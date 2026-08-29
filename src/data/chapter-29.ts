import {
  CAPSTONE_DRUDGE,
  CROWNCOURSE_KEEPER,
  DEADROCK_BEARER,
  DEEPBENCH_SHORER,
  DEEPSET_ANVILWARD,
  FORGE_THRALL,
  GOBWALL_MASON,
  HOLDFAST_HAND,
  LIDSTONE_WARDEN,
  MARCHWARD_PIKEMAN,
  NEVERMARK_KEEPER,
  OATHCUT_HEWER,
  PACKCALL_WHISTLER,
  PROPGALLERY_HAND,
  ROUGHCAST_GNAWER,
  SCATTERSTONE_HOWLER,
  SETSTONE_DRUDGE,
  SHALEBED_CRAWLER,
  SLAGBOUND_DRUDGE,
  SLIME,
  SPINEDRIFT_LANCER,
  SPOILROOF_HAND,
  STUBBORN_GRAIN,
  STULLSET_PROPPER,
  THE_DEADROCK,
  THE_OVERBURDEN,
  UNMARKED_WARDEN,
} from './enemies';

/**
 * Chapter 29 — The Overburden.
 *
 * **Sixty stages**, enemy levels 695 to 725. It **opens at the level chapter 28 closed on**, which
 * is the rule every chapter boundary follows: a name change and a boss behind you, not a step.
 *
 * ## What it asks that The Windthrow did not
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
 * anything it does **takes hold**, the thinground whether there is **anyone left to spend it**, the
 * roughcast whether any of it **can be counted on**, the looseline whether it can be **made to
 * connect**, and the windthrow whether it ever gets **a gap to land in**. This one asks whether it
 * **counts for what it costs**.
 *
 * ⚠️ **That is a different question from The Shutgate's, and the distinction is the chapter.** The
 * Shutgate asked whether one blow arrives **big enough** — a threshold on the instance. This asks
 * about the **toll**: `def` diminishes and can never reach zero, so every blow lands, every blow
 * counts, and every blow counts for less than it should. An overburden is the dead rock lying over
 * a seam — the material that has to be moved before anything underneath is worth anything — and a
 * working abandoned under it is a place where all the labour still happens and none of it tells.
 * The chapter is authored on enemy `def` and nothing else.
 *
 * | Band                      | Stages | Levels  | The lock it teaches                                     |
 * | ------------------------- | ------ | ------- | ------------------------------------------------------- |
 * | The stripped ground       | 1–10   | 695–700 | the habit: nothing new above 20 — {@link SPOILROOF_HAND} |
 * | The first setting         | 11–20  | 700–705 | the shipped median arrives — {@link CAPSTONE_DRUDGE}     |
 * | Where the roof came down  | 21–30  | 705–710 | past the median on a common — {@link LIDSTONE_WARDEN}    |
 * | The deep bench            | 31–40  | 710–715 | the premium arrives — {@link GOBWALL_MASON}              |
 * | Nothing shifts            | 41–50  | 715–720 | most of the board past it — {@link CROWNCOURSE_KEEPER}   |
 * | The overburden            | 51–60  | 720–725 | the whole board, and a roof at 34 — {@link DEEPBENCH_SHORER} |
 *
 * ⚠️ **The band table is stated as counts rather than as absolutes**, which is chapter 23's fix
 * applied for the seventh chapter running and mandatory here: `def` sits on **408 of 408** shipped
 * blocks, so no claim about this chapter can be a claim about *presence*. Measured over all sixty
 * boards, bodies at or above **26 common-equivalent `def`** — the shipped authored median — run
 * **2–3, 2–4, 3–4, 4–5, 4–5, 4–5** across the six bands.
 *
 * ⚠️ **The counts are in _common-equivalent_ `def` and they have to be, because the authored numbers
 * are not monotone and the effective ones are.** `def` carries the tier premium like every other
 * stat: at level 710 a `legendary` block is worth ×2.835 of a `common` one and an `ascended` ×8.03,
 * so {@link LIDSTONE_WARDEN}'s authored **32** and {@link DEEPBENCH_SHORER}'s authored **30** are
 * 32 and **86** on a board. Reading the authored column alone says band 6 steps *down* from band 3.
 * **Convert before comparing two bodies, exactly as with weight.**
 *
 * ⚠️ **The register these bands were measured against**: `def` on 408 of 408 blocks at a median of
 * **26**, a p90 of **46** and a ceiling of **70** — {@link THE_DOORSTONE}'s. **Dwarf owns that ceiling
 * outright**: 70 against Undead's 62, Demon's 58 and 54 for the remaining four, and three of the
 * four shipped blocks at 62 or above are Dwarf. That is the entire reason a Dwarf chapter is the
 * one that can be built on this.
 * Every figure is the register **before** these ten blocks shipped, which is the Dwarf fourth
 * hundred's rule.
 *
 * ⚠️ **No board restores anything**, for the fourth chapter running and checked the same way:
 * `recovery` appears on **0 of 60** boards, `lifeLeech` on **0 of 60**, `healthRegen` on **0 of 60**,
 * a `heal`, `drain` or `shield` effect on **0 of 60**, and a `regen`, `barrier` or `aegis` status on
 * **0 of 60** — five counts rather than one word, because naming them together is how five sessions
 * running shipped a false claim. {@link WARDSTONE_KEEPER} is the returning Dwarf block this
 * excluded: it carries an `ally-all` barrier and stands on no board here.
 *
 * ⚠️ **No board fields two board-wide turns and no board fields two `enemy-back` turns**, checked
 * mechanically over the **fielded** bodies rather than the new ones — and the check earned its keep.
 * {@link PACKCALL_WHISTLER} carries an `ally-all` haste, which is a board-wide turn wearing a buff,
 * and three boards paired it with {@link GOBWALL_MASON}'s `enemy-row-front` before the audit caught
 * it. **A wide turn is a target, not an intent**; count `ally-all` with the rest.
 *
 * ## The rung stays on `ascended`, and the margin is the same constant for the fourth chapter
 *
 * **The rule that picks a rung reproduces the power ratio the seam below it had**,
 * `pow(1.6, rung − rareIndex) * pow(perLevel.common, min(close, caps[rung]) − close)`. Against
 * chapter 28's seam of **0.7463** and The Overburden's close of 725, `ascended` reads **0.4001**
 * (|Δln| **0.6235**) and `ascended-1` **5.1152** (|Δln| **1.9248**). **The rule prefers staying put
 * by 1.30 nats** — the identical margin chapters 26, 27 and 28 all read, because the ratio is exactly
 * `1.6 / perLevel.common ** 100`, fixed by the hundred levels between the two caps. **It is a
 * constant now; quote it rather than re-deriving it a fifth time.**
 *
 * ⚠️ **The degenerate stretch reaches five links, exactly as chapter 28 predicted.** `ascended` caps
 * at 500 and chapters 25 through 29 all close above it, so `THINGROUND`, `ROUGHCAST`, `LOOSELINE`,
 * `WINDTHROW` and `INVESTED` are **the same five combatants at the same level at the same rung** —
 * deeper than any stretch the campaign has had before, and the first that no rung move can close.
 * **Expect a sixth at chapter 30; it is not a bug.**
 *
 * ⚠️ **The refield cliff is ten levels wide, down from chapter 28's fifteen.** Chapter 28's own
 * boards, carried to this chapter's levels: `c28-s60` reads **100% with 3.85 of five at 695** and
 * **0% at 705**, `c28-s30` reads 0% at 695 and `c28-s1` 0% at 695. **The whole of the chapter below
 * refields as a cliff inside this chapter's first ten stages.**
 *
 * ⚠️ **The pool is a wall on _attack_ and it is the tightest it has been.** Fielded as an ordinary
 * body beside four light escorts, **154 of 408 shipped blocks stand at level 695, 110 at 710 and 53
 * at 725**, across all seven factions — measured by *fielding* rather than by filtering, which is
 * chapter 24's correction. At 725 Monster supplies **18 of the 53** against Elf's 15, Human's 8,
 * Dwarf's **6** and Undead's 4. ⚠️ **And on the lean's own side the wall is sharper than the count
 * suggests**: exactly **five** shipped Dwarf blocks are cold enough to stand on an ordinary board
 * here — {@link SETSTONE_DRUDGE} at 39 gear-weighted attack, {@link DEEPSET_ANVILWARD} at 42,
 * {@link NEVERMARK_KEEPER} and {@link UNMARKED_WARDEN} at 44 and {@link HOLDFAST_HAND} at 45 —
 * where every other affordable Dwarf block sits at **62 or above** and can only ever anchor a board
 * alone. That is what sets the fielded roster at 26 rather than chapter 28's 32.
 *
 * ## ⚠️ What this chapter measured, against its own control
 *
 * Priced against one calibrated control — an `ascended` anchor of 26/1.4 behind four `legendary`
 * bodies of 44/4.0, each carrying one ordinary turn, at level 710 and Relic 100: **reading 3.98 of
 * five at 36.4s**, and it **moves** (4.00 at escort attack 3.8, 3.35 at 4.2, 1.50 at 4.4, 0.25 at
 * 4.6). Zero timeouts on every row below.
 *
 * | shape                                  | survivors   | worth           | mean fight   |
 * | -------------------------------------- | ----------- | --------------- | ------------ |
 * | `def` 17 → 28 across five              | 3.95 → 0.38 | 0.02 → **3.60** | 36.7 → 58.3s |
 * | `physicalResist` 0.08 → 0.45 across five | 3.73 → 0.07 | 0.25 → 3.90   | 39.2 → 58.6s |
 * | `magicResist` 0.60 (pool max)          | 3.05        | 0.93            | 47.2s        |
 * | `critChance` 0.28 × `critDamageAmp` 1.15 | 0.07      | 3.90            | 44.1s        |
 * | `dodge` 0.34 (chapter 27's)            | 0.50        | 3.48            | 55.2s        |
 * | `attackSpeed` 36 (chapter 28's)        | 0.30        | 3.68            | 49.3s        |
 * | `lifeLeech` 0.40 / `tenacity` 0.60     | 2.10 / 3.17 | 1.88 / 0.80     | 46.3 / 42.8s |
 * | `accuracy` 1.50 / `magicPierce` 0.40   | 3.98 / 3.98 | **0.00 / 0.00** | 36.4 / 36.4s |
 *
 * 1. ⚠️ **`def` is the last stat in the block that has never been a chapter's premise, and this is
 *    the chapter where the vocabulary runs out.** Chapter 23 took all four mitigation stats at once
 *    — `critBlock`, `critDamageResist`, `physicalResist` and `magicResist` — chapter 24 `tenacity`,
 *    25 `physicalPierce`, 26 enemy `critChance`, 27 `dodge` and 28 `attackSpeed`. What is left grades
 *    **nine monotone steps** (0.02 / 0.10 / 0.58 / 0.73 / 1.20 / 1.73 / 2.23 / 3.13 / 3.60 across
 *    17 → 28), and everything else either belongs to a shipped chapter or reads **0.00**.
 * 2. ⚠️ **`accuracy` and `magicPierce` are worth exactly 0.00 and the formula says so before the
 *    sweep does** — the third and fourth candidates disqualified by reading `damage.ts` rather than
 *    the stat names. The calibrated five carry `dodge` **Σ0.00**, so an `accuracy` axis has nothing
 *    to overcome; and `resistedShare` multiplies **after** `effectiveDefence`, so a pierce never
 *    touches a resist and a *magic* pierce never touches a party that takes five physical skills to
 *    two magical. **Price the shortlist from the formula, not from the vocabulary.**
 * 3. ⚠️ **`def` grades in _value_ and not in carrier count, which is the inverse of chapter 28.**
 *    By value across five it reads nine steps; by carrier count at 26 it reads **0.00 / 0.06 / 0.10 /
 *    0.10 / 1.70 / 2.96** — flat through the middle and a cliff at the end. That is the survivors
 *    metric saturating, and it generalises: **a defensive stat grades in value and an offensive one
 *    grades in carrier count**, which is why `attackSpeed` could be a dial in two dimensions and this
 *    cannot. The six bands move value and count together, and the board weight carries the rest.
 * 4. ⚠️ **The axis was taken knowing it costs the clock, because every remaining candidate does.**
 *    `def` 28 buys twenty-two seconds of fight for its 3.60, `physicalResist` 0.45 twenty-two for
 *    3.90 and `magicResist` 0.60 eleven for 0.93. The only cheap thing left is the crit *product*
 *    (eight seconds for 3.90) and half of it is chapter 26's axis. **When the vocabulary is spent the
 *    clock stops being a filter and becomes the budget** — see the boards below.
 * 5. ⚠️ **The bar that binds is the sixty-second _mean_, not the seventy-two-second max, and a
 *    fight-lengthening chapter meets it first.** `chapters.balance.ts` holds *every* sweep entry to
 *    a mean under 60s and the longest *cleared* fight to 0.80 of the timer; the first authored pass
 *    here read 60.2s and 64.3s means on two boards and passed the max bar comfortably. **Tune
 *    against the mean.**
 *
 * ## ⚠️ Four things the boards found that the control did not
 *
 * 0. ⚠️ **The first authored pass was too cold and the difficulty probe is what said so.** It read
 *    every board at 100% and every fight under the max bar, and the probe still failed twice: band 4
 *    opened at **0.680** of band 3's close, and the chapter's closing third read *lighter* than its
 *    opening third. **The probe reads throughput and `def` is invisible to it** — chapter 24's
 *    finding — so the repair was to re-cut all ten new blocks **hotter and lighter** (health ×0.86,
 *    attack ×1.14 on the early bodies, ×0.76 and ×1.6 on the late ones), which raised the probe and
 *    shortened the fights at once. **On a refusal axis, weight and heat move in opposite directions
 *    and only the probe can tell you which one is short.**
 * 1. ⚠️ **Armour on a heavy body is the ninety-second clock, so a Dwarven chapter about armour has
 *    to put it on the light bodies.** Four light escorts at `def` 34 are worth **3.01 of five**;
 *    one heavy anchor at `def` 80 is worth 2.74 at a 68.3s longest fight; and an anchor carrying both
 *    weight and armour (hp 78, `def` 44) runs **88.5s**, which is a timeout and a defeat. That is the
 *    exact inverse of the faction's own idiom — the faction that owns the tankiest blocks in the game
 *    is the one whose chapter may not stack them — and it is what kept every board here under 69s.
 * 2. ⚠️ **A lone `def` carrier is rank-neutral, which is the third answer in three chapters and the
 *    first that is _no answer at all_.** Carried on **one** body — chapter 22's rule — and moved
 *    between ranks, it reads **0.00 of five in front and 0.01 in the back** at 22, 30, 40 *and* 55,
 *    where chapter 27's `dodge` read 3.25 against 3.70 and chapter 28's `attackSpeed` 0.00 against
 *    0.77. A dodge bills what is *aimed at*, an `attackSpeed` bills what is *left alive*, and `def`
 *    bills every blow that reaches the body whenever it arrives. **Rank was most of the remaining
 *    tuning in the last two chapters and is not a dial here at all.**
 * 3. ⚠️ **The final's escort is inert on the campaign sweep and decisive on the clock guard, which
 *    is a split no earlier chapter has recorded.** Every legal arrangement reads **4.00 of five at
 *    62–68s** on `chapters.balance.ts` — front-rank swap, heavier escort, cooler escort, an escort
 *    carrying no axis — where chapter 28's final went from 100% to 0% on a single front-rank swap.
 *    The one arrangement that moves *that* file is a body with attack and no armour
 *    ({@link PACKCALL_WHISTLER} reads **0%**), which is the attack wall rather than the escort.
 *    ⚠️ **`signature.balance.ts` sees the same swaps completely differently**: with the boss held,
 *    swapping {@link CAPSTONE_DRUDGE} for {@link DEADROCK_BEARER} in the back rank moves Seraphine's
 *    rung-20-to-30 step from **0.9910 to 0.9964** — through the 0.995 tolerance — and every other
 *    escort variant tried reads 0.9892 to 0.9910 and fails. **The two files disagree about which
 *    escort matters; run both.**
 * 4. ⚠️ **The boss's own axis buys clock and never survivors, and its weight is the only real dial.**
 *    Held at hp 22, `def` 18 / 26 / 34 reads **4.00 / 4.00 / 4.00** of five at 64.1s / 66.6s / 68.2s;
 *    `hp` 22 / 26 / 30 at fixed `def` reads 64.1s / 66.0s / 67.7s. It ships at the chapter's ceiling
 *    on the axis — **34**, against an ordinary ceiling of 30 — because the value is free in
 *    difficulty and the identity is worth having, and at **hp 16**, which is what puts the clock
 *    guard at 897 of 900 rather than 898. **Expect a boss's axis to be its identity and its weight
 *    to be its difficulty**, which is chapter 27's finding for the third chapter running.
 *
 * ## What the sixty boards read
 *
 * Against the party the chapter is tuned for, every board reads **100%** with **zero timeouts**. The
 * lowest survivor count anywhere is **3.80** (`c29-s29`), the final reads **4.00 at 58.6s**, and
 * **the longest fight in the chapter is 61.5s**. ⚠️ **The binding bar is the sixty-second _mean_
 * rather than the seventy-two-second max**, which is the guard this chapter met first and the one a
 * fight-lengthening axis runs into: every board here is under 58.6s mean. The lieutenant grades
 * **4.00** on all five appearances with the fight walking 29.7s to 57.4s, settled by fielding all
 * five rather than the first. On the difficulty probe the spine runs **1,118,511 → 1,300,745** across
 * the sixteen sampled stages, with a worst adjacent ratio of **0.876** against the 0.85 bar and a
 * closing third 5.8% above the opening third.
 *
 * ⚠️ **Every figure above is measured with the stage's own shipped id.** `battleSeed` hashes
 * `stage.id`, so a probe that names a board anything else measures a different forty fights — chapter
 * 28 lost a full sweep to exactly that. **Tune with the ids that ship.**
 *
 * ⚠️ **`signature.balance.ts` bound this final on an assertion that is not the clock, which is new.**
 * That file bisects a five-of-one-character party against the ladder's **highest-level** board — now
 * `c29-s60` — and chapter 28's note says to run it before the full sweep. Its ninety-second guard
 * passed on the first draft at **898 of 900**; what failed was *"never makes a character reach
 * meaningfully less far as the item is levelled"*, on Seraphine, whose capstone unconditions an
 * `ally-all` heal and therefore trades damage threshold for sustain at exactly the edge that file
 * measures. She read 556 → **551** across rungs 20 and 30, a ratio of 0.9910 against a tolerance of
 * 0.995. **It is chaotic in the board, exactly as chapter 28 found the clock to be**: the boss's own
 * `def` moved it 0.9910 → 0.9928 → 0.9947 across 34 / 26 / 18 and its `hp` 0.9892 → 0.9946 across
 * 26 / 16, and no setting of either passed alone. What passed was one **escort** substitution.
 * **Run that file on the candidate final, and do not assume the assertion that binds is the clock.**
 *
 * ## The lean, and what it costs
 *
 * - **Dwarf, at 89.7% of board slots** — in family, between The Windthrow's 89.3% and The Roughcast's
 *   90.0%. ⚠️ **The lead was taken on the rotation rather than on
 *   the counts, and the two disagreed.** The reading before this chapter was demon 33, angel 36,
 *   **human 64**, dwarf 66, undead 67, monster 71, elf 71 — so Human was the thinnest legal lead by
 *   **two blocks** — while the leads since chapter 20 have run undead, monster, human, elf, dwarf,
 *   undead, monster, human, elf, a clean five-cycle that puts Dwarf here. **The rotation won because
 *   the depth argument has stopped discriminating**: the four mortal factions behind Monster sit
 *   within three of each other, and Human led two chapters ago. ⚠️ **And the axis settled it** —
 *   Dwarf owns the shipped ceiling on `def` at 70 against every other faction's 54 to 62.
 * - ⚠️ **It is Dwarf's fifth lead and they are perfectly periodic**: chapters 9, 14, 19, 24 and 29.
 *   The Hollow Anvil is the Dwarves at the forge, The Shutgate is a hold with its gate shut, The
 *   Backcut is a working cut from behind, The Nevermark is a hold that takes no telling — and this is
 *   a working nobody shut, simply buried, where the labour still happens under rock that will not
 *   move. ⚠️ **The overlap with The Nevermark is deliberate and narrow**: six of its blocks return
 *   here, because they are among the five coldest Dwarf blocks in the game and nothing else stands.
 * - **The non-lean texture is Monster: what got into the dead ground.** It is chosen on the pool
 *   rather than on the fiction — at level 725 Monster supplies **18 of the 53 blocks that stand**
 *   against Dwarf's 6 — and it thins monotonically across the bands, **8, 7, 6, 5, 3, 2**. ⚠️ **A
 *   Monster texture is also the one that costs the faction matchup nothing**, because Monster is the
 *   wildcard row of `FACTION_MATCHUPS`.
 * - **27 distinct archetypes fielded, ten of them new** — **32.0%** of ordinary archetypes under the
 *   shipped rule (8 of 25) and **37.0%** counting the lieutenant and the boss inside the fraction.
 *   ⚠️ **The denominator is small because the pool is, not because the roster was cut**: five shipped
 *   Dwarf blocks are cold enough for an ordinary board here. That is chapter 17's situation
 *   recurring, one rung and twelve chapters later.
 * - ⚠️ **The `gearArchetype` bill was zero for the tenth chapter running and structurally**: all 408
 *   shipped blocks carried one before this chapter and all 418 do after it.
 */

export const CHAPTER_29 = {
  id: 'chapter-29',
  name: 'The Overburden',
  stages: [
    {
      id: 'c29-s1',
      name: 'The Stripped Ground',
      enemies: {
        front: [SHALEBED_CRAWLER, SPOILROOF_HAND],
        back: [SLIME, DEADROCK_BEARER, CAPSTONE_DRUDGE],
      },
      level: 695,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c29-s2',
      name: 'Dead Ground',
      enemies: {
        front: [STUBBORN_GRAIN, SPOILROOF_HAND],
        back: [DEADROCK_BEARER, CAPSTONE_DRUDGE, LIDSTONE_WARDEN],
      },
      level: 696,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c29-s3',
      name: 'What The Cut Left',
      enemies: {
        front: [ROUGHCAST_GNAWER, SPOILROOF_HAND],
        back: [SPINEDRIFT_LANCER, CAPSTONE_DRUDGE, LIDSTONE_WARDEN],
      },
      level: 696,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c29-s4',
      name: 'The Barren Measure',
      enemies: {
        front: [SCATTERSTONE_HOWLER, SPOILROOF_HAND],
        back: [DEADROCK_BEARER, CAPSTONE_DRUDGE, LIDSTONE_WARDEN],
      },
      level: 697,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c29-s5',
      name: 'Spoil To The Roof',
      enemies: {
        front: [MARCHWARD_PIKEMAN, SPOILROOF_HAND],
        back: [DEADROCK_BEARER, CAPSTONE_DRUDGE, STULLSET_PROPPER],
      },
      level: 697,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c29-s6',
      name: 'The Stripped Bench',
      enemies: {
        front: [SLAGBOUND_DRUDGE, SPOILROOF_HAND],
        back: [DEADROCK_BEARER, CAPSTONE_DRUDGE, LIDSTONE_WARDEN],
      },
      level: 698,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c29-s7',
      name: 'Nothing Under It',
      enemies: {
        front: [SLIME, SPOILROOF_HAND],
        back: [DEEPSET_ANVILWARD, DEADROCK_BEARER, CAPSTONE_DRUDGE],
      },
      level: 698,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c29-s8',
      name: 'The Waste Heading',
      enemies: {
        front: [OATHCUT_HEWER, SPOILROOF_HAND],
        back: [DEADROCK_BEARER, CAPSTONE_DRUDGE, LIDSTONE_WARDEN],
      },
      level: 699,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c29-s9',
      name: 'Where The Seam Was',
      enemies: {
        front: [SHALEBED_CRAWLER, SPOILROOF_HAND],
        back: [SPINEDRIFT_LANCER, CAPSTONE_DRUDGE, LIDSTONE_WARDEN],
      },
      level: 699,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c29-s10',
      name: 'The Deadrock',
      enemies: {
        front: [THE_DEADROCK, SPOILROOF_HAND],
        back: [SETSTONE_DRUDGE, DEADROCK_BEARER, CAPSTONE_DRUDGE],
      },
      level: 700,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c29-s11',
      name: 'The First Setting',
      enemies: {
        front: [PROPGALLERY_HAND, CAPSTONE_DRUDGE],
        back: [DEADROCK_BEARER, LIDSTONE_WARDEN, SPOILROOF_HAND],
      },
      level: 700,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c29-s12',
      name: 'Laid Over The Work',
      enemies: {
        front: [ROUGHCAST_GNAWER, CAPSTONE_DRUDGE],
        back: [DEADROCK_BEARER, LIDSTONE_WARDEN, SPOILROOF_HAND],
      },
      level: 701,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c29-s13',
      name: 'Set Against The Fall',
      enemies: {
        front: [FORGE_THRALL, CAPSTONE_DRUDGE],
        back: [DEADROCK_BEARER, LIDSTONE_WARDEN, STULLSET_PROPPER],
      },
      level: 701,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c29-s14',
      name: 'The Second Setting',
      enemies: {
        front: [UNMARKED_WARDEN, CAPSTONE_DRUDGE],
        back: [DEADROCK_BEARER, LIDSTONE_WARDEN, SPINEDRIFT_LANCER],
      },
      level: 702,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c29-s15',
      name: 'Coursework',
      enemies: {
        front: [SETSTONE_DRUDGE, CAPSTONE_DRUDGE],
        back: [SPOILROOF_HAND, LIDSTONE_WARDEN, SLIME],
      },
      level: 702,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c29-s16',
      name: 'The Packed Wall',
      enemies: {
        front: [SLIME, CAPSTONE_DRUDGE],
        back: [DEADROCK_BEARER, LIDSTONE_WARDEN, SPOILROOF_HAND],
      },
      level: 703,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c29-s17',
      name: 'Nothing Gives',
      enemies: {
        front: [SCATTERSTONE_HOWLER, CAPSTONE_DRUDGE],
        back: [DEADROCK_BEARER, LIDSTONE_WARDEN, STULLSET_PROPPER],
      },
      level: 703,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c29-s18',
      name: 'The Held Roof',
      enemies: {
        front: [FORGE_THRALL, CAPSTONE_DRUDGE],
        back: [DEADROCK_BEARER, LIDSTONE_WARDEN, STULLSET_PROPPER],
      },
      level: 704,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c29-s19',
      name: 'Weight On Weight',
      enemies: {
        front: [ROUGHCAST_GNAWER, DEADROCK_BEARER],
        back: [CAPSTONE_DRUDGE, LIDSTONE_WARDEN, SPOILROOF_HAND],
      },
      level: 704,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c29-s20',
      name: 'The Course Above',
      enemies: {
        front: [THE_DEADROCK, CAPSTONE_DRUDGE],
        back: [DEADROCK_BEARER, LIDSTONE_WARDEN, SPINEDRIFT_LANCER],
      },
      level: 705,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c29-s21',
      name: 'Where The Roof Came Down',
      enemies: {
        front: [HOLDFAST_HAND, LIDSTONE_WARDEN],
        back: [CAPSTONE_DRUDGE, SLIME, STULLSET_PROPPER],
      },
      level: 705,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c29-s22',
      name: 'The Fallen Course',
      enemies: {
        front: [NEVERMARK_KEEPER, LIDSTONE_WARDEN],
        back: [CAPSTONE_DRUDGE, DEADROCK_BEARER, GOBWALL_MASON],
      },
      level: 706,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c29-s23',
      name: 'Under The Gob',
      enemies: {
        front: [ROUGHCAST_GNAWER, LIDSTONE_WARDEN],
        back: [CAPSTONE_DRUDGE, SPOILROOF_HAND, STULLSET_PROPPER],
      },
      level: 706,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c29-s24',
      name: 'Choked Heading',
      enemies: {
        front: [SETSTONE_DRUDGE, LIDSTONE_WARDEN],
        back: [CAPSTONE_DRUDGE, DEADROCK_BEARER, GOBWALL_MASON],
      },
      level: 707,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c29-s25',
      name: 'The Shale Bed',
      enemies: {
        front: [SHALEBED_CRAWLER, LIDSTONE_WARDEN],
        back: [CAPSTONE_DRUDGE, DEADROCK_BEARER, STULLSET_PROPPER],
      },
      level: 707,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c29-s26',
      name: 'Nothing To Dig To',
      enemies: {
        front: [SLIME, LIDSTONE_WARDEN],
        back: [CAPSTONE_DRUDGE, DEADROCK_BEARER, GOBWALL_MASON],
      },
      level: 708,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c29-s27',
      name: 'The Closed Gallery',
      enemies: {
        front: [HOLDFAST_HAND, LIDSTONE_WARDEN],
        back: [CAPSTONE_DRUDGE, SPOILROOF_HAND, GOBWALL_MASON],
      },
      level: 708,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c29-s28',
      name: 'Dead Roof',
      enemies: {
        front: [SLIME, LIDSTONE_WARDEN],
        back: [CAPSTONE_DRUDGE, DEADROCK_BEARER, GOBWALL_MASON],
      },
      level: 709,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c29-s29',
      name: 'The Fall Above',
      enemies: {
        front: [SHALEBED_CRAWLER, LIDSTONE_WARDEN],
        back: [CAPSTONE_DRUDGE, DEADROCK_BEARER, CROWNCOURSE_KEEPER],
      },
      level: 709,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c29-s30',
      name: 'The Weight Above',
      enemies: {
        front: [THE_DEADROCK, LIDSTONE_WARDEN],
        back: [CAPSTONE_DRUDGE, DEADROCK_BEARER, STULLSET_PROPPER],
      },
      level: 710,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c29-s31',
      name: 'The Deep Bench',
      enemies: {
        front: [SETSTONE_DRUDGE, LIDSTONE_WARDEN],
        back: [CAPSTONE_DRUDGE, GOBWALL_MASON, CROWNCOURSE_KEEPER],
      },
      level: 710,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c29-s32',
      name: 'Benchwork',
      enemies: {
        front: [HOLDFAST_HAND, LIDSTONE_WARDEN],
        back: [CAPSTONE_DRUDGE, GOBWALL_MASON, CROWNCOURSE_KEEPER],
      },
      level: 711,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c29-s33',
      name: 'The Gob Wall',
      enemies: {
        front: [NEVERMARK_KEEPER, LIDSTONE_WARDEN],
        back: [CAPSTONE_DRUDGE, GOBWALL_MASON, CROWNCOURSE_KEEPER],
      },
      level: 711,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c29-s34',
      name: 'Packed Behind',
      enemies: {
        front: [SPINEDRIFT_LANCER, LIDSTONE_WARDEN],
        back: [CAPSTONE_DRUDGE, GOBWALL_MASON, CROWNCOURSE_KEEPER],
      },
      level: 712,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c29-s35',
      name: 'The Low Working',
      enemies: {
        front: [SETSTONE_DRUDGE, CAPSTONE_DRUDGE],
        back: [LIDSTONE_WARDEN, GOBWALL_MASON, CROWNCOURSE_KEEPER],
      },
      level: 712,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c29-s36',
      name: 'Nothing Comes Out',
      enemies: {
        front: [SLIME, LIDSTONE_WARDEN],
        back: [CAPSTONE_DRUDGE, CROWNCOURSE_KEEPER, GOBWALL_MASON],
      },
      level: 713,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c29-s37',
      name: 'The Held Bench',
      enemies: {
        front: [SPINEDRIFT_LANCER, LIDSTONE_WARDEN],
        back: [CAPSTONE_DRUDGE, GOBWALL_MASON, CROWNCOURSE_KEEPER],
      },
      level: 713,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c29-s38',
      name: 'Deadwork',
      enemies: {
        front: [SLIME, CAPSTONE_DRUDGE],
        back: [LIDSTONE_WARDEN, GOBWALL_MASON, CROWNCOURSE_KEEPER],
      },
      level: 714,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c29-s39',
      name: 'The Bench Below',
      enemies: {
        front: [SLIME, LIDSTONE_WARDEN],
        back: [CAPSTONE_DRUDGE, CROWNCOURSE_KEEPER, GOBWALL_MASON],
      },
      level: 714,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c29-s40',
      name: 'Where It Leans',
      enemies: {
        front: [THE_DEADROCK, LIDSTONE_WARDEN],
        back: [CAPSTONE_DRUDGE, GOBWALL_MASON, CROWNCOURSE_KEEPER],
      },
      level: 715,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c29-s41',
      name: 'Nothing Shifts',
      enemies: {
        front: [PACKCALL_WHISTLER, LIDSTONE_WARDEN],
        back: [CROWNCOURSE_KEEPER, DEEPBENCH_SHORER, CAPSTONE_DRUDGE],
      },
      level: 715,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c29-s42',
      name: 'The Crown Course',
      enemies: {
        front: [SPOILROOF_HAND, LIDSTONE_WARDEN],
        back: [CROWNCOURSE_KEEPER, GOBWALL_MASON, CAPSTONE_DRUDGE],
      },
      level: 716,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c29-s43',
      name: 'Set Solid',
      enemies: {
        front: [HOLDFAST_HAND, LIDSTONE_WARDEN],
        back: [CROWNCOURSE_KEEPER, DEEPBENCH_SHORER, CAPSTONE_DRUDGE],
      },
      level: 716,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c29-s44',
      name: 'The Whole Measure',
      enemies: {
        front: [DEADROCK_BEARER, LIDSTONE_WARDEN],
        back: [CROWNCOURSE_KEEPER, DEEPBENCH_SHORER, CAPSTONE_DRUDGE],
      },
      level: 717,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c29-s45',
      name: 'No Give In It',
      enemies: {
        front: [SPOILROOF_HAND, LIDSTONE_WARDEN],
        back: [CROWNCOURSE_KEEPER, DEEPBENCH_SHORER, CAPSTONE_DRUDGE],
      },
      level: 717,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c29-s46',
      name: 'The Crowned Roof',
      enemies: {
        front: [SLIME, LIDSTONE_WARDEN],
        back: [CROWNCOURSE_KEEPER, DEEPBENCH_SHORER, CAPSTONE_DRUDGE],
      },
      level: 718,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c29-s47',
      name: 'Shut Working',
      enemies: {
        front: [SLIME, LIDSTONE_WARDEN],
        back: [CROWNCOURSE_KEEPER, DEEPBENCH_SHORER, CAPSTONE_DRUDGE],
      },
      level: 718,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c29-s48',
      name: 'The Last Shoring',
      enemies: {
        front: [SPOILROOF_HAND, LIDSTONE_WARDEN],
        back: [CROWNCOURSE_KEEPER, DEEPBENCH_SHORER, CAPSTONE_DRUDGE],
      },
      level: 719,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c29-s49',
      name: 'Nothing Moves',
      enemies: {
        front: [DEADROCK_BEARER, LIDSTONE_WARDEN],
        back: [CROWNCOURSE_KEEPER, DEEPBENCH_SHORER, CAPSTONE_DRUDGE],
      },
      level: 719,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c29-s50',
      name: 'The Crown Above',
      enemies: {
        front: [THE_DEADROCK, LIDSTONE_WARDEN],
        back: [CROWNCOURSE_KEEPER, GOBWALL_MASON, CAPSTONE_DRUDGE],
      },
      level: 720,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c29-s51',
      name: 'Under The Whole Of It',
      enemies: {
        front: [DEADROCK_BEARER, LIDSTONE_WARDEN],
        back: [CROWNCOURSE_KEEPER, DEEPBENCH_SHORER, GOBWALL_MASON],
      },
      level: 720,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c29-s52',
      name: 'The Shored Face',
      enemies: {
        front: [SPINEDRIFT_LANCER, LIDSTONE_WARDEN],
        back: [CROWNCOURSE_KEEPER, DEEPBENCH_SHORER, CAPSTONE_DRUDGE],
      },
      level: 721,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c29-s53',
      name: 'Nothing To Shift',
      enemies: {
        front: [SPINEDRIFT_LANCER, LIDSTONE_WARDEN],
        back: [CROWNCOURSE_KEEPER, DEEPBENCH_SHORER, CAPSTONE_DRUDGE],
      },
      level: 721,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c29-s54',
      name: 'The Dead Measure',
      enemies: {
        front: [CAPSTONE_DRUDGE, LIDSTONE_WARDEN],
        back: [CROWNCOURSE_KEEPER, GOBWALL_MASON, DEEPBENCH_SHORER],
      },
      level: 722,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c29-s55',
      name: 'All The Way Up',
      enemies: {
        front: [SPOILROOF_HAND, LIDSTONE_WARDEN],
        back: [CROWNCOURSE_KEEPER, DEEPBENCH_SHORER, GOBWALL_MASON],
      },
      level: 722,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c29-s56',
      name: 'The Shut Seam',
      enemies: {
        front: [LIDSTONE_WARDEN, CAPSTONE_DRUDGE],
        back: [CROWNCOURSE_KEEPER, GOBWALL_MASON, STULLSET_PROPPER],
      },
      level: 723,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c29-s57',
      name: 'What Lies Over It',
      enemies: {
        front: [SPOILROOF_HAND, LIDSTONE_WARDEN],
        back: [CROWNCOURSE_KEEPER, DEEPBENCH_SHORER, CAPSTONE_DRUDGE],
      },
      level: 723,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c29-s58',
      name: 'The Whole Weight',
      enemies: {
        front: [DEADROCK_BEARER, LIDSTONE_WARDEN],
        back: [CROWNCOURSE_KEEPER, DEEPBENCH_SHORER, GOBWALL_MASON],
      },
      level: 724,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c29-s59',
      name: 'Nothing Under The Sky',
      enemies: {
        front: [DEADROCK_BEARER, LIDSTONE_WARDEN],
        back: [CROWNCOURSE_KEEPER, DEEPBENCH_SHORER, GOBWALL_MASON],
      },
      level: 724,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c29-s60',
      name: 'The Overburden',
      enemies: {
        front: [THE_OVERBURDEN, LIDSTONE_WARDEN],
        back: [CROWNCOURSE_KEEPER, DEEPBENCH_SHORER, CAPSTONE_DRUDGE],
      },
      level: 725,
      gear: { grade: 4, level: 100 },
    },
  ],
} as const;
