import { mulberry32 } from '../mulberry32';
import { type Numeric, ZERO } from '../numeric';
import { deriveSeed } from '../rng';
import { toEnemyCombatant } from '../roster/stats';
import { ATB_THRESHOLD, MAX_BATTLE_TICKS, ticksToMs, ticksUntilReady } from './clock';
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
 */
function encounterAt(stage: StageData, rules: CombatRules): FormationData {
  const resolve = (enemy: EnemyData): CombatantData =>
    toEnemyCombatant(enemy, rules.growth, stage.level);

  return {
    front: stage.enemies.front.map(resolve),
    back: stage.enemies.back.map(resolve),
  };
}

function buildSide(formation: FormationData, side: Side, rules: CombatRules): Fighter[] {
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

      fighters.push({
        key: `${side}-${slot}`,
        side,
        row,
        slot,
        defId: combatant.id,
        name: (totals.get(combatant.id) ?? 0) > 1 ? `${combatant.name} ${ordinal}` : combatant.name,
        faction: combatant.faction,
        hasUltimate: combatant.skills.some((skill) => skill.ultimate),
        maxHp: stats.hp,
        base: stats,
        lineup,
        combatant,
        hp: stats.hp,
        // Empty, not full. An ultimate is a payoff rather than an opener — the single most
        // consequential difference between energy and the MP pool it replaced.
        energy: 0,
        gauge: 0,
        swinging: false,
        statuses: [],
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
 */
export function simulateBattle(
  party: FormationData,
  stage: StageData,
  seed: number,
  rules: CombatRules,
): BattleResult {
  const draw = mulberry32(seed);
  const fighters = [
    ...buildSide(party, 'ally', rules),
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
    if (status.kind === 'dot' && status.damageType !== undefined) {
      const share = resistedShare(target.base, status.damageType);
      return share === 1 ? status : { ...status, amount: status.amount.mul(share) };
    }
    if (status.kind === 'regen') {
      return { ...status, amount: amplified(target, source, status.amount) };
    }
    return status;
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
          const roll = rollAttack(
            attacker,
            live(target),
            effect.damageType,
            effect.power,
            matchup,
            rules,
            draw,
          );
          if (!isAlive(target)) {
            break;
          }
          if (!roll.hit) {
            events.push({ kind: 'miss', tick, source: actor.key, target: target.key });
            break;
          }

          const absorbed = absorbDamage(target.statuses, roll.damage);
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
      }
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
