# Chapter 30 plan

Status: premise and faction research complete; chapter authoring has not started.
Measurements below use repository revision `fd65d6d`. No shipped content, combat rules,
economy tuning, or test thresholds were changed for this research.

## Decisions

- **Premise: enemy `critChance` paired with `critDamageAmp`.** Teach the danger of the two
  stats meeting on the same body, then make reaching that body the formation question.
  A working chapter question is: **can the party reach the body whose frequent critical hits
  also hit hard?** The name and landscape remain authoring work.
- **Lead faction: Undead.** The recent five-faction rotation points here; Undead has 71
  archetypes against Human's 68, so the difference in depth is small. This is a choice on
  rotation and measured authorability, not a claim that Undead owns the strongest crit register.
- **Supporting faction: Dwarf.** The previous chapter supplies light, usable returning bodies.
  They remain useful beside the new crit carriers deeper than the Monster alternatives tested.
- **Budget twelve new ordinary Undead blocks, plus a lieutenant and a unique boss.** This is an
  authoring allowance, not a measured minimum. Shipped Undead bodies disappear from the tested
  pool before the midpoint, so the new roster must supply the middle and closing bands itself.
  Final block count can shrink if the boards demonstrate enough variety with fewer.

The chapter remains sixty stages at enemy levels **725–755**, with Relic level 100 enemy gear.
The campaign becomes thirty chapters and 1,510 stages. The reference party stays at `ascended`
rarity, capped at effective level 500. The sixth identical seam link is expected. The established
1.30-nat preference for staying on that rung is unchanged; no cap or rarity changes belong here.

## What was measured

The production `toBattleCombatant`, `resolveStage`, `toCombatRules`, `battleSeed`, and
`simulateBattle` functions performed the measurements. The reference formation matches
`chapters.balance.ts`: Bran and Gnash in front; Rin, Celia and Pyra behind; all common-tier,
at `ascended` rarity and its level cap, with no player gear or signature bonuses.

Each sweep uses **forty attempts**, with `battleSeed(0xc0ffee, stage.id, attempt)`. The central
interaction, feasible attack settings, and selected Dwarf placements were also tested with roots
`0xc0ffef` and `0xc0fff0`, forty attempts each. Tables identify whether they use forty or 120 fights.
These are deterministic samples, not promises about every possible seed.

Control IDs are `c30-s1`, `c30-s30` and `c30-s60` at levels 725, 740 and 755 respectively.
Refielded chapter-29 boards retain their shipped IDs. Intermediate Undead-window checks use
`c30-s11`, `c30-s21`, and `c30-s31` at 730, 735 and 740. The eventual authored boards must be
retested under their actual IDs; this research does not validate unwritten encounters.

### The interaction control

At level 740, four identical legendary-tier Undead escorts have authored hp/atk/def
**24 / 3.843 / 6**. One ascended-tier Undead anchor, in the last back slot, has
**14 / 1.3725 / 6**. Every body has haste 75, tank gear archetype, base crit chance 0.05 and
amplification 0.50. Each has one physical `enemy-front` skill at power 1.5, cooldown 60,
priority 1. No hostile status, sustain, or enemy ultimate is added.

The attack values are the harness's attack factor **1.83**. This is near a responsive edge:
at level 740, factors 1.80, 1.83, 1.85, 1.90 and 1.95 produce **4.00, 3.925, 3.725, 2.975,
and 1.65** survivors respectively. The control is therefore not simply a five-survivor plateau.

For the level-755 experiment, hp, atk and def are multiplied by each enemy tier's
`perLevel ** (740 - 755)`. This holds the absolute combat stats fixed while testing a different
stage's seeds. It is experimental normalization, **not the proposed chapter level curve**:
copying it over all sixty shipped stages would cancel the chapter's climb.

### Pairing result: approved

The tested changes are chance **0.05 → 0.20**, amplification **0.50 → 1.15**, and both together
on all five bodies. Cost means baseline survivors minus changed survivors. The following rows
aggregate three seed roots, **120 fights per cell**:

| Enemy level | Baseline survivors | Chance-only cost | Amp-only cost | Pair cost | Excess over sum of halves | Baseline mean | Pair mean |
| ----------- | ------------------ | ---------------- | ------------- | --------- | ------------------------- | ------------- | --------- |
| 740         | 3.967              | 1.383            | 0.050         | **3.700** | **2.267**                 | 39.30s        | 51.89s    |
| 755         | 3.933              | 1.342            | 0.117         | **3.600** | **2.142**                 | 39.56s        | 51.06s    |

There are **zero timeouts** in these comparisons; their longest fight is **61.7s**. The pair is
deliberately too hard on this control: aggregate win rates are 11.7% and 14.2%. Those defeats
measure the interaction's price; these stat lines are not proposed shipping boards.

The grid at both levels also tested chance 0.05/0.12/0.20/0.28 against amplification
0.50/0.75/1.00/1.15. It supplies intermediate steps rather than only an off/on result. The old
chapter-29 suggestion, 0.28 × 1.15 on all five, is a **total wipe** on this control at both levels.
Use **0.20 × 1.15** as the initial upper-band research reference, not 0.28 everywhere.

### There is room to author it

Holding hp, def, skills and the full 0.20 × 1.15 pairing fixed, lowering the attack factor from
1.83 to **1.65** gives:

| Enemy level | Lowest win rate among three roots | Mean survivors, 120 fights | Mean fight, 120 fights | Longest fight |
| ----------- | --------------------------------- | -------------------------- | ---------------------- | ------------- |
| 740         | 97.5%                             | 3.667                      | 40.14s                 | 61.5s         |
| 755         | 95.0%                             | 3.633                      | 40.81s                 | 62.6s         |

Zero timeouts. At factor **1.60**, all three roots at both levels win every fight, with mean
durations under 40.2s. At **1.70**, each forty-fight group falls below 90% wins. There is a
usable tuning interval, but the upper edge is steep. Start ordinary boards around the safer
side and earn harder settings by measuring their complete formations.

These results are for tank-profile controls. Gear archetype, skill power, cooldown and targeting
remain part of the attack budget; copying the same authored attack into a mage profile is not an
equivalent board.

### What distinguishes this from chapter 26

The placement experiment changes the same legendary-tier body among the four equivalent escort
slots. A lone 0.28 × 1.15 carrier leaves **3.75 survivors in front-left versus 2.85 in back-left**
at level 740, and **3.75 versus 2.80** at 755, forty fights per placement. The anchor's own slot
was also tested, but it is a different tier/body and is not evidence for the isolated rank claim.

More importantly, with identical board-wide totals of both stats:

| Arrangement, two chance increases and two amplification increases    | Survivors at 740 | Survivors at 755 |
| -------------------------------------------------------------------- | ---------------- | ---------------- |
| Both stats together on the two back escorts                          | **2.20**         | **2.15**         |
| Chance on those back escorts; amplification on the two front escorts | 3.40             | 3.325            |
| Both together on the two front escorts                               | 3.60             | 3.60             |
| Chance on front escorts; amplification on back escorts               | 3.75             | 3.80             |

Forty fights per row and level, with no timeouts. **Overlap and access are priced**, not merely
the chapter's average crit chance. The six-band design can introduce separated halves, put them
together on a reachable body, then protect or multiply the combined carriers. Carrier-count
tests also descend from 3.925 to 0.325 survivors at 740 and 3.875 to 0.325 at 755 as zero through
five bodies receive the pair. Those ordered count tests fill front slots before back slots;
they demonstrate an authorable sequence, not independence from placement.

The party's register explains why the interaction has room: Bran supplies all of its **0.05
total crit block**, and Celia all of its **0.15 total crit damage resistance**. The formula is
`chance - critBlock` and `1 + max(amp - critDamageResist, 0)`. The two halves have separate answers.

## Faction and returning-pool result

The current enemy registry contains **446** blocks:

| Human | Undead | Elf | Monster | Dwarf | Angel | Demon |
| ----- | ------ | --- | ------- | ----- | ----- | ----- |
| 68    | 71     | 73  | 78      | 80    | 39    | 37    |

These replace the stale 418-block census for this plan. Current Undead medians/ceilings are
**0.08/0.18 chance** and **0.70/0.95 amplification**. The proposed reference pair exceeds both
Undead ceilings while remaining inside the game's overall register (0.30 chance, 2.30
amplification). It would establish a new, late-campaign Undead register. No shipped block is
changed to achieve it. Human's ceilings are lower still, 0.16 and 0.90; roster depth alone does
not make Human a better supplier of this premise.

### Fielding census

Every one of the 446 shipped bodies was tested in **all five slots** at each of 725, 740 and
755, for **267,600 candidate battles**. Four synthetic light Undead escorts occupy the other
slots. At level 740 each escort is common-tier, tank-profile, hp/atk/def **65/3/4**, haste 65,
chance 0.05, amplification 0.50, with the same ordinary skill as the interaction control.
Their hp/atk/def are normalized by common-tier growth at other levels. The five-light-body
control wins every fight with five survivors and a mean of about 12.4s.

A candidate passes this census if at least one placement has ≥90% wins, no timeouts,
mean ≤60s and max <72s. After simulation, remove chapter headline bosses, missing gear
archetypes and sustain carriers. This produces:

| Enemy level | Undead | Human | Elf | Monster | Dwarf | Angel/Demon | Eligible distinct bodies |
| ----------- | ------ | ----- | --- | ------- | ----- | ----------- | ------------------------ |
| 725         | **4**  | 7     | 10  | 16      | 13    | 0/0         | 50                       |
| 740         | **0**  | 2     | 5   | 14      | 9     | 0/0         | 30                       |
| 755         | **0**  | 0     | 0   | 4       | 8     | 0/0         | 12                       |

Before the post-simulation exclusions the totals are 52, 32 and 12. Counts are conditional on
this escort fixture and these seeds. They are neither a statistical filter on raw stats nor a
proof that a failing body cannot work in any imaginable formation. Passing also does not mean
that several candidates can be combined on one board.

The four early Undead candidates are **Wisp, Sheafless Shade, Bindweed Dead and Headlong Runner**.
Additional checks at 730 still admit all four; at 735 only Sheafless Shade passes; at 740 none
passes. Use these as early-band candidates, not as the roster for the second half.

### Why Dwarf is the supporting faction

Retesting the passing pool beside four bodies from the **actual crit control at attack factor
1.60** makes the distinction sharper. At 755 no Monster candidate passes in any slot; the
Dwarf candidates Capstone Drudge, Lidstone Warden and Deepbench Shorer do. Their placements
were then checked across three roots:

- **Lidstone Warden in back-left**, replacing a legendary-tier escort while retaining the
  ascended-tier anchor: **97.5% wins in each group**, mean **55.08–55.84s**, max **69.8s**.
- **Capstone Drudge replacing the anchor**: **97.5–100% wins**, mean **45.06–45.95s**,
  max **64.7s**. This proves an ordinary-board option, not a legal final with its boss removed.
- **Lidstone Warden replacing the anchor**: **100% wins**, mean **45.34–45.55s**, max **48.9s**.
- **Deepbench Shorer replacing the anchor** passes, but mean **58.83–59.44s** consumes almost
  all the mean-duration budget. It is a reserve, not the default texture. In back-left with the
  anchor retained it fails both win rate and clock limits.

Start the returning Dwarf shortlist with **Spoilroof Hand, Deadrock Bearer, Capstone Drudge and
Lidstone Warden**. Spoilroof Hand is a middle-band candidate; its corresponding level-755
placements fail. Thin the Dwarf presence toward the close, and preserve the new Undead carriers
as the chapter's identity. Do not carry chapter 29's armour escalation forward with the texture.

Choosing Undead on rotation instead of Human on the smallest count is deliberate. Both need
new late bodies; Undead is authorable with the measured new controls and a Dwarf returning
texture. Human has no measured closing-pool advantage that would overturn that choice.

### The previous final cannot simply be carried forward

Refielding the unchanged `c29-s60` at 725 reproduces its **100% wins, four survivors, 58.635s
mean and 61.5s max**. At **730 it falls to 0% wins**, and remains there through 755. Its cliff
is within five enemy levels. The old middle board already reads 47.5% at 725 and fails outright
at 730; the opening board fails at 725. New chapter-30 boards must spend smaller authored
budgets rather than copy chapter 29 upward.

## Updated implementation plan

1. **Complete: choose and measure the interaction.** Use the crit pairing, overlapping carriers,
   and access to the back rank. Retain the calibration, ablations and clock measurements above
   as the starting evidence.
2. **Complete: choose the factions and establish supply.** Undead lead, Dwarf supporting
   faction; four early Undead candidates, a small measured Dwarf shortlist, and a budget of
   twelve new ordinary Undead bodies plus two chapter-specific antagonists.
3. **Author the six bands.** Build the new light bodies before arranging the sixty stages.
   Teach the separate halves, reachable overlap, protected overlap, then combinations and the
   recurring lieutenant. Name the place from the resulting structure. With twelve new ordinary
   bodies and the eight proposed returns, the ordinary distinct roster would be twenty, **60%
   new**; recalculate from the actual fielded roster before shipping. This is a budget, not an
   instruction to force every candidate into the chapter.
4. **Wire the content and seam.** Add `chapter-30.ts`, its enemy/skill definitions and necessary
   exports, append `CHAPTERS`, and preserve the old `INVESTED` as `OVERBURDEN` in the campaign
   balance chain. Derive the new party level from the closing level and rarity cap. Use
   `725 + round(30 * (stageNumber - 1) / 59)` for stage levels, with the lieutenant at
   10/20/30/40/50 and the unique boss at 60.
5. **Handle extension effects.** Plan the established `gradeSoftness` adjustment 725 → 755
   while preserving its drop-share guard. Inspect rewards, achievements, level-economy checks,
   Descent and Expeditions at the new depth; retune only where measurements require it. Verify
   continuation from a save at the former endpoint. No save migration is expected for appending.
6. **Validate the authored result.** Mechanically audit IDs, quotas, faction shares, tiers,
   gear archetypes, stat keys and all prose claims. Check the sampled difficulty spine and each
   complete encounter under final IDs. Run `signature.balance.ts` on the candidate final early,
   including reach monotonicity, not only its timer. Run full unit and mandatory balance suites
   after tuning; lint and build before completion. Preserve existing win-rate and clock bars.

The remaining uncertainty is encounter authoring and final-board validation, not which premise
or factions to pursue. The synthetic controls do not exercise all reference parties or the
signature-item suite. No claim is made that an unwritten chapter already passes those checks.

## Research artifacts

The local research bundle is `/private/tmp/idle-rpg-chapter-30-research/`, with `probe.ts`,
`followup.ts`, `mixed.ts`, `robustness.ts` and their JSON results. A compressed copy is at
`/private/tmp/idle-rpg-chapter-30-research.tar.gz`. These files are research artifacts outside
the application; the only repository change from this session is this plan.

The bundle's `README.md` records replay commands and fixture definitions. The existing unit
and balance suites were not run in this planning session; production simulator calls and the
chapter-29 final reproduction were used to verify the research setup.
