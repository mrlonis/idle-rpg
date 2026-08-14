import { mulberry32 } from '../mulberry32';
import { type Numeric, ONE, ZERO } from '../numeric';
import { deriveSeed } from '../rng';
import { toEnemyCombatant } from '../roster/stats';
import { ATB_THRESHOLD, MAX_BATTLE_TICKS, pressureAt, ticksToMs, ticksUntilReady } from './clock';
import { toAmount, toCombatant, toCurrencyAmounts, toRates } from './content';
import { factionMultiplier, resistedShare, rollAttack, statusChance } from './damage';
import { clampEnergy } from './energy';
import { applyLineupBonus, lineupBonus, NO_LINEUP_BONUS } from './lineup';
import { chooseSkill, type FighterView, isAlive, selectTargets } from './skills';
import {
  absorbDamage,
  applyStatus,
  cleanseStatuses,
  effectiveSpeed,
  effectiveStats,
  isStunned,
  nextExpiry,
  partitionExpired,
  runningStatus,
  shieldTotal,
  toActiveStatus,
} from './status';
import {
  type ActiveStatus,
  type BattleEvent,
  type BattleOutcome,
  type BattleResult,
  type Combatant,
  type CombatantData,
  type CombatantSnapshot,
  type CombatRules,
  type CombatStats,
  type EnemyData,
  type FormationData,
  type LineupBonus,
  type Row,
  ROWS,
  type Side,
  type Skill,
  type StageData,
} from './types';

/**
 * The battle simulation.
 *
 * A battle resolves **instantly, headlessly and completely** into an event log. Nothing here
 * is driven by the render tick, and nothing here touches a clock. That is the decision that
 * makes 2x/4x playback, skipping, and offline resolution free rather than three separate
 * features: the UI is only choosing how fast to narrate a fight that has already happened.
 *
 * ## Turn order
 *
 * An ATB gauge rather than fixed rounds. Every living combatant gains its **current** `haste`
 * in gauge per tick — plus its `attackSpeed` while its last action was a basic attack — and
 * acts when it reaches `ATB_THRESHOLD`. A faster combatant therefore genuinely takes more turns
 * instead of merely going earlier in a round, and a haste or a slow is a real effect rather
 * than a reordering.
 *
 * The loop jumps straight to the next thing that happens instead of stepping tick by tick.
 * "The next thing" is the sooner of the next action and the next status expiry; missing the
 * second would let a stun outlive itself whenever the next turn was further away than the
 * stun was long.
 *
 * ## Why a turn is upkeep first, action second
 *
 * A turn regenerates energy, ticks damage-over-time and regeneration, and only then acts. A
 * stunned combatant **still consumes its turn** — the gauge is spent and the action is
 * skipped. That is what bounds a stun lock: a stun costs its victim turns rather than freezing
 * the victim out of the schedule entirely, so a stunned side keeps arriving at the front of
 * the queue and the fight cannot deadlock.
 *
 * ## Energy
 *
 * Every combatant opens a fight at **zero** energy and fills it from its own `energyRegen` plus
 * what the fight pays — landing a hit, taking one, healing an ally. An ultimate spends the whole
 * bar. See [`energy.ts`](energy.ts) for why that inverts what MP did to pacing, and for the
 * termination responsibility it hands to `MAX_BATTLE_TICKS`.
 *
 * ## Determinism
 *
 * `seed` is a fully derived battle seed — build it with {@link battleSeed}, never from
 * `state.rng` directly. Combat draws from its own sub-stream and does **not** advance
 * `state.rng.calls`, so replaying a battle is reproducible and cannot shift the gacha pull
 * sequence.
 *
 * Draw consumption never depends on a random outcome. Two draws per damage instance and one
 * per status clause, taken whatever happens — including against a target that the preceding
 * clause just killed. Target selection and skill choice are fully deterministic, so the whole
 * of a fight's randomness is "did it hit, did it crit, did it stick".
 */

/**
 * A combatant's working state during the fight.
 *
 * Deliberately mutable, and deliberately local: these are built inside `simulateBattle`,
 * mutated as the fight resolves, and read back out into immutable snapshots. None of this
 * ever reaches `GameState`, so the purity of the public function holds — exactly the pattern
 * `RngStream` uses. It satisfies {@link FighterView}, which is the read-only shape targeting
 * and selection are written against.
 */
interface Fighter extends FighterView {
  readonly defId: string;
  readonly name: string;
  readonly faction: string;
  /** Whether this combatant has anything to spend a full bar on. */
  readonly hasUltimate: boolean;
  /**
   * As parsed, with the row bonus and the lineup bonus already baked in. Statuses are applied on
   * top per read.
   */
  readonly base: CombatStats;
  /**
   * What this side's composition is worth, kept for the one clause that cannot be baked in.
   *
   * Every other part of the lineup bonus is a fixed multiplier and lives in {@link base}. The
   * injured-energy clause is conditional on current health, so it has to be read at the top of a
   * turn — see `upkeep`.
   */
  readonly lineup: LineupBonus;
  readonly combatant: Combatant;
  hp: Numeric;
  energy: number;
  gauge: number;
  /**
   * Whether the last action taken was a basic attack, which is what `attackSpeed` pays for.
   *
   * False before the first action: a fight opens at plain haste for everybody, because nobody
   * has swung yet.
   */
  swinging: boolean;
  statuses: readonly ActiveStatus[];
  cooldowns: Map<string, number>;
}

/**
 * Builds the canonical RNG label for a battle.
 *
 * Wrapped rather than written out at each call site so the label can never drift: two
 * spellings of it would silently become two different battles. `battleCount` is included so a
 * retry of the same stage is a genuinely different fight rather than a replay of the loss.
 */
export function battleSeed(seed: number, stageId: string, battleCount: number): number {
  return deriveSeed(seed, `battle:${stageId}:${battleCount}`);
}

/** The stats a fighter is currently acting with, statuses included. */
function live(fighter: Fighter): CombatStats {
  return effectiveStats(fighter.base, fighter.statuses);
}

/**
 * A fighter's current gauge fill, without building a whole stat block to read one number.
 *
 * The scheduling loop asks every living combatant for this twice an iteration, and a full
 * {@link live} costs `Decimal` multiplications it would immediately throw away.
 *
 * `swinging` — whether the last action was a basic attack — is what {@link CombatStats.attackSpeed}
 * pays for. Reading the **last** action rather than predicting the next one is deliberate and it
 * is the whole of why this stays cheap and sound:
 *
 * - Predicting the next one means running {@link chooseSkill}, which walks the kit resolving
 *   targets for each candidate. Doing that ten times an iteration is what `effectiveSpeed`
 *   exists to avoid.
 * - Approximating it as "nothing in the kit is off cooldown" is cheap but wrong in a way that
 *   bites the exact content the stat was authored for: a skill gated on a condition that is not
 *   currently met never goes on cooldown, so it suppresses the bonus permanently. Aelrindel's
 *   Volley needs three living enemies, and on that reading his attack speed — the largest in the
 *   game — would pay only on wide waves.
 * - The flag can only change **inside an action**, which is already a tick boundary, so the gauge
 *   rate is constant across a jump for free. The alternatives both need a scheduling boundary of
 *   their own to stay exact.
 *
 * It also reads the way the stat is described: a combatant that has started swinging keeps
 * swinging faster, and casting drops it back to plain haste for one turn.
 */
function speed(fighter: Fighter): number {
  return effectiveSpeed(fighter.base, fighter.statuses, fighter.swinging);
}

/**
 * Places one side on the field, front row first.
 *
 * Copies of the same definition are numbered ("Slime 1", "Slime 2") across both rows, so the
 * log stays readable when a stage fields three of something. Keys are positional and never
 * reused, so events stay unambiguous even between identical combatants.
 *
 * ## The lineup bonus is the party's alone, and that is a decision rather than an oversight
 *
 * This function is otherwise perfectly symmetric, so paying the composition bonus to both sides
 * would have been the shorter code. It is deliberately not, for two reasons:
 *
 * - **An enemy formation is authored, so a bonus on top of it decides nothing.** The lineup
 *   bonus exists to make *who you brought* a question with seven answers. A stage's line-up is
 *   written down in `data/`, and multiplying an authored stat block by a number derived from that
 *   same authored stat block is a stat block with a hidden step — the author could simply have
 *   written the larger number.
 * - **It would silently retune the whole ladder**, unevenly. Early stages field waves of one
 *   faction and late ones are deliberately mixed, so a symmetric rule would hand the opening
 *   stages up to +25% and the closing ones nothing, which is the opposite of the difficulty curve
 *   twenty-four stages were tuned to.
 *
 * The matchup matrix stays symmetric, and the difference between the two is the point: a matchup
 * is a fact about the fight, and a composition bonus is a reward for a decision only the player
 * makes.
 */
/**
 * Resolves a stage's archetypes into the formation that actually takes the field.
 *
 * The enemy-side counterpart of what `ui/` does to the roster before handing a party over, and it
 * happens **inside** the simulation on purpose. A party is assembled by the caller and there is
 * nowhere else it could be; an encounter is not, and letting a caller build one would mean every
 * call site — the UI, three specs and a balance sweep — independently remembering to scale it.
 * Forgetting would field level-1 fodder against a level-200 party, which reads as a tuning
 * problem rather than as a missing call.
 *
 * **Gear enters on the same seam and inherits the same argument.** `stage.enemyGear` is priced by
 * `resolveStage`, so what happens here is a lookup by the body's own archetype: a `tank` block
 * takes the tank profile out of the stage's set and a `mage` block takes the mage one. A body that
 * declares no archetype, or a stage that declares no gear, resolves to `undefined` and fights
 * exactly as it did before milestone 27 — which is every enemy on every tower floor, every Descent
 * board and every Expedition, and every campaign stage below The Rustwood.
 */
function encounterAt(stage: StageData, rules: CombatRules): FormationData {
  const resolve = (enemy: EnemyData): CombatantData =>
    toEnemyCombatant(
      enemy,
      rules.growth,
      stage.level,
      enemy.gearArchetype === undefined ? undefined : stage.enemyGear?.[enemy.gearArchetype],
    );

  return {
    front: stage.enemies.front.map(resolve),
    back: stage.enemies.back.map(resolve),
  };
}

/**
 * What one combatant carries into a fight that is not its first.
 *
 * ⚠️ **Health is a fraction of maximum, never a quantity**, which is what lets it be recorded at
 * the end of one fight and honoured at the start of the next across anything that can move a
 * maximum in between — a level, an ascension rung, a resonance floor, a gear swap. An absolute
 * figure would read as a heal or a wound nobody administered, and against a curve worth ×10⁹ it
 * would read as a very large one.
 */
export interface CombatantOpening {
  /** Remaining health as a fraction of maximum. Clamped into `(0, 1]`. */
  readonly health: number;
  /** Energy carried in, clamped into `[0, MAX_ENERGY]`. */
  readonly energy: number;
}

/**
 * What the **party** carries into a fight, keyed by character id.
 *
 * Applied to the ally side alone, for the reason the lineup bonus is: an encounter is authored, so
 * a wounded enemy is a stat block with a hidden step in it and the author could simply have written
 * the smaller number. What this exists for is a run in which damage carries — see
 * `core/descent/`.
 *
 * ⚠️ **Keyed by character id rather than by slot, and it can never name a body at zero.** One
 * character cannot stand twice in a crew, so an id is unique on the party's side; and a fallen
 * member is removed from the formation entirely rather than fielded at nothing, because a
 * zero-health fighter is a body every targeting rule then has to step around and one that goes on
 * paying the lineup bonus for somebody who is not fighting.
 */
export type PartyOpening = ReadonlyMap<string, CombatantOpening>;

/**
 * The health a fighter opens with: its maximum, or the share of it that survived the last fight.
 *
 * ⚠️ **Never zero.** A fighter at nothing is a corpse on the board — excluded from targeting,
 * counted by the lineup bonus, and drawn as a fifth member who cannot act — and the whole reason
 * {@link PartyOpening} is keyed by id is that the caller removes the fallen instead. The floor of
 * one is a guard against a damaged share rather than a state anything can reach by playing, and at
 * a late-game maximum it is indistinguishable from nothing anyway.
 */
function carriedHp(maxHp: Numeric, carried: CombatantOpening | undefined): Numeric {
  if (carried === undefined) {
    return maxHp;
  }
  const share = Number.isFinite(carried.health) ? Math.min(Math.max(carried.health, 0), 1) : 1;
  const hp = maxHp.mul(share);
  return hp.lt(ONE) ? ONE : hp;
}

function buildSide(
  formation: FormationData,
  side: Side,
  rules: CombatRules,
  opening?: PartyOpening,
): Fighter[] {
  const ranks: readonly (readonly [Row, readonly CombatantData[]])[] = ROWS.map((row) => [
    row,
    row === 'front' ? formation.front : formation.back,
  ]);

  const totals = new Map<string, number>();
  for (const [, members] of ranks) {
    for (const def of members) {
      totals.set(def.id, (totals.get(def.id) ?? 0) + 1);
    }
  }

  const lineup =
    side === 'ally'
      ? lineupBonus(
          [...formation.front, ...formation.back].map((def) => def.faction),
          rules.lineup,
        ).bonus
      : NO_LINEUP_BONUS;

  const numbered = new Map<string, number>();
  const fighters: Fighter[] = [];
  for (const [row, members] of ranks) {
    for (const def of members) {
      const combatant = toCombatant(def, rules, row);
      const stats = applyLineupBonus(combatant.stats, lineup);
      const ordinal = (numbered.get(combatant.id) ?? 0) + 1;
      numbered.set(combatant.id, ordinal);
      const slot = fighters.length;

      // Carried state, for a run in which damage persists between fights. Absent for every fight in
      // the game bar the Descent's, and `carriedHp` short-circuits to `stats.hp` when it is — so the
      // ordinary path is bit-identical to what it was before this parameter existed, which is what
      // keeps the whole-board rescale identity and every recorded balance figure valid.
      const carried = side === 'ally' ? opening?.get(combatant.id) : undefined;

      fighters.push({
        key: `${side}-${slot}`,
        side,
        row,
        slot,
        defId: combatant.id,
        name: (totals.get(combatant.id) ?? 0) > 1 ? `${combatant.name} ${ordinal}` : combatant.name,
        faction: combatant.faction,
        hasUltimate: combatant.skills.some((skill) => skill.ultimate),
        // The **full** maximum whatever was carried in, so a wounded fighter reads as wounded on
        // the bar rather than as a smaller fighter at full health.
        maxHp: stats.hp,
        base: stats,
        lineup,
        combatant,
        hp: carriedHp(stats.hp, carried),
        // Empty, not full. An ultimate is a payoff rather than an opener — the single most
        // consequential difference between energy and the MP pool it replaced. A carried bar is the
        // one exception, and it is a bar the party filled in a fight it already fought.
        energy: carried === undefined ? 0 : clampEnergy(carried.energy),
        gauge: 0,
        swinging: false,
        // Opening statuses land at tick 0, applied against the combatant's **own** stats — the
        // wearer is who granted them, so a shield or a regeneration here is sized by the wearer.
        // This is where a signature item's passive half arrives; nothing in this file knows that,
        // because what it receives is an ordinary `StatusData` list on the combatant.
        statuses: (combatant.opening ?? []).map((status) => toActiveStatus(status, stats, 0)),
        cooldowns: new Map<string, number>(),
      });
    }
  }
  return fighters;
}

/**
 * Decides whether the fight is over.
 *
 * Allies are checked first, so a battle entered with no party is a defeat rather than a
 * walkover. Mid-fight the order cannot matter: actions resolve one at a time, so both sides
 * can never be wiped by the same attack.
 */
function decide(fighters: readonly Fighter[]): BattleOutcome | undefined {
  if (!fighters.some((fighter) => fighter.side === 'ally' && isAlive(fighter))) {
    return 'defeat';
  }
  if (!fighters.some((fighter) => fighter.side === 'enemy' && isAlive(fighter))) {
    return 'victory';
  }
  return undefined;
}

/**
 * Ticks until the next thing worth resolving: an action, or a status running out.
 *
 * Never less than 1, so the loop is guaranteed to make progress even in a state where nothing
 * is scheduled at all.
 */
function ticksUntilNextEvent(fighters: readonly Fighter[], tick: number): number {
  let soonest = MAX_BATTLE_TICKS;
  for (const fighter of fighters) {
    if (!isAlive(fighter)) {
      continue;
    }
    soonest = Math.min(soonest, ticksUntilReady(fighter.gauge, speed(fighter)));
    const expiry = nextExpiry(fighter.statuses);
    if (expiry !== undefined) {
      soonest = Math.min(soonest, expiry - tick);
    }
  }
  return Math.max(soonest, 1);
}

/**
 * Every combatant that can act this tick, in the order they act.
 *
 * A fuller gauge goes first; ties break towards the player, then by slot. The tie-break has
 * to be total and stable or the whole simulation stops being reproducible, and favouring the
 * party is the friendlier of the two arbitrary choices available.
 */
function readyInOrder(fighters: readonly Fighter[]): Fighter[] {
  return fighters
    .filter((fighter) => isAlive(fighter) && fighter.gauge >= ATB_THRESHOLD)
    .sort((a, b) => {
      if (a.gauge !== b.gauge) {
        return b.gauge - a.gauge;
      }
      if (a.side !== b.side) {
        return a.side === 'ally' ? -1 : 1;
      }
      return a.slot - b.slot;
    });
}

function snapshot(fighter: Fighter): CombatantSnapshot {
  return {
    key: fighter.key,
    side: fighter.side,
    row: fighter.row,
    slot: fighter.slot,
    defId: fighter.defId,
    name: fighter.name,
    faction: fighter.faction,
    maxHp: fighter.maxHp,
    hp: fighter.hp,
    energy: fighter.energy,
    ultimate: fighter.hasUltimate,
    haste: speed(fighter),
    shield: shieldTotal(fighter.statuses),
    statuses: fighter.statuses,
  };
}

/**
 * Resolves a whole battle.
 *
 * @param party the player's formation, in two rows, as authored in `data/`
 * @param stage the encounter to fight, as authored in `data/`
 * @param seed a derived battle seed from {@link battleSeed} — not `state.rng.seed`
 * @param rules the parsed combat rules: row bonuses, the faction matrix and the guards
 * @param opening what the **party** carries in from an earlier fight, or absent for a fresh one.
 *   Only the Descent supplies it; every other fight in the game opens at full health and no
 *   energy, and omitting it is bit-identical to the behaviour before it existed.
 */
export function simulateBattle(
  party: FormationData,
  stage: StageData,
  seed: number,
  rules: CombatRules,
  opening?: PartyOpening,
): BattleResult {
  const draw = mulberry32(seed);
  const fighters = [
    ...buildSide(party, 'ally', rules, opening),
    ...buildSide(encounterAt(stage, rules), 'enemy', rules),
  ];
  const roster = fighters.map(snapshot);
  const events: BattleEvent[] = [];

  let tick = 0;
  let outcome = decide(fighters);
  let timedOut = false;

  /**
   * Moves a fighter's HP, clamped to `[0, maxHp]`, and reports whether it just fell.
   *
   * A combatant that falls drops everything it was carrying. Not cosmetic: the log's promise is
   * that replaying it reproduces the final standings, and the animator clears a combatant's
   * badges when it sees the `defeat` event — so leaving them here would make the two disagree
   * about every corpse. It also stops `partitionExpired` narrating a poison wearing off a body
   * that has been on the floor for twenty seconds.
   */
  const damage = (fighter: Fighter, amount: Numeric): boolean => {
    const wasAlive = isAlive(fighter);
    const remaining = fighter.hp.sub(amount);
    fighter.hp = remaining.lt(ZERO) ? ZERO : remaining;

    const fell = wasAlive && !isAlive(fighter);
    if (fell) {
      fighter.statuses = [];
    }
    return fell;
  };

  const restore = (fighter: Fighter, amount: Numeric): Numeric => {
    const before = fighter.hp;
    const healed = fighter.hp.add(amount);
    fighter.hp = healed.gt(fighter.maxHp) ? fighter.maxHp : healed;
    return fighter.hp.sub(before);
  };

  /**
   * Healing amplified by the recipient's `receivedHealing`, but only when somebody else is
   * doing it.
   *
   * "Received healing" is the whole of the stat's meaning: a self-heal, a life leech and the
   * natural recovery at the top of a turn are all a combatant healing itself, and amplifying
   * those would make the stat a second `healthRegen` rather than the thing that makes a
   * dedicated healer worth fielding behind it.
   */
  const amplified = (target: Fighter, source: Fighter, amount: Numeric): Numeric =>
    source === target ? amount : amount.mul(1 + target.base.receivedHealing);

  /**
   * Settles a freshly rolled status against the combatant it is landing on.
   *
   * Both adjustments here belong to the **recipient**, which is why they happen at application
   * rather than in `toActiveStatus` — that function only ever sees the applier. And they happen
   * at application rather than per tick because that is when the quantity is snapshotted anyway:
   * a poison does not stop hurting when its caster dies, and by the same token it should not
   * start hurting more when the wall it is sitting on drops its guard.
   *
   * - A **damage-over-time** is measured against the target's matching resist. Without this the
   *   `damageType` on a `dot` would be a field with no consumer: the collapse to one `atk` took
   *   away its old job of choosing an attack stat, and answering a resist is the job it took on.
   *   A Golem that shrugged off swords and not bleeds would be a hole in the one axis milestone
   *   8a moved onto the resists.
   * - A **regeneration** is healing from somebody else, so the recipient's amplifier applies.
   *
   * Both read `base` rather than {@link live}. The resists and `receivedHealing` are not in
   * `ModifiableStat`, so a status cannot move them and the effective block would return the same
   * two numbers after four `Decimal` multiplications thrown away — the same trade `effectiveSpeed`
   * exists to make. If either stat ever becomes modifiable, these two reads are what has to
   * change with it.
   */
  const resolveAgainst = (status: ActiveStatus, target: Fighter, source: Fighter): ActiveStatus => {
    if (status.amount === undefined) {
      return status;
    }
    if ((status.kind === 'dot' || status.kind === 'bomb') && status.damageType !== undefined) {
      // A bomb is a poison that pays late, so it answers a resist exactly as a poison does — and
      // at the same moment, which is the one the quantity was snapshotted at.
      const share = resistedShare(target.base, status.damageType);
      return share === 1 ? status : { ...status, amount: status.amount.mul(share) };
    }
    if (status.kind === 'regen') {
      return { ...status, amount: amplified(target, source, status.amount) };
    }
    return status;
  };

  /**
   * Damage a **status** deals, rather than damage an action deals.
   *
   * The one path for all four of them — a poison ticking, a bomb going off, thorns answering a
   * blow, and the share of a hit a link moves onto an ally. Shields absorb it, it can kill, and it
   * charges nobody's energy bar: energy is paid for acting and for being acted upon, and a status
   * is neither.
   *
   * ⚠️ **Nothing in here re-enters {@link resolveOn}, and that is the termination argument for
   * reflect and link both.** Thorns cannot answer thorns and a link cannot spread a share it was
   * handed, because neither ever looks at the incoming damage again. It is structural rather than
   * a depth counter, which is what makes it impossible to reintroduce by accident.
   */
  const statusDamage = (
    victim: Fighter,
    amount: Numeric,
    statusId: string,
    statusName: string,
  ): void => {
    if (!isAlive(victim) || amount.lte(ZERO)) {
      return;
    }
    const absorbed = absorbDamage(victim.statuses, amount);
    victim.statuses = absorbed.statuses;
    const fell = damage(victim, absorbed.through);
    events.push({
      kind: 'tick-damage',
      tick,
      target: victim.key,
      statusId,
      statusName,
      damage: absorbed.through,
      absorbed: absorbed.absorbed,
      targetHp: victim.hp,
    });
    if (fell) {
      events.push({ kind: 'defeat', tick, combatant: victim.key });
    }
  };

  /**
   * Splits an incoming hit across a link, returning what the target itself still takes.
   *
   * The allies are paid **before** the target, which is deliberate: the `attack` event has to be
   * the last word on what the target's health is, and an animator that saw the target's bar move
   * and then a stranger's would narrate the same hit twice.
   *
   * ⚠️ Damage is conserved rather than multiplied, and a link with nobody left to share to returns
   * the whole hit — see {@link StatusData}'s `link` for why both clauses are load-bearing.
   */
  const spreadLink = (target: Fighter, incoming: Numeric): Numeric => {
    const link = runningStatus(target.statuses, 'link');
    const share = link?.share ?? 0;
    if (link === undefined || share <= 0) {
      return incoming;
    }
    const partners = fighters.filter(
      (fighter) =>
        fighter !== target &&
        fighter.side === target.side &&
        isAlive(fighter) &&
        fighter.statuses.some((status) => status.id === link.id),
    );
    if (partners.length === 0) {
      return incoming;
    }

    const moved = incoming.mul(share);
    const each = moved.div(partners.length);
    for (const partner of partners) {
      statusDamage(partner, each, link.id, link.name);
    }
    return incoming.sub(moved);
  };

  /** Adds energy to a fighter, clamped to the bar. Returns the new total for the event log. */
  const charge = (fighter: Fighter, amount: number): number => {
    fighter.energy = clampEnergy(fighter.energy + amount);
    return fighter.energy;
  };

  /**
   * What one action has already been paid for.
   *
   * `onHit` and `onHeal` are **once per action**, so a row nuke does not charge its own caster
   * five times over and turn every wide ultimate into an engine that refuels itself. That has to
   * be tracked across the per-target loop, and it has to be tracked here rather than settled
   * afterwards: the `attack` and `heal` events carry the caster's energy, and an award applied
   * after the events were emitted would put a number in the log that never existed.
   */
  interface Credit {
    hit: boolean;
    healed: boolean;
  }

  /** Resolves one skill from `actor` onto one already-selected `target`. */
  const resolveOn = (actor: Fighter, target: Fighter, skill: Skill, credit: Credit): void => {
    const attacker = live(actor);
    const matchup = factionMultiplier(rules, actor.faction, target.faction);

    for (const effect of skill.effects) {
      switch (effect.kind) {
        case 'damage':
        case 'drain': {
          // Rolled before the liveness check so the draw count depends on the line-up rather
          // than on whether an earlier clause happened to land a killing blow.
          // `pressureAt(tick)` is what guarantees this fight ends. Past fifty seconds it climbs,
          // and healing does not climb with it — so a sustain loop that neither side can break is
          // resolved by arithmetic rather than by the ninety-second timer calling it a defeat.
          const roll = rollAttack(
            attacker,
            live(target),
            effect.damageType,
            effect.power,
            matchup,
            rules,
            draw,
            pressureAt(tick),
          );
          if (!isAlive(target)) {
            break;
          }
          if (!roll.hit) {
            events.push({ kind: 'miss', tick, source: actor.key, target: target.key });
            break;
          }

          // Read before the blow lands, because a fighter that falls drops everything it was
          // carrying — and thorns are meant to answer the killing blow above all others. A reflect
          // that a burst party could step around by finishing the job in one hit would tax exactly
          // the parties it is not aimed at.
          const thorns = runningStatus(target.statuses, 'reflect');

          // The link is settled before the shield, so each holder meets the share it was handed
          // with its own absorb rather than with the target's. What is spread is the damage the
          // roll produced **against the target** — one resolution against one defence, then a
          // share of the result moved — which is what keeps a link readable at the board level.
          const incoming = spreadLink(target, roll.damage);
          const absorbed = absorbDamage(target.statuses, incoming);
          target.statuses = absorbed.statuses;
          const fell = damage(target, absorbed.through);

          // The attacker is credited once for the action; the target every time it is hit. A
          // combatant that has just fallen is not credited — a bar filling on a corpse is a
          // number the animator would have to draw somewhere.
          const sourceEnergy = credit.hit ? actor.energy : charge(actor, rules.energy.onHit);
          credit.hit = true;
          const targetEnergy = fell ? target.energy : charge(target, rules.energy.onHurt);

          events.push({
            kind: 'attack',
            tick,
            source: actor.key,
            target: target.key,
            damageType: effect.damageType,
            damage: absorbed.through,
            absorbed: absorbed.absorbed,
            crit: roll.crit,
            targetHp: target.hp,
            sourceEnergy,
            targetEnergy,
          });

          // Life leech is measured against damage **dealt**, shield included: a shield
          // protects its holder, it does not deny the attacker its return.
          const siphon = attacker.lifeLeech + (effect.kind === 'drain' ? effect.siphon : 0);
          if (siphon > 0 && isAlive(actor)) {
            const gained = restore(actor, roll.damage.mul(siphon));
            if (gained.gt(ZERO)) {
              events.push({
                kind: 'heal',
                tick,
                source: actor.key,
                target: actor.key,
                amount: gained,
                targetHp: actor.hp,
                // Healing itself, so no energy. Same line `receivedHealing` draws.
                sourceEnergy: actor.energy,
              });
            }
          }

          if (fell) {
            events.push({ kind: 'defeat', tick, combatant: target.key });
          }

          // Measured against what reached HP, so a shield that ate the blow also swallows the
          // answer to it. Last, so the log reads as hit, then consequence.
          //
          // ⚠️ This may fell the actor mid-skill, and the remaining clauses of this swing still
          // land on this target — a rider like a bleed is part of the blow the thorns are
          // answering, not a second swing. Where the corpse stops is the *next* target; `act()`
          // owns that check and records why the granularity is the action rather than the clause.
          const returned = thorns?.share ?? 0;
          if (thorns !== undefined && returned > 0) {
            statusDamage(actor, absorbed.through.mul(returned), thorns.id, thorns.name);
          }
          break;
        }

        case 'heal': {
          if (!isAlive(target)) {
            break;
          }
          const gained = restore(
            target,
            amplified(target, actor, attacker.atk.mul(Math.max(effect.power, 0))),
          );
          const healedAnother = target !== actor;
          const sourceEnergy =
            healedAnother && !credit.healed ? charge(actor, rules.energy.onHeal) : actor.energy;
          credit.healed = credit.healed || healedAnother;

          events.push({
            kind: 'heal',
            tick,
            source: actor.key,
            target: target.key,
            amount: gained,
            targetHp: target.hp,
            sourceEnergy,
          });
          break;
        }

        case 'status': {
          // Drawn unconditionally, before the liveness check, for the same reason the attack
          // roll is: consumption must never depend on an outcome.
          const roll = draw();
          if (!isAlive(target)) {
            break;
          }
          const chance = statusChance(effect.chance ?? 1, attacker, live(target));
          if (roll >= chance) {
            events.push({
              kind: 'status-resisted',
              tick,
              source: actor.key,
              target: target.key,
              statusId: effect.status.id,
              statusName: effect.status.name,
            });
            break;
          }
          const rolled = toActiveStatus(effect.status, attacker, tick);
          const status = resolveAgainst(rolled, target, actor);
          target.statuses = applyStatus(target.statuses, status);
          events.push({ kind: 'status', tick, source: actor.key, target: target.key, status });
          break;
        }

        case 'cleanse': {
          if (!isAlive(target)) {
            break;
          }
          const cleaned = cleanseStatuses(target.statuses, effect.count);
          target.statuses = cleaned.remaining;
          events.push({
            kind: 'cleanse',
            tick,
            source: actor.key,
            target: target.key,
            removed: cleaned.removed,
          });
          break;
        }
      }
    }
  };

  /**
   * The drip half of the energy meter, with the one conditional lineup clause folded in.
   *
   * The clause is worth its own function because it is the only part of a lineup bonus that is
   * not a constant for the fight: it pays a combatant for being **injured**, so it has to be read
   * at the top of every turn rather than baked into a stat block.
   *
   * Short-circuited when nothing is owed, which is every party that did not field the ladder
   * faction twice — so the common case costs a comparison against zero rather than the `Decimal`
   * multiplication the health threshold needs.
   *
   * It touches only the authorable half of the meter. What a fight *pays* — landing a hit, taking
   * one, healing an ally — is the same for everybody and describes the fight rather than the
   * party, which is the same line `CombatRules.energy` already draws.
   */
  const energyRegenFor = (actor: Fighter): number => {
    const bonus = actor.lineup.injuredEnergyRegen;
    if (bonus === 0 || actor.hp.gte(actor.maxHp.mul(rules.lineup.injuredBelow))) {
      return actor.base.energyRegen;
    }
    return clampEnergy(actor.base.energyRegen * (1 + bonus));
  };

  /** Regenerates, resolves lingering statuses, and reports whether the actor may act. */
  const upkeep = (actor: Fighter): boolean => {
    charge(actor, energyRegenFor(actor));
    events.push({ kind: 'turn', tick, combatant: actor.key, energy: actor.energy });

    // Natural recovery, amplified by `healthRegen`. It is a quantity rather than a percentage
    // of maximum HP on purpose — a percentage would scale itself and make a deep pool heal
    // faster than a shallow one for free — and it is one of the four stats that grows, because
    // a fixed number measured against a health bar heading for ×10⁹ is a rounding error by
    // then. Self-healing, so `receivedHealing` deliberately does not touch it.
    if (actor.base.recovery.gt(ZERO)) {
      const gained = restore(actor, actor.base.recovery.mul(1 + actor.base.healthRegen));
      if (gained.gt(ZERO)) {
        events.push({
          kind: 'heal',
          tick,
          source: actor.key,
          target: actor.key,
          amount: gained,
          targetHp: actor.hp,
          sourceEnergy: actor.energy,
        });
      }
    }

    for (const status of actor.statuses) {
      if (status.amount === undefined) {
        continue;
      }
      if (status.kind === 'dot') {
        const absorbed = absorbDamage(actor.statuses, status.amount);
        actor.statuses = absorbed.statuses;
        const fell = damage(actor, absorbed.through);
        events.push({
          kind: 'tick-damage',
          tick,
          target: actor.key,
          statusId: status.id,
          statusName: status.name,
          damage: absorbed.through,
          absorbed: absorbed.absorbed,
          targetHp: actor.hp,
        });
        if (fell) {
          events.push({ kind: 'defeat', tick, combatant: actor.key });
          return false;
        }
      } else if (status.kind === 'regen') {
        const gained = restore(actor, status.amount);
        events.push({
          kind: 'tick-heal',
          tick,
          target: actor.key,
          statusId: status.id,
          statusName: status.name,
          amount: gained,
          targetHp: actor.hp,
        });
      }
    }

    if (isStunned(actor.statuses)) {
      events.push({ kind: 'stunned', tick, combatant: actor.key });
      return false;
    }
    return true;
  };

  const act = (actor: Fighter): void => {
    const skill = chooseSkill(actor, actor.combatant, fighters, tick);
    const targets = selectTargets(actor, fighters, skill.target);
    if (targets.length === 0) {
      return;
    }

    if (skill.ultimate) {
      // The whole bar, every time. `canAfford` has already established it was full.
      actor.energy = 0;
    }
    if (skill.cooldown > 0) {
      actor.cooldowns.set(skill.id, tick + skill.cooldown);
    }
    actor.swinging = skill.id === actor.combatant.basic.id;
    if (skill.id !== actor.combatant.basic.id) {
      events.push({
        kind: 'cast',
        tick,
        source: actor.key,
        skillId: skill.id,
        skillName: skill.name,
        energy: actor.energy,
      });
    }

    // One record for the whole action, so `onHit` and `onHeal` are paid once however many
    // targets the skill reaches.
    const credit: Credit = { hit: false, healed: false };
    for (const target of targets) {
      // ⚠️ **An actor can now die inside its own action**, which nothing could do before `reflect`
      // existed — a row attack into three thorned enemies is answered three times. A corpse must
      // not finish swinging, and the check is here rather than in `resolveOn` because it is about
      // the *action* rather than about one clause of it.
      if (!isAlive(actor)) {
        break;
      }
      resolveOn(actor, target, skill, credit);
    }
  };

  while (outcome === undefined) {
    const jump = ticksUntilNextEvent(fighters, tick);
    if (tick + jump > MAX_BATTLE_TICKS) {
      // The ninety seconds are up, and that is a loss. Out of time rather than out of
      // combatants — the damage formula and the hit-chance floor guarantee a battle ends
      // eventually, but a party that cannot out-damage a healer has already lost by the first
      // minute and only the clock had not noticed.
      //
      // `timedOut` is what keeps that difference readable where it matters. The player sees a
      // defeat, because that is what it is; the balance sweep sees the reason, because an
      // over-tuned sustain kit is invisible otherwise.
      tick = MAX_BATTLE_TICKS;
      outcome = 'defeat';
      timedOut = true;
      break;
    }

    tick += jump;
    for (const fighter of fighters) {
      if (isAlive(fighter)) {
        // The jump was sized so nothing changes inside `[tick, tick + jump)`: gauge modifiers
        // are bounded by `nextExpiry`, and `swinging` only ever moves inside an action, which is
        // a tick boundary by construction.
        fighter.gauge += speed(fighter) * jump;
      }
    }

    // Expiries are resolved for everyone before anybody acts, so a stun that ran out during
    // the jump does not cost its victim the turn it just earned.
    for (const fighter of fighters) {
      const { active, expired } = partitionExpired(fighter.statuses, tick);
      if (expired.length === 0) {
        continue;
      }
      fighter.statuses = active;
      for (const status of expired) {
        events.push({
          kind: 'status-expired',
          tick,
          target: fighter.key,
          statusId: status.id,
          statusName: status.name,
        });
        // A bomb pays out **as it goes**, which is the whole of what separates it from a poison.
        // Emitted after the expiry so the log reads as the thing ending and then landing, and
        // fired exactly once because the same expiry is what removed it.
        if (status.kind === 'bomb' && status.amount !== undefined) {
          statusDamage(fighter, status.amount, status.id, status.name);
        }
      }
    }

    // ⚠️ **Nothing but a bomb can kill at an expiry, and before bombs nothing could kill here at
    // all** — which is why this call is new rather than something that was missing. Without it the
    // last combatant on a side could fall to a detonation and the fight would carry on until
    // somebody's turn came around to notice.
    outcome = decide(fighters);
    if (outcome !== undefined) {
      break;
    }

    for (const actor of readyInOrder(fighters)) {
      // Turn order is fixed at the top of the tick, so an actor can be killed by an earlier
      // action within the same tick and must not still swing.
      if (!isAlive(actor)) {
        continue;
      }
      actor.gauge -= ATB_THRESHOLD;

      if (upkeep(actor)) {
        act(actor);
      }

      outcome = decide(fighters);
      if (outcome !== undefined) {
        break;
      }
    }
  }

  events.push({ kind: 'end', tick, outcome });

  return {
    stageId: stage.id,
    outcome,
    timedOut,
    ticks: tick,
    durationMs: ticksToMs(tick),
    roster,
    final: fighters.map(snapshot),
    events,
    reward:
      outcome === 'victory'
        ? {
            gained: toCurrencyAmounts(stage.reward),
            rates: toRates(stage.rates),
            firstClearSummons: toAmount(stage.firstClearSummons),
          }
        : { gained: {}, rates: {}, firstClearSummons: ZERO },
  };
}
