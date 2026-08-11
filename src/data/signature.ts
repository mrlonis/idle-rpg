import { type SignatureItemData, type SignatureRulesData } from '../core';
import {
  AEGIS,
  BLEED,
  CHAINBOND,
  GUARD,
  HASTE,
  HEXBRAND,
  OATHSHIELD,
  POISON,
  RALLY,
  SIG_BULWARK,
  SIG_CONCORD,
  SIG_CORROSION,
  SIG_ENTROPY,
  SIG_EVERGREEN,
  SIG_GRUDGE,
  SIG_HUNGER,
  SIG_LAST_QUIVER,
  SIG_PATIENCE,
  SIG_QUICKENING,
  SIG_RESOLVE,
  SIG_SANCTUARY,
  SIG_SENTENCE,
  SIG_SOULGUARD,
  SLOW,
  SUNDER,
  THORNMAIL,
  WEAKEN,
} from './statuses';

/**
 * The fourteen signature items, one per ascended-tier character.
 *
 * The system is in [`core/signature/`](../core/signature/types.ts) and the emblems that buy a
 * level are in [`data/emblems.ts`](./emblems.ts); this file is the content alone. See
 * [signature items](../../docs/signature-items.md) for the design.
 *
 * ## What a signature item is for
 *
 * It sharpens the niche its character already has. Not "makes them stronger" — every one of these
 * could be a flat stat block and would be — but **more of the specific thing that made anybody
 * field this character in the first place**. Aelrindel's item is about reach and tempo because
 * that is what a First Arrow is; Thraun's is about not dying because that is what a Deep Ward is.
 * A signature item that turned a wall into a damage dealer would be a second character wearing the
 * first one's name.
 *
 * ## The stat budget, and why it is not identical across the fourteen
 *
 * Roughly 5% per level, so roughly +150% at level 30 — comparable to a maxed gear set's attack
 * contribution and well under its health one. It varies between 4.5% and 5.5%, deliberately,
 * because the four stats are not worth the same per point:
 *
 * - **`haste` is worth the most and gets the smallest budgets.** Turn frequency is
 *   `ceil(1000 / haste)`, which is sharply non-linear — 152 to 243 takes Aelrindel from a turn
 *   every 7 ticks to one every 5, a ×1.4 on everything he does. The two items that move it carry
 *   the lowest totals for exactly that reason.
 * - **`def` is worth the least and gets the largest.** It sits under a diminishing-returns curve
 *   and, per [gear](../../docs/gear.md), the defensive share of the gear profiles is already
 *   deliberately half what it looks like it should be — a fully geared party ran the ninety-second
 *   clock out on `c2-s23` — `c4-s13` since the six-chapter re-cut — at twice that size.
 * - **`hp` is worth less than `atk`** on a board where damage is `atk² / (atk + def)`.
 *
 * ⚠️ **Every value is a fraction of the wearer's own scaled stat, never a flat quantity.** A flat
 * bonus is invisible against a levelling curve worth ×10⁹, and — the stronger argument — it is an
 * *addition*, which is what the whole-board rescale identity in `simulate.spec.ts` forbids.
 *
 * ## The abilities, and the one rule they are all written against
 *
 * Four rungs each, at levels 1, 10, 20 and 30. **A rung replaces the one below it rather than
 * stacking on it**, so each restates everything the earlier rungs did and adds to it — which is
 * why the fourth entry of every item is the longest.
 *
 * ⚠️ **No signature item multiplies healing, and Seraphine is the one where that is a visible
 * omission.** Closing pressure amplifies damage without bound past `PRESSURE_AFTER_TICKS` and
 * deliberately does not amplify healing, so a party made unkillable by a sustain item does not
 * win — it stalls, the ninety-second clock runs out, and a timeout is a **defeat**. Her item
 * therefore spends its rungs on shield uptime, on dropping the conditions that stop her acting,
 * and on Judgement's damage. That is the same fantasy arriving by the only route that works.
 */

/**
 * When a signature item unlocks, how far it goes, and what a level costs.
 *
 * **`mythic` is four rungs above where an ascended-tier character starts.** That is 27 copies for a
 * mortal and 39 for a celestial — deep enough that a signature item is the last thing a run
 * reaches for, which is what milestone 16 is for.
 *
 * **The cost ramps smoothly rather than stepping per tier.** `10 + 1.6 × (L − 1)`, so level 1 costs
 * 10 and level 30 costs 56, and the whole climb is **996 emblems**. A stepped price was the
 * alternative and reads worse where it matters: a player saving toward the next level watches the
 * price move every time instead of sitting flat for nine levels and then jumping by a factor they
 * did not see coming.
 *
 * ⚠️ **Linear, not the `coefficient × L ** exponent` shape gear and character levels use.** Those
 * price against curves that compound, so their costs must compound to keep pace. A signature level
 * is worth a flat slice of one stat profile and a tenth of the way to a tier mark, so a linear
 * price is what keeps the thirtieth level as worth buying as the first.
 */
export const SIGNATURE_RULES: SignatureRulesData = {
  unlockRarity: 'mythic',
  maxLevel: 30,
  tierEvery: 10,
  cost: { base: 10, perLevel: 1.6 },
};

/**
 * Aurelia — the commander's banner.
 *
 * Her kit is three ally-facing turns and one execution, so the item is about **what her orders are
 * worth and how often they land**. The budget is spread across three stats because she is the one
 * ascended character with no single spike to sharpen: a Marshal wants to survive her own front
 * rank, hit hard enough for Decisive Strike to close, and act often enough to keep two buffs up.
 */
const BANNER_OF_THE_NINTH: SignatureItemData = {
  id: 'banner-of-the-ninth',
  defId: 'aurelia',
  name: 'Banner of the Ninth',
  description: 'The standard the last Marshal never put down. Her orders carry further with it.',
  perLevel: { atk: 0.02, hp: 0.02, haste: 0.01 },
  tiers: [
    {
      name: 'Standard Raised',
      description: "Marshal's Call lays Guard over the party alongside Rally and Haste.",
      // The authored effects restated with one added. `effects` replaces rather than appends —
      // see `SkillOverrideData` — so an override that wants to keep Rally and Haste has to say so.
      skills: [
        {
          skillId: 'marshals-call',
          effects: [
            { kind: 'status', status: RALLY },
            { kind: 'status', status: HASTE },
            { kind: 'status', status: GUARD },
          ],
        },
      ],
    },
    {
      name: 'The Ninth Rallies',
      description: "Marshal's Call adds Guard, and Hold the Line comes up a third sooner.",
      skills: [
        {
          skillId: 'marshals-call',
          effects: [
            { kind: 'status', status: RALLY },
            { kind: 'status', status: HASTE },
            { kind: 'status', status: GUARD },
          ],
        },
        { skillId: 'hold-the-line', cooldown: 40 },
      ],
    },
    {
      name: 'Sweeping Order',
      description: 'Hold the Line quickens, and Sweeping Command reaches the whole field.',
      skills: [
        {
          skillId: 'marshals-call',
          effects: [
            { kind: 'status', status: RALLY },
            { kind: 'status', status: HASTE },
            { kind: 'status', status: GUARD },
          ],
        },
        { skillId: 'hold-the-line', cooldown: 40 },
        { skillId: 'sweeping-command', target: 'enemy-all' },
      ],
    },
    {
      name: 'The Last Order',
      description:
        'Hold the Line quickens, Sweeping Command reaches everything, Decisive Strike comes up ' +
        'twice as often, and Aurelia takes the field already commanding.',
      skills: [
        {
          skillId: 'marshals-call',
          effects: [
            { kind: 'status', status: RALLY },
            { kind: 'status', status: HASTE },
            { kind: 'status', status: GUARD },
          ],
        },
        { skillId: 'hold-the-line', cooldown: 40 },
        { skillId: 'sweeping-command', target: 'enemy-all' },
        { skillId: 'decisive-strike', cooldown: 20 },
      ],
      opening: [SIG_RESOLVE],
    },
  ],
};

/**
 * Thraun — the wall, made more of a wall.
 *
 * The largest stat budget of the seven at 5.5% per level, because it is the one spent mostly on
 * `def`, which is the cheapest stat on the board. Every rung is about **uptime rather than size**:
 * a Deep Ward's problem was never how much one cast absorbs, it was the gap between casts.
 */
const THE_DEEPSTONE_OATH: SignatureItemData = {
  id: 'the-deepstone-oath',
  defId: 'thraun',
  name: 'The Deepstone Oath',
  description: 'Sworn to the stone below the hold. What it wards does not fall.',
  perLevel: { hp: 0.03, def: 0.025 },
  tiers: [
    {
      name: 'Set Stone',
      description: 'Deepstone Grasp comes up a third sooner.',
      skills: [{ skillId: 'deepstone-grasp', cooldown: 35 }],
    },
    {
      name: 'Unyielding',
      description: 'Deepstone Grasp quickens, and Ground Slam never fails to slow.',
      skills: [
        { skillId: 'deepstone-grasp', cooldown: 35 },
        {
          skillId: 'ground-slam',
          effects: [
            { kind: 'damage', damageType: 'physical', power: 1.05 },
            { kind: 'status', status: SLOW },
          ],
        },
      ],
    },
    {
      name: 'The Deeper Ward',
      description: 'Both quicken, Ground Slam always slows, and the Ward Unbroken returns sooner.',
      skills: [
        { skillId: 'deepstone-grasp', cooldown: 35 },
        {
          skillId: 'ground-slam',
          effects: [
            { kind: 'damage', damageType: 'physical', power: 1.05 },
            { kind: 'status', status: SLOW },
          ],
        },
        { skillId: 'ward-unbroken', cooldown: 60 },
      ],
    },
    {
      name: 'The Oath Unbroken',
      description:
        'Every ward comes faster, Ground Slam always slows, and Thraun stands the whole fight ' +
        'behind stone of his own.',
      skills: [
        { skillId: 'deepstone-grasp', cooldown: 35 },
        {
          skillId: 'ground-slam',
          effects: [
            { kind: 'damage', damageType: 'physical', power: 1.05 },
            { kind: 'status', status: SLOW },
          ],
        },
        { skillId: 'ward-unbroken', cooldown: 60 },
      ],
      opening: [SIG_BULWARK],
    },
  ],
};

/**
 * Aelrindel — reach, then tempo.
 *
 * The smallest budget of the seven at 4.5% per level, and the reason is `haste`: he already
 * carries the highest in the game at 152, and turn frequency is `ceil(1000 / haste)`. A +45% haste
 * at level 30 takes him from a turn every seven ticks to one every five, which is a ×1.4 on his
 * entire output before a single point of `atk` is counted.
 *
 * The rungs walk his kit's own theme in order — his four skills are each a statement about *where*
 * a target stands, so the item widens them one rank at a time and finishes by widening the
 * ultimate itself.
 */
const THE_FIRST_ARROW: SignatureItemData = {
  id: 'the-first-arrow',
  defId: 'aelrindel',
  name: 'The First Arrow',
  description: 'Nocked before the enemy knows there is a fight. It has never needed a second.',
  perLevel: { atk: 0.03, haste: 0.015 },
  tiers: [
    {
      name: 'Nocked',
      description: 'Arrow of Ending comes up a third sooner.',
      skills: [{ skillId: 'arrow-of-ending', cooldown: 40 }],
    },
    {
      name: 'Unerring',
      description: 'Arrow of Ending quickens, and Volley no longer waits for a crowd.',
      skills: [
        { skillId: 'arrow-of-ending', cooldown: 40 },
        { skillId: 'volley', condition: { kind: 'always' } },
      ],
    },
    {
      name: 'Splitting',
      description: 'Volley is unconditional, and Splitting Shaft hits half again as hard.',
      skills: [
        { skillId: 'arrow-of-ending', cooldown: 40 },
        { skillId: 'volley', condition: { kind: 'always' } },
        {
          skillId: 'splitting-shaft',
          effects: [{ kind: 'damage', damageType: 'physical', power: 1.4 }],
        },
      ],
    },
    {
      name: 'First and Last',
      description:
        'Every shot quickens, Volley is unconditional, and the First Arrow takes the whole back ' +
        'rank rather than one of it.',
      skills: [
        { skillId: 'arrow-of-ending', cooldown: 40 },
        { skillId: 'volley', condition: { kind: 'always' } },
        {
          skillId: 'splitting-shaft',
          effects: [{ kind: 'damage', damageType: 'physical', power: 1.4 }],
        },
        { skillId: 'first-arrow', target: 'enemy-row-back' },
      ],
      opening: [SIG_QUICKENING],
    },
  ],
};

/**
 * Nekros — the tithe, taken more often and from more places.
 *
 * Both of his drains are opportunistic in different directions — one takes from whatever is nearly
 * dead, the other from whatever has the most to give — so the item is about **how much comes back
 * and how often he can ask**. The passive is a shield rather than the defence buff the other
 * casters get: his `def` is 7, the lowest in the game, and a multiplier on nearly nothing is
 * nearly nothing.
 */
const THE_SOVEREIGNS_TITHE: SignatureItemData = {
  id: 'the-sovereigns-tithe',
  defId: 'nekros',
  name: "The Sovereign's Tithe",
  description: 'A crown owed rather than worn. What it takes, it keeps.',
  perLevel: { atk: 0.03, hp: 0.02 },
  tiers: [
    {
      name: 'Deeper Draught',
      description: 'Soul Siphon returns four fifths of what it takes rather than three fifths.',
      skills: [
        {
          skillId: 'soul-siphon',
          effects: [{ kind: 'drain', damageType: 'magical', power: 1.6, siphon: 0.8 }],
        },
      ],
    },
    {
      name: 'The Toll Doubled',
      description: 'Soul Siphon drains deeper, and the Toll comes due a third sooner.',
      skills: [
        {
          skillId: 'soul-siphon',
          effects: [{ kind: 'drain', damageType: 'magical', power: 1.6, siphon: 0.8 }],
        },
        { skillId: 'sovereigns-toll', cooldown: 40 },
      ],
    },
    {
      name: 'The Grave Widens',
      description: 'Both drains sharpen, and Grave Tide never fails to poison.',
      skills: [
        {
          skillId: 'soul-siphon',
          effects: [{ kind: 'drain', damageType: 'magical', power: 1.6, siphon: 0.8 }],
        },
        { skillId: 'sovereigns-toll', cooldown: 40 },
        {
          skillId: 'grave-tide',
          effects: [
            { kind: 'damage', damageType: 'magical', power: 0.95 },
            { kind: 'status', status: POISON },
          ],
        },
      ],
    },
    {
      name: 'The Tithe Unending',
      description:
        'Every drain deepens, Grave Tide always poisons, Soul Tithe returns far sooner, and ' +
        'Nekros opens the fight already warded by what he has taken.',
      skills: [
        {
          skillId: 'soul-siphon',
          effects: [{ kind: 'drain', damageType: 'magical', power: 1.6, siphon: 0.8 }],
        },
        { skillId: 'sovereigns-toll', cooldown: 40 },
        {
          skillId: 'grave-tide',
          effects: [
            { kind: 'damage', damageType: 'magical', power: 0.95 },
            { kind: 'status', status: POISON },
          ],
        },
        { skillId: 'soul-tithe', cooldown: 45 },
      ],
      opening: [SIG_SOULGUARD],
    },
  ],
};

/**
 * Vharok — the largest `atk` in the game, pointed at more things.
 *
 * The most attack-weighted profile of the seven, because the Monster faction's whole argument is
 * raw output with no support behind it. The rungs escalate from one target to the whole field,
 * which is the only direction a kit built entirely of single hits can grow in.
 */
const THE_WORLDS_HUNGER: SignatureItemData = {
  id: 'the-worlds-hunger',
  defId: 'vharok',
  name: "The World's Hunger",
  description: 'Not a weapon. The appetite itself, given somewhere to sit.',
  perLevel: { atk: 0.035, hp: 0.015 },
  tiers: [
    {
      name: 'Ravenous',
      description: 'Devour returns seven tenths of what it takes rather than half.',
      skills: [
        {
          skillId: 'devour',
          effects: [{ kind: 'drain', damageType: 'physical', power: 1.6, siphon: 0.7 }],
        },
      ],
    },
    {
      name: 'Gorged',
      description: 'Devour feeds harder, and Gorge lands a third heavier.',
      skills: [
        {
          skillId: 'devour',
          effects: [{ kind: 'drain', damageType: 'physical', power: 1.6, siphon: 0.7 }],
        },
        { skillId: 'gorge', effects: [{ kind: 'damage', damageType: 'physical', power: 2.5 }] },
      ],
    },
    {
      name: 'The Wider Maw',
      description: 'Both feed harder, and the Devouring Tide comes far sooner.',
      skills: [
        {
          skillId: 'devour',
          effects: [{ kind: 'drain', damageType: 'physical', power: 1.6, siphon: 0.7 }],
        },
        { skillId: 'gorge', effects: [{ kind: 'damage', damageType: 'physical', power: 2.5 }] },
        { skillId: 'devouring-tide', cooldown: 50 },
      ],
    },
    {
      name: "The World's Hunger",
      description:
        'Everything feeds harder and returns sooner, and the Maw closes on the whole field ' +
        'rather than on one of it.',
      skills: [
        {
          skillId: 'devour',
          effects: [{ kind: 'drain', damageType: 'physical', power: 1.6, siphon: 0.7 }],
        },
        { skillId: 'gorge', effects: [{ kind: 'damage', damageType: 'physical', power: 2.5 }] },
        { skillId: 'devouring-tide', cooldown: 50 },
        {
          skillId: 'worlds-maw',
          target: 'enemy-all',
          effects: [
            { kind: 'damage', damageType: 'physical', power: 1.7 },
            { kind: 'status', status: SUNDER, chance: 0.9 },
          ],
        },
      ],
      opening: [SIG_HUNGER],
    },
  ],
};

/**
 * Seraphine — the one item written around a rule rather than around a kit.
 *
 * ⚠️ **Not a single rung multiplies her healing, and that is the whole design of this item.**
 * Closing pressure amplifies damage without bound past `PRESSURE_AFTER_TICKS` and deliberately
 * does not amplify healing. A Seraphine who healed twice as hard would not win fights she was
 * losing — she would stop anything on either side from dying, run the ninety-second clock out, and
 * turn a close fight into a **timeout, which is a defeat**. The obvious signature item for a
 * healer is the one that makes her worse.
 *
 * So the rungs buy the three things that are not healing: shield uptime, which banks a pool
 * against damage that is still rising; the removal of the conditions that make her stand idle
 * while the party is healthy; and Judgement, which is the only damage an Angel deals on purpose.
 * The stat budget is the joint largest at 5.5% for the same reason Thraun's is — most of it is
 * `def`.
 */
const THE_UNWAVERING_VIGIL: SignatureItemData = {
  id: 'the-unwavering-vigil',
  defId: 'seraphine',
  name: 'The Unwavering Vigil',
  description: 'She has not looked away yet. The light is only where she is looking.',
  perLevel: { hp: 0.02, def: 0.02, atk: 0.015 },
  tiers: [
    {
      name: 'Aegis Held',
      description: 'Aegis returns a quarter sooner.',
      skills: [{ skillId: 'aegis', cooldown: 60 }],
    },
    {
      name: 'Vigilant',
      description: 'Aegis returns sooner, and Vigil no longer waits for somebody to be hurt.',
      skills: [
        { skillId: 'aegis', cooldown: 60 },
        { skillId: 'vigil', condition: { kind: 'always' } },
      ],
    },
    {
      name: 'Judgement Sharpened',
      description: 'Vigil is unconditional, and Judgement lands far heavier.',
      skills: [
        { skillId: 'aegis', cooldown: 60 },
        { skillId: 'vigil', condition: { kind: 'always' } },
        { skillId: 'judgement', effects: [{ kind: 'damage', damageType: 'magical', power: 1.5 }] },
      ],
    },
    {
      name: 'The Unwavering',
      description:
        'Nothing waits any more — every turn she has is available every turn — and she opens the ' +
        'fight already warded.',
      skills: [
        { skillId: 'aegis', cooldown: 60 },
        { skillId: 'vigil', condition: { kind: 'always' } },
        { skillId: 'judgement', effects: [{ kind: 'damage', damageType: 'magical', power: 1.5 }] },
        { skillId: 'unwavering-light', condition: { kind: 'always' } },
      ],
      opening: [SIG_SANCTUARY],
    },
  ],
};

/**
 * Azrathoth — the gate that stops being conditional.
 *
 * His kit is the sharpest in the game and the most gated: Ruin Unbound needs three targets,
 * Unmaking wants the largest, the Long Silence wants the smallest. Every rung of this item is
 * about **removing a precondition**, which is the shape milestone 16's roadmap entry asked for —
 * behaviour rather than size. The 4.5% budget is the low one because a fifth of it is `haste`.
 */
const THE_LONG_UNMAKING: SignatureItemData = {
  id: 'the-long-unmaking',
  defId: 'azrathoth',
  name: 'The Long Unmaking',
  description: 'Ruin does not need a reason. It had one once and has not needed it since.',
  perLevel: { atk: 0.035, haste: 0.01 },
  tiers: [
    {
      name: 'Unbound',
      description: 'Ruin Unbound no longer waits for a crowd.',
      skills: [{ skillId: 'ruin-unbound', condition: { kind: 'always' } }],
    },
    {
      name: 'Entropic',
      description: 'Ruin Unbound is unconditional, and Entropy comes up a third sooner.',
      skills: [
        { skillId: 'ruin-unbound', condition: { kind: 'always' } },
        { skillId: 'entropy', cooldown: 35 },
      ],
    },
    {
      name: 'The Silence Deepens',
      description: 'Entropy quickens, and the Long Silence lands a third heavier.',
      skills: [
        { skillId: 'ruin-unbound', condition: { kind: 'always' } },
        { skillId: 'entropy', cooldown: 35 },
        {
          skillId: 'long-silence',
          effects: [{ kind: 'damage', damageType: 'magical', power: 2.8 }],
        },
      ],
    },
    {
      name: 'Ruin Unbound',
      description:
        'Nothing in the kit waits for anything, and the Unmaking takes the whole field rather ' +
        'than the largest thing standing on it.',
      skills: [
        { skillId: 'ruin-unbound', condition: { kind: 'always' } },
        { skillId: 'entropy', cooldown: 35 },
        {
          skillId: 'long-silence',
          effects: [{ kind: 'damage', damageType: 'magical', power: 2.8 }],
        },
        {
          skillId: 'unmaking',
          target: 'enemy-all',
          effects: [{ kind: 'damage', damageType: 'magical', power: 1.7 }],
        },
      ],
      opening: [SIG_ENTROPY],
    },
  ],
};

// ---------------------------------------------------------------------------------------
// Milestone 20's seven — the second ascended-tier rank
//
// ⚠️ **Not one of these widens a skill's target at its top rung, and the omission is deliberate.**
// Vharok's and Aelrindel's and Azrathoth's do, and those three work — but widening trades
// per-target power for coverage, so whether it is an upgrade at all depends on how many bodies the
// probe's board happens to have in the row being aimed at. `signature.balance.ts` asserts that
// **reach never falls between one rung and the next**, which a trade cannot promise and a strict
// increase can. So every rung below is a lower cooldown, a certain status where one was a roll, a
// deeper siphon, or a bigger number — and the three shipped items that widen keep doing so because
// they are measured doing it.
// ---------------------------------------------------------------------------------------

/**
 * Corvane — the word spoken further, and the party held together longer.
 *
 * His kit is one turn about where damage goes and three about the party surviving until it gets
 * there, so the rungs buy **how often each of them lands** rather than how hard. The last one adds
 * {@link RALLY} to the Chainward, which is the only place in either roster where the link the
 * party wears also pays it — the same argument the Deepstone Oath makes about uptime, said on a
 * caster.
 */
const THE_SWORN_WORD: SignatureItemData = {
  id: 'the-sworn-word',
  defId: 'corvane',
  name: 'The Sworn Word',
  description: 'Sworn once, in front of the Ninth. It has not needed saying again.',
  perLevel: { atk: 0.03, hp: 0.02 },
  tiers: [
    {
      name: 'Spoken Once',
      description: 'Sending comes up a third sooner.',
      skills: [{ skillId: 'sending', cooldown: 30 }],
    },
    {
      name: 'Twice Sworn',
      description: 'Sending quickens, and the Ninth Holds returns a third sooner.',
      skills: [
        { skillId: 'sending', cooldown: 30 },
        { skillId: 'the-ninth-holds', cooldown: 40 },
      ],
    },
    {
      name: 'The Word Carries',
      description: 'Both quicken, and Blunt the Edge never fails to weaken.',
      skills: [
        { skillId: 'sending', cooldown: 30 },
        { skillId: 'the-ninth-holds', cooldown: 40 },
        {
          skillId: 'blunt-the-edge',
          effects: [
            { kind: 'damage', damageType: 'magical', power: 1.2 },
            { kind: 'status', status: WEAKEN },
          ],
        },
      ],
    },
    {
      name: 'The Concord Holds',
      description:
        'Everything returns sooner, Blunt the Edge always weakens, the Chainward rallies the ' +
        'party it binds, and Corvane takes the field already warded.',
      skills: [
        { skillId: 'sending', cooldown: 30 },
        { skillId: 'the-ninth-holds', cooldown: 40 },
        {
          skillId: 'blunt-the-edge',
          effects: [
            { kind: 'damage', damageType: 'magical', power: 1.2 },
            { kind: 'status', status: WEAKEN },
          ],
        },
        {
          skillId: 'chainward',
          // `effects` replaces rather than appends, so keeping the link and the armour means
          // restating both. Forgetting one here would silently remove the character's whole point.
          effects: [
            { kind: 'status', status: CHAINBOND },
            { kind: 'status', status: GUARD },
            { kind: 'status', status: RALLY },
          ],
        },
      ],
      opening: [SIG_CONCORD],
    },
  ],
};

/**
 * Vurn — the ledger, kept for longer and settled harder.
 *
 * The joint largest budget at 5.5% for the reason Thraun's and Seraphine's are: most of it is `hp`
 * and `def`, which are the cheapest stats on the board. It is also the one item where a defensive
 * profile is **offence** — thorns pay out per blow survived, so every point of health is another
 * instalment collected.
 */
const THE_GRUDGE_LEDGER: SignatureItemData = {
  id: 'the-grudge-ledger',
  defId: 'vurn',
  name: 'The Grudge Ledger',
  description: 'Every debt the hold is owed, written down. He has never lost a page.',
  perLevel: { hp: 0.03, def: 0.025 },
  tiers: [
    {
      name: 'First Entry',
      description: 'Grudgefire comes up a third sooner.',
      skills: [{ skillId: 'grudgefire', cooldown: 30 }],
    },
    {
      name: 'The Ledger Open',
      description: 'Grudgefire quickens, and the Wardstone banks an Aegis rather than a Barrier.',
      skills: [
        { skillId: 'grudgefire', cooldown: 30 },
        { skillId: 'wardstone', effects: [{ kind: 'status', status: AEGIS }] },
      ],
    },
    {
      name: 'Every Debt Noted',
      description: 'The Wardstone deepens, and the Sunken Rune returns a third sooner.',
      skills: [
        { skillId: 'grudgefire', cooldown: 30 },
        { skillId: 'wardstone', effects: [{ kind: 'status', status: AEGIS }] },
        { skillId: 'sunken-rune', cooldown: 35 },
      ],
    },
    {
      name: 'The Ledger Closed',
      description:
        'Every rune comes faster, the Wardstone banks an Aegis, the Runes of Return armour what ' +
        'they thorn, and Vurn stands the whole fight behind his own.',
      skills: [
        { skillId: 'grudgefire', cooldown: 30 },
        { skillId: 'wardstone', effects: [{ kind: 'status', status: AEGIS }] },
        { skillId: 'sunken-rune', cooldown: 35 },
        {
          skillId: 'runes-of-return',
          effects: [
            { kind: 'status', status: THORNMAIL },
            { kind: 'status', status: GUARD },
          ],
        },
      ],
      opening: [SIG_GRUDGE],
    },
  ],
};

/**
 * Maelis — the taunt held longer, and the body behind it harder to hit.
 *
 * A haste-mover, so it carries one of the smaller budgets: turn frequency is `ceil(1000 / haste)`
 * and every extra turn is another window in which the grove is standing where the party is not.
 *
 * ⚠️ **No rung touches the cooldown on {@link OATHSHIELD}'s skill**, and that is a rule rather than
 * an oversight: `skills.spec.ts` requires it to outlast the status so a party with only
 * single-target reach is left a window at whatever stands behind the taunter. A signature item is
 * exactly the shape of thing that would quietly close that door.
 */
const THE_WARDED_BOUGH: SignatureItemData = {
  id: 'the-warded-bough',
  defId: 'maelis',
  name: 'The Warded Bough',
  description: 'Cut from the tree that outlived the grove. It has still not been hit.',
  perLevel: { hp: 0.025, def: 0.015, haste: 0.01 },
  tiers: [
    {
      name: 'Rooted',
      description: 'Bramblecut comes up a third sooner.',
      skills: [{ skillId: 'bramblecut', cooldown: 30 }],
    },
    {
      name: 'Seen and Sought',
      description: 'Bramblecut quickens, and standing to be seen quickens him with it.',
      skills: [
        { skillId: 'bramblecut', cooldown: 30 },
        {
          skillId: 'stand-and-be-seen',
          effects: [
            { kind: 'status', status: OATHSHIELD },
            { kind: 'status', status: HASTE },
          ],
        },
      ],
    },
    {
      name: 'The Grove Answers',
      description: 'The taunt quickens him, and Root and Bough never fails to slow.',
      skills: [
        { skillId: 'bramblecut', cooldown: 30 },
        {
          skillId: 'stand-and-be-seen',
          effects: [
            { kind: 'status', status: OATHSHIELD },
            { kind: 'status', status: HASTE },
          ],
        },
        {
          skillId: 'root-and-bough',
          effects: [
            { kind: 'damage', damageType: 'physical', power: 1.2 },
            { kind: 'status', status: SLOW },
          ],
        },
      ],
    },
    {
      name: 'Sunlit',
      description:
        'The taunt quickens him, Root and Bough always slows, the Sunlit Bough banks an Aegis ' +
        'over the party, and Maelis opens the fight already warded.',
      skills: [
        { skillId: 'bramblecut', cooldown: 30 },
        {
          skillId: 'stand-and-be-seen',
          effects: [
            { kind: 'status', status: OATHSHIELD },
            { kind: 'status', status: HASTE },
          ],
        },
        {
          skillId: 'root-and-bough',
          effects: [
            { kind: 'damage', damageType: 'physical', power: 1.2 },
            { kind: 'status', status: SLOW },
          ],
        },
        {
          skillId: 'sunlit-bough',
          effects: [
            { kind: 'status', status: HASTE },
            { kind: 'status', status: AEGIS },
          ],
        },
      ],
      opening: [SIG_EVERGREEN],
    },
  ],
};

/**
 * Carrow — more taken, from further away.
 *
 * Every rung is about the siphon rather than the shot, which is the faction rule stated on an
 * archer: an Undead's health is whatever it has most recently removed from something else. The
 * last rung takes the Last Volley from half to seven tenths returned and raises it besides — the
 * only item here that moves a number and a ratio on the same clause.
 */
const THE_LAST_QUIVER: SignatureItemData = {
  id: 'the-last-quiver',
  defId: 'carrow',
  name: 'The Last Quiver',
  description: 'He fletched it himself, from himself. It has never run empty.',
  perLevel: { atk: 0.03, hp: 0.02 },
  tiers: [
    {
      name: 'Fletched',
      description: 'Boneshot returns three quarters of what it takes rather than half.',
      skills: [
        {
          skillId: 'boneshot',
          effects: [{ kind: 'drain', damageType: 'physical', power: 1.8, siphon: 0.75 }],
        },
      ],
    },
    {
      name: 'Never Empty',
      description: 'Boneshot drains deeper, and the Quiet Field falls a third sooner.',
      skills: [
        {
          skillId: 'boneshot',
          effects: [{ kind: 'drain', damageType: 'physical', power: 1.8, siphon: 0.75 }],
        },
        { skillId: 'the-quiet-field', cooldown: 45 },
      ],
    },
    {
      name: 'The Field Quiets',
      description: 'The Quiet Field falls sooner, and Bonewhistle never fails to bleed.',
      skills: [
        {
          skillId: 'boneshot',
          effects: [{ kind: 'drain', damageType: 'physical', power: 1.8, siphon: 0.75 }],
        },
        { skillId: 'the-quiet-field', cooldown: 45 },
        {
          skillId: 'bonewhistle',
          effects: [
            { kind: 'damage', damageType: 'physical', power: 1.2 },
            { kind: 'status', status: BLEED },
          ],
        },
      ],
    },
    {
      name: 'The Last Quiver',
      description:
        'Everything drains deeper and falls sooner, Bonewhistle always bleeds, and the Last ' +
        'Volley takes far more and returns seven tenths of it.',
      skills: [
        {
          skillId: 'boneshot',
          effects: [{ kind: 'drain', damageType: 'physical', power: 1.8, siphon: 0.75 }],
        },
        { skillId: 'the-quiet-field', cooldown: 45 },
        {
          skillId: 'bonewhistle',
          effects: [
            { kind: 'damage', damageType: 'physical', power: 1.2 },
            { kind: 'status', status: BLEED },
          ],
        },
        {
          skillId: 'the-last-volley',
          effects: [{ kind: 'drain', damageType: 'physical', power: 2.6, siphon: 0.7 }],
        },
      ],
      opening: [SIG_LAST_QUIVER],
    },
  ],
};

/**
 * Vrakk — the same appetite, eating through more of what stops it.
 *
 * The most attack-weighted of the seven new profiles for the reason the World's Hunger is of the
 * old: this faction's whole argument is raw output with nothing behind it. What the rungs sharpen
 * is the **shred** rather than the hit, because a Monster is the answer to armour and the fastest
 * way to be more of that answer is to leave less armour standing.
 */
const THE_CORRODED_GULLET: SignatureItemData = {
  id: 'the-corroded-gullet',
  defId: 'vrakk',
  name: 'The Corroded Gullet',
  description: 'Whatever it was before, it is a hole now. The hole is still hungry.',
  perLevel: { atk: 0.035, hp: 0.015 },
  tiers: [
    {
      name: 'Etched',
      description: 'The Gullet returns three quarters of what it takes rather than half.',
      skills: [
        {
          skillId: 'gullet',
          effects: [{ kind: 'drain', damageType: 'magical', power: 1.75, siphon: 0.75 }],
        },
      ],
    },
    {
      name: 'Eaten Through',
      description: 'The Gullet feeds harder, and Bilespray never fails to sunder.',
      skills: [
        {
          skillId: 'gullet',
          effects: [{ kind: 'drain', damageType: 'magical', power: 1.75, siphon: 0.75 }],
        },
        {
          skillId: 'bilespray',
          effects: [
            { kind: 'damage', damageType: 'magical', power: 1.2 },
            { kind: 'status', status: SUNDER },
          ],
        },
      ],
    },
    {
      name: 'Nothing Holds',
      description: 'Bilespray always sunders, and the Acid Wind comes up a third sooner.',
      skills: [
        {
          skillId: 'gullet',
          effects: [{ kind: 'drain', damageType: 'magical', power: 1.75, siphon: 0.75 }],
        },
        {
          skillId: 'bilespray',
          effects: [
            { kind: 'damage', damageType: 'magical', power: 1.2 },
            { kind: 'status', status: SUNDER },
          ],
        },
        { skillId: 'acid-wind', cooldown: 35 },
      ],
    },
    {
      name: 'The Gullet Wide',
      description:
        'Everything feeds harder and comes sooner, Bilespray always sunders, and Corrosion eats ' +
        'through armour on the way in.',
      skills: [
        {
          skillId: 'gullet',
          effects: [{ kind: 'drain', damageType: 'magical', power: 1.75, siphon: 0.75 }],
        },
        {
          skillId: 'bilespray',
          effects: [
            { kind: 'damage', damageType: 'magical', power: 1.2 },
            { kind: 'status', status: SUNDER },
          ],
        },
        { skillId: 'acid-wind', cooldown: 35 },
        {
          skillId: 'corrosion',
          effects: [
            { kind: 'damage', damageType: 'magical', power: 2.9 },
            { kind: 'status', status: SUNDER, chance: 0.9 },
          ],
        },
      ],
      opening: [SIG_CORROSION],
    },
  ],
};

/**
 * Cassiel — the sentence read faster and carried out harder.
 *
 * ⚠️ **The mirror of the Unwavering Vigil, and the pair is the point.** Seraphine's item is
 * written around the rule that no signature item may multiply healing, because closing pressure
 * amplifies damage and deliberately does not amplify healing — so the obvious item for a healer is
 * the one that makes her stall. His has the opposite problem and therefore no problem: an Angel
 * whose entire kit is damage is the one wearer where "more of what this character already does" is
 * the safe answer, and it is safe for the same reason hers is not.
 */
const THE_VERDICT: SignatureItemData = {
  id: 'the-verdict',
  defId: 'cassiel',
  name: 'The Verdict',
  description: 'Not the sword. The sentence it was drawn to carry out.',
  perLevel: { atk: 0.025, hp: 0.02, def: 0.01 },
  tiers: [
    {
      name: 'Charge Read',
      description: 'Sentence comes up a third sooner.',
      skills: [{ skillId: 'sentence', cooldown: 30 }],
    },
    {
      name: 'Sentence Passed',
      description: 'Sentence quickens, and the Blade of the Choir never fails to sunder.',
      skills: [
        { skillId: 'sentence', cooldown: 30 },
        {
          skillId: 'blade-of-the-choir',
          effects: [
            { kind: 'damage', damageType: 'physical', power: 1.2 },
            { kind: 'status', status: SUNDER },
          ],
        },
      ],
    },
    {
      name: 'No Appeal',
      description: 'The Blade always sunders, and Answered in Kind returns a third sooner.',
      skills: [
        { skillId: 'sentence', cooldown: 30 },
        {
          skillId: 'blade-of-the-choir',
          effects: [
            { kind: 'damage', damageType: 'physical', power: 1.2 },
            { kind: 'status', status: SUNDER },
          ],
        },
        { skillId: 'answered-in-kind', cooldown: 35 },
      ],
    },
    {
      name: 'The Verdict',
      description:
        'Every turn comes sooner, the Blade always sunders, and the Drawn Sword lands far ' +
        'heavier and blunts what survives it.',
      skills: [
        { skillId: 'sentence', cooldown: 30 },
        {
          skillId: 'blade-of-the-choir',
          effects: [
            { kind: 'damage', damageType: 'physical', power: 1.2 },
            { kind: 'status', status: SUNDER },
          ],
        },
        { skillId: 'answered-in-kind', cooldown: 35 },
        {
          skillId: 'the-drawn-sword',
          effects: [
            { kind: 'damage', damageType: 'physical', power: 2.9 },
            { kind: 'status', status: WEAKEN },
          ],
        },
      ],
      opening: [SIG_SENTENCE],
    },
  ],
};

/**
 * Nazreth — the hex made certain, then made unavoidable.
 *
 * The lowest budget of the fourteen at 4.5%, and a fifth of it is `haste` — the same reason the
 * First Arrow and the Long Unmaking carry theirs. What the rungs buy is **landing**: a bomb that
 * fails its roll is a turn that did nothing at all, so certainty comes first and size comes last.
 *
 * The top rung seeds the front rank as well as the largest body, which is the one place this kit
 * is allowed to put two payloads on the board at once — see {@link SEEDED_SHAFT} for why the two
 * are deliberately not aimed at the same target.
 */
const THE_LONG_HEX: SignatureItemData = {
  id: 'the-long-hex',
  defId: 'nazreth',
  name: 'The Long Hex',
  description: 'Set down a long time ago, against a name nobody remembers giving him.',
  perLevel: { atk: 0.035, haste: 0.01 },
  tiers: [
    {
      name: 'Sown',
      description: 'The Seeded Shaft never fails to plant.',
      skills: [
        {
          skillId: 'seeded-shaft',
          effects: [
            { kind: 'damage', damageType: 'magical', power: 1.5 },
            { kind: 'status', status: HEXBRAND },
          ],
        },
      ],
    },
    {
      name: 'Patient',
      description: 'The seed always plants, and Patient Malice never fails to slow.',
      skills: [
        {
          skillId: 'seeded-shaft',
          effects: [
            { kind: 'damage', damageType: 'magical', power: 1.5 },
            { kind: 'status', status: HEXBRAND },
          ],
        },
        {
          skillId: 'patient-malice',
          effects: [
            { kind: 'damage', damageType: 'magical', power: 1.2 },
            { kind: 'status', status: SLOW },
          ],
        },
      ],
    },
    {
      name: 'Due',
      description: 'Both land every time, and the Reckoning comes up a third sooner.',
      skills: [
        {
          skillId: 'seeded-shaft',
          effects: [
            { kind: 'damage', damageType: 'magical', power: 1.5 },
            { kind: 'status', status: HEXBRAND },
          ],
        },
        {
          skillId: 'patient-malice',
          effects: [
            { kind: 'damage', damageType: 'magical', power: 1.2 },
            { kind: 'status', status: SLOW },
          ],
        },
        { skillId: 'the-reckoning', cooldown: 35 },
      ],
    },
    {
      name: 'The Long Hex',
      description:
        'Everything lands every time, the Reckoning comes sooner, and the Hex seeds the front ' +
        'rank as it lands, so two payloads run at once.',
      skills: [
        {
          skillId: 'seeded-shaft',
          effects: [
            { kind: 'damage', damageType: 'magical', power: 1.5 },
            { kind: 'status', status: HEXBRAND },
          ],
        },
        {
          skillId: 'patient-malice',
          effects: [
            { kind: 'damage', damageType: 'magical', power: 1.2 },
            { kind: 'status', status: SLOW },
          ],
        },
        { skillId: 'the-reckoning', cooldown: 35 },
        {
          skillId: 'the-hex-comes-due',
          effects: [
            { kind: 'damage', damageType: 'magical', power: 2.3 },
            { kind: 'status', status: HEXBRAND },
          ],
        },
      ],
      opening: [SIG_PATIENCE],
    },
  ],
};

/**
 * Every signature item this build ships, in roster order.
 *
 * One per ascended-tier character and no more: `data/signature.spec.ts` holds that against
 * `CHARACTERS` rather than against a literal count, so a new ascended-tier character without an
 * item is a failing test rather than a character whose panel is permanently empty.
 */
export const SIGNATURE_ITEMS: readonly SignatureItemData[] = [
  BANNER_OF_THE_NINTH,
  THE_SWORN_WORD,
  THE_DEEPSTONE_OATH,
  THE_GRUDGE_LEDGER,
  THE_FIRST_ARROW,
  THE_WARDED_BOUGH,
  THE_SOVEREIGNS_TITHE,
  THE_LAST_QUIVER,
  THE_WORLDS_HUNGER,
  THE_CORRODED_GULLET,
  THE_UNWAVERING_VIGIL,
  THE_VERDICT,
  THE_LONG_UNMAKING,
  THE_LONG_HEX,
];
