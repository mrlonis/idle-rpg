import { DESCENT_RULES } from './descent';

/**
 * Expeditions: three hand-authored puzzle maps, solved once each. Milestone 23.
 *
 * `core/expedition/` evaluates all of this; what lives here is the rules, and the maps live in
 * [`expedition-maps.ts`](./expedition-maps.ts) — the same division `descent.ts` makes with its
 * boards.
 *
 * ## The whole mode is a finite pool
 *
 * ⚠️ **Every reward here pays once, ever** — a camp's first clear, a chest, a completion — recorded
 * in the per-map ledger. That is the same shape as the campaign's first-clear crystals, and it is
 * the entire economy argument: a finite pool needs no rate guard, no daily cap and no compounding
 * analysis, which is what lets restarts be free. Retuning any number below changes the pool's
 * *size*, never its shape.
 *
 * ## The cards are the Descent's, on purpose
 *
 * The families, the rank ladder and the leech clamp are shared content rather than parallel
 * copies: a card a player learned in one mode means the same thing in the other, and a balance fix
 * to a family lands in both at once. What differs is only the draw's inputs — the tilt progresses
 * on **stamina spent over the map's budget** rather than on a fixed choice count, and the offer is
 * filtered by the crew's own factions rather than by a daily lock, because this mode has no lock
 * and a faction family for a faction nobody fielded is the dead card the Descent already caught.
 */
export const EXPEDITION_RULES = {
  /**
   * Opens with the Descent, at chapter 3, and deliberately restates its number rather than
   * importing it: the two gates agree today for the same measured reason (cards and multi-body
   * boards need ascension rungs more than levels), but they are two decisions, and a future
   * milestone moving one is not obliged to move the other. `expedition.spec.ts` asserts the
   * agreement so it cannot drift silently.
   */
  unlockChapters: 3,
  offer: 3,
  /**
   * The Descent's rank ladder, shared by reference rather than restated — one set of names, one
   * tilt, and a retune that lands in both modes at once. The tilt saturates against this mode's own
   * budget fraction, so nothing here needs re-deriving when a map is added.
   */
  ranks: DESCENT_RULES.ranks,
  /** The Descent's clamp, for the Descent's reason — see `DescentRulesData.maxLifeLeech`. */
  maxLifeLeech: DESCENT_RULES.maxLifeLeech,
  /**
   * Crystals: 150 a camp, ×5 on a map's boss, 1,500 for first completing a map.
   *
   * One-time, so these are sized against *events* rather than against a day of income: the whole
   * three-map pool — every camp, chest and completion — comes to roughly 11,000 crystals, about
   * what finishing one campaign chapter pays, spread over the mode's whole life. Flat for the
   * reason every crystal payout in this game is flat.
   */
  summons: {
    perCamp: 150,
    bossMultiplier: 5,
    completion: 1500,
  },
  /**
   * Emblems for first completing a map. With the emblem chests, the mode's whole pool is ~210 —
   * about two chapters of the Chapter Conqueror track, once, ever. On completion only, never per
   * camp: emblems already have two faucets and `docs/economy.md` records that a third mechanism on
   * one currency is the silent kind of mistake.
   */
  completionEmblems: 50,
  /**
   * A camp's first-ever clear pays the Descent's lump — the same multiples of the campaign lump
   * matched at the anchor level, including essence at three times the others, for the reason
   * `descent.ts` argues. First clear only; a re-fought camp pays nothing.
   */
  lumpMultipliers: DESCENT_RULES.lumpMultipliers,
} as const;

export { EXPEDITION_MAPS } from './expedition-maps';
