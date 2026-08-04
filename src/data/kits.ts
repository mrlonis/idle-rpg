/**
 * How many skills a character gets, and which rung hands over each one.
 *
 * Plain data, as everything in `data/` is: `core/roster/kit.ts` holds the rule and this holds the
 * numbers. Both axes are authored here — the per-tier ceiling and the rungs that climb to it.
 *
 * ## The ceilings
 *
 * | Tier      | Skills           |
 * | --------- | ---------------- |
 * | common    | 2 — ultimate + 1 |
 * | legendary | 3 — ultimate + 2 |
 * | ascended  | 4 — ultimate + 3 |
 *
 * The ultimate is counted, and it is the one skill no rung ever gates — a bar that fills and can
 * never be spent is a simulation bug wearing progression's clothes.
 *
 * Every kit in `characters.ts` is authored **exactly at** its tier's ceiling, which
 * `characters.spec.ts` asserts. So the ceiling is an authoring constraint that the runtime also
 * applies rather than a runtime trim of surplus content: a character never carries a skill no
 * amount of ascending could reach.
 *
 * ## The rungs are absolute rarity, and that is the head start
 *
 * `elite`, `legendary`, `ascended` — read against the ladder itself, not against where a
 * character started on it. An `ascended`-tier character starts at `elite`, so it arrives with its
 * second skill already unlocked; a common-tier one climbs two rungs for the same thing. The
 * reasoning behind picking that over per-character counting, and what keeps it fair, is in
 * `core/roster/kit.ts`.
 *
 * Rarity **ids** rather than ladder indices. The ascension tables next door are indexed *by*
 * rarity and use named index constants for it; this is a list of three names, and naming them
 * means `kits.spec.ts` can prove each one is a rarity the ladder actually has.
 */
export const KIT_RULES = {
  ceiling: { common: 2, legendary: 3, ascended: 4 },
  unlocks: ['elite', 'legendary', 'ascended'],
} as const;
