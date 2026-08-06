/**
 * The bounty board's missions.
 *
 * `core/bounties.ts` evaluates these. What lives here is the content — a duration, a crew size, a
 * payout and an unlock — which is the same division `quests.ts` and `achievements.ts` make.
 *
 * ## The payout is a duration, not an amount
 *
 * ⚠️ Every mission pays `payoutSeconds` **of the run's own current idle income** in gold, xp and
 * essence — the same idiom `STAGE_REWARDS.rewardSeconds` uses for a stage's lump. A flat quantity
 * of any of those three is worthless a chapter or two later, because they are spent against a level
 * curve worth ×10⁹; a duration of the player's *current* rate means the same thing at stage 5 and
 * at stage 5,000 and never needs retuning.
 *
 * ⚠️ **No mission pays crystals**, and none may. The crystal rate is linear in the clear count
 * precisely so it cannot outrun a flat `PULL_COST`, and paying a multiple of it on a repeatable
 * timer is exactly the compounding that rule exists to prevent. Quests are where crystals come
 * from; bounties are where idle income comes from. Keeping the two faucets on different currencies
 * is what stops either from being the only one worth engaging with.
 *
 * ## What the durations and crews are measured against
 *
 * The formation is five, so a roster has to be **wider than the party** before the board is worth
 * anything — which is the entire point of the system. Crews are sized so the shipped ladder's
 * three starters cannot crew anything at all, the board opens with a one-character errand once a
 * player has pulled a little, and the longest mission wants four spare bodies.
 *
 * | | Runs for | Crew | Pays | Opens at |
 * | ------------- | -------- | ---- | ---------- | -------- |
 * | Errand | 1 hour | 1 | 20 minutes | 5 clears |
 * | Patrol | 4 hours | 2 | 90 minutes | 15 clears |
 * | Expedition | 8 hours | 3 | 3.5 hours | 30 clears |
 * | Long campaign | 24 hours | 4 | 12 hours | 50 clears |
 *
 * **Every mission pays less than it runs for**, and that is deliberate rather than stingy. A
 * bounty that paid its own duration back would make dispatching strictly free — the characters are
 * idle anyway — and the board would be a button the player presses rather than a decision. Paying
 * roughly a third to a half means sending four characters away is worth doing and still costs
 * something to think about once towers arrive and those characters have somewhere else to be.
 *
 * The longest mission is **24 hours**, which is also where the second notification fires. That is
 * not a coincidence and it is the one place this milestone's two halves touch: a full day away is
 * the point at which the board has nothing left to give and a player has something waiting.
 */

/** Milliseconds in an hour and a minute, so the table below reads in the units it is authored in. */
const HOUR = 3_600_000;
const MINUTE = 60;

export const BOUNTIES = [
  {
    id: 'errand',
    name: 'Village Errand',
    description: 'Send one character to run down a lead. Back within the hour.',
    durationMs: HOUR,
    crew: 1,
    payoutSeconds: 20 * MINUTE,
    unlockClears: 5,
  },
  {
    id: 'patrol',
    name: 'Border Patrol',
    description: 'Two characters walk the boundary. Half a working day.',
    durationMs: 4 * HOUR,
    crew: 2,
    payoutSeconds: 90 * MINUTE,
    unlockClears: 15,
  },
  {
    id: 'expedition',
    name: 'Deep Expedition',
    description: 'Three characters go somewhere the campaign does not.',
    durationMs: 8 * HOUR,
    crew: 3,
    payoutSeconds: 210 * MINUTE,
    unlockClears: 30,
  },
  {
    id: 'campaign',
    name: 'Long Campaign',
    description: 'Four characters, away for a full day. The board has nothing longer.',
    durationMs: 24 * HOUR,
    crew: 4,
    payoutSeconds: 720 * MINUTE,
    unlockClears: 50,
  },
] as const;
