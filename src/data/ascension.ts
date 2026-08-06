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
 * | common    | `common`  | 36 / 42       | 46 / 52         |
 * | legendary | `rare`    | 16 / 22       | 26 / 32         |
 * | ascended  | `elite`   | 8 / 14        | 18 / 24         |
 *
 * (mortal / celestial). `data/ascension.spec.ts` derives every one of those from the arrays
 * below rather than restating them, so a retune that moves a total fails there naming the real
 * number.
 *
 * ## Why the bottom of the ladder is the expensive part
 *
 * Every rung costs every character the same, so a tier is worth exactly the rungs it skips. That
 * is the only lever left, and it is pointed at a real asymmetry: a pull produces a *specific*
 * common-tier character about 3× more often than a specific legendary-tier one and about 10×
 * more often than an ascended-tier one. Charging 20 copies below `rare` is what makes a full
 * climb roughly the same commitment whichever tier you fell in love with — without it, a
 * common-tier character maxes out in well under one climb's worth of pulls while an
 * ascended-tier one takes nearly three.
 *
 * ## Why two ladders
 *
 * They differ only above `elite`, and only in size: the celestial rungs are roughly double. That
 * is what the celestial advantage in combat is paid for with, and it is the whole of the
 * difference — Angels and Demons walk the same shape of ladder as everyone else.
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
  8, // common → common+
  12, // common+ → rare
  2, // rare → rare+
  6, // rare+ → elite
  1, // elite → elite+
  1, // elite+ → legendary
  1, // legendary → legendary+
  1, // legendary+ → mythic
  1, // mythic → mythic+
  2, // mythic+ → ascended
  2, // ascended → ★1
  2, // ★1 → ★2
  2, // ★2 → ★3
  2, // ★3 → ★4
  2, // ★4 → ★5
] as const;

/**
 * Angels and Demons. Identical below `elite`, roughly double above it.
 *
 * The four rungs below `elite` are shared with the mortal ladder rather than scaled, and that is
 * deliberate: they are the tier gap (see the header), and a celestial common-tier character is
 * common-tier for the same reason everyone else's is. Scaling them would be charging twice for
 * one thing.
 */
export const CELESTIAL_LADDER = [
  8, // common → common+
  12, // common+ → rare
  2, // rare → rare+
  6, // rare+ → elite
  1, // elite → elite+
  2, // elite+ → legendary
  2, // legendary → legendary+
  2, // legendary+ → mythic
  2, // mythic → mythic+
  4, // mythic+ → ascended
  2, // ascended → ★1
  2, // ★1 → ★2
  2, // ★2 → ★3
  2, // ★3 → ★4
  2, // ★4 → ★5
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
