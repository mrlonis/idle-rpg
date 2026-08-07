/**
 * The bounty board's missions.
 *
 * `core/bounties.ts` evaluates these. What lives here is the content — a duration, a crew size, a
 * payout, an unlock and an optional faction requirement — which is the same division `quests.ts`
 * and `achievements.ts` make.
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
 * ## Four tiers, three variants each, one of each tier offered per day
 *
 * The board **rotates daily**. What is authored here is a **pool**; what a player sees is one
 * variant of each unlocked tier, drawn from the run's own seed against the day index. Nothing about
 * the day's board is stored — see `dailyBoard` in `core/bounties.ts` for why that matters.
 *
 * | Tier | Runs for | Crew | Pays | Opens at |
 * | ------------- | -------- | ---- | ---------- | -------- |
 * | Errand | 1 hour | 1 | 20 minutes | 5 clears |
 * | Patrol | 4 hours | 2 | 90 minutes | 15 clears |
 * | Expedition | 8 hours | 3 | 3.5 hours | 30 clears |
 * | Long campaign | 24 hours | 4 | 12 hours | 50 clears |
 *
 * ⚠️ **Every variant of a tier shares that tier's duration, crew, payout and unlock**, and only the
 * flavour and the faction requirement differ. That is what keeps the ladder a ladder: the board
 * always reads short-to-long in the same shape, so rotation changes *what you are asked for* rather
 * than *what the board is worth today*. A variant that also paid differently would make the day's
 * draw a payout lottery, which is the manufactured scarcity this project rejects everywhere else.
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
 *
 * ## ⚠️ A faction requirement never names a celestial faction
 *
 * Angels and Demons ascend on **copies of themselves alone** — there is no fodder path and no shop
 * that sells them, so a run whose banners are unkind can own none of either for a very long time.
 * A mission requiring one would be a row that player cannot run, for reasons no amount of play
 * fixes. That is the same failure milestone 4 rejected role-locked formation slots for, and the
 * same one that put a healer and a cleanse on the mortal ladder.
 *
 * The five mortal factions are all reachable — through pulls, through the spark shop, and at
 * three-per-faction at common tier — so a requirement naming one is a question a player can always
 * eventually answer. `bounties.spec.ts` derives the rule from `FACTIONS` rather than restating the
 * list, so a faction changing ladder re-runs it.
 *
 * **Each tier keeps one variant with no requirement at all.** A tier whose every variant named a
 * faction could roll one the player owns none of and leave that whole rung of the board dead for
 * the day; with a plain variant in the pool it is only ever sometimes.
 */

/** Milliseconds in an hour and a minute, so the table below reads in the units it is authored in. */
const HOUR = 3_600_000;
const MINUTE = 60;

/**
 * When the board rotates.
 *
 * ⚠️ **The same 04:00 UTC boundary the quest windows use, and it must stay the same.** Two daily
 * clocks four hours apart would mean two separate "tomorrows" in one game — a player who opened the
 * app at 02:00 would find their quests reset and their board not, with nothing on either screen to
 * explain it. `bounties.spec.ts` asserts equality against `QUEST_RULES` rather than restating 240,
 * so moving one moves both or fails.
 */
export const BOUNTY_BOARD = {
  resetOffsetMinutes: 240,
} as const;

export const BOUNTIES = [
  // ── Errand: one character, an hour, the rung the board opens on ──────────────────────────────
  {
    id: 'errand-lead',
    tier: 'errand',
    name: 'Village Errand',
    description: 'Send one character to run down a lead. Back within the hour.',
    durationMs: HOUR,
    crew: 1,
    payoutSeconds: 20 * MINUTE,
    unlockClears: 5,
  },
  {
    id: 'errand-market',
    tier: 'errand',
    name: 'Market Day',
    description: 'The traders talk to their own. Someone from the towns should go.',
    durationMs: HOUR,
    crew: 1,
    payoutSeconds: 20 * MINUTE,
    unlockClears: 5,
    requires: { faction: 'human', count: 1 },
  },
  {
    id: 'errand-vigil',
    tier: 'errand',
    name: 'Graveyard Vigil',
    description: 'An hour among the barrows. Best sent with someone already at home there.',
    durationMs: HOUR,
    crew: 1,
    payoutSeconds: 20 * MINUTE,
    unlockClears: 5,
    requires: { faction: 'undead', count: 1 },
  },

  // ── Patrol: two characters, half a working day ───────────────────────────────────────────────
  {
    id: 'patrol-border',
    tier: 'patrol',
    name: 'Border Patrol',
    description: 'Two characters walk the boundary. Half a working day.',
    durationMs: 4 * HOUR,
    crew: 2,
    payoutSeconds: 90 * MINUTE,
    unlockClears: 15,
  },
  {
    id: 'patrol-canopy',
    tier: 'patrol',
    name: 'Canopy Watch',
    description: 'The old wood answers to those who grew up under it.',
    durationMs: 4 * HOUR,
    crew: 2,
    payoutSeconds: 90 * MINUTE,
    unlockClears: 15,
    requires: { faction: 'elf', count: 1 },
  },
  {
    id: 'patrol-warren',
    tier: 'patrol',
    name: 'Warren Sweep',
    description: 'Something is denning in the low tunnels. Send something that knows the smell.',
    durationMs: 4 * HOUR,
    crew: 2,
    payoutSeconds: 90 * MINUTE,
    unlockClears: 15,
    requires: { faction: 'monster', count: 1 },
  },

  // ── Expedition: three characters, a working day ──────────────────────────────────────────────
  {
    id: 'expedition-deep',
    tier: 'expedition',
    name: 'Deep Expedition',
    description: 'Three characters go somewhere the campaign does not.',
    durationMs: 8 * HOUR,
    crew: 3,
    payoutSeconds: 210 * MINUTE,
    unlockClears: 30,
  },
  {
    id: 'expedition-seam',
    tier: 'expedition',
    name: 'Collapsed Seam',
    description: 'Eight hours of shoring and hauling. Bring people who have done it before.',
    durationMs: 8 * HOUR,
    crew: 3,
    payoutSeconds: 210 * MINUTE,
    unlockClears: 30,
    requires: { faction: 'dwarf', count: 2 },
  },
  {
    id: 'expedition-envoy',
    tier: 'expedition',
    name: 'Envoy Escort',
    description: 'The delegation will not travel without a face they recognise.',
    durationMs: 8 * HOUR,
    crew: 3,
    payoutSeconds: 210 * MINUTE,
    unlockClears: 30,
    requires: { faction: 'human', count: 1 },
  },

  // ── Long campaign: four characters, a full day, the longest the board goes ───────────────────
  {
    id: 'campaign-long',
    tier: 'campaign',
    name: 'Long Campaign',
    description: 'Four characters, away for a full day. The board has nothing longer.',
    durationMs: 24 * HOUR,
    crew: 4,
    payoutSeconds: 720 * MINUTE,
    unlockClears: 50,
  },
  {
    id: 'campaign-reclamation',
    tier: 'campaign',
    name: 'Reclamation',
    description: 'A day spent taking a hold back. It wants hands that know the stonework.',
    durationMs: 24 * HOUR,
    crew: 4,
    payoutSeconds: 720 * MINUTE,
    unlockClears: 50,
    requires: { faction: 'dwarf', count: 2 },
  },
  {
    id: 'campaign-longwatch',
    tier: 'campaign',
    name: 'The Long Watch',
    description: 'Somebody has to sit with the wood for a day and a night.',
    durationMs: 24 * HOUR,
    crew: 4,
    payoutSeconds: 720 * MINUTE,
    unlockClears: 50,
    requires: { faction: 'elf', count: 2 },
  },
] as const;
