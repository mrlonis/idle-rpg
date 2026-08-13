/**
 * The cards a Descent run is offered.
 *
 * Fourteen families of four rungs — fifty-six cards, from fourteen rows. `core/descent/cards.ts`
 * is what draws and resolves them; this is the content.
 *
 * ## Why the rungs are a list rather than fifty-six cards
 *
 * The rule the mode is built on is that a family already taken comes back **only higher**. Authored
 * flat that is a naming convention holding a mechanic together; authored as a list it is an array
 * index, and `descent.spec.ts` can assert every rung is strictly larger than the one below it —
 * which is the failure that would otherwise be silent, because a repeat offered as a *downgrade*
 * still looks like a reward on screen.
 *
 * ## The rung scale, and why the top one is not a round number
 *
 * Every family scales its own base by roughly **1 / 2 / 3.4 / 5**. Doubling twice would put the top
 * rung at ×4 and make the ladder read as three steps and a shrug; ×5 with a 3.4 under it is the
 * shape that makes Grand worth holding out for and Sovereign worth the whole run.
 *
 * A family taken all four rungs is worth ×11.4 its base, which is the largest single-axis stack the
 * mode can produce — and it costs **four of a run's eight choices** to reach, which is what stops it
 * being the obvious line.
 *
 * ## Seven universal families and seven faction ones
 *
 * The universal seven are the backbone and every one of them is a stat the party already has. The
 * faction seven are the same idea aimed narrowly: attack at ×1.67 Whetstone's and health at ×1.25
 * Vitality's, on the same rung — and paid to one faction only.
 *
 * ⚠️ **A faction card is the pattern `AGENTS.md` names and rejects — and the rejection does not
 * reach it, for a reason the lineup bonus cannot use.** "+10% if two Fire units" is forbidden
 * because it resolves to one optimal party, decided before the fight. This is **drawn**, three at a
 * time out of fourteen, after the crew is locked for the run and after a daily faction lock nobody
 * chose. There is nothing to optimise into: a crew built in the hope of Wyrdsong loses eight runs in
 * nine. What it rewards is the crew you happened to bring — and what it *asks* is the only question
 * a card can ask a party that is already assembled, which is whether a narrow bonus on three of your
 * five beats a broad one on all of them.
 */

/**
 * The seven families every member of the party receives.
 *
 * ⚠️ **Three of the seven move stats gear cannot**, and that is the point of the mode having its own
 * bonus vocabulary at all: crit chance, crit damage and life leech are bounded rates, so gear's
 * percentage-of-your-own-stat rule pays nothing on them and the four gear stats are the only ones it
 * can move. Points on a bounded rate survive the ×10⁹ level curve untouched, which is the same split
 * the lineup ladder already makes.
 *
 * The three of them are also the three the mode is *about*: a run that keeps drawing Keen Edge and
 * Cruel Edge becomes a crit run, and one that keeps drawing Bloodthirst survives fights the first
 * one wins outright. Neither is reachable any other way in this game.
 */
export const DESCENT_UNIVERSAL_FAMILIES = [
  {
    id: 'whetstone',
    name: 'Whetstone',
    description: 'Attack for the whole party.',
    rungs: [{ atk: 0.06 }, { atk: 0.12 }, { atk: 0.2 }, { atk: 0.3 }],
  },
  {
    id: 'aegis',
    name: 'Aegis',
    description: 'Defence for the whole party.',
    // The largest percentages in the file, and they buy the least. Damage is `atk² / (atk + def)`,
    // so defence is worth a fraction of what the same percentage of attack is worth — the same
    // finding `docs/gear.md` records after halving every defensive profile. It is here because a
    // run that draws nothing else should still have taken *something*, not because it is a line.
    rungs: [{ def: 0.1 }, { def: 0.2 }, { def: 0.34 }, { def: 0.5 }],
  },
  {
    id: 'vitality',
    name: 'Vitality',
    description: 'Maximum health for the whole party.',
    // ⚠️ Health carries as a **fraction**, so a Vitality card raises the maximum and the current
    // health together — it heals in proportion rather than in absolute terms. That is the honest
    // reading of "your party is tougher now", and it is the one shape of healing this mode can
    // safely offer: it cannot outrun closing pressure, because it is spent the moment it is bought.
    rungs: [{ hp: 0.08 }, { hp: 0.16 }, { hp: 0.27 }, { hp: 0.4 }],
  },
  {
    id: 'quickstep',
    name: 'Quickstep',
    description: 'Haste for the whole party.',
    // ⚠️ Re-clamped into `[1, ATB_THRESHOLD]` by `content.ts` on the way into the fight, the same
    // backstop gear's boots inherit. The bound that keeps it away from that clamp is the size of
    // these numbers: a full Quickstep stack is ×1.45, which on the fastest character in the game is
    // still comfortably short of the threshold.
    rungs: [{ haste: 0.04 }, { haste: 0.08 }, { haste: 0.13 }, { haste: 0.2 }],
  },
  {
    id: 'keen-edge',
    name: 'Keen Edge',
    description: 'Critical hit chance for the whole party.',
    // Points, not a percentage: most of the roster sits between 0.02 and 0.12, so a percentage of
    // what they already have would pay almost nothing. The full stack is +46 points, which takes a
    // character with nothing into "crits regularly" — the whole reason the family exists.
    rungs: [{ critChance: 0.04 }, { critChance: 0.08 }, { critChance: 0.14 }, { critChance: 0.2 }],
  },
  {
    id: 'cruel-edge',
    name: 'Cruel Edge',
    description: 'Critical damage for the whole party.',
    // The pair to Keen Edge, and deliberately a separate family rather than one card moving both:
    // a crit build wanting *two* families is what makes it a build rather than a card.
    rungs: [
      { critDamageAmp: 0.1 },
      { critDamageAmp: 0.2 },
      { critDamageAmp: 0.34 },
      { critDamageAmp: 0.5 },
    ],
  },
  {
    id: 'bloodthirst',
    name: 'Bloodthirst',
    description: 'Life steal for the whole party.',
    // ⚠️ **The one family with a termination argument attached.** Leech is taken off damage dealt,
    // and closing pressure amplifies damage without amplifying healing — so a party siphoning
    // enough of its own output back does not win, it stalls until the ninety-second clock ends the
    // fight in a defeat. The full stack is 0.34 against `maxLifeLeech` of 0.35, so the clamp binds
    // on nothing shipped and is there for the fifth rung nobody has authored yet.
    rungs: [{ lifeLeech: 0.03 }, { lifeLeech: 0.06 }, { lifeLeech: 0.1 }, { lifeLeech: 0.15 }],
  },
] as const;

/**
 * One family per faction, paid only to that faction's members.
 *
 * All seven are identical in size, which is the same call `towers.spec.ts` holds for the tower
 * tracks: paying more for one faction than another would let the banner's luck decide which of these
 * is worth drawing, and the banner's luck already decides plenty.
 *
 * Attack **and** health rather than one or the other, because a card that only pays three of five
 * has to be worth interrupting a broad line for — and a narrow bonus on one axis is a card a player
 * declines every time. Attack at ×1.67 Whetstone's and health at ×1.25 Vitality's is the size at
 * which three matching members beats a universal card and two does not, which is the decision the
 * family is for.
 */
export const DESCENT_FACTION_FAMILIES = [
  {
    id: 'mustered-oath',
    name: 'Mustered Oath',
    description: 'Attack and health for your Humans.',
    faction: 'human',
    rungs: [
      { atk: 0.1, hp: 0.1 },
      { atk: 0.2, hp: 0.2 },
      { atk: 0.34, hp: 0.34 },
      { atk: 0.5, hp: 0.5 },
    ],
  },
  {
    id: 'deepforge-rite',
    name: 'Deepforge Rite',
    description: 'Attack and health for your Dwarves.',
    faction: 'dwarf',
    rungs: [
      { atk: 0.1, hp: 0.1 },
      { atk: 0.2, hp: 0.2 },
      { atk: 0.34, hp: 0.34 },
      { atk: 0.5, hp: 0.5 },
    ],
  },
  {
    id: 'wyrdsong',
    name: 'Wyrdsong',
    description: 'Attack and health for your Elves.',
    faction: 'elf',
    rungs: [
      { atk: 0.1, hp: 0.1 },
      { atk: 0.2, hp: 0.2 },
      { atk: 0.34, hp: 0.34 },
      { atk: 0.5, hp: 0.5 },
    ],
  },
  {
    id: 'grave-compact',
    name: 'Grave Compact',
    description: 'Attack and health for your Undead.',
    faction: 'undead',
    rungs: [
      { atk: 0.1, hp: 0.1 },
      { atk: 0.2, hp: 0.2 },
      { atk: 0.34, hp: 0.34 },
      { atk: 0.5, hp: 0.5 },
    ],
  },
  {
    id: 'feral-bond',
    name: 'Feral Bond',
    description: 'Attack and health for your Monsters.',
    faction: 'monster',
    rungs: [
      { atk: 0.1, hp: 0.1 },
      { atk: 0.2, hp: 0.2 },
      { atk: 0.34, hp: 0.34 },
      { atk: 0.5, hp: 0.5 },
    ],
  },
  {
    id: 'choral-grace',
    name: 'Choral Grace',
    description: 'Attack and health for your Angels.',
    faction: 'angel',
    rungs: [
      { atk: 0.1, hp: 0.1 },
      { atk: 0.2, hp: 0.2 },
      { atk: 0.34, hp: 0.34 },
      { atk: 0.5, hp: 0.5 },
    ],
  },
  {
    id: 'infernal-pact',
    name: 'Infernal Pact',
    description: 'Attack and health for your Demons.',
    faction: 'demon',
    rungs: [
      { atk: 0.1, hp: 0.1 },
      { atk: 0.2, hp: 0.2 },
      { atk: 0.34, hp: 0.34 },
      { atk: 0.5, hp: 0.5 },
    ],
  },
] as const;

/**
 * Every family, universal first.
 *
 * Order is presentation only — the offer draws uniformly over whatever is still available — but it
 * is the order a spec walks and the order a screen would list, so the broad ones come first.
 *
 * ⚠️ **One faction family per shipped faction, derived from `FACTIONS` by `descent.spec.ts` rather
 * than trusted.** A faction with no family is a daily lock that can hand a player three factions and
 * a card pool that ignores one of them, which is the same silent gap `signature.spec.ts` exists to
 * close for a new ascended-tier character.
 */
export const DESCENT_FAMILIES = [
  ...DESCENT_UNIVERSAL_FAMILIES,
  ...DESCENT_FACTION_FAMILIES,
] as const;
