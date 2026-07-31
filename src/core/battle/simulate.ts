import { mulberry32 } from '../mulberry32';
import { type Numeric, ZERO } from '../numeric';
import { deriveSeed } from '../rng';
import { ATB_THRESHOLD, MAX_BATTLE_TICKS, ticksToMs, ticksUntilReady } from './clock';
import { toCombatant, toGoldReward } from './content';
import { rollAttack } from './damage';
import {
  type BattleEvent,
  type BattleOutcome,
  type BattleResult,
  type CombatantData,
  type CombatantSnapshot,
  type CombatStats,
  type Side,
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
 * An ATB gauge rather than fixed rounds. Every living combatant gains `spd` gauge per tick and
 * acts when it reaches `ATB_THRESHOLD`, so a faster combatant genuinely takes more turns
 * instead of merely going earlier in a round. SPD is therefore a stat with a real cost —
 * which is the point, and which fixed rounds cannot express.
 *
 * The loop jumps straight to the tick of the next action instead of stepping tick by tick.
 * The two are equivalent (see `ticksUntilReady`) and the jump costs one iteration per action
 * rather than one per tick, which matters once balance sweeps run thousands of battles.
 *
 * ## Determinism
 *
 * `seed` is a fully derived battle seed — build it with {@link battleSeed}, never from
 * `state.rng` directly. Combat draws from its own sub-stream and does **not** advance
 * `state.rng.calls`, so replaying a battle is reproducible and cannot shift the gacha pull
 * sequence.
 */

/**
 * A combatant's working state during the fight.
 *
 * Deliberately mutable, and deliberately local: these are built inside `simulateBattle`,
 * mutated as the fight resolves, and read back out into immutable snapshots. None of this
 * ever reaches `GameState`, so the purity of the public function holds — exactly the pattern
 * `RngStream` uses.
 */
interface Fighter {
  readonly key: string;
  readonly side: Side;
  readonly slot: number;
  readonly defId: string;
  readonly name: string;
  readonly maxHp: Numeric;
  readonly stats: CombatStats;
  hp: Numeric;
  gauge: number;
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

function isAlive(fighter: Fighter): boolean {
  return fighter.hp.gt(ZERO);
}

/**
 * Places one side on the field.
 *
 * Copies of the same definition are numbered ("Slime 1", "Slime 2") so the log stays readable
 * when a stage fields three of something. Keys are positional and never reused, so events
 * stay unambiguous even between identical combatants.
 */
function buildSide(defs: readonly CombatantData[], side: Side): Fighter[] {
  const totals = new Map<string, number>();
  for (const def of defs) {
    totals.set(def.id, (totals.get(def.id) ?? 0) + 1);
  }

  const numbered = new Map<string, number>();
  return defs.map((def, slot) => {
    const { id, name, stats } = toCombatant(def);
    const ordinal = (numbered.get(id) ?? 0) + 1;
    numbered.set(id, ordinal);

    return {
      key: `${side}-${slot}`,
      side,
      slot,
      defId: id,
      name: (totals.get(id) ?? 0) > 1 ? `${name} ${ordinal}` : name,
      maxHp: stats.hp,
      stats,
      hp: stats.hp,
      gauge: 0,
    };
  });
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

/** Ticks until the next combatant is ready to act. */
function ticksUntilNextAction(fighters: readonly Fighter[]): number {
  let soonest = MAX_BATTLE_TICKS;
  for (const fighter of fighters) {
    if (isAlive(fighter)) {
      soonest = Math.min(soonest, ticksUntilReady(fighter.gauge, fighter.stats.spd));
    }
  }
  return soonest;
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

/**
 * Picks a target for `side` to attack: the living opponent with the least HP remaining, ties
 * broken by slot.
 *
 * Focusing the weakest opponent is the strongest simple auto-battle heuristic — a dead enemy
 * deals no damage, so finishing one off is worth more than spreading damage evenly. It is
 * also completely deterministic, which keeps replays exact. Targeting stays deliberately
 * naive until enemy design gives it something to reason about (taunts, backline threats);
 * milestone 4 is where that lands.
 */
function pickTarget(fighters: readonly Fighter[], side: Side): Fighter | undefined {
  let best: Fighter | undefined;
  for (const fighter of fighters) {
    if (fighter.side === side || !isAlive(fighter)) {
      continue;
    }
    if (best === undefined || fighter.hp.lt(best.hp)) {
      best = fighter;
    }
  }
  return best;
}

function snapshot(fighter: Fighter): CombatantSnapshot {
  return {
    key: fighter.key,
    side: fighter.side,
    slot: fighter.slot,
    defId: fighter.defId,
    name: fighter.name,
    maxHp: fighter.maxHp,
    hp: fighter.hp,
    spd: fighter.stats.spd,
  };
}

/**
 * Resolves a whole battle.
 *
 * @param team the party, in slot order, as authored in `data/`
 * @param stage the encounter to fight, as authored in `data/`
 * @param seed a derived battle seed from {@link battleSeed} — not `state.rng.seed`
 */
export function simulateBattle(
  team: readonly CombatantData[],
  stage: StageData,
  seed: number,
): BattleResult {
  const draw = mulberry32(seed);
  const fighters = [...buildSide(team, 'ally'), ...buildSide(stage.enemies, 'enemy')];
  const roster = fighters.map(snapshot);
  const events: BattleEvent[] = [];

  let tick = 0;
  let outcome = decide(fighters);

  while (outcome === undefined) {
    const jump = ticksUntilNextAction(fighters);
    if (tick + jump > MAX_BATTLE_TICKS) {
      // Out of patience rather than out of combatants. The damage formula guarantees a
      // battle ends eventually, but "eventually" is not a promise a synchronous function on
      // the main thread can keep.
      tick = MAX_BATTLE_TICKS;
      outcome = 'stalemate';
      break;
    }

    tick += jump;
    for (const fighter of fighters) {
      if (isAlive(fighter)) {
        fighter.gauge += fighter.stats.spd * jump;
      }
    }

    for (const actor of readyInOrder(fighters)) {
      // Turn order is fixed at the top of the tick, so an actor can be killed by an earlier
      // action within the same tick and must not still swing.
      if (!isAlive(actor)) {
        continue;
      }
      actor.gauge -= ATB_THRESHOLD;

      const target = pickTarget(fighters, actor.side);
      if (target === undefined) {
        break;
      }

      const { damage, crit } = rollAttack(actor.stats, target.stats, draw);
      const remaining = target.hp.sub(damage);
      target.hp = remaining.lt(ZERO) ? ZERO : remaining;

      events.push({
        kind: 'attack',
        tick,
        source: actor.key,
        target: target.key,
        damage,
        crit,
        targetHp: target.hp,
      });
      if (!isAlive(target)) {
        events.push({ kind: 'defeat', tick, combatant: target.key });
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
        ? { gold: toGoldReward(stage.goldReward), goldPerSec: toGoldReward(stage.goldPerSec) }
        : { gold: ZERO, goldPerSec: ZERO },
  };
}
