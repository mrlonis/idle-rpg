/**
 * The two ascension ladders, and the factions that walk them.
 *
 * Plain data, as everything in `data/` is. A rung's entry is the number of **base copies of the
 * character being ascended** that leaving that rung costs — the number the player actually
 * spends, with nothing between this table and the price on screen. Retuning a rung is an edit
 * to one integer in this file and nothing else.
 *
 * ## Reading the tables
 *
 * Both arrays are indexed by **the rarity being left**, so entry 0 is the price of leaving
 * `common` and the last entry is the price of leaving `ascended-4`. Length is
 * `RARITIES.length - 1`: there is no step off the top.
 *
 * A character never starts at index 0 unless it is common-tier — see `startRarityIndex` in
 * [`core/roster/rarity.ts`](../core/roster/rarity.ts) — so the first four entries are, in order,
 * the two rungs only common-tier characters ever climb and the two only common- and
 * legendary-tier ones do.
 *
 * ## The three totals this is tuned around
 *
 * Counting the first copy, so these are "how many of this character do I have to see":
 *
 * | Tier      | Starts at | To `ascended` | To `ascended-5` |
 * | --------- | --------- | ------------- | --------------- |
 * | common    | `common`  | 63 / 83       | 93 / 113        |
 * | legendary | `rare`    | 53 / 73       | 83 / 103        |
 * | ascended  | `elite`   | 43 / 63       | 73 / 93         |
 *
 * (mortal / celestial). `data/ascension.spec.ts` derives every one of those from the arrays
 * below rather than restating them, so a retune that moves a total fails there naming the real
 * number.
 *
 * ## Why the weight sits above `elite`
 *
 * Every rung costs every character the same, so a tier is worth exactly the rungs it skips — and
 * what a tier skips is the *cheap* end. 20 copies sit below `elite` and 72 above it, so the bulk
 * of a climb is the stretch that every tier walks.
 *
 * That makes a higher tier a **longer** investment rather than a shortcut, which is deliberate.
 * A pull produces a *specific* common-tier character about 4× more often than a specific
 * ascended-tier one, so paying near-identical copy counts out of a much thinner stream is what
 * separates the climbs: at the shipped rates a common-tier character maxes in roughly 2,800
 * pulls and an ascended-tier one in roughly 9,000.
 *
 * ⚠️ **This inverts what the ladder used to say**, and the inversion is the point rather than
 * drift. The bottom used to carry the whole tier gap so that every tier was a comparable
 * commitment; it now carries a fifth of the ladder, and tier buys a head start on the level cap
 * instead of a shorter climb. Retuning rungs 0–3 is retuning how much of a head start that is.
 *
 * ## Why two ladders
 *
 * They differ only above `elite`, and only in size: the celestial rungs on 5–9 are half again as
 * expensive. That is what the celestial advantage in combat is paid for with, and it is the whole
 * of the difference — Angels and Demons walk the same shape of ladder as everyone else.
 *
 * ⚠️ **The factor is chosen to land the totals, not the rungs.** It was a flat ×2 per rung when
 * those rungs were 1s and 2s, which came to +6 copies and about ×1.2 on a total. Applying ×2 to
 * the current rungs would cost +38 and reach ×1.5 — the same rule charging a materially heavier
 * tax. ×1.5 is what reproduces the premium celestials have always actually paid.
 *
 * The ladders used to differ in *kind*: four mortal rungs were paid in same-faction fodder while
 * the celestial ones never were, so the two were expensive in genuinely different resources.
 * That distinction went when fodder did, and what is left is a straight price difference. Worth
 * knowing before reading either table as though it still says something about bodies.
 */

/**
 * Humans, Dwarves, Elves, Undead and Monsters.
 *
 * ```
 *  common  common+  rare  rare+ │ elite  elite+  leg  leg+  myth  myth+ │ ★1 ★2 ★3 ★4 ★5
 * ```
 */
export const MORTAL_LADDER = [
  4, // common → common+
  6, // common+ → rare
  3, // rare → rare+
  7, // rare+ → elite
  4, // elite → elite+
  8, // elite+ → legendary
  5, // legendary → legendary+
  9, // legendary+ → mythic
  6, // mythic → mythic+
  10, // mythic+ → ascended
  6, // ascended → ★1
  6, // ★1 → ★2
  6, // ★2 → ★3
  6, // ★3 → ★4
  6, // ★4 → ★5
] as const;

/**
 * Angels and Demons. Identical below `elite`, half again as expensive on rungs 5–9.
 *
 * The four rungs below `elite` are shared with the mortal ladder rather than scaled, and that is
 * deliberate: they are the tier gap (see the header), and a celestial common-tier character is
 * common-tier for the same reason everyone else's is. Scaling them would be charging twice for
 * one thing.
 *
 * ⚠️ **`elite → elite+` and the five stars are shared too**, which is easy to miss when reading
 * "the celestial ladder is the expensive one above `elite`". The premium has always lived on
 * rungs 5–9 alone; the first rung above `elite` and the whole star stretch have never carried it.
 * A retune that scales the block uniformly is a different ladder from this one.
 */
export const CELESTIAL_LADDER = [
  4, // common → common+
  6, // common+ → rare
  3, // rare → rare+
  7, // rare+ → elite
  4, // elite → elite+
  12, // elite+ → legendary
  8, // legendary → legendary+
  14, // legendary+ → mythic
  9, // mythic → mythic+
  15, // mythic+ → ascended
  6, // ascended → ★1
  6, // ★1 → ★2
  6, // ★2 → ★3
  6, // ★3 → ★4
  6, // ★4 → ★5
] as const;

/** Both ladders, in the shape `core/roster/` takes as an argument. */
export const ASCENSION_RULES = {
  mortal: MORTAL_LADDER,
  celestial: CELESTIAL_LADDER,
} as const;

/**
 * The seven factions.
 *
 * Faction is what decides the ascension path, which is why it is a property of the faction
 * rather than of each character — a character cannot be authored onto the wrong ladder.
 */
export const FACTIONS = [
  { id: 'human', name: 'Humans', ascensionPath: 'mortal' },
  { id: 'dwarf', name: 'Dwarves', ascensionPath: 'mortal' },
  { id: 'elf', name: 'Elves', ascensionPath: 'mortal' },
  { id: 'undead', name: 'Undead', ascensionPath: 'mortal' },
  { id: 'monster', name: 'Monsters', ascensionPath: 'mortal' },
  { id: 'angel', name: 'Angels', ascensionPath: 'celestial' },
  { id: 'demon', name: 'Demons', ascensionPath: 'celestial' },
] as const;
