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
 * Simulated over 400 seeds per stage, the starter party clears all eight at level 1 and settles
 * on the last one, which repeats. Battles run from about 4 seconds at the bottom to 28 at the
 * top, and the party finishes stage 1 untouched but stage 8 with roughly one member standing.
 *
 * Clearable by the starting party is deliberate, and now doubly so: the gacha is what a player
 * spends their crystals on, and crystals come from clearing this ladder. A stage the starter
 * party could not beat would be a wall in front of the entire summon economy, not just in front
 * of the next fight.
 *
 * ## The four rates, and the one lump
 *
 * `rates` is the real prize. Clearing a stage permanently raises idle income on **every**
 * currency, and a rate compounds with time away in a way a lump sum cannot. Gold runs 0.5/s to
 * 16/s across the ladder; the others are scaled to sit where `levels.ts` needs them, with
 * essence deliberately stingiest.
 *
 * `reward` is the smaller half: a one-off lump paid on every clear, tuned to roughly forty
 * seconds of the income the stage unlocks, so it reads as a bonus rather than as the
 * progression.
 *
 * **Summon crystals are deliberately absent from `reward`.** They accrue idly and on a first
 * clear, and nowhere else. A repeatable crystal payout would make tap-farming the shortest
 * stage the fastest way to pull — stage 1 resolves in about four seconds — and the correct
 * play in a game about a party climbing a ladder would be to never leave the bottom of it.
 * Tying crystals to the rate and to genuine progress removes that incentive completely rather
 * than balancing against it.
 *
 * `firstClearSummons` totals 3,000 across the ladder — thirty pulls, three of them as
 * ten-pulls — so a new player who fights their way up has a real roster before the idle trickle
 * has delivered much of anything.
 */
export const STAGES = [
  {
    id: 'stage-1',
    name: 'Mossy Hollow',
    enemies: [SLIME, SLIME],
    reward: { gold: 25, xp: 4 },
    rates: { gold: 0.5, xp: 0.1, essence: 0.0015, summons: 0.0015 },
    firstClearSummons: 200,
  },
  {
    id: 'stage-2',
    name: 'Sunken Path',
    enemies: [SLIME, SLIME, SLIME],
    reward: { gold: 40, xp: 8 },
    rates: { gold: 1, xp: 0.2, essence: 0.003, summons: 0.0025 },
    firstClearSummons: 200,
  },
  {
    // First speed check: two Wisps act nearly twice as often as anything the party has.
    id: 'stage-3',
    name: 'Wisplight Marsh',
    enemies: [WISP, WISP, SLIME],
    reward: { gold: 65, xp: 12 },
    rates: { gold: 1.5, xp: 0.3, essence: 0.005, summons: 0.0035 },
    firstClearSummons: 250,
  },
  {
    id: 'stage-4',
    name: 'Bramble Run',
    enemies: [BOAR, SLIME, SLIME],
    reward: { gold: 100, xp: 20, essence: 1 },
    rates: { gold: 2.5, xp: 0.5, essence: 0.008, summons: 0.005 },
    firstClearSummons: 300,
  },
  {
    // First real damage check: Bandits hit hard enough and often enough to threaten Rin, and
    // the Slime is what tips the fight from comfortable to costly.
    id: 'stage-5',
    name: 'Cutthroat Camp',
    enemies: [BANDIT, BANDIT, SLIME],
    reward: { gold: 160, xp: 32, essence: 1 },
    rates: { gold: 4, xp: 0.8, essence: 0.013, summons: 0.007 },
    firstClearSummons: 350,
  },
  {
    // The widest wave in the ladder: five bodies, two of them fast. Focusing the weakest
    // target is the right call and still only just enough — the party usually loses someone.
    id: 'stage-6',
    name: 'Thornwood Clearing',
    enemies: [BOAR, BOAR, WISP, WISP, SLIME],
    reward: { gold: 250, xp: 48, essence: 2 },
    rates: { gold: 6, xp: 1.2, essence: 0.02, summons: 0.009 },
    firstClearSummons: 400,
  },
  {
    // The DEF check. Almost nothing the party does lands for full value, and the Wisp means
    // grinding through it is not free.
    id: 'stage-7',
    name: 'Broken Causeway',
    enemies: [GOLEM, WISP],
    reward: { gold: 400, xp: 80, essence: 3 },
    rates: { gold: 10, xp: 2, essence: 0.032, summons: 0.011 },
    firstClearSummons: 500,
  },
  {
    // The gate, and the end of the authored ladder. Winnable but expensive: the party usually
    // finishes with one member standing, and a bad set of crit rolls loses outright.
    id: 'stage-8',
    name: 'The Warden’s Gate',
    enemies: [WARDEN, BANDIT],
    reward: { gold: 650, xp: 120, essence: 5 },
    rates: { gold: 16, xp: 3, essence: 0.05, summons: 0.014 },
    firstClearSummons: 800,
  },
] as const;
