import {
  BANDIT,
  BRAMBLEWALK_SCOUT,
  BREAKSTEP_SKIRMISHER,
  DEADMANS_MAIL,
  DUSKFERN_SKIRMISHER,
  FORLORN_LEVY,
  FREE_BLADE,
  GIVEGROUND_LEVY,
  GLADE_STALKER,
  HALFHELD_SERJEANT,
  HALFTURN_HARRIER,
  HARNESS_CUTTER,
  HEAPFOOT_RUMMAGER,
  LOOSEREIN_LANCER,
  MUSTERYARD_HAND,
  MUSTER_PIKE,
  NEVERCLOSE_RIDER,
  OPENORDER_SPEAR,
  ROADWATCH_BOWMAN,
  RUSTLEAF_GLEANER,
  SIGNAL_RUNNER,
  SPOILCART_HAND,
  SPOIL_PICKER,
  SUNMOTE_DANCER,
  THE_HALFSTEP,
  THE_LOOSELINE,
  THORNPLATE_WEARER,
  TRACKWAY_GANG,
  VANWARD_SPEAR,
  WHISPERLEAF_ARCHER,
  WIDEORDER_HERALD,
  WINDLASS_CREW,
} from './enemies';

/**
 * Chapter 27 — The Looseline.
 *
 * **Sixty stages**, enemy levels 635 to 665. It **opens at the level chapter 26 closed on**, which
 * is the rule every chapter boundary follows: a name change and a boss behind you, not a step.
 *
 * ## What it asks that The Roughcast did not
 *
 * The barrows asked *how* the party's damage arrives, the weald *where* it lands, the anvil whether
 * anything the party does **stays done**, the wild what its damage **does to what it is spent on**,
 * the line what the party spends it on **first**, the rustwood how much of it **survives contact**,
 * the quarry whether it lands **at all**, the shutgate whether it arrives **big enough**, the
 * underroad whether there is **an end to it**, the spoilfield whether it is **the party's own damage
 * at all**, the quickmire whether it can be **spent fast enough**, the slowgrowth whether it **adds
 * up**, the backcut whether the party can **afford** to spend it, the commonage whether it gets to
 * **choose where it goes**, the longebb whether it **still holds its value**, the downstroke whether
 * it **arrives all at once**, the evenfall whether it **ever lands well**, the nevermark whether
 * anything it does **takes hold**, the thinground whether there is **anyone left to spend it**, and
 * the roughcast whether any of it **can be counted on**. This one asks whether it can be **made to
 * connect**.
 *
 * ⚠️ **The Roughcast asked about variance and this one asks about contact, which is the
 * distinction.** The Standing Line was the Humans as an army holding a line; this is the same army
 * after it has stopped trying to — a screening withdrawal across open ground, files at four paces,
 * elven outriders moving with it, and nothing anywhere that will stand still long enough to be hit.
 * The chapter is authored on enemy `dodge` and nothing else.
 *
 * | Band                 | Stages | Levels  | The lock it teaches                                             |
 * | -------------------- | ------ | ------- | --------------------------------------------------------------- |
 * | The line as it stood | 1–10   | 635–640 | the habit: a line still dressed, and nothing above 0.20         |
 * | The first give       | 11–20  | 640–645 | the screen — {@link OPENORDER_SPEAR} at 0.16, on nine of ten     |
 * | Open order           | 21–30  | 645–650 | 0.20 on one or two bodies — {@link HALFTURN_HARRIER}            |
 * | The half turn        | 31–40  | 650–655 | the shipped **median** of 0.22 on seven of ten — {@link HALFHELD_SERJEANT} |
 * | Never closing        | 41–50  | 655–660 | the shipped **p90** of 0.30 on eight of ten — {@link NEVERCLOSE_RIDER} |
 * | The looseline        | 51–60  | 660–665 | three or four carriers, and a roof level with the Elf ceiling   |
 *
 * ⚠️ **The band table is stated as counts rather than as absolutes**, which is chapter 23's fix
 * applied for the fifth chapter running. Measured over the **ordinary** boards — the five mini-bosses
 * and the final carry the two `ascended` blocks and are excluded — bodies per board at or above
 * **0.14** run **1–2, 1–3, 3–4, 3–4, 3–5, 4–5** across the six bands; at or above **0.20**, **0–1,
 * 0–2, 1–2, 2–3, 2–4, 3–4**; and at or above **0.24**, **0, 0, 0–1, 0–2, 1–2, 1–2**. The highest
 * `dodge` on an ordinary board runs **0.14–0.20, 0.14–0.20, 0.20–0.24, 0.22–0.26, 0.26–0.30,
 * 0.30**, with {@link THE_HALFSTEP} carrying 0.28 on all five mini-boss boards and
 * {@link THE_LOOSELINE} 0.34 on the final.
 *
 * ⚠️ **The chapter is authored *below* the register on a stat whose lean carries none of it, which is
 * a pair of firsts.** Every figure here is the register this chapter was measured **against**, not
 * the one it leaves behind — the Dwarf fourth hundred's rule. Before The Looseline, `dodge` sat on
 * **33 of 388** shipped blocks at a median of 0.22, a p90 of 0.30 and a ceiling of **0.55**
 * ({@link SHADE}, authored for chapter 3), and **0 of the 54 Human blocks carried a point of it** —
 * Elves carry 16 of the 33 at a faction ceiling of 0.34. Shipping these ten takes the pool to 398 and
 * the Human ceiling from nothing to 0.34. So the boards run 0.10 to 0.30 with the final at 0.34, and
 * the whole chapter sits **under a shipped ceiling it never approaches**: that is chapter 17's
 * `haste` shape — a stat that works only below its own register — rather than the Monster Tower's
 * `physicalResist` one, because the register was set at levels 125 to 375 against parties that could
 * still buy accuracy.
 *
 * ⚠️ **No board restores anything**, for the second chapter running and checked the same way:
 * `recovery` appears on **0 of 60** boards, `lifeLeech` on **0 of 60**, `healthRegen` on **0 of 60**,
 * a `heal`, `drain` or `shield` effect on **0 of 60**, and a `regen`, `barrier` or `aegis` status on
 * **0 of 60** — five counts rather than one word, because naming them together is how five sessions
 * running shipped a false claim.
 *
 * ⚠️ **No board fields two board-wide turns and no board fields two `enemy-back` turns**, both checked
 * mechanically over the **fielded** bodies rather than the new ones. The board-wide three are
 * {@link WIDEORDER_HERALD}, {@link SPOILCART_HAND} and {@link SIGNAL_RUNNER}; none of the ten new
 * blocks reaches past the front rank, so every `enemy-back` turn the chapter fields comes from a
 * returning body.
 *
 * ## The rung stays on `ascended`, and the degenerate stretch reaches three links
 *
 * **The rule that picks a rung reproduces the power ratio the seam below it had**,
 * `pow(1.6, rung − rareIndex) * pow(perLevel.common, min(close, caps[rung]) − close)`. Against
 * chapter 26's seam of **2.5971** and The Looseline's close of 665, `ascended` reads **1.3922**
 * (|Δln| **0.6235**) and `ascended-1` **17.7995** (|Δln| **1.9248**). **The rule prefers staying put
 * by 1.30 nats**, and there is nothing to override toward: chapter 25 recorded that `ascended` is the
 * last rung whose cap the ladder has not already climbed past.
 *
 * ⚠️ **This is the second chapter with no rung question and the third link of a stretch nothing can
 * end.** `ascended` caps at 500 and chapters 25, 26 and 27 all close above it, so `THINGROUND`,
 * `ROUGHCAST` and `INVESTED` are **the same five combatants at the same level at the same rung** —
 * one link deeper than the four-link stretch chapters 18 through 21 reached on `mythic`, and the
 * first stretch no rung move can close. **Expect a fourth link at chapter 28; it is not a bug.**
 *
 * ⚠️ **The pool was not a wall.** Fielded as an ordinary body beside four light escorts, **284 of 388
 * shipped blocks stand at level 635 and 150 at 665**, across all seven factions — measured by
 * *fielding* rather than by filtering, which is chapter 24's correction. Human supplies 32 and 19 of
 * those two counts and Elf 45 and 22, which is more than a sixty-stage chapter can field.
 *
 * ## ⚠️ The party is unchanged again, so thirty levels of board is the whole difficulty
 *
 * Equal *absolute* weight is equal difficulty at a degenerate seam, so chapter 26's boards transfer
 * at **0.536×** the common-equivalent figure — and refielding them is what fixes the budget.
 * `c26-s30` reads 100% with 4.00 of five at 635 and **0%** at 650; `c26-s60` reads 100% / 4.00 at 635
 * and **33% / 1.07** at 645. So these boards are authored *lighter* than The Roughcast's while
 * standing thirty levels higher — **1,897 to 2,808 common-equivalent** against chapter 26's 3,174 to
 * 5,089, on ten new blocks running **85 to 620 authored health** and **4 to 19 attack** where chapter
 * 26's ran 300 to 1,100 and 13 to 34.
 *
 * ## ⚠️ What this chapter measured, against its own control
 *
 * Priced against one calibrated control — an `ascended` anchor of 160/6 behind four `legendary`
 * bodies of 240/16, each carrying one ordinary turn, at level 650 and Relic 100: **3,563
 * common-equivalent, reading 3.80 of five at 30.1s**, and it **moves** (4.00 at escort attack 14,
 * 0.80 at 18). Zero timeouts on every row.
 *
 * | shape                                 | survivors   | worth           | mean fight   |
 * | ------------------------------------- | ----------- | --------------- | ------------ |
 * | `dodge` 0.04 → 0.30 across five       | 3.80 → 0.30 | 0.00 → **3.50** | 30.6 → 50.2s |
 * | `physicalResist` 0.10 → 0.40          | 3.08 → 0.00 | 0.75 → 3.83     | 34.0 → 51.5s |
 * | `attackSpeed` 10 → 55 across five     | 3.02 → 0.00 | 0.77 → 3.80     | 30.6 → 36.1s |
 * | `magicResist` 0.20 → 0.60 across five | 3.48 → 1.13 | 0.32 → 2.67     | 32.0 → 51.7s |
 * | `def` 40 / 55 across five             | 1.90 / 0.00 | 1.93 / 3.83     | 41.3 / 53.5s |
 * | `critDamageAmp` 1.15 across five      | 3.45        | 0.35            | 30.2s        |
 * | `accuracy` 1.25 across five           | 3.80        | **0.03**        | 30.0s        |
 *
 * 1. ⚠️ **Nine steps in value and six in carrier count, with zero timeouts.** By value it reads 0.00 /
 *    0.20 / 0.32 / 1.00 / 1.05 / 1.97 / 2.52 / 3.17 / 3.50 across 0.04 → 0.30; by carrier count at
 *    0.30 it reads 3.80 / 3.05 / 2.75 / 2.27 / 1.98 / 0.38 at zero through five. **When every other
 *    reading is a cliff, look for the one stat that grades** has now found five chapters running.
 * 2. ⚠️ **The licence is the register read from the *party's* side, and it is in `damage.ts` rather
 *    than in the stat names.** `hitChance` is `clamp(attacker.accuracy − defender.dodge,
 *    minHitChance, 1)`, and the five that arrive here carry `dodge` **Σ0.00** and `accuracy` **1.10 on
 *    one member with the other four at the default 1.00**. The mirror stat proves it: enemy `accuracy`
 *    at the pool ceiling of 1.25 is worth **0.03**, because a party with no evasion has nothing for an
 *    accuracy stat to beat.
 * 3. ⚠️ **Chapter 8 fought this stat on 49 of its 50 boards, and that is the argument rather than an
 *    objection.** The Sunless Weald taught a party at levels 125 to 150 that accuracy answers a dodge
 *    pool; this is the same stat five hundred levels later against a party that never bought the
 *    answer. **Two chapters may share a stat without sharing the argument** — chapter 26's rule, and
 *    the second chapter running to need it.
 * 4. ⚠️ **`physicalResist` grades as well and was declined on ownership rather than on the reading.**
 *    Chapter 23 built its skin band on it and states its counts at 0.12; taking it again would be that
 *    chapter's axis wearing this chapter's fiction. `magicResist` was disqualified from the formula
 *    instead: **one** of the five deals magical damage, which is why it needs the pool ceiling of 0.60
 *    to be worth 2.67 where `dodge` is worth 3.17 at 0.26.
 *
 * ## ⚠️ Four things the boards found that the control did not
 *
 * 1. ⚠️ **A dodge bills what is *aimed at*, so the rank a carrier stands in is a priced dial.**
 *    Measured on **one** body — chapter 22's rule, because a rank comparison carried on two measures
 *    the pair — a single carrier is worth **3.25 in the front rank against 3.70 in the back** at 0.22,
 *    3.15 against 3.80 at 0.30 and **2.17 against 3.17 at 0.40**: a spread that grows with the value,
 *    from 0.45 to 1.00 of a survivor. That is {@link THORNMAIL}'s "only bills what is struck" wearing
 *    the party's aim instead of its damage, and it is the opposite sign to chapter 16's unreachable
 *    debuffer.
 * 2. ⚠️ **The carriers this chapter most wants at the top are the ones it can least afford, and the
 *    binding quantity is common-equivalent *attack*.** A shipped `dodge` carrier is a light body with
 *    a hot attack — the six returning Elf blocks run 40 to 58 where the chapter's own new commons run
 *    15 to 19 — so a band already carrying three of this chapter's legendaries has no room for one.
 *    Every board that failed in tuning failed at 172 to 212 common-equivalent attack and every fix was
 *    an attack cut: `c27-s47` read **40%** at 172 and 100% / 4.00 at 129 with one body swapped.
 *    **That is why the Elf texture runs 5, 7, 8, 7, 3, 2 rather than thinning monotonically** — it
 *    arrives with the withdrawal and cannot be paid for in the closing bands.
 * 3. ⚠️ **The final's stat line is a five-row plateau the survivor metric cannot read at all, and
 *    what settles it is the clock.** Behind its shipped escort {@link THE_LOOSELINE} grades **4.00 /
 *    4.00 / 4.00 / 4.00 / 4.00 / 3.70 / 3.58 / 0.70** across 85/4, 95/4, 105/5, 115/5, 125/5, 135/6,
 *    150/6 and 175/7 — five rows the metric calls identical, then a decline, then a cliff — while the
 *    fight walks 31.2s → 44.5s. The escort is what moves it: held at 115/5, a heavier escort reads
 *    **0%**, four light bodies read **20%** and an escort carrying the axis reads **0%**. ⚠️ **And the
 *    boss's own `dodge` is worth nothing at all on this board** — 0.26, 0.30, 0.34 and 0.40 all read
 *    100% with 4.00 of five, and buy 34.7s, 35.6s, 36.6s and 38.5s. It is the identity rather than
 *    the difficulty, which is the honest reading and not the one the axis would predict.
 * 4. ⚠️ **The clock is the ceiling on a refusal chapter, and the guard that binds is in another
 *    file.** At 150/6 the final reads 100% with 3.58 of five and a **longest single fight of 81.4s** —
 *    inside the 90s timer and past the 72s bar `chapters.balance.ts` holds cleared fights to. ⚠️ **And
 *    `signature.balance.ts` is stricter than either**: it bisects a five-of-one-character party to its
 *    own **edge**, which is where a fight is longest, and a draft of the final at 135/6 behind a
 *    heavier escort put Vurn Runewright at a maxed item on a victory at **exactly tick 900**. Chapter
 *    26's own final already reads 897 there, so the headroom was gone before this chapter. **Lowering
 *    the boss's `dodge` did not move that reading at all** — 0.34, 0.30 and 0.28 all read 900 — and
 *    lightening the board did. It ships at **115/5** behind the coolest escort in the chapter, reading
 *    100% with 4.00 of five at **36.6s**, the longest fight in the chapter against a next-longest of
 *    33.7s. **Check the signature clock guard when a chapter's axis is refusal; the campaign sweep
 *    cannot see it.**
 *
 * ## What the sixty boards read
 *
 * Against the party the chapter is tuned for, every board reads **100%** with **zero timeouts**. The
 * lowest survivor count anywhere is **3.25**, the final reads 4.00, and **the longest fight in the
 * chapter is 44.0s** against a 72s bar. The lieutenant grades **4.65 / 4.17 / 4.00 / 4.00 / 4.00**
 * across its five appearances, settled by fielding all five rather than the first — at 100/5 it reads
 * 3.29 on the fifth and at 150/7 it reads **33%**. The spine runs **794,030 → 1,207,888** across the
 * sixteen sampled stages, ×1.52, with a worst adjacent ratio of **0.888** against the 0.85 bar.
 * ⚠️ **The final asks 0.942 of `c27-s59` on the probe rather than more than it**, which is the clock
 * cap above showing up in the one place a chapter's shape is measured. It is inside the 0.85 bar and
 * it is deliberate.
 *
 * ## The lean, and what it costs
 *
 * - **Human, at 89.3% of board slots** — in family, between The Underroad's 86.4% and The Roughcast's
 *   90.0%. ⚠️ **This is the first chapter in three where the depth argument and the rotation agree.**
 *   The reading before this chapter was demon 33, angel 36, **human 54**, elf 61, dwarf 66, undead 67,
 *   monster 71, so Human was the thinnest legal lead; and the leads have run undead, monster, human,
 *   elf, dwarf, undead, monster since chapter 20, so Human was next either way. It takes Human to 64.
 * - ⚠️ **It is Human's fourth lead, and what a repeat costs is that the chapter has to be a visibly
 *   different place.** The Standing Line is the Humans as an army holding a line, The Spoilfield is
 *   what lives off the ground after every army has gone through, The Downstroke is the blow that
 *   arrives all at once, and this is the line that has stopped being one. Fifteen of its thirty-two
 *   archetypes are shared with The Spoilfield, ten with The Downstroke and eight with The Standing
 *   Line — the overlap is the faction's light tail rather than its fiction, because at this weight
 *   the light tail is all there is.
 * - **The non-lean texture is Elf: the outriders who never had a line to hold.** It is also where the
 *   whole *shipped* register for the axis lives — six returning blocks running `dodge` 0.14, 0.18,
 *   0.20, 0.24, 0.26 and 0.30, on **32 of the 60 boards** — so where a board carries the stat on a
 *   returning body it carries it at a value the game already ships, and the ten new Human blocks
 *   interleave with that ladder from 0.10 to 0.34. The sixteen returning Human blocks carry **zero**.
 * - **32 distinct archetypes fielded, ten of them new** — **26.7%** of ordinary archetypes under the
 *   shipped rule (8 of 30) and **31.3%** counting the lieutenant and the boss inside the fraction. The
 *   quota lands at the quota for the eighth chapter running, and the returning roster was sized to
 *   twenty-two **before** the boards were authored, which is chapter 26's finding applied.
 * - ⚠️ **The `gearArchetype` bill was zero for the eighth chapter running and structurally**: all 388
 *   shipped blocks carried one before this chapter and all 398 do after it.
 */

export const CHAPTER_27 = {
  id: 'chapter-27',
  name: 'The Looseline',
  stages: [
    {
      id: 'c27-s1',
      name: 'The Line As It Stood',
      enemies: {
        front: [MUSTER_PIKE, GIVEGROUND_LEVY],
        back: [HEAPFOOT_RUMMAGER, SPOILCART_HAND, BREAKSTEP_SKIRMISHER],
      },
      level: 635,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c27-s2',
      name: 'Ground Held Since Morning',
      enemies: {
        front: [MUSTER_PIKE, GIVEGROUND_LEVY],
        back: [WHISPERLEAF_ARCHER, HARNESS_CUTTER, BREAKSTEP_SKIRMISHER],
      },
      level: 636,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c27-s3',
      name: 'The Order To Hold',
      enemies: {
        front: [TRACKWAY_GANG, OPENORDER_SPEAR],
        back: [SPOIL_PICKER, HARNESS_CUTTER, BREAKSTEP_SKIRMISHER],
      },
      level: 636,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c27-s4',
      name: 'Where The Flank Was',
      enemies: {
        front: [GIVEGROUND_LEVY, VANWARD_SPEAR],
        back: [BRAMBLEWALK_SCOUT, SPOIL_PICKER, BREAKSTEP_SKIRMISHER],
      },
      level: 637,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c27-s5',
      name: 'A Company Still Dressed',
      enemies: {
        front: [MUSTERYARD_HAND, GIVEGROUND_LEVY],
        back: [SPOILCART_HAND, HARNESS_CUTTER, OPENORDER_SPEAR],
      },
      level: 637,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c27-s6',
      name: 'The First Step Back',
      enemies: {
        front: [GIVEGROUND_LEVY, FORLORN_LEVY],
        back: [WHISPERLEAF_ARCHER, SPOIL_PICKER, BREAKSTEP_SKIRMISHER],
      },
      level: 638,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c27-s7',
      name: 'No Word From The Right',
      enemies: {
        front: [WINDLASS_CREW, VANWARD_SPEAR],
        back: [GLADE_STALKER, SPOILCART_HAND, OPENORDER_SPEAR],
      },
      level: 638,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c27-s8',
      name: 'The Second Rank Gone',
      enemies: {
        front: [MUSTER_PIKE, FREE_BLADE],
        back: [BRAMBLEWALK_SCOUT, SPOIL_PICKER, BREAKSTEP_SKIRMISHER],
      },
      level: 639,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c27-s9',
      name: 'Nobody Dressing The Line',
      enemies: {
        front: [GIVEGROUND_LEVY, WINDLASS_CREW],
        back: [HARNESS_CUTTER, SPOIL_PICKER, BREAKSTEP_SKIRMISHER],
      },
      level: 639,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c27-s10',
      name: 'The Halfstep',
      enemies: {
        front: [THE_HALFSTEP, GIVEGROUND_LEVY],
        back: [BREAKSTEP_SKIRMISHER, HARNESS_CUTTER, SPOIL_PICKER],
      },
      level: 640,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c27-s11',
      name: 'The First Give',
      enemies: {
        front: [OPENORDER_SPEAR, FREE_BLADE],
        back: [WHISPERLEAF_ARCHER, SPOIL_PICKER, BREAKSTEP_SKIRMISHER],
      },
      level: 640,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c27-s12',
      name: 'Opening On The Left',
      enemies: {
        front: [THORNPLATE_WEARER, GIVEGROUND_LEVY],
        back: [SPOILCART_HAND, GLADE_STALKER, OPENORDER_SPEAR],
      },
      level: 641,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c27-s13',
      name: 'A Gap Nobody Ordered',
      enemies: {
        front: [GIVEGROUND_LEVY, VANWARD_SPEAR],
        back: [GLADE_STALKER, HARNESS_CUTTER, OPENORDER_SPEAR],
      },
      level: 641,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c27-s14',
      name: 'Falling Back In Company',
      enemies: {
        front: [OPENORDER_SPEAR, FORLORN_LEVY],
        back: [BANDIT, SPOIL_PICKER, BREAKSTEP_SKIRMISHER],
      },
      level: 642,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c27-s15',
      name: 'The Line Bends',
      enemies: {
        front: [OPENORDER_SPEAR, GIVEGROUND_LEVY],
        back: [WHISPERLEAF_ARCHER, HARNESS_CUTTER, BREAKSTEP_SKIRMISHER],
      },
      level: 642,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c27-s16',
      name: 'Ground Given, Not Lost',
      enemies: {
        front: [MUSTER_PIKE, OPENORDER_SPEAR],
        back: [BRAMBLEWALK_SCOUT, SPOIL_PICKER, HALFTURN_HARRIER],
      },
      level: 643,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c27-s17',
      name: 'Two Paces And Turn',
      enemies: {
        front: [OPENORDER_SPEAR, FREE_BLADE],
        back: [BRAMBLEWALK_SCOUT, SPOIL_PICKER, BREAKSTEP_SKIRMISHER],
      },
      level: 643,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c27-s18',
      name: 'The Colours Move Back',
      enemies: {
        front: [DEADMANS_MAIL, GIVEGROUND_LEVY],
        back: [SPOILCART_HAND, HARNESS_CUTTER, BREAKSTEP_SKIRMISHER],
      },
      level: 644,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c27-s19',
      name: 'Nothing To Dress On',
      enemies: {
        front: [OPENORDER_SPEAR, VANWARD_SPEAR],
        back: [GLADE_STALKER, SPOIL_PICKER, HALFTURN_HARRIER],
      },
      level: 644,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c27-s20',
      name: 'The Second Halfstep',
      enemies: {
        front: [THE_HALFSTEP, OPENORDER_SPEAR],
        back: [BREAKSTEP_SKIRMISHER, HARNESS_CUTTER, SPOIL_PICKER],
      },
      level: 645,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c27-s21',
      name: 'Open Order',
      enemies: {
        front: [OPENORDER_SPEAR, HALFTURN_HARRIER],
        back: [GLADE_STALKER, SPOIL_PICKER, BREAKSTEP_SKIRMISHER],
      },
      level: 645,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c27-s22',
      name: 'Files At Four Paces',
      enemies: {
        front: [OPENORDER_SPEAR, FREE_BLADE],
        back: [HALFTURN_HARRIER, WHISPERLEAF_ARCHER, GIVEGROUND_LEVY],
      },
      level: 646,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c27-s23',
      name: 'The Ground Between',
      enemies: {
        front: [GIVEGROUND_LEVY, HALFTURN_HARRIER],
        back: [BRAMBLEWALK_SCOUT, HARNESS_CUTTER, BREAKSTEP_SKIRMISHER],
      },
      level: 646,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c27-s24',
      name: 'Skirmishers Forward',
      enemies: {
        front: [HALFTURN_HARRIER, OPENORDER_SPEAR],
        back: [ROADWATCH_BOWMAN, SPOIL_PICKER, BREAKSTEP_SKIRMISHER],
      },
      level: 647,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c27-s25',
      name: 'No Front To Speak Of',
      enemies: {
        front: [OPENORDER_SPEAR, HALFTURN_HARRIER],
        back: [WHISPERLEAF_ARCHER, SPOILCART_HAND, GIVEGROUND_LEVY],
      },
      level: 647,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c27-s26',
      name: 'Loose And Loosening',
      enemies: {
        front: [HALFTURN_HARRIER, FREE_BLADE],
        back: [SIGNAL_RUNNER, OPENORDER_SPEAR, BREAKSTEP_SKIRMISHER],
      },
      level: 648,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c27-s27',
      name: 'The Company Spread Thin',
      enemies: {
        front: [OPENORDER_SPEAR, HALFTURN_HARRIER],
        back: [BRAMBLEWALK_SCOUT, HARNESS_CUTTER, GIVEGROUND_LEVY],
      },
      level: 648,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c27-s28',
      name: 'Where The Line Was',
      enemies: {
        front: [GIVEGROUND_LEVY, HALFTURN_HARRIER],
        back: [GLADE_STALKER, SPOIL_PICKER, BREAKSTEP_SKIRMISHER],
      },
      level: 649,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c27-s29',
      name: 'Wide Of Everything',
      enemies: {
        front: [OPENORDER_SPEAR, HALFTURN_HARRIER],
        back: [RUSTLEAF_GLEANER, HARNESS_CUTTER, BREAKSTEP_SKIRMISHER],
      },
      level: 649,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c27-s30',
      name: 'The Third Halfstep',
      enemies: {
        front: [THE_HALFSTEP, HALFTURN_HARRIER],
        back: [GLADE_STALKER, SPOIL_PICKER, BREAKSTEP_SKIRMISHER],
      },
      level: 650,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c27-s31',
      name: 'The Half Turn',
      enemies: {
        front: [HALFHELD_SERJEANT, HALFTURN_HARRIER],
        back: [GLADE_STALKER, SPOIL_PICKER, BREAKSTEP_SKIRMISHER],
      },
      level: 650,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c27-s32',
      name: 'Struck At Nothing',
      enemies: {
        front: [HALFHELD_SERJEANT, OPENORDER_SPEAR],
        back: [LOOSEREIN_LANCER, SPOIL_PICKER, GIVEGROUND_LEVY],
      },
      level: 651,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c27-s33',
      name: 'A Blade Through Air',
      enemies: {
        front: [LOOSEREIN_LANCER, HALFTURN_HARRIER],
        back: [RUSTLEAF_GLEANER, HARNESS_CUTTER, BREAKSTEP_SKIRMISHER],
      },
      level: 651,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c27-s34',
      name: 'Turned Off The Shoulder',
      enemies: {
        front: [HALFHELD_SERJEANT, HALFTURN_HARRIER],
        back: [DUSKFERN_SKIRMISHER, SPOIL_PICKER, BREAKSTEP_SKIRMISHER],
      },
      level: 652,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c27-s35',
      name: 'Half A Pace Aside',
      enemies: {
        front: [LOOSEREIN_LANCER, OPENORDER_SPEAR],
        back: [HALFTURN_HARRIER, RUSTLEAF_GLEANER, GIVEGROUND_LEVY],
      },
      level: 652,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c27-s36',
      name: 'The Aim And The Ground',
      enemies: {
        front: [HALFHELD_SERJEANT, HALFTURN_HARRIER],
        back: [RUSTLEAF_GLEANER, SPOIL_PICKER, OPENORDER_SPEAR],
      },
      level: 653,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c27-s37',
      name: 'Gone From Where It Went',
      enemies: {
        front: [LOOSEREIN_LANCER, HALFTURN_HARRIER],
        back: [GLADE_STALKER, HARNESS_CUTTER, BREAKSTEP_SKIRMISHER],
      },
      level: 653,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c27-s38',
      name: 'Cut And Carried Past',
      enemies: {
        front: [HALFHELD_SERJEANT, OPENORDER_SPEAR],
        back: [LOOSEREIN_LANCER, HARNESS_CUTTER, GIVEGROUND_LEVY],
      },
      level: 654,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c27-s39',
      name: 'The Wide Company',
      enemies: {
        front: [HALFHELD_SERJEANT, DUSKFERN_SKIRMISHER],
        back: [HALFTURN_HARRIER, SPOIL_PICKER, BREAKSTEP_SKIRMISHER],
      },
      level: 654,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c27-s40',
      name: 'The Fourth Halfstep',
      enemies: {
        front: [THE_HALFSTEP, HALFHELD_SERJEANT],
        back: [HALFTURN_HARRIER, SPOIL_PICKER, BREAKSTEP_SKIRMISHER],
      },
      level: 655,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c27-s41',
      name: 'Never Closing',
      enemies: {
        front: [NEVERCLOSE_RIDER, HALFHELD_SERJEANT],
        back: [HALFTURN_HARRIER, SPOIL_PICKER, BREAKSTEP_SKIRMISHER],
      },
      level: 655,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c27-s42',
      name: 'The Rein Let Out',
      enemies: {
        front: [HALFHELD_SERJEANT, NEVERCLOSE_RIDER],
        back: [GLADE_STALKER, HALFTURN_HARRIER, BREAKSTEP_SKIRMISHER],
      },
      level: 656,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c27-s43',
      name: 'Riders Who Will Not Meet You',
      enemies: {
        front: [NEVERCLOSE_RIDER, HALFTURN_HARRIER],
        back: [OPENORDER_SPEAR, SUNMOTE_DANCER, GIVEGROUND_LEVY],
      },
      level: 656,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c27-s44',
      name: 'The Wide Order',
      enemies: {
        front: [WIDEORDER_HERALD, HALFHELD_SERJEANT],
        back: [HALFTURN_HARRIER, SPOIL_PICKER, OPENORDER_SPEAR],
      },
      level: 657,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c27-s45',
      name: 'Out Of Reach And Staying There',
      enemies: {
        front: [NEVERCLOSE_RIDER, HALFHELD_SERJEANT],
        back: [SPOIL_PICKER, HALFTURN_HARRIER, GIVEGROUND_LEVY],
      },
      level: 657,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c27-s46',
      name: 'A Charge With Nothing In It',
      enemies: {
        front: [NEVERCLOSE_RIDER, OPENORDER_SPEAR],
        back: [HALFTURN_HARRIER, DUSKFERN_SKIRMISHER, BREAKSTEP_SKIRMISHER],
      },
      level: 658,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c27-s47',
      name: 'The Field Gives Way',
      enemies: {
        front: [HALFHELD_SERJEANT, HALFTURN_HARRIER],
        back: [WIDEORDER_HERALD, GIVEGROUND_LEVY, OPENORDER_SPEAR],
      },
      level: 658,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c27-s48',
      name: 'Every Blow A Pace Late',
      enemies: {
        front: [HALFHELD_SERJEANT, NEVERCLOSE_RIDER],
        back: [GIVEGROUND_LEVY, OPENORDER_SPEAR, BREAKSTEP_SKIRMISHER],
      },
      level: 659,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c27-s49',
      name: 'Ground Nobody Holds',
      enemies: {
        front: [HALFHELD_SERJEANT, NEVERCLOSE_RIDER],
        back: [HALFTURN_HARRIER, OPENORDER_SPEAR, GIVEGROUND_LEVY],
      },
      level: 659,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c27-s50',
      name: 'The Fifth Halfstep',
      enemies: {
        front: [THE_HALFSTEP, NEVERCLOSE_RIDER],
        back: [HALFTURN_HARRIER, SPOIL_PICKER, BREAKSTEP_SKIRMISHER],
      },
      level: 660,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c27-s51',
      name: 'The Looseline',
      enemies: {
        front: [HALFHELD_SERJEANT, NEVERCLOSE_RIDER],
        back: [LOOSEREIN_LANCER, OPENORDER_SPEAR, BREAKSTEP_SKIRMISHER],
      },
      level: 660,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c27-s52',
      name: 'No Line To Break',
      enemies: {
        front: [NEVERCLOSE_RIDER, HALFHELD_SERJEANT],
        back: [HALFTURN_HARRIER, GLADE_STALKER, OPENORDER_SPEAR],
      },
      level: 661,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c27-s53',
      name: 'The Whole Field Loose',
      enemies: {
        front: [HALFHELD_SERJEANT, LOOSEREIN_LANCER],
        back: [NEVERCLOSE_RIDER, OPENORDER_SPEAR, BREAKSTEP_SKIRMISHER],
      },
      level: 661,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c27-s54',
      name: 'Nothing Stands To Be Struck',
      enemies: {
        front: [NEVERCLOSE_RIDER, OPENORDER_SPEAR],
        back: [WIDEORDER_HERALD, GLADE_STALKER, GIVEGROUND_LEVY],
      },
      level: 662,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c27-s55',
      name: 'The Order Comes Apart',
      enemies: {
        front: [HALFHELD_SERJEANT, NEVERCLOSE_RIDER],
        back: [LOOSEREIN_LANCER, HALFTURN_HARRIER, GIVEGROUND_LEVY],
      },
      level: 662,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c27-s56',
      name: 'Where They Were Standing',
      enemies: {
        front: [LOOSEREIN_LANCER, NEVERCLOSE_RIDER],
        back: [HALFHELD_SERJEANT, OPENORDER_SPEAR, BREAKSTEP_SKIRMISHER],
      },
      level: 663,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c27-s57',
      name: 'A Field With No Front',
      enemies: {
        front: [HALFHELD_SERJEANT, NEVERCLOSE_RIDER],
        back: [LOOSEREIN_LANCER, GIVEGROUND_LEVY, OPENORDER_SPEAR],
      },
      level: 663,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c27-s58',
      name: 'The Last Of The Company',
      enemies: {
        front: [NEVERCLOSE_RIDER, LOOSEREIN_LANCER],
        back: [HALFTURN_HARRIER, OPENORDER_SPEAR, GIVEGROUND_LEVY],
      },
      level: 664,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c27-s59',
      name: 'Nothing Left To Aim At',
      enemies: {
        front: [HALFHELD_SERJEANT, LOOSEREIN_LANCER],
        back: [NEVERCLOSE_RIDER, OPENORDER_SPEAR, GIVEGROUND_LEVY],
      },
      level: 664,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c27-s60',
      name: 'The Looseline Entire',
      enemies: {
        front: [THE_LOOSELINE, GIVEGROUND_LEVY],
        back: [OPENORDER_SPEAR, BREAKSTEP_SKIRMISHER, SPOIL_PICKER],
      },
      level: 665,
      gear: { grade: 4, level: 100 },
    },
  ],
} as const;
