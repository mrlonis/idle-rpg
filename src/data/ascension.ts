/**
 * The two ascension ladders, and the factions that walk them.
 *
 * Plain data, as everything in `data/` is: the rungs are authored here and the arithmetic
 * they imply lives in `core/roster/rarity.ts`. Retuning a rung is an edit to this file and
 * nothing else.
 *
 * ## Reading a rung
 *
 * Each entry is the price of leaving the rarity it is named after, quoted in **ascended**
 * copies — "2 copies of any character of the same faction at Rare+". A player never holds an
 * ascended spare, so `core/` resolves each of those recursively into base copies. The
 * headline numbers that falls out of:
 *
 * - A **mortal** ascended-tier character, Elite to Ascended: 8 Elite copies of itself, plus
 *   180 Rare copies of same-faction fodder. Five stars on top of that is 10 more Elite copies
 *   — 18 in total.
 * - A **celestial** ascended-tier character, Elite to Ascended: 14 Elite copies of itself and
 *   no fodder at all. 24 in total for five stars.
 * - Fodder priced in Rare copies: Rare+ 3, Elite 9, Elite+ 18, Legendary 54, Legendary+ 72.
 *
 * Those are design targets, not commentary — `data/ascension.spec.ts` asserts every one of
 * them against what these tables actually derive to, so an edit here that moves a total shows
 * up as a failure naming the old and new number.
 *
 * ## Why two ladders
 *
 * The mortal ladder spends **bodies**: four of its rungs are paid with same-faction fodder,
 * so a Human roster is only as ascendable as its bench is deep. That makes a common-tier
 * pull genuinely useful — it is both an early-game unit and future fodder for the
 * ascended-tier one standing next to it.
 *
 * The celestial ladder spends **luck**: Angels and Demons ask for nothing but copies of
 * themselves, which makes them trivial to ascend if the banner is kind and impossible if it
 * is not. Neither path is cheaper overall; they are expensive in different resources, which
 * is the point.
 */

// Ladder indices, named. These mirror `RARITIES` in `core/roster/types.ts`, which `data/`
// may not import — `ascension.spec.ts` asserts the two agree rather than trusting the
// comment.
const RARE = 0;
const RARE_PLUS = 1;
const ELITE = 2;
const ELITE_PLUS = 3;
const LEGENDARY_PLUS = 5;

/** Rungs from `ascended` to `ascended-5`: one Elite+ copy of the character per star. */
const STAR_RUNGS = [
  [{ scope: 'self', rarity: ELITE_PLUS, count: 1 }],
  [{ scope: 'self', rarity: ELITE_PLUS, count: 1 }],
  [{ scope: 'self', rarity: ELITE_PLUS, count: 1 }],
  [{ scope: 'self', rarity: ELITE_PLUS, count: 1 }],
  [{ scope: 'self', rarity: ELITE_PLUS, count: 1 }],
] as const;

/**
 * Humans, Dwarves, Elves, Undead and Monsters.
 *
 * Indexed by the rarity being left. Four rungs — Rare+, Elite+, Legendary+ and Mythic — are
 * paid in same-faction fodder, and those four are where the 180 Rare copies come from.
 */
export const MORTAL_LADDER = [
  // Rare → Rare+
  [{ scope: 'self', rarity: RARE, count: 2 }],
  // Rare+ → Elite
  [{ scope: 'faction', rarity: RARE_PLUS, count: 2 }],
  // Elite → Elite+
  [{ scope: 'self', rarity: ELITE, count: 1 }],
  // Elite+ → Legendary
  [{ scope: 'faction', rarity: ELITE_PLUS, count: 2 }],
  // Legendary → Legendary+
  [{ scope: 'self', rarity: ELITE_PLUS, count: 1 }],
  // Legendary+ → Mythic
  [{ scope: 'faction', rarity: LEGENDARY_PLUS, count: 1 }],
  // Mythic → Mythic+
  [{ scope: 'faction', rarity: LEGENDARY_PLUS, count: 1 }],
  // Mythic+ → Ascended
  [{ scope: 'self', rarity: ELITE_PLUS, count: 2 }],
  ...STAR_RUNGS,
] as const;

/**
 * Angels and Demons. Every rung is copies of the character itself.
 *
 * The authored table starts at Elite, because the tier this path was designed around starts
 * there. The two rungs below it exist for common- and legendary-tier Angels and Demons, and
 * are derived rather than authored: the defining property of this path is that it never asks
 * for fodder, so `Rare+ → Elite` is the mortal rung with its faction clause turned into a
 * self clause. Everything from Elite up is the authored table verbatim.
 */
export const CELESTIAL_LADDER = [
  // Rare → Rare+ — same as the mortal ladder, which asks for no fodder here either.
  [{ scope: 'self', rarity: RARE, count: 2 }],
  // Rare+ → Elite — derived: the mortal rung's faction clause, made self.
  [{ scope: 'self', rarity: RARE_PLUS, count: 2 }],
  // Elite → Elite+
  [{ scope: 'self', rarity: ELITE, count: 1 }],
  // Elite+ → Legendary
  [{ scope: 'self', rarity: ELITE_PLUS, count: 1 }],
  // Legendary → Legendary+
  [{ scope: 'self', rarity: ELITE_PLUS, count: 1 }],
  // Legendary+ → Mythic
  [{ scope: 'self', rarity: ELITE_PLUS, count: 1 }],
  // Mythic → Mythic+
  [{ scope: 'self', rarity: ELITE_PLUS, count: 1 }],
  // Mythic+ → Ascended
  [{ scope: 'self', rarity: ELITE_PLUS, count: 2 }],
  ...STAR_RUNGS,
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
