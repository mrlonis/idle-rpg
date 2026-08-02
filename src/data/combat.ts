/**
 * The combat rules: what a rank is worth, and who beats whom.
 *
 * Plain data, as everything in `data/` is. `core/battle/` receives this as an argument and
 * resolves it into lookups; retuning any of it is an edit to this file and nothing else.
 *
 * ## Why a faction matrix is not the "flat synergy bonus" AGENTS.md forbids
 *
 * The thing that rule is about is a bonus for **your own team's composition** — "+10% if two
 * Fire units" — because that only ever produces a new single optimal team and asks nothing of
 * the encounter. This is the opposite shape: every multiplier here is a statement about the
 * *matchup*, so what it rewards is bringing the right answer to the fight in front of you. A
 * Dwarf wall is not better in general; it is better against Elves and worse against Humans,
 * and which of those a player wants depends entirely on what the next stage fields.
 *
 * The numbers are small on purpose. Five percent does not decide a fight — it decides a fight
 * that was already close, which is what a tiebreaker should do. If a matchup edge were large
 * enough to carry a bad party, the ladder would stop being about the enemy design that this
 * milestone exists to build.
 *
 * ## The mortal cycle, the monster wildcard, and the celestial tax
 *
 * - **human → dwarf → elf → undead → human**, five percent each. A closed cycle, so no mortal
 *   faction is anybody's strict answer: whoever counters you is countered by somebody else.
 * - **Monsters trade defence for reach.** They hit every faction for five percent more and
 *   take five percent more from the four other mortal factions. That is a wildcard with a
 *   bill attached rather than a free upgrade — and monster-on-monster is ten percent, so the
 *   answer to a formidable all-Monster wave is Monsters of your own.
 * - **Celestials are simply better at hitting mortals**, ten percent, with nothing coming
 *   back. This is a deliberate power advantage and the one asymmetry in the table. It is paid
 *   for on the other side of the game: Angels and Demons walk the **luck-only** ascension
 *   ladder, which asks for copies of the character itself at every single rung and never
 *   accepts a faction-mate, so a celestial is cheap in bodies and brutally expensive in
 *   banners. Angel and Demon get five percent against each other, which makes the answer to a
 *   celestial wall the celestial you also had to be lucky to own.
 *
 * The counterweight to that advantage is **enemy design, not arithmetic**. A Demon's ten
 * percent against a Golem does not help nearly as much as a Monster's raw ATK against the
 * diminishing-DEF curve, and no amount of matchup multiplier lets a 380-HP Azrathoth stand in
 * a front rank. That is the intended shape: the matrix decides close fights, and the encounter
 * decides which archetype was ever going to be close.
 */

/**
 * What standing in each rank is worth.
 *
 * The front row's five percent covers **both** defences, so putting a body forward is worth
 * the same whatever is being thrown at it.
 *
 * The back row's five percent lands on whichever offensive stat is already higher, and only
 * that one. A mage gets all of it on `matk` — which nothing but its skills read, because every
 * basic attack in the game is physical — and none of it on the swing it spends most of its
 * turns making. So the bonus pays for standing where a character's damage actually comes from
 * rather than paying for the back row itself, and a caster that runs out of MP quietly stops
 * benefiting from where it is standing.
 */
export const ROW_BONUSES = {
  frontDefence: 1.05,
  backOffence: 1.05,
} as const;

/**
 * The matchup matrix. Any pairing absent from this list is neutral.
 *
 * Written out in full rather than derived from a cycle, because `data/` is plain data and a
 * generated table is a function by another name. `combat.spec.ts` asserts the structure this
 * comment claims — the cycle closes, Monsters pay for their reach, celestials do not — so an
 * edit that breaks one of those reads as a failure naming the rule it broke.
 */
export const FACTION_MATCHUPS = [
  // The mortal cycle. Each beats the next by five percent, and the loop closes.
  { attacker: 'human', defender: 'dwarf', multiplier: 1.05 },
  { attacker: 'dwarf', defender: 'elf', multiplier: 1.05 },
  { attacker: 'elf', defender: 'undead', multiplier: 1.05 },
  { attacker: 'undead', defender: 'human', multiplier: 1.05 },

  // Monsters hit everything harder…
  { attacker: 'monster', defender: 'human', multiplier: 1.05 },
  { attacker: 'monster', defender: 'dwarf', multiplier: 1.05 },
  { attacker: 'monster', defender: 'elf', multiplier: 1.05 },
  { attacker: 'monster', defender: 'undead', multiplier: 1.05 },
  { attacker: 'monster', defender: 'angel', multiplier: 1.05 },
  { attacker: 'monster', defender: 'demon', multiplier: 1.05 },
  // …including each other, which is what makes Monsters their own counter.
  { attacker: 'monster', defender: 'monster', multiplier: 1.1 },
  // …and take it back from the four mortal factions outside the cycle with them.
  { attacker: 'human', defender: 'monster', multiplier: 1.05 },
  { attacker: 'dwarf', defender: 'monster', multiplier: 1.05 },
  { attacker: 'elf', defender: 'monster', multiplier: 1.05 },
  { attacker: 'undead', defender: 'monster', multiplier: 1.05 },

  // Celestials against everything mortal, one way only.
  { attacker: 'angel', defender: 'human', multiplier: 1.1 },
  { attacker: 'angel', defender: 'dwarf', multiplier: 1.1 },
  { attacker: 'angel', defender: 'elf', multiplier: 1.1 },
  { attacker: 'angel', defender: 'undead', multiplier: 1.1 },
  { attacker: 'angel', defender: 'monster', multiplier: 1.1 },
  { attacker: 'demon', defender: 'human', multiplier: 1.1 },
  { attacker: 'demon', defender: 'dwarf', multiplier: 1.1 },
  { attacker: 'demon', defender: 'elf', multiplier: 1.1 },
  { attacker: 'demon', defender: 'undead', multiplier: 1.1 },
  { attacker: 'demon', defender: 'monster', multiplier: 1.1 },

  // And against each other, which is the only answer a celestial wall has.
  { attacker: 'angel', defender: 'demon', multiplier: 1.05 },
  { attacker: 'demon', defender: 'angel', multiplier: 1.05 },
] as const;

/**
 * The attack every combatant falls back to.
 *
 * **Physical, single target, into the front rank.** All three of those are load-bearing.
 * Physical is why the back row's `matk` bonus only pays off on a cast; single-target is what
 * makes a wide wave a genuine question; and targeting through the front-row gate is what turns
 * a formation into a puzzle instead of a seating chart. Every bypass in the game is authored
 * on an individual skill, so reaching a back line is a decision about who to field rather than
 * a number to accumulate.
 */
export const BASIC_ATTACK = {
  id: 'basic-attack',
  name: 'Attack',
  target: 'enemy-front',
  effects: [{ kind: 'damage', damageType: 'physical', power: 1 }],
  // The floor. Every authored skill sits above this, so the basic attack is what happens when
  // nothing better is available rather than something selection has to consider.
  priority: 0,
} as const;

/**
 * Floor under any attack's hit chance.
 *
 * A termination guard first and a balance number second. `simulateBattle` is only guaranteed
 * to return because damage lands eventually; a dodge pool that could reach certainty would
 * turn every fight against it into a stalemate. Ten percent also keeps an evasion build
 * *annoying* rather than *unbeatable*, which is the right amount of annoying for a stat with
 * no counter-play beyond accuracy.
 */
export const MIN_HIT_CHANCE = 0.1;

/**
 * Ceiling on `armorPen` and `magicPen`.
 *
 * A shredder should make a wall feel like a body, not like an empty square. Leaving a tenth of
 * DEF standing keeps the diminishing-return curve doing its job at the top end, which is what
 * stops "stack penetration" from collapsing every defensive archetype at once.
 */
export const MAX_PENETRATION = 0.9;

/** Everything the simulation needs that is a number rather than a rule. */
export const COMBAT_RULES = {
  rows: ROW_BONUSES,
  matchups: FACTION_MATCHUPS,
  minHitChance: MIN_HIT_CHANCE,
  maxPenetration: MAX_PENETRATION,
  basicAttack: BASIC_ATTACK,
} as const;
