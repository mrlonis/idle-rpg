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
 * **Each rank sharpens the role it already has.** The front row is the gate ordinary attacks
 * work through, so it gets defence and the answer to a crit build. The back row is where damage
 * is fielded, so it gets attack and the crit amplification to go with it. Neither is a tax on
 * the other: the cost of the front row is that it is the rank getting hit, which is a fact about
 * the formation rather than a number in this file.
 *
 * This replaced milestone 4's "+5% to whichever offensive stat is already higher, and only that
 * one" when milestone 8a collapsed `patk` and `matk` into a single `atk`, at which point the
 * old rule had nothing left to choose between. The crit halves are **points, not multipliers** —
 * a crit is worth `1 + max(amp - resist, 0)`, so multiplying a zero by 1.05 would pay nothing at
 * all.
 */
export const ROW_BONUSES = {
  frontDefence: 1.05,
  frontCritDamageResist: 0.05,
  backAttack: 1.05,
  backCritDamageAmp: 0.05,
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
 * Physical is the type every `physicalResist` wall in the game is authored against, so a
 * magical kit is what gets past one; single-target is what makes a wide wave a genuine
 * question; and targeting through the front-row gate is what turns a formation into a puzzle
 * instead of a seating chart. Every bypass in the game is authored on an individual skill, so
 * reaching a back line is a decision about who to field rather than a number to accumulate.
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
 * What fighting is worth in energy, against a bar of 100.
 *
 * These three numbers decide how often ultimates land, and they were chosen to **reproduce the
 * cadence the cooldowns and MP pool used to produce** rather than to be a fresh opinion — the
 * ladder was tuned against roughly one marquee cast every three to five turns, and a rework that
 * quietly halved that would have retuned twenty-four stages by accident.
 *
 * Measured against the invested reference party at the top of the ladder, this lands there:
 *
 * | Combatant                 | Per turn                       | Turns per ultimate |
 * | ------------------------- | ------------------------------ | ------------------ |
 * | Front-line, being hit     | 5–9 regen + 20 hit + 10/hit taken | 2.5             |
 * | Back-line damage          | 8 regen + 20 hit               | 3.9                |
 * | Healer under pressure     | 13 regen + 15 heal             | 3.2                |
 * | Healer with nothing to do | 13 regen alone                 | 7.7                |
 *
 * The last row is the shape worth noticing: a support that is not needed charges slowly, so an
 * ultimate arrives when the fight has actually gone badly rather than on a metronome. That is
 * pacing MP could not express — its pool was full at the opening bell.
 *
 * ## Why `onHit` is double `onHurt`
 *
 * It was not, and the ladder said so. At ten each the back rank charged half as fast as the front
 * one, because `onHurt` is paid **per incoming hit** while `onHit` is paid once per action — so a
 * front-liner absorbing three attacks a turn banked thirty and the damage dealer behind it banked
 * ten. That put the slowest meter in the game on the rank where the damage is fielded, which is
 * backwards, and stage 24 fell to 43%.
 *
 * Doubling `onHit` restores the symmetry the per-hit rule breaks without giving up what that rule
 * buys: being focused still charges a bar fastest, which is the Undead's whole meter and the
 * reason a wide enemy wave charges a whole party at once.
 *
 * A single gain stays a fifth of the bar or less. Larger and one exchange charges an ultimate;
 * smaller and the meter stops responding to the fight and becomes `energyRegen` with extra steps.
 */
export const ENERGY_RULES = {
  onHit: 20,
  onHurt: 10,
  onHeal: 15,
} as const;

/**
 * Floor under any attack's hit chance.
 *
 * A termination guard first and a balance number second. `simulateBattle` is only guaranteed
 * to return because damage lands eventually; a dodge pool that could reach certainty would
 * leave every fight against it to be decided by the clock. Ten percent also keeps an evasion build
 * *annoying* rather than *unbeatable*, which is the right amount of annoying for a stat with
 * no counter-play beyond accuracy.
 */
export const MIN_HIT_CHANCE = 0.1;

/**
 * Ceiling on `physicalPierce` and `magicPierce`.
 *
 * A shredder should make a wall feel like a body, not like an empty square. Leaving a tenth of
 * DEF standing keeps the diminishing-return curve doing its job at the top end, which is what
 * stops "stack penetration" from collapsing every defensive archetype at once.
 */
export const MAX_PENETRATION = 0.9;

/**
 * Ceiling on `physicalResist` and `magicResist`.
 *
 * ⚠️ The same guard as {@link MIN_HIT_CHANCE}, arriving from the other side. Resist removes a
 * flat percentage of what a hit was going to be, so unlike `def` it reaches zero rather than
 * approaching it — and a combatant that cannot be damaged is a fight that runs to the tick cap
 * every time. Not a tuning knob.
 */
export const MAX_RESIST = 0.9;

/** Everything the simulation needs that is a number rather than a rule. */
export const COMBAT_RULES = {
  rows: ROW_BONUSES,
  matchups: FACTION_MATCHUPS,
  energy: ENERGY_RULES,
  minHitChance: MIN_HIT_CHANCE,
  maxPenetration: MAX_PENETRATION,
  maxResist: MAX_RESIST,
  basicAttack: BASIC_ATTACK,
} as const;
