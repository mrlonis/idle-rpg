import {
  BLOWDOWN_STALKER,
  BOAR,
  CROWNFALL_DARTER,
  DULLEDGE_BRIAR,
  DUSKFERN_SKIRMISHER,
  EVENFERN_CREEPER,
  EVENLIGHT_TENDER,
  FLATSHADE_STALKER,
  GALEWAY_OUTRIDER,
  GLADE_STALKER,
  GLASSBARK_SENTRY,
  GLOAMVINE_CREEPER,
  GREYLEAF_WARDEN,
  HOLLOWBARK_SENTRY,
  ILLFALL_SKULKER,
  LEEWARD_SCOUT,
  MIREMAST_TRUNK,
  NOONLESS_ARCHER,
  ROOTPLATE_CLIMBER,
  ROUGHCAST_GNAWER,
  SCALEPLATE_BRAMBLE,
  SHADOWLESS_DANCER,
  SHAKEWOOD_LANCER,
  SHARPSTONE_COURSER,
  SLAGBLOOM_THICKET,
  SLIME,
  SLOWGROWTH_BOLE,
  SNAPWOOD_HARRIER,
  THE_ROOTPLATE,
  THE_WINDTHROW,
  THORNLING,
  TIMBERFALL_HERALD,
} from './enemies';

/**
 * Chapter 28 — The Windthrow.
 *
 * **Sixty stages**, enemy levels 665 to 695. It **opens at the level chapter 27 closed on**, which
 * is the rule every chapter boundary follows: a name change and a boss behind you, not a step.
 *
 * ## What it asks that The Looseline did not
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
 * roughcast whether any of it **can be counted on**, and the looseline whether it can be **made to
 * connect**. This one asks whether it ever gets **a gap to land in**.
 *
 * ⚠️ **The Looseline asked about contact and this one asks about interval, which is the
 * distinction.** The Sunless Weald is the Elves at home, The Rustwood is the Elves out on somebody
 * else's battlefield and The Evenfall is the light going; this is their own country in a gale that
 * has laid it flat — a wood coming apart faster than anything in it can set itself, fought at the
 * weather's pace rather than the host's. The chapter is authored on enemy `attackSpeed` and nothing
 * else.
 *
 * | Band                  | Stages | Levels  | The lock it teaches                                        |
 * | --------------------- | ------ | ------- | ---------------------------------------------------------- |
 * | The wood still standing | 1–10  | 665–670 | the habit: nothing above 9, and no body at 10 or more |
 * | The first stems go    | 11–20  | 670–675 | 12 on one body — {@link CROWNFALL_DARTER}                   |
 * | Open where the wood was | 21–30 | 675–680 | 13, and the first boards carrying two — {@link GALEWAY_OUTRIDER} |
 * | The wood moving       | 31–40  | 680–685 | 15 on the block the closing bands are built on — {@link SHAKEWOOD_LANCER} |
 * | Nothing waits         | 41–50  | 685–690 | 18, the chapter's ordinary ceiling — {@link BLOWDOWN_STALKER} |
 * | No gap in it          | 51–60  | 690–695 | four and five carriers, and a roof at 20                    |
 *
 * ⚠️ **The band table is stated as counts rather than as absolutes**, which is chapter 23's fix
 * applied for the sixth chapter running. Measured over the **ordinary** boards — the five mini-bosses
 * and the final carry the two `ascended` blocks and are excluded — bodies carrying a point of the
 * stat run **1–3, 1–3, 2–4, 2–4, 3–4, 3–5** across the six bands, and bodies at or above **10** run
 * **0, 0–1, 0–2, 0–3, 1–3, 2–3**. The highest `attackSpeed` on an ordinary board runs **5–9, 5–12,
 * 9–13, 9–15, 13–18, 15–18**, with {@link THE_ROOTPLATE} carrying 14 on all five mini-boss boards and
 * {@link THE_WINDTHROW} 20 on the final.
 *
 * ⚠️ **The lean owns the entire shipped register of the axis and cannot afford one body of it, which
 * is a pair of firsts.** Every figure here is the register this chapter was measured **against**, not
 * the one it leaves behind — the Dwarf fourth hundred's rule. Before The Windthrow, `attackSpeed` sat
 * on **4 of 398** blocks at values 55, 70, 80 and 110, and **all four are Elf**:
 * {@link SUCKERWOOD_WHIP}, {@link THE_BLACKTHORN}, {@link BRAKETHORN_FLAIL} and
 * {@link COVERT_REAVER}. Not one of them stands here — the lightest is **1,166 common-equivalent at
 * level 665** against a whole board's budget of about 2,000 — and board-wide the stat is a **total
 * wipe at 40**, well under its own shipped floor of 55. So the chapter runs **5 to 18** with its boss
 * at 20 and never comes within a factor of five of the ceiling its own faction set. That is chapter
 * 27's shape — a stat authored below its register — arriving on a stat the lean already owns
 * outright, which is the exact inverse of The Looseline, where the lean carried none of its axis and
 * the texture supplied the whole register.
 *
 * ⚠️ **No board restores anything**, for the third chapter running and checked the same way:
 * `recovery` appears on **0 of 60** boards, `lifeLeech` on **0 of 60**, `healthRegen` on **0 of 60**,
 * a `heal`, `drain` or `shield` effect on **0 of 60**, and a `regen`, `barrier` or `aegis` status on
 * **0 of 60** — five counts rather than one word, because naming them together is how five sessions
 * running shipped a false claim.
 *
 * ⚠️ **No board fields two board-wide turns and no board fields two `enemy-back` turns**, both
 * checked mechanically over the **fielded** bodies rather than the new ones. The chapter's only
 * board-wide turn is {@link TIMBERFALL_HERALD}'s, at the wide cap of 1.2; the `enemy-back` turns come
 * from {@link CROWNFALL_DARTER}, {@link BLOWDOWN_STALKER} and three returning bodies.
 *
 * ## The rung stays on `ascended`, and the degenerate stretch reaches four links
 *
 * **The rule that picks a rung reproduces the power ratio the seam below it had**,
 * `pow(1.6, rung − rareIndex) * pow(perLevel.common, min(close, caps[rung]) − close)`. Against
 * chapter 27's seam of **1.3922** and The Windthrow's close of 695, `ascended` reads **0.7463**
 * (|Δln| **0.6235**) and `ascended-1` **9.5419** (|Δln| **1.9248**). **The rule prefers staying put
 * by 1.30 nats** — the identical margin chapters 26 and 27 both read, which is what "the rung
 * question has no tuning answer" looks like once it has become a constant.
 *
 * ⚠️ **This is the third chapter with no rung question and the fourth link of a stretch nothing can
 * end.** `ascended` caps at 500 and chapters 25 through 28 all close above it, so `THINGROUND`,
 * `ROUGHCAST`, `LOOSELINE` and `INVESTED` are **the same five combatants at the same level at the
 * same rung** — level with the four-link stretch chapters 18 through 21 reached on `mythic`, and the
 * first stretch no rung move can close. **Expect a fifth link at chapter 29; it is not a bug.**
 *
 * ⚠️ **The pool was not a wall.** Fielded as an ordinary body beside four light escorts, **159 of 398
 * shipped blocks stand at level 665, 141 at 680 and 52 at 695**, across all seven factions —
 * measured by *fielding* rather than by filtering, which is chapter 24's correction. Elf supplies
 * 22, 19 and 5 of those three counts and Monster 42, 37 and 18, which is why the non-lean texture is
 * Monster: at 695 it has three times the light tail of any other faction.
 *
 * ## ⚠️ The party is unchanged again, so thirty levels of board is the whole difficulty
 *
 * Equal *absolute* weight is equal difficulty at a degenerate seam, so chapter 27's boards transfer
 * at **0.536×** the common-equivalent figure — and refielding them is what fixes the budget. Every
 * one of `c27-s1`, `c27-s15`, `c27-s30`, `c27-s45`, `c27-s59` and `c27-s60` reads 100% at **665**
 * and **0% at 680**. So these boards are authored *lighter* than The Looseline's while standing
 * thirty levels higher, on ten new blocks running **54 to 480 authored health** and **2 to 15 attack**
 * where chapter 27's ran 85 to 620 and 4 to 19.
 *
 * ## ⚠️ What this chapter measured, against its own control
 *
 * Priced against one calibrated control — an `ascended` anchor of 90/3 behind four `legendary`
 * bodies of 150/7.5, each carrying one ordinary turn, at level 680 and Relic 100: **2,286
 * common-equivalent, reading 3.98 of five at 38.1s**, and it **moves** (4.00 at escort attack 7,
 * 2.52 at 8, 0.38 at 8.5). Zero timeouts on every row.
 *
 * | shape                                 | survivors   | worth           | mean fight   |
 * | ------------------------------------- | ----------- | --------------- | ------------ |
 * | `attackSpeed` 4 → 36 across five      | 3.75 → 0.07 | 0.23 → **3.90** | 38.8 → 54.0s |
 * | `haste` 100 → 124 across five         | 3.77 → 0.00 | 0.20 → 3.98     | 38.3 → 41.0s |
 * | `def` 30 / 46 / 70 across five        | 0.13 / 0.00 / 0.00 | 3.88 / 3.98 / 3.98 | 59.4 / 48.0 / 46.5s |
 * | `physicalResist` 0.18 / 0.40          | 3.00 / 0.10 | 1.00 / 3.90     | 46.1 / 59.5s |
 * | `magicResist` 0.60 (pool max)         | 1.15        | 2.85            | 56.7s        |
 * | `critChance` 0.30 (pool max)          | 1.07        | 2.92            | 52.6s        |
 * | `critBlock` 0.34 (pool max)           | 3.35        | 0.65            | 45.4s        |
 * | `magicPierce` 0.40 / `accuracy` 1.25  | 3.95 / 3.92 | **0.05 / 0.08** | 38.5 / 38.6s |
 *
 * 1. ⚠️ **Nine steps in value and six in carrier count, with zero timeouts.** By value across five it
 *    reads 0.23 / 0.40 / 0.90 / 1.15 / 2.13 / 2.88 / 3.42 / 3.58 / 3.90 over 4 → 36; by carrier count
 *    it grades at every value a board actually uses — 3.92 / 3.88 / 3.02 / 2.10 / 1.38 at zero
 *    through five carriers at 20, and 3.98 / 3.65 / 2.95 / 1.57 / 1.00 at 24. **A six-band chapter
 *    needs a dial in two dimensions and this is the first axis to grade in both.**
 * 2. ⚠️ **The licence is `simulate.ts` rather than the stat names, for the sixth time.**
 *    `attackSpeed` accrues **only when a combatant's last action was a basic attack** — it is swing
 *    speed rather than casting frequency, which is why it is not chapter 17's `haste` wearing a new
 *    name even though the two grade alike here. Every new block carries a **long** cooldown for that
 *    reason: 58 to 68 against a chapter-27 range of 40 to 68. A shorter cooldown would hand the same
 *    body a bigger nominal turn and quietly switch its own axis off.
 * 3. ⚠️ **`haste` grades as well and was declined on ownership rather than on the reading.** The
 *    Quickmire is the tempo chapter and states its band counts; the Human Tower's fifth hundred
 *    spends the `def`/`haste` pairing. Taking it again would be that chapter's axis wearing this
 *    chapter's fiction. `def` and `physicalResist` were declined on the **clock**: each buys eight to
 *    twenty-one seconds of fight where `attackSpeed` buys five, and chapter 27 shipped with the
 *    signature clock guard reading exactly tick 900.
 * 4. ⚠️ **An enemy `ultimate` was measured and is a design reversal rather than an axis.** No enemy
 *    has one — `docs/combat.md` records that as a decision, not an omission — and **0 of 398** blocks
 *    carries one. Measured anyway, a single-target ultimate grades 0.50 / 1.27 / 2.53 / 3.75 across
 *    power 1.2 → 1.9 and 3.92 / 3.23 / 1.50 / 0.15 across one to four carriers at power 2.2: real,
 *    narrower than the axis taken, and not a content session's call to make.
 *
 * ## ⚠️ Five things the boards found that the control did not
 *
 * 1. ⚠️ **Common-equivalent attack is blind to the gear archetype, and at Relic 100 that is worth a
 *    factor of 1.5.** `GEAR_PROFILES` pays `tank` +46% attack, `brawler` +89%, `ranger` +112% and
 *    `mage` +120%, so {@link EVENLIGHT_TENDER}'s authored 26 bills **57** where
 *    {@link GLASSBARK_SENTRY}'s 24 bills **35**. Weighted that way the failures line up and unweighted
 *    they do not: every board that failed in tuning failed between **246 and 364** gear-weighted
 *    common-equivalent attack at its own level, and every fix was an attack cut. **Weight the attack
 *    budget by archetype before comparing two boards.**
 * 2. ⚠️ **The axis is cheap and the raw attack is the wall, which is the opposite of what the axis
 *    would predict.** `c28-s57` carries **five** carriers summing 56 points of `attackSpeed` at 127
 *    gear-weighted attack and reads 100% with 4.00 of five; a draft at three carriers summing 41 at
 *    **173** read 42% with 0.63. **The chapter can afford its own premise and cannot afford an
 *    ordinary hot body**, which is chapter 23's attack wall with the axis on the safe side of it.
 * 3. ⚠️ **A carrier is worth more in the back rank than in front, which is the opposite sign to
 *    chapter 27's dodge.** Measured on **one** body — chapter 22's rule — a lone carrier at 40 is
 *    worth **0.00 of five in the front rank and 0.77 in the back**, because a body the party cannot
 *    aim at is a body that keeps swinging, and swinging is what the stat pays for. A dodge bills what
 *    is aimed at; this bills what is *left alive*.
 * 4. ⚠️ **The final is settled by its escort's arrangement rather than by its stat line, and swapping
 *    which escort body stands in front flips the board.** Held at 62/2, {@link THE_WINDTHROW} reads
 *    100% with **3.85 of five at 48.9s** behind the escort it ships with; putting
 *    {@link ROOTPLATE_CLIMBER} in the front rank and {@link SNAPWOOD_HARRIER} behind reads **0%**, a
 *    heavier escort reads **0%**, a *cooler* one reads 3.58 at a longest fight of **74.5s**, and an
 *    escort carrying no axis at all reads **57%**. Its own attack is the other half: 58/2 reads 3.85
 *    where **58/3 reads 0%**. ⚠️ **And its own axis buys clock rather than difficulty** —
 *    `attackSpeed` 8 through 34 reads 3.75 / 3.60 / **3.85** / 3.48 / 3.40, no order at all, while
 *    the longest fight runs 73.6s, 67.5s, **57.2s**, 73.6s and 74.5s. **The shipped value is the one
 *    inside the bar rather than the hardest**, and the escort is what makes the board.
 * 5. ⚠️ **`signature.balance.ts` binds this chapter's final and it is chaotic rather than monotone.**
 *    That file bisects a five-of-one-character party against the ladder's **highest-level** board,
 *    which is now `c28-s60`, and at boss weight 62 it puts Vurn Runewright at a maxed item on a
 *    victory at **exactly tick 900**. 58 reads the standing **897** chapter 26's final already set;
 *    54 reads 900 again, 50 reads 900 and 46 reads 897 — **the guard does not vary smoothly with the
 *    weight.** Removing {@link ROOTPLATE_CLIMBER} from the escort also fixes it and costs the board
 *    outright (every replacement read 0% to 18%), so the fix was the boss. **Run that file on the
 *    candidate final before the full sweep; the campaign sweep cannot see it.**
 *
 * ## What the sixty boards read
 *
 * Against the party the chapter is tuned for, every board reads **100%** with **zero timeouts**. The
 * lowest survivor count anywhere is **3.08** (`c28-s15`), the final reads **3.85**, and **the longest
 * fight in the chapter is 57.2s** against a 72s bar. The lieutenant grades **4.05 / 4.00 / 4.00 /
 * 4.00 / 3.98** across its five appearances with the fight walking 27.7s to 42.8s, settled by fielding
 * all five rather than the first. The spine runs **864,132 → 1,335,946** across the sixteen sampled
 * stages, ×1.55, with a worst adjacent ratio of **0.897** against the 0.85 bar.
 *
 * ⚠️ **Every figure above is measured with the stage's own shipped id.** `battleSeed` hashes
 * `stage.id`, so a probe that names a board anything else measures a different forty fights: a
 * tuning pass under a prefixed id read this chapter's final at 55.9s and 100%, and the shipped id
 * read **73.6s and 95%** — past the bar `chapters.balance.ts` holds cleared fights to. **Tune with
 * the ids that ship.**
 *
 * ## The lean, and what it costs
 *
 * - **Elf, at 89.3% of board slots** — in family, level with The Looseline's 89.3% and between The
 *   Underroad's 86.4% and The Roughcast's 90.0%. ⚠️ **This is the second chapter running where the
 *   depth argument and the rotation agree.** The reading before this chapter was demon 33, angel 36,
 *   **elf 61**, human 64, dwarf 66, undead 67, monster 71, so Elf was the thinnest legal lead; and the
 *   leads have run undead, monster, human, elf, dwarf, undead, monster, human since chapter 20, so Elf
 *   was next either way. It takes Elf to 71, level with Monster.
 * - ⚠️ **It is Elf's fourth lead, and what a repeat costs is that the chapter has to be a visibly
 *   different place.** The Sunless Weald is the Elves at home teaching a party about `dodge`, The
 *   Rustwood is the Elves out on somebody else's battlefield, The Evenfall is the light going out of
 *   one, and this is their own wood laid flat by weather. ⚠️ **And the overlap with the Weald is
 *   nearly nothing**, because a chapter at this weight can field only the coldest bodies in the pool:
 *   the seventeen returning Elf blocks are the boles, brambles and sentries rather than the archers
 *   the faction is known for, and the four `attackSpeed` carriers the faction already owns are all
 *   too heavy to stand on any board here.
 * - **The non-lean texture is Monster: what came into the wood once it was open.** It is chosen on the
 *   pool rather than on the fiction — at level 695 Monster supplies **18 of the 52 blocks that stand**
 *   against Elf's 5 — and it thins monotonically across the bands, **9, 7, 6, 5, 3, 2**, which is The
 *   Roughcast's shape rather than The Looseline's. ⚠️ **A Monster texture is also the one that costs
 *   the faction matchup nothing**, because Monster is the wildcard row of `FACTION_MATCHUPS`.
 * - **32 distinct archetypes fielded, ten of them new** — **26.7%** of ordinary archetypes under the
 *   shipped rule (8 of 30) and **31.3%** counting the lieutenant and the boss inside the fraction. The
 *   quota lands at the quota for the ninth chapter running, and the returning roster was sized to
 *   twenty-two **before** the boards were authored, which is chapter 26's finding applied.
 * - ⚠️ **The `gearArchetype` bill was zero for the ninth chapter running and structurally**: all 398
 *   shipped blocks carried one before this chapter and all 408 do after it.
 */

export const CHAPTER_28 = {
  id: 'chapter-28',
  name: 'The Windthrow',
  stages: [
    {
      id: 'c28-s1',
      name: 'The Wood Still Standing',
      enemies: {
        front: [SLOWGROWTH_BOLE, ROOTPLATE_CLIMBER],
        back: [LEEWARD_SCOUT, GLASSBARK_SENTRY, ROUGHCAST_GNAWER],
      },
      level: 665,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c28-s2',
      name: 'First Of The Weather',
      enemies: {
        front: [DUSKFERN_SKIRMISHER, ROOTPLATE_CLIMBER],
        back: [LEEWARD_SCOUT, SNAPWOOD_HARRIER, ROUGHCAST_GNAWER],
      },
      level: 666,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c28-s3',
      name: 'The Canopy Turning',
      enemies: {
        front: [HOLLOWBARK_SENTRY, ROOTPLATE_CLIMBER],
        back: [LEEWARD_SCOUT, SNAPWOOD_HARRIER, SLIME],
      },
      level: 666,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c28-s4',
      name: 'Before It Came Over',
      enemies: {
        front: [SCALEPLATE_BRAMBLE, GLASSBARK_SENTRY],
        back: [LEEWARD_SCOUT, EVENLIGHT_TENDER, SLIME],
      },
      level: 667,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c28-s5',
      name: 'The Gale Off The Ridge',
      enemies: {
        front: [GREYLEAF_WARDEN, ROOTPLATE_CLIMBER],
        back: [LEEWARD_SCOUT, SNAPWOOD_HARRIER, SLIME],
      },
      level: 667,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c28-s6',
      name: 'Standing Timber',
      enemies: {
        front: [MIREMAST_TRUNK, ROOTPLATE_CLIMBER],
        back: [SNAPWOOD_HARRIER, GLADE_STALKER, SLIME],
      },
      level: 668,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c28-s7',
      name: 'The Sound Before',
      enemies: {
        front: [HOLLOWBARK_SENTRY, GLOAMVINE_CREEPER],
        back: [LEEWARD_SCOUT, ROOTPLATE_CLIMBER, ILLFALL_SKULKER],
      },
      level: 668,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c28-s8',
      name: 'Root And Weather',
      enemies: {
        front: [SCALEPLATE_BRAMBLE, ROOTPLATE_CLIMBER],
        back: [SNAPWOOD_HARRIER, LEEWARD_SCOUT, BOAR],
      },
      level: 669,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c28-s9',
      name: 'The First Stem Goes',
      enemies: {
        front: [EVENFERN_CREEPER, ROOTPLATE_CLIMBER],
        back: [LEEWARD_SCOUT, SNAPWOOD_HARRIER, SLIME],
      },
      level: 669,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c28-s10',
      name: 'What The Wind Lifted',
      enemies: {
        front: [THE_ROOTPLATE, ROOTPLATE_CLIMBER],
        back: [LEEWARD_SCOUT, SNAPWOOD_HARRIER, GLASSBARK_SENTRY],
      },
      level: 670,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c28-s11',
      name: 'A Crown Comes Down',
      enemies: {
        front: [SLOWGROWTH_BOLE, ROOTPLATE_CLIMBER],
        back: [LEEWARD_SCOUT, THORNLING, GLASSBARK_SENTRY],
      },
      level: 670,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c28-s12',
      name: 'Green Timber Snapping',
      enemies: {
        front: [HOLLOWBARK_SENTRY, GLASSBARK_SENTRY],
        back: [LEEWARD_SCOUT, DULLEDGE_BRIAR, ROUGHCAST_GNAWER],
      },
      level: 671,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c28-s13',
      name: 'The Stand Opens',
      enemies: {
        front: [MIREMAST_TRUNK, ROOTPLATE_CLIMBER],
        back: [SNAPWOOD_HARRIER, EVENLIGHT_TENDER, SLIME],
      },
      level: 671,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c28-s14',
      name: 'Light Where None Was',
      enemies: {
        front: [SCALEPLATE_BRAMBLE, GLOAMVINE_CREEPER],
        back: [CROWNFALL_DARTER, ROOTPLATE_CLIMBER, SLIME],
      },
      level: 672,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c28-s15',
      name: 'Downwind Of It',
      enemies: {
        front: [SLOWGROWTH_BOLE, GLASSBARK_SENTRY],
        back: [LEEWARD_SCOUT, SHADOWLESS_DANCER, SLIME],
      },
      level: 672,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c28-s16',
      name: 'The Second Hour',
      enemies: {
        front: [SLAGBLOOM_THICKET, SHADOWLESS_DANCER],
        back: [SNAPWOOD_HARRIER, CROWNFALL_DARTER, BOAR],
      },
      level: 673,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c28-s17',
      name: 'Nothing Left To Break It',
      enemies: {
        front: [HOLLOWBARK_SENTRY, ROOTPLATE_CLIMBER],
        back: [LEEWARD_SCOUT, FLATSHADE_STALKER, SLIME],
      },
      level: 673,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c28-s18',
      name: 'Leaf And Splinter',
      enemies: {
        front: [SCALEPLATE_BRAMBLE, LEEWARD_SCOUT],
        back: [SNAPWOOD_HARRIER, EVENLIGHT_TENDER, SLIME],
      },
      level: 674,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c28-s19',
      name: 'The Ridge Gives Up',
      enemies: {
        front: [GLASSBARK_SENTRY, ROOTPLATE_CLIMBER],
        back: [SNAPWOOD_HARRIER, NOONLESS_ARCHER, LEEWARD_SCOUT],
      },
      level: 674,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c28-s20',
      name: 'The Ground Comes Up',
      enemies: {
        front: [THE_ROOTPLATE, LEEWARD_SCOUT],
        back: [SNAPWOOD_HARRIER, CROWNFALL_DARTER, GLASSBARK_SENTRY],
      },
      level: 675,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c28-s21',
      name: 'Open Where The Wood Was',
      enemies: {
        front: [GLASSBARK_SENTRY, ROOTPLATE_CLIMBER],
        back: [LEEWARD_SCOUT, SNAPWOOD_HARRIER, SHARPSTONE_COURSER],
      },
      level: 675,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c28-s22',
      name: 'Windrows Of It',
      enemies: {
        front: [SLOWGROWTH_BOLE, LEEWARD_SCOUT],
        back: [SNAPWOOD_HARRIER, CROWNFALL_DARTER, GALEWAY_OUTRIDER],
      },
      level: 676,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c28-s23',
      name: 'The Long Blowdown',
      enemies: {
        front: [HOLLOWBARK_SENTRY, ROOTPLATE_CLIMBER],
        back: [CROWNFALL_DARTER, EVENLIGHT_TENDER, SLIME],
      },
      level: 676,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c28-s24',
      name: 'Timber Across Timber',
      enemies: {
        front: [MIREMAST_TRUNK, GLASSBARK_SENTRY],
        back: [SNAPWOOD_HARRIER, LEEWARD_SCOUT, SLIME],
      },
      level: 677,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c28-s25',
      name: 'No Standing Line',
      enemies: {
        front: [SCALEPLATE_BRAMBLE, ROOTPLATE_CLIMBER],
        back: [SNAPWOOD_HARRIER, CROWNFALL_DARTER, GALEWAY_OUTRIDER],
      },
      level: 677,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c28-s26',
      name: 'A Stand Laid Flat',
      enemies: {
        front: [GLOAMVINE_CREEPER, DULLEDGE_BRIAR],
        back: [SNAPWOOD_HARRIER, ROOTPLATE_CLIMBER, BOAR],
      },
      level: 678,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c28-s27',
      name: 'The Wind Keeps At It',
      enemies: {
        front: [DULLEDGE_BRIAR, ROOTPLATE_CLIMBER],
        back: [LEEWARD_SCOUT, CROWNFALL_DARTER, ILLFALL_SKULKER],
      },
      level: 678,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c28-s28',
      name: 'Broken Off At The Root',
      enemies: {
        front: [SLAGBLOOM_THICKET, LEEWARD_SCOUT],
        back: [SNAPWOOD_HARRIER, EVENLIGHT_TENDER, CROWNFALL_DARTER],
      },
      level: 679,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c28-s29',
      name: 'Under The Fallen Crown',
      enemies: {
        front: [HOLLOWBARK_SENTRY, ROOTPLATE_CLIMBER],
        back: [CROWNFALL_DARTER, LEEWARD_SCOUT, ROUGHCAST_GNAWER],
      },
      level: 679,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c28-s30',
      name: 'The Disc Of Roots',
      enemies: {
        front: [THE_ROOTPLATE, ROOTPLATE_CLIMBER],
        back: [LEEWARD_SCOUT, SNAPWOOD_HARRIER, CROWNFALL_DARTER],
      },
      level: 680,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c28-s31',
      name: 'The Wood Moving',
      enemies: {
        front: [GLASSBARK_SENTRY, ROOTPLATE_CLIMBER],
        back: [FLATSHADE_STALKER, SNAPWOOD_HARRIER, SLIME],
      },
      level: 680,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c28-s32',
      name: 'Nothing Sets',
      enemies: {
        front: [DULLEDGE_BRIAR, GLASSBARK_SENTRY],
        back: [SNAPWOOD_HARRIER, SHAKEWOOD_LANCER, LEEWARD_SCOUT],
      },
      level: 681,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c28-s33',
      name: 'Faster Than It Falls',
      enemies: {
        front: [EVENLIGHT_TENDER, ROOTPLATE_CLIMBER],
        back: [SNAPWOOD_HARRIER, GALEWAY_OUTRIDER, SLIME],
      },
      level: 681,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c28-s34',
      name: 'Loose Timber Running',
      enemies: {
        front: [GLASSBARK_SENTRY, SNAPWOOD_HARRIER],
        back: [CROWNFALL_DARTER, SHAKEWOOD_LANCER, LEEWARD_SCOUT],
      },
      level: 682,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c28-s35',
      name: 'The Gale Inside It',
      enemies: {
        front: [SLOWGROWTH_BOLE, ROOTPLATE_CLIMBER],
        back: [CROWNFALL_DARTER, GALEWAY_OUTRIDER, SHAKEWOOD_LANCER],
      },
      level: 682,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c28-s36',
      name: 'Every Gap Filled',
      enemies: {
        front: [DULLEDGE_BRIAR, LEEWARD_SCOUT],
        back: [SNAPWOOD_HARRIER, SHAKEWOOD_LANCER, ROUGHCAST_GNAWER],
      },
      level: 683,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c28-s37',
      name: 'The Shakewood',
      enemies: {
        front: [EVENLIGHT_TENDER, ROOTPLATE_CLIMBER],
        back: [SNAPWOOD_HARRIER, CROWNFALL_DARTER, SLIME],
      },
      level: 683,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c28-s38',
      name: 'Off The Leeward Side',
      enemies: {
        front: [GLASSBARK_SENTRY, LEEWARD_SCOUT],
        back: [SNAPWOOD_HARRIER, GALEWAY_OUTRIDER, SLIME],
      },
      level: 684,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c28-s39',
      name: 'No Time To Set',
      enemies: {
        front: [SHADOWLESS_DANCER, ROOTPLATE_CLIMBER],
        back: [CROWNFALL_DARTER, SHAKEWOOD_LANCER, LEEWARD_SCOUT],
      },
      level: 684,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c28-s40',
      name: 'The Whole Stand Goes',
      enemies: {
        front: [THE_ROOTPLATE, ROOTPLATE_CLIMBER],
        back: [SNAPWOOD_HARRIER, CROWNFALL_DARTER, SHAKEWOOD_LANCER],
      },
      level: 685,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c28-s41',
      name: 'Nothing Waits',
      enemies: {
        front: [DULLEDGE_BRIAR, ROOTPLATE_CLIMBER],
        back: [SNAPWOOD_HARRIER, SHAKEWOOD_LANCER, SLIME],
      },
      level: 685,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c28-s42',
      name: 'Timberfall',
      enemies: {
        front: [EVENLIGHT_TENDER, LEEWARD_SCOUT],
        back: [CROWNFALL_DARTER, SHAKEWOOD_LANCER, TIMBERFALL_HERALD],
      },
      level: 686,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c28-s43',
      name: 'The Wind Does Not Stop',
      enemies: {
        front: [GLASSBARK_SENTRY, SNAPWOOD_HARRIER],
        back: [CROWNFALL_DARTER, GALEWAY_OUTRIDER, SHAKEWOOD_LANCER],
      },
      level: 686,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c28-s44',
      name: 'Between The Blows',
      enemies: {
        front: [SHADOWLESS_DANCER, ROOTPLATE_CLIMBER],
        back: [SNAPWOOD_HARRIER, SHAKEWOOD_LANCER, SLIME],
      },
      level: 687,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c28-s45',
      name: 'Struck And Struck Again',
      enemies: {
        front: [EVENLIGHT_TENDER, LEEWARD_SCOUT],
        back: [CROWNFALL_DARTER, GALEWAY_OUTRIDER, SHAKEWOOD_LANCER],
      },
      level: 687,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c28-s46',
      name: 'The Crown Comes Through',
      enemies: {
        front: [DULLEDGE_BRIAR, SNAPWOOD_HARRIER],
        back: [BLOWDOWN_STALKER, SHAKEWOOD_LANCER, LEEWARD_SCOUT],
      },
      level: 688,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c28-s47',
      name: 'No Interval In It',
      enemies: {
        front: [GLASSBARK_SENTRY, ROOTPLATE_CLIMBER],
        back: [CROWNFALL_DARTER, SHAKEWOOD_LANCER, SLIME],
      },
      level: 688,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c28-s48',
      name: 'The Second Gale',
      enemies: {
        front: [EVENLIGHT_TENDER, SNAPWOOD_HARRIER],
        back: [CROWNFALL_DARTER, GALEWAY_OUTRIDER, TIMBERFALL_HERALD],
      },
      level: 689,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c28-s49',
      name: 'Green Wood Bending',
      enemies: {
        front: [SHADOWLESS_DANCER, LEEWARD_SCOUT],
        back: [BLOWDOWN_STALKER, SHAKEWOOD_LANCER, ROOTPLATE_CLIMBER],
      },
      level: 689,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c28-s50',
      name: 'The Ground Lifting',
      enemies: {
        front: [THE_ROOTPLATE, SNAPWOOD_HARRIER],
        back: [CROWNFALL_DARTER, SHAKEWOOD_LANCER, LEEWARD_SCOUT],
      },
      level: 690,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c28-s51',
      name: 'No Gap In It',
      enemies: {
        front: [EVENLIGHT_TENDER, SNAPWOOD_HARRIER],
        back: [CROWNFALL_DARTER, SHAKEWOOD_LANCER, GALEWAY_OUTRIDER],
      },
      level: 690,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c28-s52',
      name: 'The Wood Comes Apart',
      enemies: {
        front: [ROOTPLATE_CLIMBER, LEEWARD_SCOUT],
        back: [BLOWDOWN_STALKER, SHAKEWOOD_LANCER, GALEWAY_OUTRIDER],
      },
      level: 691,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c28-s53',
      name: 'All Of It At Once',
      enemies: {
        front: [DULLEDGE_BRIAR, SNAPWOOD_HARRIER],
        back: [CROWNFALL_DARTER, SHAKEWOOD_LANCER, TIMBERFALL_HERALD],
      },
      level: 691,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c28-s54',
      name: 'The Last Stems',
      enemies: {
        front: [EVENLIGHT_TENDER, ROOTPLATE_CLIMBER],
        back: [BLOWDOWN_STALKER, SHAKEWOOD_LANCER, GALEWAY_OUTRIDER],
      },
      level: 692,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c28-s55',
      name: 'Nothing To Stand On',
      enemies: {
        front: [GLASSBARK_SENTRY, SNAPWOOD_HARRIER],
        back: [CROWNFALL_DARTER, SHAKEWOOD_LANCER, SLIME],
      },
      level: 692,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c28-s56',
      name: 'Blown Through',
      enemies: {
        front: [ROOTPLATE_CLIMBER, LEEWARD_SCOUT],
        back: [BLOWDOWN_STALKER, GALEWAY_OUTRIDER, TIMBERFALL_HERALD],
      },
      level: 693,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c28-s57',
      name: 'Not One Thing Still',
      enemies: {
        front: [ROOTPLATE_CLIMBER, SNAPWOOD_HARRIER],
        back: [CROWNFALL_DARTER, SHAKEWOOD_LANCER, GALEWAY_OUTRIDER],
      },
      level: 693,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c28-s58',
      name: 'The Wind In The Roots',
      enemies: {
        front: [ROOTPLATE_CLIMBER, LEEWARD_SCOUT],
        back: [BLOWDOWN_STALKER, SHAKEWOOD_LANCER, TIMBERFALL_HERALD],
      },
      level: 694,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c28-s59',
      name: 'The Whole Ridge Loose',
      enemies: {
        front: [ROOTPLATE_CLIMBER, SNAPWOOD_HARRIER],
        back: [BLOWDOWN_STALKER, SHAKEWOOD_LANCER, SLIME],
      },
      level: 694,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c28-s60',
      name: 'The Windthrow',
      enemies: {
        front: [THE_WINDTHROW, SNAPWOOD_HARRIER],
        back: [CROWNFALL_DARTER, ROOTPLATE_CLIMBER, GALEWAY_OUTRIDER],
      },
      level: 695,
      gear: { grade: 4, level: 100 },
    },
  ],
} as const;
