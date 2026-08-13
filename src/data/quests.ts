/**
 * Daily and weekly quests, and where their windows fall.
 *
 * `core/quests.ts` evaluates these. What lives here is the content — a counter, a target and a
 * price — which is the same division `achievements.ts` makes with its tracks.
 *
 * ## Every reward is crystals, and it is the only currency that could work
 *
 * ⚠️ Gold, xp and essence are spent against a level curve worth ×10⁹, so a flat quantity of any of
 * them is invisible a chapter or two in — the same argument `docs/gear.md` makes for gear bonuses
 * being percentages rather than quantities. A pull costs a flat `PULL_COST` forever, so crystals
 * are the one payout that means the same thing at stage 5 and at stage 5,000.
 *
 * Paying a *percentage* of income would fix the scaling and break the point: it would pay most to
 * the player whose ladder is already moving, when the whole reason quests exist is to pay the one
 * whose ladder is not.
 *
 * ## What the targets are measured against
 *
 * A battle is a tap and resolves in well under a minute, and auto-battle unlocks at twelve clears
 * — so five battles is a couple of minutes for a player who sat down to play, and not something
 * that has to be ground for. The pull quest is deliberately satisfiable by the crystals the day's
 * own idle income produces: at the base rate of 100 an hour a run earns a pull an hour before it
 * has cleared anything, so this never asks a player to have saved up.
 *
 * ⚠️ **A weekly is exactly seven of its daily, and never more** — 35 battles against five a day,
 * 7 pulls against one. A player who does their dailies has therefore already finished the
 * weeklies, which is the intended shape: the weekly tier is a **bonus for consistency, not a
 * second obligation**. A weekly demanding more than the dailies add up to would be a chore with a
 * deadline, which is the pattern this project rejects everywhere else — and `quests.spec.ts`
 * derives the bound from the daily targets rather than restating it, so retuning a daily re-checks
 * this instead of leaving it describing the old pair.
 */

/**
 * Where the day and the week roll over: 04:00 UTC.
 *
 * Not local midnight, and not read off the device's timezone at all. A reset that follows the
 * device would hand a second day to anyone who flies east, and take one from anyone who flies
 * west — and `core/` has no clock to read a timezone off anyway. One fixed moment is the only
 * version that means the same thing to one save carried between devices.
 *
 * Four in the morning rather than midnight for the ordinary reason: a player still up at 00:30 is
 * having tonight's session, not tomorrow's.
 */
export const QUEST_RULES = {
  resetOffsetMinutes: 240,
} as const;

/**
 * The quests this build ships.
 *
 * Two dailies and two weeklies, over the two counters that always move: `battleCount` advances on
 * every fight win or lose, and `pullCount` on every pull.
 *
 * ⚠️ **There is deliberately no quest over `clearedStages`**, which is the one that looks most
 * obviously right. It counts *first* clears, so it stops moving the moment a run reaches the top of
 * the authored ladder — and a daily a player at the end of the content can never finish is a
 * permanent empty row. `core/quests.ts` states the rule; this is the content obeying it.
 *
 * Daily total is 350 crystals — three and a half pulls — and weekly 1,400, which is another two a
 * day. Against the 20 to 40 pulls a day a fully cleared ladder produces idly, that is a supplement
 * rather than a replacement; against the near-nothing a player stuck at a wall earns, it is most of
 * what they get. That asymmetry is the entire design.
 */
export const QUESTS = [
  {
    id: 'daily-skirmish',
    name: 'Skirmish',
    description: 'Fight five battles. Losing one still counts.',
    period: 'daily',
    counter: 'battleCount',
    target: 5,
    reward: { summons: 200 },
  },
  {
    id: 'daily-summon',
    name: 'Consult the Crystal',
    description: 'Make a single pull.',
    period: 'daily',
    counter: 'pullCount',
    target: 1,
    reward: { summons: 150 },
  },
  {
    // ⚠️ **The one quest measured against something other than a battle or a pull, and the counter
    // had to earn it.** A quest counter has to be one a player can always make move *today*;
    // `clearedStages` cannot once the ladder runs out, and `signatureLevels` cannot before the first
    // item unlocks. The Descent is offered afresh every day forever, so its run count is the third
    // counter in the game that qualifies.
    //
    // A target of one, because the mode is once a day: any larger number would be a quest nobody
    // can finish, which is the same failure the counter rule exists to prevent arriving by the other
    // door. **No weekly pair**, deliberately — seven of these is perfect attendance, which is a
    // streak with a deadline by another name.
    id: 'daily-descent',
    name: 'The Long Way Down',
    description: 'Finish a Descent, all nine fights.',
    period: 'daily',
    counter: 'descentRuns',
    target: 1,
    reward: { summons: 300 },
  },
  {
    id: 'weekly-campaign',
    name: 'Campaigner',
    description: 'Fight thirty-five battles across the week.',
    period: 'weekly',
    counter: 'battleCount',
    target: 35,
    reward: { summons: 800 },
  },
  {
    id: 'weekly-summon',
    name: 'Patron of the Gate',
    description: 'Make seven pulls across the week.',
    period: 'weekly',
    counter: 'pullCount',
    target: 7,
    reward: { summons: 600 },
  },
] as const;
