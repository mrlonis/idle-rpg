import { mulberry32 } from '../mulberry32';
import { num, type Numeric, ZERO } from '../numeric';
import { deriveSeed } from '../rng';
import { ATB_THRESHOLD, MAX_BATTLE_TICKS, ticksToMs, ticksUntilReady } from './clock';
import { toAmount, toCombatant, toCurrencyAmounts, toRates } from './content';
import { factionMultiplier, rollAttack, statusChance } from './damage';
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
  type FormationData,
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
 * An ATB gauge rather than fixed rounds. Every living combatant gains its **current** `spd` in
 * gauge per tick and acts when it reaches `ATB_THRESHOLD`, so a faster combatant genuinely
 * takes more turns instead of merely going earlier in a round — and a haste or a slow is a
 * real effect rather than a reordering.
 *
 * The loop jumps straight to the next thing that happens instead of stepping tick by tick.
 * "The next thing" is the sooner of the next action and the next status expiry; missing the
 * second would let a stun outlive itself whenever the next turn was further away than the
 * stun was long.
 *
 * ## Why a turn is upkeep first, action second
 *
 * A turn regenerates MP, ticks damage-over-time and regeneration, and only then acts. A
 * stunned combatant **still consumes its turn** — the gauge is spent and the action is
 * skipped. That is what bounds a stun lock: a stun costs its victim turns rather than freezing
 * the victim out of the schedule entirely, so a stunned side keeps arriving at the front of
 * the queue and the fight cannot deadlock.
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
  readonly maxMp: number;
  /** As parsed, with the row bonus already baked in. Statuses are applied on top per read. */
  readonly base: CombatStats;
  readonly combatant: Combatant;
  hp: Numeric;
  mp: number;
  gauge: number;
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
 * A fighter's current speed, without building a whole stat block to read one number.
 *
 * The scheduling loop asks every living combatant for this twice an iteration, and a full
 * {@link live} costs four `Decimal` multiplications it would immediately throw away.
 */
function speed(fighter: Fighter): number {
  return effectiveSpeed(fighter.base, fighter.statuses);
}

/**
 * Places one side on the field, front row first.
 *
 * Copies of the same definition are numbered ("Slime 1", "Slime 2") across both rows, so the
 * log stays readable when a stage fields three of something. Keys are positional and never
 * reused, so events stay unambiguous even between identical combatants.
 */
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

  const numbered = new Map<string, number>();
  const fighters: Fighter[] = [];
  for (const [row, members] of ranks) {
    for (const def of members) {
      const combatant = toCombatant(def, rules, row);
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
        maxHp: combatant.stats.hp,
        maxMp: combatant.stats.mp,
        base: combatant.stats,
        combatant,
        hp: combatant.stats.hp,
        mp: combatant.stats.mp,
        gauge: 0,
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
    maxMp: fighter.maxMp,
    mp: fighter.mp,
    spd: speed(fighter),
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
    ...buildSide(stage.enemies, 'enemy', rules),
  ];
  const roster = fighters.map(snapshot);
  const events: BattleEvent[] = [];

  let tick = 0;
  let outcome = decide(fighters);

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

  /** Resolves one skill from `actor` onto one already-selected `target`. */
  const resolveOn = (actor: Fighter, target: Fighter, skill: Skill): void => {
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
          });

          // Life drain is measured against damage **dealt**, shield included: a shield
          // protects its holder, it does not deny the attacker its return.
          const siphon = attacker.lifesteal + (effect.kind === 'drain' ? effect.siphon : 0);
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
          const gained = restore(target, attacker.matk.mul(Math.max(effect.power, 0)));
          events.push({
            kind: 'heal',
            tick,
            source: actor.key,
            target: target.key,
            amount: gained,
            targetHp: target.hp,
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
          const status = toActiveStatus(effect.status, attacker, tick);
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

  /** Regenerates MP, resolves lingering statuses, and reports whether the actor may act. */
  const upkeep = (actor: Fighter): boolean => {
    actor.mp = Math.min(actor.mp + actor.base.mpRegen, actor.maxMp);
    events.push({ kind: 'turn', tick, combatant: actor.key, mp: actor.mp });

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

    if (skill.costKind === 'mp') {
      actor.mp -= skill.costAmount;
    } else if (skill.costKind === 'hp') {
      // `canAfford` guarantees this leaves at least a sliver, so paying for a skill can never
      // be what kills the caster.
      actor.hp = actor.hp.sub(num(skill.costAmount));
    }
    if (skill.cooldown > 0) {
      actor.cooldowns.set(skill.id, tick + skill.cooldown);
    }
    if (skill.id !== actor.combatant.basic.id) {
      events.push({
        kind: 'cast',
        tick,
        source: actor.key,
        skillId: skill.id,
        skillName: skill.name,
        mp: actor.mp,
        hp: actor.hp,
      });
    }

    for (const target of targets) {
      resolveOn(actor, target, skill);
    }
  };

  while (outcome === undefined) {
    const jump = ticksUntilNextEvent(fighters, tick);
    if (tick + jump > MAX_BATTLE_TICKS) {
      // Out of patience rather than out of combatants. The damage formula and the hit-chance
      // floor guarantee a battle ends eventually, but "eventually" is not a promise a
      // synchronous function on the main thread can keep — and a healer with a deep enough
      // pool can genuinely out-sustain a party for a long time.
      tick = MAX_BATTLE_TICKS;
      outcome = 'stalemate';
      break;
    }

    tick += jump;
    for (const fighter of fighters) {
      if (isAlive(fighter)) {
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
