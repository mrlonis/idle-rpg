import { BANDIT, BOAR, GOLEM, SLIME, WARDEN, WISP } from './enemies';

/**
 * The stage ladder.
 *
 * One entry is one encounter. Enemies are inlined by reference rather than looked up by id:
 * a lookup would need resolution logic (which `data/` may not contain) and would introduce an
 * "unknown enemy id" failure mode that can only ever be an authoring bug. Repeating a
 * reference fields multiple copies; the simulation numbers them in the log.
 *
 * ## How difficulty escalates
 *
 * Not by multiplying stats. There is no level scaling here on purpose — the curve has not
 * earned it yet, and a scaling factor is a balance number that would have to live in `data/`
 * anyway. Stages escalate by asking harder questions: more bodies, faster bodies, then bodies
 * the party's damage profile is bad against.
 *
 * ## Where the ladder is tuned to
 *
 * Simulated over 400 seeds per stage, the starter party clears all eight and settles on the
 * last one, which repeats. Battles run from about 4 seconds at the bottom to 28 at the top,
 * and the party finishes stage 1 untouched but stage 8 with roughly one member standing.
 *
 * Clearable end to end is deliberate. There is nothing to spend gold on yet, so a stage the
 * party simply cannot beat would be a permanent stop rather than a goal — the terminal state
 * of this milestone is farming the last stage, not staring at a wall. The final stage still
 * loses outright on about 1 seed in 100, which is what a retry with a fresh battle seed is
 * for.
 *
 * `goldReward` climbs about 1.6x per stage. Deliberately modest: at stage 8 that is 650 a
 * clear, nowhere near float64's limits, so the curve does not need `break_infinity` to be
 * correct — it is there as a hedge, not because this demands it.
 */
export const STAGES = [
  {
    id: 'stage-1',
    name: 'Mossy Hollow',
    enemies: [SLIME, SLIME],
    goldReward: 25,
  },
  {
    id: 'stage-2',
    name: 'Sunken Path',
    enemies: [SLIME, SLIME, SLIME],
    goldReward: 40,
  },
  {
    // First speed check: two Wisps act nearly twice as often as anything the party has.
    id: 'stage-3',
    name: 'Wisplight Marsh',
    enemies: [WISP, WISP, SLIME],
    goldReward: 65,
  },
  {
    id: 'stage-4',
    name: 'Bramble Run',
    enemies: [BOAR, SLIME, SLIME],
    goldReward: 100,
  },
  {
    // First real damage check: Bandits hit hard enough and often enough to threaten Rin, and
    // the Slime is what tips the fight from comfortable to costly.
    id: 'stage-5',
    name: 'Cutthroat Camp',
    enemies: [BANDIT, BANDIT, SLIME],
    goldReward: 160,
  },
  {
    // The widest wave in the ladder: five bodies, two of them fast. Focusing the weakest
    // target is the right call and still only just enough — the party usually loses someone.
    id: 'stage-6',
    name: 'Thornwood Clearing',
    enemies: [BOAR, BOAR, WISP, WISP, SLIME],
    goldReward: 250,
  },
  {
    // The DEF check. Almost nothing the party does lands for full value, and the Wisp means
    // grinding through it is not free.
    id: 'stage-7',
    name: 'Broken Causeway',
    enemies: [GOLEM, WISP],
    goldReward: 400,
  },
  {
    // The gate, and the end of the authored ladder. Winnable but expensive: the party usually
    // finishes with one member standing, and a bad set of crit rolls loses outright.
    id: 'stage-8',
    name: 'The Warden’s Gate',
    enemies: [WARDEN, BANDIT],
    goldReward: 650,
  },
] as const;
