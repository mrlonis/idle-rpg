import {
  ACOLYTE,
  BANDIT,
  BARROWMIST_KEENER,
  BARROW_SOVEREIGN,
  BLOODPACT_FIEND,
  BOAR,
  BONECHAIN_WARDEN,
  BULWARK_ENEMY,
  CAIRNBOUND_SENTINEL,
  CAIRNWARD_HUSK,
  CARRION_SWARM,
  CHARNEL_DRUDGE,
  CINDER_CULLER,
  COLOSSUS,
  CORTEGE_LANCER,
  COVENANT_EXECUTOR,
  GOLEM,
  GRAVEMOURN_KEEPER,
  GRAVEPLATE_MARSHAL,
  GRAVETIDE_HERALD,
  GRAVEWAKE_THRALL,
  HAG,
  HEADSMAN,
  HIEROPHANT,
  IRONWAKE_VANGUARD,
  KNELL_CHANTER,
  MIREWHELP,
  NIGHTMARCH_OUTRIDER,
  OATHBREAKER,
  PANOPLY_BEARER,
  PLATEBOUND_HUSK,
  PYRE,
  QUICKLIME_SERJEANT,
  RAVAGER,
  RELIQUARY_BEARER,
  RENDFANG_JACKAL,
  REVENANT,
  RIFTSTEP_REAVER,
  RIMEPLATE,
  SEALWARD_CUSTODIAN,
  SENTINEL,
  SEPULCHRE_HOUND,
  SERAPH_ADJUDICANT,
  SHADE,
  SKYSHRIKE,
  SLIME,
  STORMCALLER,
  THE_DEATHLESS_MARSHAL,
  THE_GRAVEWRIGHT,
  THE_HOURLESS_MARCH,
  THE_PANOPLY,
  THORNBACK_GRAZER,
  TYRANT,
  UNSEALED_WRETCH,
  WARDEN,
  WISP,
  WRATHBORN,
} from './enemies';

/**
 * The Human Tower — four hundred floors, enemy levels 1 to 189.
 *
 * ## What this file authors, and what it deliberately does not
 *
 * **Line-ups, and nothing else.** A floor's level is a straight line from 1 to 189 drawn by
 * `floorLevel` in `core/towers.ts`; **what it is wearing** is the ramp in `TOWER_RULES.gear` drawn by
 * `floorGear`; whether it is a mini-boss is the campaign's every-tenth rule reused; and what it pays
 * is read off the campaign's own curves at the **matched enemy level**. Typing four hundred levels —
 * or a hundred grade-and-level pairs — that must follow a formula is the retyping
 * [testing](../../docs/testing.md) forbids, and a payout authored here would be a second mechanism
 * on a number the campaign already decides.
 *
 * A floor is therefore three fields, and two of them are its name.
 *
 * ⚠️ **This is the only tower at four hundred floors.** `TOWER_RULES` is one rule for all seven, so
 * the height bump landed in one session and the floors move in seven; the other six sit on a literal
 * `PENDING` list in `towers.spec.ts` and `towers.balance.ts` until theirs land, and each **loses its
 * boss** while it waits. See `data/towers.ts` for the licence that rests on.
 *
 * ⚠️ **The band headers below are checked with a script, never by reading.** Every one of the eleven
 * covering floors 1–200 was wrong when the third hundred landed — they were written against a
 * `topLevel` of 120, the campaign flattening took it to 95, and nothing noticed for two milestones.
 * The line has moved twice more since. Re-derive them from `floorLevel` after any change to the
 * rules, in this file and the other six.
 *
 * ## The floors are numbered, and only the punctuation is named
 *
 * A tower is **one place with three hundred floors**, where a chapter is fifty places. So an ordinary
 * floor is `Floor 37` — which is how a player says where they are, and what the Home card shows —
 * and the every-tenth mini-boss and the roof carry a real name, because those are the handful of
 * moments a climb is remembered by.
 *
 * ## Why the enemies are mostly Undead
 *
 * Undead counter Humans in the matchup cycle, so this is the tower that punishes the crew it
 * admits. About two thirds of the slots are Undead and the rest are spread across the other six
 * factions, which is the shape the matrix needs: a mono-Human five meets fights it is unfavoured in
 * *and* fights it is favoured in, rather than a mirror match that would switch the matrix off
 * entirely. [`towers.spec.ts`](./towers.spec.ts) measures the share rather than trusting this
 * paragraph — it reads **62.94%** against a 65% ceiling.
 *
 * ⚠️ **The first hundred needed no new enemy blocks, and that is why this tower shipped first.**
 * Undead already had five archetypes where Elves and Angels had one each. Every hundred since has
 * needed four, which is the ratio worth reading: **a chapter gets ten because it authors five bands
 * each asking a different question, and a tower gets four because it asks one question a hundred more
 * times.** Undead go 17 → 21 → 25 → **29**, and stay the deepest faction in the game. ⚠️ **Four
 * blocks is 16.7% of the 24 distinct archetypes the fourth hundred fields, not 25%** — the quota is a
 * count with a precedent behind it rather than a fraction, and stating the fraction is how a session
 * talks itself into authoring twice as many.
 *
 * ⚠️ **Budget for the lean overshoot rather than discovering it.** The third hundred authored from the
 * Undead bench alone came out at **73.6%**, taking the whole tower to 65.34% against its 65% ceiling.
 * The fourth was budgeted first — at most **355 of its 500 slots** could be Undead for the tower to
 * stay under the ceiling — and it came in at **280 (56.0%)**, taking the whole tower to **61.17%**.
 * ⚠️ **The headroom fell out of the ramp rather than out of restraint**: the kitted anchors are all
 * Undead and there are only ever one to three of them a board, so the escort slots were free to go
 * elsewhere. Substitutions are still **only from factions that also counter Humans** (monster, demon,
 * angel), or the swap quietly turns the lean off on that board.
 *
 * ## Where the difficulty sits
 *
 * Deliberately **inside** the campaign's range: the ladder first reaches level 189 at stage 378 of
 * 1,210. A tower is not where difficulty lives — what it asks for is five characters of one faction,
 * which is a demand on the *roster* rather than on investment. Four balance targets, one per band,
 * every level derived from the level line: `rare-plus`/48 over floors 1–100, `elite`/75 over
 * 101–200, `elite-plus`/99 over 201–300 and `legendary`/123 over 301–400 — **none of the crews
 * wearing gear, and the fourth hundred's boards being the first in any tower that do.**
 * [`towers.balance.ts`](./towers.balance.ts) is what holds them.
 *
 * ⚠️ **Band 4's crew is the largest step any band boundary has, and it is not the ×1.6.** `legendary`
 * is a `KIT_RULES.unlocks` rung, so that five arrives with a **third skill** — where band 3's
 * `elite-plus` handed over none. The power ratio (×1.663, against band 2's ×1.689 and band 3's
 * ×1.676) counts the rung and cannot count the skill, so this hundred is authored against measured
 * survivors and the ratio is only a legality check.
 *
 * ## ⚠️ The third hundred escalates through the stat block, because nothing else is available
 *
 * Measured against both arrangements at the band-3 crew, on controlled boards at the roof's level,
 * varying one thing at a time. **The negative results are the finding:**
 *
 * - **Ten statuses one at a time** — STUN, SLOW, WEAKEN, SUNDER, POISON, BLEED, BURN, SAVAGED,
 *   HEXBRAND, DOOMBRAND — span **0.14 survivors in total**, every row between 2.88 and 3.02 against
 *   a 2.95 control. The vocabulary is inert here.
 * - **Question *count* is worth nothing**: 2.90 → 2.92 → 2.92 across one, two and four distinct
 *   questions. The inverse of the Monster Tower, where count was worth everything.
 * - **The second hundred's own axis is spent**: taunt 4.78, link 4.83, shield 4.75 against a 4.92
 *   control, with the weaker arrangement flat at 4.00 for all four.
 * - ⚠️ **Aim is inert or *negative*.** Output-normalised, `enemy-front` reads 2.98 for the weaker
 *   arrangement where `enemy-back`, `enemy-row-back` and `enemy-all` all read 3.83–3.92.
 *
 * What moves is **`haste` on a body that survives to use it**. At `haste` 144 a 420-hp body leaves
 * the weaker arrangement at 3.77 survivors and an 1120-hp body leaves it at **1.07**.
 *
 * ⚠️ **That is the exact inverse of the Angel Tower's rule**, where `haste` on a durable body was
 * worth almost nothing and on a thin one was the strongest dial there was — and the shipped register
 * encodes the Angel version: **every one of the 140 blocks above `haste` 125 is thin**, the heaviest
 * being the Nightmarch Outrider at 760 hp. A Human five kills a thin fast body before it acts twice.
 * So this hundred is where speed stops costing softness, and the four new blocks are the only ones
 * in the game that break the pairing.
 *
 * **The bands are a count of such bodies**: one Cortege Lancer, then two and three, then the Ironwake
 * Vanguard at 242, then two of those, then the Quicklime Serjeant at 281. ⚠️ **Crit is the
 * second dial and it arrives a band late**: the two at once are past the edge, so **no board carries
 * more than two Serjeants** — four of them read 20% for the weaker arrangement against its 75% bar.
 *
 * ## ⚠️ The rules that bind, and what the shipped hundred got wrong about one of them
 *
 * ⚠️ **No board in this hundred carries a heal**, checked with a script rather than by reading. The
 * Reliquary Bearer's shield is the deliberate exception and it is not one: a pool banked once
 * depletes where a heal refills. Against a party that cannot burst, sustain it is not allowed to aim
 * at is the ninety-second clock rather than a lock.
 *
 * ⚠️ **`NIGHT_RIDE`'s doc claim is wrong about this tower and the floors that field it are fine
 * anyway.** It reaches for `enemy-back` on the argument that it is "the row the party's own healing
 * lives in, which is the whole reason a tower wants one". Measured at the band it ships in, with the
 * chassis held constant, `enemy-back` reads 4.83 / 4.00 where `enemy-front` reads 4.00 / 3.88 —
 * **reaching past the front rank makes a Human board easier**, because the weaker arrangement fields
 * no tank and damage taken off its front row is time it did not have to buy. The twenty-seven floors
 * carrying the Nightmarch Outrider are hard for a different reason than the one written down: it is
 * a strong body (78 `atk`, `haste` 128, `physicalPierce` 0.15 and a `SLOW` rider), not a clever aim.
 *
 * ⚠️ Difficulty is otherwise the **front rank's weight**, and it is sharply non-linear — two
 * `ascended` blocks in front is past the edge at every band, and **no board in this hundred carries
 * two**.
 *
 * ## ⚠️ The fourth hundred — the Panoply — escalates through the gear the boards are wearing
 *
 * The first hundred in any tower whose axis is **enemy equipment**, and the first geared boards
 * outside the campaign. `TOWER_RULES.gear` ramps **Worn 1 → Fine 60** across floors 301–400, walked as
 * one position on the concatenated grade ladder so quality and level both only ever rise; the grade
 * steps at floors 301, 318 and 351. Priced against one calibrated control — an anchor of 1150/64
 * behind four bodies of 700/46 at level 189 wearing Fine 60, reading **4.00 / 3.33 of five**, and it
 * **moves** — forty seeds, zero timeouts on every row:
 *
 * | shape                                        | ref / alt   | worth to the alternate |
 * | -------------------------------------------- | ----------- | ---------------------- |
 * | `magicResist` 0.60 — the damage-type control | 4.00 / 3.50 | **−0.17**              |
 * | reach on `enemy-back`, power 1.2             | 4.00 / 3.38 | −0.05                  |
 * | wide damage at the cap, back rank            | 3.98 / 3.52 | **−0.19**              |
 * | wide damage at the cap, front rank           | 3.98 / 3.20 | 0.13                   |
 * | `physicalResist` 0.10                        | 3.92 / 3.15 | 0.18                   |
 * | `selection` on `enemy-lowest`, power 2.2     | 4.00 / 3.10 | 0.23                   |
 * | `physicalResist` 0.23 — the register         | 3.65 / 3.02 | 0.31                   |
 * | `def` 70                                     | 3.67 / 3.00 | 0.33                   |
 * | `physicalResist` 0.35                        | 3.48 / 2.85 | 0.48                   |
 * | `def` 110                                    | 3.25 / 2.80 | 0.53                   |
 * | `dodge` 0.30                                 | 3.73 / 2.77 | 0.56                   |
 * | burst, single-target power 3.10 / cd 80      | 3.92 / 2.70 | 0.63                   |
 * | `haste` 126                                  | 3.00 / 2.77 | 0.56                   |
 * | `physicalResist` 0.50                        | 2.65 / 2.15 | **1.18**               |
 * | `STUN` on `enemy-all`, front carrier         | 3.88 / 2.02 | **1.31**               |
 * | pairing — two `ascended` anchors in front    | 2.27 / 1.43 | **1.90**               |
 * | `haste` 144                                  | 2.65 / 0.88 | **2.45**               |
 *
 * 1. ⚠️ **A gear ramp is _escalation_ on a tower where the campaign measured it as texture, and the
 *    difference is whether the boards underneath it are being lightened.** `docs/gear.md` prices a
 *    whole grade step at about ×1.15 and chapter 16's entire Relic ramp at **0.08 of a survivor** —
 *    measured while the campaign's board budget fell 0.595 a chapter underneath the ramp. Hold a board
 *    still and add the same gear and it is enormous: the control above at **Worn 1** costs the weaker
 *    arrangement **0.82 of five**, at **Sturdy 20** it reads 93% with 1.05, and at **Fine 60** — the
 *    grade the roof wears — an *unlightened* board reads **0%**. **State whether the board under a
 *    gear figure was being lightened, or the figure means nothing.**
 * 2. ⚠️ **Relic 100 was measured and declined.** +166% health on a `tank` against Fine 60's +66%; the
 *    control reads 0% in **7.1 seconds**. A ramp that ends at the top of the ladder is the ninety-second
 *    clock's opposite failure — the board simply deletes the party — and it would leave the authored
 *    weight nothing to be.
 * 3. ⚠️ **So the authored board total _falls_ across this hundred, and that is the ramp working rather
 *    than a mistake.** The budget runs about 2,700 raw health at floor 301 to **2,810 at the roof**,
 *    peaking near 4,400 in the middle — where the third hundred's closing boards run 5,330. Holding a
 *    single board constant across the whole hundred already grades **5.00 → 3.52 survivors** on the
 *    level line and the ramp alone.
 * 4. ⚠️ **`physicalResist` is the strongest stat dial available here and it is deliberately not the
 *    axis, because it is the Monster Tower's.** It grades 0.18 / 0.31 / 0.48 / **1.18** across
 *    0.10 → 0.50 while `magicResist` 0.60 is worth **−0.17** — both Human fives being 100% physical,
 *    which is the mechanism control. **Two towers with one lock is one tower shipped twice**, so it
 *    stays on these blocks at this tower's shipped median of 0.06 and never past its 0.23 ceiling.
 *    ⚠️ **The Monster Tower's own "is it ours" table recorded `physicalResist` 0.55 as worth 0.00 to
 *    `human-ref`, and that reading was taken on the arrangement that cannot fall** — the reference five
 *    is plateaued at 4.00 here across a wide band while the alternate grades cleanly. Re-measure a
 *    cross-tower negative on the binding arrangement before trusting it.
 * 5. ⚠️ **`def` is the texture, and the coherence is deliberate.** `GEAR_STATS` is `hp`, `atk`, `def`,
 *    `haste`, so the stat a kitted body should be showing off is one gear actually moves — and it reads
 *    as texture should, 0.33 and 0.53 at 70 and 110.
 * 6. ⚠️ **Aim past the front rank is inert or negative for the second time on this tower and the fifth
 *    across the seven.** A reach is worth −0.05 and the widest turn available is worth **−0.19 from the
 *    back rank** — leaving the board easier than saying nothing. Every skill this hundred authors is
 *    `enemy-front`, which is the same conclusion the `NIGHT_RIDE` correction reached.
 * 7. ⚠️ **The roof's escort is the whole question, and the boss needed no retune.** `THE_PANOPLY` at
 *    its authored 1240/68 behind `PLATEBOUND_HUSK` reads **13% for the weaker arrangement**; behind
 *    four light bodies it reads **98% with 1.73**. Nine escort shapes were fielded before one was
 *    chosen and every one of them left the boss's stat line alone. **Check the escort before the boss,
 *    which is chapter 19's rule arriving on a roof.**
 * 8. ⚠️ **No anchor had to retire — the fourth clean answer to that check.** All 53 blocks this tower
 *    fields stand as a roof anchor behind four light escorts at level 189 in Fine 60, `THE_HOURLESS_MARCH`
 *    at 1660/76 included (4.40 / 4.00). What collapses is the **board**: the shipped floor-300 board at
 *    the new roof's level reads 100% / 1.93 against **53% / 0.55**.
 * 9. ⚠️ **`THE_PANOPLY` is the _second_ lightest tower roof this game ships on both axes, and this claim
 *    has already been overtaken once — which is the point of stating the whole list rather than a
 *    superlative.** The roofs read 1200/**52** (the Dwarf Tower's `THE_PROOF_HOUSE`), 1240/68 (this),
 *    1240/74, 1300/84, 1320/82, 1440/86, 1540/92 and 1560/91. It shipped as "lightest on attack, tied for
 *    lightest on health" and the Dwarf fourth hundred took both records the next session — that hundred
 *    is geared too, and it spends its allowance on `physicalPierce` where this one spends it on the
 *    grade alone. This block still sits where it does because it is wearing a full Fine set the moment it
 *    is fielded, and against its own predecessor `THE_HOURLESS_MARCH` at 1660/76 it is lighter on both.
 *    **The weight a roof is allowed is what is left after the grade** — and a superlative about seven
 *    towers goes stale the moment an eighth hundred lands.
 *
 * ⚠️ **The sustain claim is stated as counts, because the absolute version of it has shipped wrong
 * four times and always on one of these four words.** `recovery`, `healthRegen`, `lifeLeech`, a `regen`
 * **status** and a `heal` **effect** are five different things and no two of them are the same claim.
 * Measured over the hundred rather than read: **no board carries a heal effect, a `regen` status, a
 * shield or a point of `healthRegen` — zero of a hundred, and no block in the hundred carries any.**
 * What it does carry is the Undead idiom: `lifeLeech` on **5 of its 24 blocks and 46 of its 100
 * boards** (0.08 to 0.25), a `drain` effect on **4 blocks and 51 boards**, and `recovery` on exactly
 * **one** block (the Revenant, at 5) standing on **3**. None of that is sustain the party has to
 * outpace; a heal on a roof is, which is why the roof also carries **no taunt** and the Reliquary
 * Bearer — this tower's shield — is **not fielded in the hundred at all**.
 *
 * The hundred closes at **100% / 3.60 for the reference five against 93% / 1.65 for the alternate**,
 * zero timeouts anywhere, and the longest fight in it is 28.6s against a 90-second timer.
 *
 * Re-run `npm run test:balance` after touching any band above floor 68, 180, 290 or 385.
 */
export const TOWER_HUMAN = {
  id: 'tower-human',
  name: 'Human Tower',
  faction: 'human',
  /**
   * Open at the auto-battle unlock.
   *
   * Ten clears is the whole of the re-cut chapter 1 — the stretch that teaches a player what a
   * party is for — and it is deliberately early: somebody walled at the chapter-1 healer lock
   * should already have somewhere to send an unlucky pull. Authored rather than read off
   * `AUTO_BATTLE_UNLOCK_CHAPTERS`, because these are two decisions that happen to agree rather
   * than one fact stated twice; `towers.spec.ts` is what holds the agreement.
   */
  unlockClears: 10,
  floors: [
    // -------------------------------------------------------------------------------------
    // The Lower Steps — Floors 1–12, levels 1–6 — fodder, and the first speed check.
    // -------------------------------------------------------------------------------------
    {
      id: 't-human-f1',
      name: 'Floor 1',
      enemies: { front: [WISP], back: [SLIME] },
    },
    {
      id: 't-human-f2',
      name: 'Floor 2',
      enemies: { front: [SLIME], back: [WISP, BOAR] },
    },
    {
      id: 't-human-f3',
      name: 'Floor 3',
      enemies: { front: [REVENANT], back: [WISP, SLIME] },
    },
    {
      id: 't-human-f4',
      name: 'Floor 4',
      enemies: { front: [BOAR], back: [WISP, WISP] },
    },
    {
      id: 't-human-f5',
      name: 'Floor 5',
      enemies: { front: [REVENANT, SLIME], back: [WISP, BOAR] },
    },
    {
      id: 't-human-f6',
      name: 'Floor 6',
      enemies: { front: [BANDIT], back: [WISP, REVENANT] },
    },
    {
      id: 't-human-f7',
      name: 'Floor 7',
      enemies: { front: [BOAR, SLIME], back: [REVENANT, WISP] },
    },
    {
      id: 't-human-f8',
      name: 'Floor 8',
      enemies: { front: [REVENANT], back: [WISP, BOAR, SLIME] },
    },
    {
      id: 't-human-f9',
      name: 'Floor 9',
      enemies: { front: [WISP, BOAR], back: [REVENANT, SLIME] },
    },
    {
      id: 't-human-f10',
      name: 'Floor 10 — The Barrow Gate',
      enemies: { front: [REVENANT, BOAR], back: [WISP, WISP, SLIME] },
    },
    {
      id: 't-human-f11',
      name: 'Floor 11',
      enemies: { front: [BANDIT, SLIME], back: [WISP, REVENANT] },
    },
    {
      id: 't-human-f12',
      name: 'Floor 12',
      enemies: { front: [WISP], back: [SLIME] },
    },

    // -------------------------------------------------------------------------------------
    // The Ossuary Stair — Floors 13–28, levels 7–14 — the locks arrive: a healer behind two bodies, a party-wide debuff, an evasion wall.
    // -------------------------------------------------------------------------------------
    {
      id: 't-human-f13',
      name: 'Floor 13',
      enemies: { front: [REVENANT, BOAR], back: [WISP, ACOLYTE] },
    },
    {
      id: 't-human-f14',
      name: 'Floor 14',
      enemies: { front: [GOLEM, SLIME], back: [SHADE, WISP] },
    },
    {
      id: 't-human-f15',
      name: 'Floor 15',
      enemies: { front: [BOAR, BANDIT], back: [HAG, WISP, SLIME] },
    },
    {
      id: 't-human-f16',
      name: 'Floor 16',
      enemies: { front: [REVENANT, BANDIT], back: [HAG, SHADE] },
    },
    {
      id: 't-human-f17',
      name: 'Floor 17',
      enemies: { front: [SLIME, REVENANT], back: [SHADE, PYRE] },
    },
    {
      id: 't-human-f18',
      name: 'Floor 18',
      enemies: { front: [BOAR, BANDIT], back: [HAG, ACOLYTE, WISP] },
    },
    {
      id: 't-human-f19',
      name: 'Floor 19',
      enemies: { front: [REVENANT, SLIME], back: [PYRE, WISP, SHADE] },
    },
    {
      id: 't-human-f20',
      name: 'Floor 20 — The Weeping Reliquary',
      enemies: { front: [REVENANT, GOLEM], back: [HAG, ACOLYTE, WISP] },
    },
    {
      id: 't-human-f21',
      name: 'Floor 21',
      enemies: { front: [BULWARK_ENEMY, REVENANT], back: [SHADE, ACOLYTE] },
    },
    {
      id: 't-human-f22',
      name: 'Floor 22',
      enemies: { front: [GOLEM, BOAR], back: [HAG, SHADE, WISP] },
    },
    {
      id: 't-human-f23',
      name: 'Floor 23',
      enemies: { front: [REVENANT, BANDIT], back: [SKYSHRIKE, HAG] },
    },
    {
      id: 't-human-f24',
      name: 'Floor 24',
      enemies: { front: [GOLEM, REVENANT], back: [ACOLYTE, SHADE] },
    },
    {
      id: 't-human-f25',
      name: 'Floor 25',
      enemies: { front: [BOAR, REVENANT], back: [PYRE, HAG, WISP] },
    },
    {
      id: 't-human-f26',
      name: 'Floor 26',
      enemies: { front: [BULWARK_ENEMY, BANDIT], back: [SHADE, WISP, ACOLYTE] },
    },
    {
      id: 't-human-f27',
      name: 'Floor 27',
      enemies: { front: [REVENANT, BOAR], back: [WISP, ACOLYTE] },
    },
    {
      id: 't-human-f28',
      name: 'Floor 28',
      enemies: { front: [GOLEM, SLIME], back: [SHADE, WISP] },
    },

    // -------------------------------------------------------------------------------------
    // The Hollow Gallery — Floors 29–48, levels 14–23 — the executioner, armour on both axes, and every lock met in combination.
    // -------------------------------------------------------------------------------------
    {
      id: 't-human-f29',
      name: 'Floor 29',
      enemies: { front: [RIMEPLATE, REVENANT], back: [SHADE, STORMCALLER] },
    },
    {
      id: 't-human-f30',
      name: 'Floor 30 — The Gallows Arch',
      enemies: { front: [REVENANT, RIMEPLATE], back: [HEADSMAN, HAG, ACOLYTE] },
    },
    {
      id: 't-human-f31',
      name: 'Floor 31',
      enemies: { front: [HEADSMAN, BOAR], back: [SHADE, ACOLYTE, WISP] },
    },
    {
      id: 't-human-f32',
      name: 'Floor 32',
      enemies: { front: [BULWARK_ENEMY, REVENANT], back: [HAG, SHADE] },
    },
    {
      id: 't-human-f33',
      name: 'Floor 33',
      enemies: { front: [GOLEM, RIMEPLATE], back: [SHADE, HAG, WISP] },
    },
    {
      id: 't-human-f34',
      name: 'Floor 34',
      enemies: { front: [SENTINEL, REVENANT], back: [HEADSMAN, HAG] },
    },
    {
      id: 't-human-f35',
      name: 'Floor 35',
      enemies: { front: [RIMEPLATE, REVENANT], back: [SKYSHRIKE, SHADE] },
    },
    {
      id: 't-human-f36',
      name: 'Floor 36',
      enemies: { front: [RAVAGER, BOAR], back: [HAG, HEADSMAN, SHADE] },
    },
    {
      id: 't-human-f37',
      name: 'Floor 37',
      enemies: { front: [HEADSMAN, RIMEPLATE], back: [PYRE, SHADE] },
    },
    {
      id: 't-human-f38',
      name: 'Floor 38',
      enemies: { front: [GOLEM, HEADSMAN], back: [SHADE, STORMCALLER] },
    },
    {
      id: 't-human-f39',
      name: 'Floor 39',
      enemies: { front: [SENTINEL, REVENANT], back: [HAG, SHADE, ACOLYTE] },
    },
    {
      id: 't-human-f40',
      name: 'Floor 40 — The Gallows Arch',
      enemies: { front: [REVENANT, RIMEPLATE], back: [HEADSMAN, HAG, ACOLYTE] },
    },
    {
      id: 't-human-f41',
      name: 'Floor 41',
      enemies: { front: [RIMEPLATE, BULWARK_ENEMY], back: [HEADSMAN, SHADE, HAG] },
    },
    {
      id: 't-human-f42',
      name: 'Floor 42',
      enemies: { front: [WRATHBORN, REVENANT], back: [SHADE, HAG] },
    },
    {
      id: 't-human-f43',
      name: 'Floor 43',
      enemies: { front: [HEADSMAN, GOLEM], back: [HAG, SKYSHRIKE, SHADE] },
    },
    {
      id: 't-human-f44',
      name: 'Floor 44',
      enemies: { front: [RAVAGER, RIMEPLATE], back: [SHADE, STORMCALLER] },
    },
    {
      id: 't-human-f45',
      name: 'Floor 45',
      enemies: { front: [SENTINEL, HEADSMAN], back: [HAG, SHADE, WISP] },
    },
    {
      id: 't-human-f46',
      name: 'Floor 46',
      enemies: { front: [RIMEPLATE, REVENANT], back: [HEADSMAN, PYRE] },
    },
    {
      id: 't-human-f47',
      name: 'Floor 47',
      enemies: { front: [BULWARK_ENEMY, HEADSMAN], back: [SHADE, HAG, ACOLYTE] },
    },
    {
      id: 't-human-f48',
      name: 'Floor 48',
      enemies: { front: [RIMEPLATE, REVENANT], back: [SHADE, STORMCALLER] },
    },

    // -------------------------------------------------------------------------------------
    // The Bonefall Reach — Floors 49–68, levels 24–33 — two walls a floor, and the first boards with no soft slot in them.
    // -------------------------------------------------------------------------------------
    {
      id: 't-human-f49',
      name: 'Floor 49',
      enemies: { front: [HEADSMAN, SENTINEL], back: [SHADE, SKYSHRIKE, STORMCALLER] },
    },
    {
      id: 't-human-f50',
      name: 'Floor 50 — The Bonefall Throne',
      enemies: { front: [HEADSMAN, HEADSMAN], back: [HEADSMAN, HIEROPHANT, SHADE] },
    },
    {
      id: 't-human-f51',
      name: 'Floor 51',
      enemies: { front: [RIMEPLATE, HEADSMAN], back: [SHADE, HEADSMAN] },
    },
    {
      id: 't-human-f52',
      name: 'Floor 52',
      enemies: { front: [RAVAGER, HEADSMAN], back: [HAG, SHADE, SKYSHRIKE] },
    },
    {
      id: 't-human-f53',
      name: 'Floor 53',
      enemies: { front: [SENTINEL, RIMEPLATE], back: [HEADSMAN, STORMCALLER, PYRE] },
    },
    {
      id: 't-human-f54',
      name: 'Floor 54',
      enemies: { front: [HEADSMAN, WRATHBORN], back: [SHADE, HIEROPHANT] },
    },
    {
      id: 't-human-f55',
      name: 'Floor 55',
      enemies: { front: [HEADSMAN, HEADSMAN], back: [SHADE, SKYSHRIKE, PYRE] },
    },
    {
      id: 't-human-f56',
      name: 'Floor 56',
      enemies: { front: [SENTINEL, HEADSMAN], back: [HAG, HEADSMAN, STORMCALLER] },
    },
    {
      id: 't-human-f57',
      name: 'Floor 57',
      enemies: { front: [RIMEPLATE, RAVAGER], back: [SHADE, HEADSMAN, STORMCALLER] },
    },
    {
      id: 't-human-f58',
      name: 'Floor 58',
      enemies: { front: [HEADSMAN, SENTINEL], back: [SHADE, HIEROPHANT, HAG] },
    },
    {
      id: 't-human-f59',
      name: 'Floor 59',
      enemies: { front: [RAVAGER, HEADSMAN], back: [HEADSMAN, SHADE] },
    },
    {
      id: 't-human-f60',
      name: 'Floor 60 — The Bonefall Throne',
      enemies: { front: [HEADSMAN, HEADSMAN], back: [HEADSMAN, HIEROPHANT, SHADE] },
    },
    {
      id: 't-human-f61',
      name: 'Floor 61',
      enemies: { front: [HEADSMAN, RIMEPLATE], back: [SHADE, WRATHBORN, SKYSHRIKE] },
    },
    {
      id: 't-human-f62',
      name: 'Floor 62',
      enemies: { front: [WRATHBORN, HEADSMAN], back: [HEADSMAN, SHADE, ACOLYTE] },
    },
    {
      id: 't-human-f63',
      name: 'Floor 63',
      enemies: { front: [SENTINEL, HEADSMAN], back: [SHADE, STORMCALLER, SKYSHRIKE] },
    },
    {
      id: 't-human-f64',
      name: 'Floor 64',
      enemies: { front: [HEADSMAN, RAVAGER], back: [HIEROPHANT, SHADE, HEADSMAN] },
    },
    {
      id: 't-human-f65',
      name: 'Floor 65',
      enemies: { front: [RIMEPLATE, SENTINEL], back: [HEADSMAN, SHADE, STORMCALLER] },
    },
    {
      id: 't-human-f66',
      name: 'Floor 66',
      enemies: { front: [HEADSMAN, SENTINEL], back: [SHADE, SKYSHRIKE, STORMCALLER] },
    },
    {
      id: 't-human-f67',
      name: 'Floor 67',
      enemies: { front: [RIMEPLATE, HEADSMAN], back: [SHADE, HEADSMAN] },
    },
    {
      id: 't-human-f68',
      name: 'Floor 68',
      enemies: { front: [RAVAGER, HEADSMAN], back: [HAG, SHADE, SKYSHRIKE] },
    },

    // -------------------------------------------------------------------------------------
    // The Long Vigil — Floors 69–84, levels 33–40 — an ascended block anchors every front rank, so reaching the back is a decision rather than a formality.
    // -------------------------------------------------------------------------------------
    {
      id: 't-human-f69',
      name: 'Floor 69',
      enemies: { front: [HEADSMAN, TYRANT], back: [SHADE, HEADSMAN, HAG] },
    },
    {
      id: 't-human-f70',
      name: 'Floor 70 — The Vigil Gate',
      enemies: { front: [HEADSMAN, TYRANT], back: [HEADSMAN, HIEROPHANT, SHADE] },
    },
    {
      id: 't-human-f71',
      name: 'Floor 71',
      enemies: { front: [COLOSSUS, HEADSMAN], back: [SHADE, HAG] },
    },
    {
      id: 't-human-f72',
      name: 'Floor 72',
      enemies: { front: [HEADSMAN, WARDEN], back: [HEADSMAN, SHADE, SKYSHRIKE] },
    },
    {
      id: 't-human-f73',
      name: 'Floor 73',
      enemies: { front: [TYRANT, HEADSMAN], back: [SHADE, HIEROPHANT, HAG] },
    },
    {
      id: 't-human-f74',
      name: 'Floor 74',
      enemies: { front: [HEADSMAN, COLOSSUS], back: [STORMCALLER, SHADE, SKYSHRIKE] },
    },
    {
      id: 't-human-f75',
      name: 'Floor 75',
      enemies: { front: [OATHBREAKER, HEADSMAN], back: [SHADE, HAG, HEADSMAN] },
    },
    {
      id: 't-human-f76',
      name: 'Floor 76',
      enemies: { front: [HEADSMAN, TYRANT], back: [HIEROPHANT, SHADE, STORMCALLER] },
    },
    {
      id: 't-human-f77',
      name: 'Floor 77',
      enemies: { front: [SENTINEL, COLOSSUS], back: [HEADSMAN, SHADE, PYRE] },
    },
    {
      id: 't-human-f78',
      name: 'Floor 78',
      enemies: { front: [HEADSMAN, OATHBREAKER], back: [SHADE, HEADSMAN, SKYSHRIKE] },
    },
    {
      id: 't-human-f79',
      name: 'Floor 79',
      enemies: { front: [TYRANT, HEADSMAN], back: [HEADSMAN, HIEROPHANT, SHADE] },
    },
    {
      id: 't-human-f80',
      name: 'Floor 80 — The Vigil Gate',
      enemies: { front: [HEADSMAN, TYRANT], back: [HEADSMAN, HIEROPHANT, SHADE] },
    },
    {
      id: 't-human-f81',
      name: 'Floor 81',
      enemies: { front: [HEADSMAN, COLOSSUS], back: [SHADE, WRATHBORN, HEADSMAN] },
    },
    {
      id: 't-human-f82',
      name: 'Floor 82',
      enemies: { front: [WARDEN, HEADSMAN], back: [HEADSMAN, SHADE, HIEROPHANT] },
    },
    {
      id: 't-human-f83',
      name: 'Floor 83',
      enemies: { front: [COLOSSUS, HEADSMAN], back: [SHADE, HEADSMAN, SKYSHRIKE] },
    },
    {
      id: 't-human-f84',
      name: 'Floor 84',
      enemies: { front: [HEADSMAN, TYRANT], back: [HEADSMAN, SHADE, STORMCALLER] },
    },

    // -------------------------------------------------------------------------------------
    // The Roof — Floors 85–100, levels 41–48 — two ascended blocks in front of three legendaries, and the Oathbreaker waiting above them.
    // -------------------------------------------------------------------------------------
    {
      id: 't-human-f85',
      name: 'Floor 85',
      enemies: { front: [TYRANT, COLOSSUS], back: [HEADSMAN, SHADE, HAG] },
    },
    {
      id: 't-human-f86',
      name: 'Floor 86',
      enemies: { front: [OATHBREAKER, COLOSSUS], back: [HEADSMAN, SHADE, STORMCALLER] },
    },
    {
      id: 't-human-f87',
      name: 'Floor 87',
      enemies: { front: [COLOSSUS, TYRANT], back: [HEADSMAN, HIEROPHANT, SHADE] },
    },
    {
      id: 't-human-f88',
      name: 'Floor 88',
      enemies: { front: [TYRANT, WARDEN], back: [HEADSMAN, SHADE, SKYSHRIKE] },
    },
    {
      id: 't-human-f89',
      name: 'Floor 89',
      enemies: { front: [COLOSSUS, OATHBREAKER], back: [HEADSMAN, WRATHBORN, SHADE] },
    },
    {
      id: 't-human-f90',
      name: 'Floor 90 — The Crown Stair',
      enemies: { front: [TYRANT, COLOSSUS], back: [HEADSMAN, HIEROPHANT, SHADE] },
    },
    {
      id: 't-human-f91',
      name: 'Floor 91',
      enemies: { front: [TYRANT, COLOSSUS], back: [HEADSMAN, SHADE, HIEROPHANT] },
    },
    {
      id: 't-human-f92',
      name: 'Floor 92',
      enemies: { front: [OATHBREAKER, TYRANT], back: [HEADSMAN, SHADE, PYRE] },
    },
    {
      id: 't-human-f93',
      name: 'Floor 93',
      enemies: { front: [WARDEN, COLOSSUS], back: [HEADSMAN, HIEROPHANT, SHADE] },
    },
    {
      id: 't-human-f94',
      name: 'Floor 94',
      enemies: { front: [COLOSSUS, TYRANT], back: [HEADSMAN, SHADE, STORMCALLER] },
    },
    {
      id: 't-human-f95',
      name: 'Floor 95',
      enemies: { front: [TYRANT, OATHBREAKER], back: [SHADE, HEADSMAN, HAG] },
    },
    {
      id: 't-human-f96',
      name: 'Floor 96',
      enemies: { front: [COLOSSUS, WARDEN], back: [HEADSMAN, SKYSHRIKE, HIEROPHANT] },
    },
    {
      id: 't-human-f97',
      name: 'Floor 97',
      enemies: { front: [OATHBREAKER, COLOSSUS], back: [SHADE, HEADSMAN, HAG] },
    },
    {
      id: 't-human-f98',
      name: 'Floor 98',
      enemies: { front: [TYRANT, COLOSSUS], back: [HIEROPHANT, HEADSMAN, SHADE] },
    },
    {
      id: 't-human-f99',
      name: 'Floor 99',
      enemies: { front: [COLOSSUS, OATHBREAKER], back: [HEADSMAN, SHADE, SKYSHRIKE] },
    },
    {
      id: 't-human-f100',
      name: 'Floor 100 — The Oathbreaker',
      enemies: { front: [OATHBREAKER, COLOSSUS], back: [HIEROPHANT, STORMCALLER, HEADSMAN] },
    },

    // -------------------------------------------------------------------------------------
    // The Barrow Road — Floors 101–120, levels 48–57 — the ground under the tower, and the blocks the first hundred never met.
    // -------------------------------------------------------------------------------------
    {
      id: 't-human-f101',
      name: 'Floor 101',
      enemies: { front: [HEADSMAN, CHARNEL_DRUDGE], back: [SHADE, HAG, GRAVEWAKE_THRALL] },
    },
    {
      id: 't-human-f102',
      name: 'Floor 102',
      enemies: {
        front: [CAIRNWARD_HUSK, HEADSMAN],
        back: [SKYSHRIKE, BARROWMIST_KEENER, SENTINEL],
      },
    },
    {
      id: 't-human-f103',
      name: 'Floor 103',
      enemies: { front: [TYRANT, CHARNEL_DRUDGE], back: [SHADE, BULWARK_ENEMY, SEPULCHRE_HOUND] },
    },
    {
      id: 't-human-f104',
      name: 'Floor 104',
      enemies: { front: [HEADSMAN, WARDEN], back: [GRAVEMOURN_KEEPER, PYRE, HEADSMAN] },
    },
    {
      id: 't-human-f105',
      name: 'Floor 105',
      enemies: { front: [CHARNEL_DRUDGE, COLOSSUS], back: [SHADE, WRATHBORN, BARROWMIST_KEENER] },
    },
    {
      id: 't-human-f106',
      name: 'Floor 106',
      enemies: { front: [HEADSMAN, CAIRNWARD_HUSK], back: [GRAVETIDE_HERALD, ACOLYTE, HAG] },
    },
    {
      id: 't-human-f107',
      name: 'Floor 107',
      enemies: { front: [TYRANT, HEADSMAN], back: [SHADE, SEPULCHRE_HOUND, RAVAGER] },
    },
    {
      id: 't-human-f108',
      name: 'Floor 108',
      enemies: { front: [CHARNEL_DRUDGE, HEADSMAN], back: [GOLEM, GRAVEMOURN_KEEPER, SKYSHRIKE] },
    },
    {
      id: 't-human-f109',
      name: 'Floor 109',
      enemies: { front: [WARDEN, CHARNEL_DRUDGE], back: [SHADE, HEADSMAN, STORMCALLER] },
    },
    {
      id: 't-human-f110',
      name: 'Floor 110 — The Barrow Gate',
      enemies: { front: [BARROW_SOVEREIGN, STORMCALLER], back: [PYRE, HAG, HEADSMAN] },
    },
    {
      id: 't-human-f111',
      name: 'Floor 111',
      enemies: { front: [HEADSMAN, CHARNEL_DRUDGE], back: [GRAVETIDE_HERALD, SHADE, SKYSHRIKE] },
    },
    {
      id: 't-human-f112',
      name: 'Floor 112',
      enemies: { front: [CAIRNWARD_HUSK, TYRANT], back: [SKYSHRIKE, SENTINEL, RIMEPLATE] },
    },
    {
      id: 't-human-f113',
      name: 'Floor 113',
      enemies: { front: [CHARNEL_DRUDGE, HEADSMAN], back: [GRAVEMOURN_KEEPER, SHADE, PYRE] },
    },
    {
      id: 't-human-f114',
      name: 'Floor 114',
      enemies: { front: [COLOSSUS, CHARNEL_DRUDGE], back: [PYRE, HEADSMAN, HAG] },
    },
    {
      id: 't-human-f115',
      name: 'Floor 115',
      enemies: { front: [WRATHBORN, CAIRNWARD_HUSK], back: [SHADE, GRAVETIDE_HERALD, RIMEPLATE] },
    },
    {
      id: 't-human-f116',
      name: 'Floor 116',
      enemies: { front: [TYRANT, CHARNEL_DRUDGE], back: [HEADSMAN, ACOLYTE, BULWARK_ENEMY] },
    },
    {
      id: 't-human-f117',
      name: 'Floor 117',
      enemies: { front: [CHARNEL_DRUDGE, WARDEN], back: [GRAVEMOURN_KEEPER, SHADE, HEADSMAN] },
    },
    {
      id: 't-human-f118',
      name: 'Floor 118',
      enemies: { front: [RAVAGER, COLOSSUS], back: [SKYSHRIKE, HAG, ACOLYTE] },
    },
    {
      id: 't-human-f119',
      name: 'Floor 119',
      enemies: { front: [CAIRNWARD_HUSK, HEADSMAN], back: [SHADE, GRAVETIDE_HERALD, HEADSMAN] },
    },
    {
      id: 't-human-f120',
      name: 'Floor 120 — The Ossuary Door',
      enemies: { front: [BARROW_SOVEREIGN, COLOSSUS], back: [PYRE, STORMCALLER, HIEROPHANT] },
    },

    // -------------------------------------------------------------------------------------
    // The Reliquary — Floors 121–140, levels 58–66 — a board that has to be spent twice, and a wall that charges for being hit.
    // -------------------------------------------------------------------------------------
    {
      id: 't-human-f121',
      name: 'Floor 121',
      enemies: {
        front: [CAIRNBOUND_SENTINEL, HEADSMAN],
        back: [RELIQUARY_BEARER, SHADE, HEADSMAN],
      },
    },
    {
      id: 't-human-f122',
      name: 'Floor 122',
      enemies: { front: [SENTINEL, CHARNEL_DRUDGE], back: [RELIQUARY_BEARER, GOLEM, SKYSHRIKE] },
    },
    {
      id: 't-human-f123',
      name: 'Floor 123',
      enemies: { front: [TYRANT, CAIRNBOUND_SENTINEL], back: [RELIQUARY_BEARER, SHADE, HEADSMAN] },
    },
    {
      id: 't-human-f124',
      name: 'Floor 124',
      enemies: { front: [COLOSSUS, HEADSMAN], back: [RELIQUARY_BEARER, GRAVETIDE_HERALD, PYRE] },
    },
    {
      id: 't-human-f125',
      name: 'Floor 125',
      enemies: {
        front: [CAIRNBOUND_SENTINEL, CHARNEL_DRUDGE],
        back: [RELIQUARY_BEARER, WRATHBORN, HAG],
      },
    },
    {
      id: 't-human-f126',
      name: 'Floor 126',
      enemies: { front: [HEADSMAN, WARDEN], back: [RELIQUARY_BEARER, SHADE, STORMCALLER] },
    },
    {
      id: 't-human-f127',
      name: 'Floor 127',
      enemies: { front: [OATHBREAKER, HEADSMAN], back: [RELIQUARY_BEARER, ACOLYTE, RIMEPLATE] },
    },
    {
      id: 't-human-f128',
      name: 'Floor 128',
      enemies: {
        front: [CAIRNBOUND_SENTINEL, RAVAGER],
        back: [GRAVEMOURN_KEEPER, RELIQUARY_BEARER, SHADE],
      },
    },
    {
      id: 't-human-f129',
      name: 'Floor 129',
      enemies: { front: [TYRANT, CHARNEL_DRUDGE], back: [RELIQUARY_BEARER, HEADSMAN, SKYSHRIKE] },
    },
    {
      id: 't-human-f130',
      name: 'Floor 130 — The Reliquary',
      enemies: {
        front: [BARROW_SOVEREIGN, CAIRNBOUND_SENTINEL],
        back: [RELIQUARY_BEARER, SHADE, HEADSMAN],
      },
    },
    {
      id: 't-human-f131',
      name: 'Floor 131',
      enemies: {
        front: [STORMCALLER, CAIRNBOUND_SENTINEL],
        back: [RELIQUARY_BEARER, GRAVETIDE_HERALD, PYRE],
      },
    },
    {
      id: 't-human-f132',
      name: 'Floor 132',
      enemies: { front: [COLOSSUS, CHARNEL_DRUDGE], back: [RELIQUARY_BEARER, HEADSMAN, SKYSHRIKE] },
    },
    {
      id: 't-human-f133',
      name: 'Floor 133',
      enemies: { front: [CAIRNBOUND_SENTINEL, TYRANT], back: [RELIQUARY_BEARER, SHADE, HAG] },
    },
    {
      id: 't-human-f134',
      name: 'Floor 134',
      enemies: {
        front: [OATHBREAKER, CHARNEL_DRUDGE],
        back: [RELIQUARY_BEARER, SKYSHRIKE, HEADSMAN],
      },
    },
    {
      id: 't-human-f135',
      name: 'Floor 135',
      enemies: {
        front: [SENTINEL, CAIRNBOUND_SENTINEL],
        back: [RELIQUARY_BEARER, GRAVEMOURN_KEEPER, PYRE],
      },
    },
    {
      id: 't-human-f136',
      name: 'Floor 136',
      enemies: { front: [WARDEN, HEADSMAN], back: [RELIQUARY_BEARER, SHADE, HEADSMAN] },
    },
    {
      id: 't-human-f137',
      name: 'Floor 137',
      enemies: {
        front: [CAIRNBOUND_SENTINEL, COLOSSUS],
        back: [RELIQUARY_BEARER, PYRE, BULWARK_ENEMY],
      },
    },
    {
      id: 't-human-f138',
      name: 'Floor 138',
      enemies: { front: [TYRANT, WRATHBORN], back: [RELIQUARY_BEARER, GRAVETIDE_HERALD, SHADE] },
    },
    {
      id: 't-human-f139',
      name: 'Floor 139',
      enemies: {
        front: [CAIRNBOUND_SENTINEL, CHARNEL_DRUDGE],
        back: [RELIQUARY_BEARER, HEADSMAN, WRATHBORN],
      },
    },
    {
      id: 't-human-f140',
      name: 'Floor 140 — The Sealed Vault',
      enemies: {
        front: [BARROW_SOVEREIGN, OATHBREAKER],
        back: [RELIQUARY_BEARER, ACOLYTE, HEADSMAN],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Nightmarch — Floors 141–160, levels 67–76 — reach at speed, so the back rank stops being somewhere safe to stand.
    // -------------------------------------------------------------------------------------
    {
      id: 't-human-f141',
      name: 'Floor 141',
      enemies: { front: [RAVAGER, CAIRNWARD_HUSK], back: [NIGHTMARCH_OUTRIDER, SHADE, HEADSMAN] },
    },
    {
      id: 't-human-f142',
      name: 'Floor 142',
      enemies: { front: [TYRANT, HEADSMAN], back: [NIGHTMARCH_OUTRIDER, HAG, SKYSHRIKE] },
    },
    {
      id: 't-human-f143',
      name: 'Floor 143',
      enemies: {
        front: [CAIRNBOUND_SENTINEL, STORMCALLER],
        back: [NIGHTMARCH_OUTRIDER, RELIQUARY_BEARER, SHADE],
      },
    },
    {
      id: 't-human-f144',
      name: 'Floor 144',
      enemies: { front: [COLOSSUS, CHARNEL_DRUDGE], back: [NIGHTMARCH_OUTRIDER, PYRE, HEADSMAN] },
    },
    {
      id: 't-human-f145',
      name: 'Floor 145',
      enemies: { front: [OATHBREAKER, HEADSMAN], back: [NIGHTMARCH_OUTRIDER, SHADE, GOLEM] },
    },
    {
      id: 't-human-f146',
      name: 'Floor 146',
      enemies: {
        front: [SENTINEL, CAIRNBOUND_SENTINEL],
        back: [NIGHTMARCH_OUTRIDER, GRAVETIDE_HERALD, SKYSHRIKE],
      },
    },
    {
      id: 't-human-f147',
      name: 'Floor 147',
      enemies: { front: [TYRANT, CHARNEL_DRUDGE], back: [NIGHTMARCH_OUTRIDER, HEADSMAN, SHADE] },
    },
    {
      id: 't-human-f148',
      name: 'Floor 148',
      enemies: { front: [WARDEN, HEADSMAN], back: [NIGHTMARCH_OUTRIDER, RELIQUARY_BEARER, HAG] },
    },
    {
      id: 't-human-f149',
      name: 'Floor 149',
      enemies: {
        front: [CAIRNBOUND_SENTINEL, COLOSSUS],
        back: [NIGHTMARCH_OUTRIDER, PYRE, WRATHBORN],
      },
    },
    {
      id: 't-human-f150',
      name: 'Floor 150 — The Night Road',
      enemies: {
        front: [BARROW_SOVEREIGN, HEADSMAN],
        back: [NIGHTMARCH_OUTRIDER, RELIQUARY_BEARER, SHADE],
      },
    },
    {
      id: 't-human-f151',
      name: 'Floor 151',
      enemies: {
        front: [HEADSMAN, CHARNEL_DRUDGE],
        back: [NIGHTMARCH_OUTRIDER, ACOLYTE, SKYSHRIKE],
      },
    },
    {
      id: 't-human-f152',
      name: 'Floor 152',
      enemies: {
        front: [OATHBREAKER, CAIRNBOUND_SENTINEL],
        back: [NIGHTMARCH_OUTRIDER, SHADE, RAVAGER],
      },
    },
    {
      id: 't-human-f153',
      name: 'Floor 153',
      enemies: {
        front: [TYRANT, HEADSMAN],
        back: [NIGHTMARCH_OUTRIDER, GRAVEMOURN_KEEPER, RIMEPLATE],
      },
    },
    {
      id: 't-human-f154',
      name: 'Floor 154',
      enemies: {
        front: [COLOSSUS, HEADSMAN],
        back: [NIGHTMARCH_OUTRIDER, RELIQUARY_BEARER, SKYSHRIKE],
      },
    },
    {
      id: 't-human-f155',
      name: 'Floor 155',
      enemies: {
        front: [CAIRNBOUND_SENTINEL, CHARNEL_DRUDGE],
        back: [NIGHTMARCH_OUTRIDER, STORMCALLER, SHADE],
      },
    },
    {
      id: 't-human-f156',
      name: 'Floor 156',
      enemies: { front: [HEADSMAN, WARDEN], back: [NIGHTMARCH_OUTRIDER, PYRE, RIMEPLATE] },
    },
    {
      id: 't-human-f157',
      name: 'Floor 157',
      enemies: {
        front: [OATHBREAKER, HEADSMAN],
        back: [NIGHTMARCH_OUTRIDER, RELIQUARY_BEARER, HAG],
      },
    },
    {
      id: 't-human-f158',
      name: 'Floor 158',
      enemies: {
        front: [TYRANT, CAIRNBOUND_SENTINEL],
        back: [NIGHTMARCH_OUTRIDER, SHADE, SENTINEL],
      },
    },
    {
      id: 't-human-f159',
      name: 'Floor 159',
      enemies: {
        front: [HEADSMAN, COLOSSUS],
        back: [NIGHTMARCH_OUTRIDER, GRAVETIDE_HERALD, SKYSHRIKE],
      },
    },
    {
      id: 't-human-f160',
      name: 'Floor 160 — The Standing Watch',
      enemies: {
        front: [BARROW_SOVEREIGN, OATHBREAKER],
        back: [NIGHTMARCH_OUTRIDER, RELIQUARY_BEARER, HEADSMAN],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Deathless Watch — Floors 161–180, levels 76–85 — two ascended blocks on every front rank, which is as heavy as this tower's anchors go.
    // -------------------------------------------------------------------------------------
    {
      id: 't-human-f161',
      name: 'Floor 161',
      enemies: { front: [OATHBREAKER, WRATHBORN], back: [HIEROPHANT, SHADE, HEADSMAN] },
    },
    {
      id: 't-human-f162',
      name: 'Floor 162',
      enemies: { front: [TYRANT, COLOSSUS], back: [RELIQUARY_BEARER, PYRE, HEADSMAN] },
    },
    {
      id: 't-human-f163',
      name: 'Floor 163',
      enemies: {
        front: [BARROW_SOVEREIGN, RAVAGER],
        back: [NIGHTMARCH_OUTRIDER, SHADE, BULWARK_ENEMY],
      },
    },
    {
      id: 't-human-f164',
      name: 'Floor 164',
      enemies: {
        front: [OATHBREAKER, CAIRNBOUND_SENTINEL],
        back: [RELIQUARY_BEARER, HEADSMAN, PYRE],
      },
    },
    {
      id: 't-human-f165',
      name: 'Floor 165',
      enemies: { front: [COLOSSUS, TYRANT], back: [SHADE, HEADSMAN, HAG] },
    },
    {
      id: 't-human-f166',
      name: 'Floor 166',
      enemies: {
        front: [BARROW_SOVEREIGN, CAIRNBOUND_SENTINEL],
        back: [NIGHTMARCH_OUTRIDER, RELIQUARY_BEARER, SKYSHRIKE],
      },
    },
    {
      id: 't-human-f167',
      name: 'Floor 167',
      enemies: { front: [OATHBREAKER, COLOSSUS], back: [SHADE, STORMCALLER, GOLEM] },
    },
    {
      id: 't-human-f168',
      name: 'Floor 168',
      enemies: { front: [TYRANT, HEADSMAN], back: [HIEROPHANT, RELIQUARY_BEARER, PYRE] },
    },
    {
      id: 't-human-f169',
      name: 'Floor 169',
      enemies: {
        front: [BARROW_SOVEREIGN, CAIRNBOUND_SENTINEL],
        back: [RELIQUARY_BEARER, SHADE, HEADSMAN],
      },
    },
    {
      id: 't-human-f170',
      name: 'Floor 170 — The Deathless Watch',
      enemies: {
        front: [OATHBREAKER, TYRANT],
        back: [NIGHTMARCH_OUTRIDER, RELIQUARY_BEARER, SKYSHRIKE],
      },
    },
    {
      id: 't-human-f171',
      name: 'Floor 171',
      enemies: {
        front: [COLOSSUS, CAIRNBOUND_SENTINEL],
        back: [RELIQUARY_BEARER, SENTINEL, SHADE],
      },
    },
    {
      id: 't-human-f172',
      name: 'Floor 172',
      enemies: {
        front: [BARROW_SOVEREIGN, HEADSMAN],
        back: [BONECHAIN_WARDEN, RELIQUARY_BEARER, PYRE],
      },
    },
    {
      id: 't-human-f173',
      name: 'Floor 173',
      enemies: {
        front: [OATHBREAKER, CAIRNBOUND_SENTINEL],
        back: [NIGHTMARCH_OUTRIDER, SHADE, HAG],
      },
    },
    {
      id: 't-human-f174',
      name: 'Floor 174',
      enemies: {
        front: [TYRANT, CAIRNBOUND_SENTINEL],
        back: [RELIQUARY_BEARER, GRAVETIDE_HERALD, SKYSHRIKE],
      },
    },
    {
      id: 't-human-f175',
      name: 'Floor 175',
      enemies: { front: [COLOSSUS, HEADSMAN], back: [BONECHAIN_WARDEN, RELIQUARY_BEARER, SHADE] },
    },
    {
      id: 't-human-f176',
      name: 'Floor 176',
      enemies: {
        front: [BARROW_SOVEREIGN, CAIRNBOUND_SENTINEL],
        back: [RELIQUARY_BEARER, SKYSHRIKE, RIMEPLATE],
      },
    },
    {
      id: 't-human-f177',
      name: 'Floor 177',
      enemies: {
        front: [OATHBREAKER, WRATHBORN],
        back: [BONECHAIN_WARDEN, RELIQUARY_BEARER, SHADE],
      },
    },
    {
      id: 't-human-f178',
      name: 'Floor 178',
      enemies: {
        front: [TYRANT, CAIRNBOUND_SENTINEL],
        back: [NIGHTMARCH_OUTRIDER, RELIQUARY_BEARER, PYRE],
      },
    },
    {
      id: 't-human-f179',
      name: 'Floor 179',
      enemies: {
        front: [COLOSSUS, CAIRNBOUND_SENTINEL],
        back: [BONECHAIN_WARDEN, SHADE, HEADSMAN],
      },
    },
    {
      id: 't-human-f180',
      name: 'Floor 180 — The Last Landing',
      enemies: {
        front: [BARROW_SOVEREIGN, OATHBREAKER],
        back: [BONECHAIN_WARDEN, RELIQUARY_BEARER, SKYSHRIKE],
      },
    },

    // -------------------------------------------------------------------------------------
    // The Marshal's Hall — Floors 181–200, levels 86–95 — the anchors thin out and the board's own support thickens, and the level line carries the rest.
    // -------------------------------------------------------------------------------------
    {
      id: 't-human-f181',
      name: 'Floor 181',
      enemies: {
        front: [OATHBREAKER, BONECHAIN_WARDEN],
        back: [RELIQUARY_BEARER, SHADE, HEADSMAN],
      },
    },
    {
      id: 't-human-f182',
      name: 'Floor 182',
      enemies: {
        front: [TYRANT, CAIRNBOUND_SENTINEL],
        back: [BONECHAIN_WARDEN, RELIQUARY_BEARER, PYRE],
      },
    },
    {
      id: 't-human-f183',
      name: 'Floor 183',
      enemies: {
        front: [BARROW_SOVEREIGN, BONECHAIN_WARDEN],
        back: [RELIQUARY_BEARER, SHADE, HAG],
      },
    },
    {
      id: 't-human-f184',
      name: 'Floor 184',
      enemies: {
        front: [COLOSSUS, CAIRNBOUND_SENTINEL],
        back: [BONECHAIN_WARDEN, RELIQUARY_BEARER, PYRE],
      },
    },
    {
      id: 't-human-f185',
      name: 'Floor 185',
      enemies: {
        front: [THE_DEATHLESS_MARSHAL, CAIRNBOUND_SENTINEL],
        back: [RELIQUARY_BEARER, SHADE, BULWARK_ENEMY],
      },
    },
    {
      id: 't-human-f186',
      name: 'Floor 186',
      enemies: {
        front: [OATHBREAKER, BONECHAIN_WARDEN],
        back: [RELIQUARY_BEARER, SKYSHRIKE, RAVAGER],
      },
    },
    {
      id: 't-human-f187',
      name: 'Floor 187',
      enemies: {
        front: [THE_DEATHLESS_MARSHAL, BONECHAIN_WARDEN],
        back: [RELIQUARY_BEARER, SHADE, HEADSMAN],
      },
    },
    {
      id: 't-human-f188',
      name: 'Floor 188',
      enemies: {
        front: [BARROW_SOVEREIGN, CAIRNBOUND_SENTINEL],
        back: [BONECHAIN_WARDEN, RELIQUARY_BEARER, HEADSMAN],
      },
    },
    {
      id: 't-human-f189',
      name: 'Floor 189',
      enemies: {
        front: [THE_DEATHLESS_MARSHAL, CAIRNBOUND_SENTINEL],
        back: [BONECHAIN_WARDEN, RELIQUARY_BEARER, PYRE],
      },
    },
    {
      id: 't-human-f190',
      name: 'Floor 190 — The Hall of Standards',
      enemies: {
        front: [THE_DEATHLESS_MARSHAL, BONECHAIN_WARDEN],
        back: [RELIQUARY_BEARER, SHADE, STORMCALLER],
      },
    },
    {
      id: 't-human-f191',
      name: 'Floor 191',
      enemies: {
        front: [OATHBREAKER, BONECHAIN_WARDEN],
        back: [RELIQUARY_BEARER, SKYSHRIKE, HEADSMAN],
      },
    },
    {
      id: 't-human-f192',
      name: 'Floor 192',
      enemies: {
        front: [THE_DEATHLESS_MARSHAL, CAIRNBOUND_SENTINEL],
        back: [RELIQUARY_BEARER, NIGHTMARCH_OUTRIDER, SHADE],
      },
    },
    {
      id: 't-human-f193',
      name: 'Floor 193',
      enemies: {
        front: [BARROW_SOVEREIGN, BONECHAIN_WARDEN],
        back: [RELIQUARY_BEARER, CAIRNWARD_HUSK, HEADSMAN],
      },
    },
    {
      id: 't-human-f194',
      name: 'Floor 194',
      enemies: {
        front: [THE_DEATHLESS_MARSHAL, BONECHAIN_WARDEN],
        back: [RELIQUARY_BEARER, SHADE, HEADSMAN],
      },
    },
    {
      id: 't-human-f195',
      name: 'Floor 195',
      enemies: {
        front: [OATHBREAKER, CAIRNBOUND_SENTINEL],
        back: [BONECHAIN_WARDEN, RELIQUARY_BEARER, HEADSMAN],
      },
    },
    {
      id: 't-human-f196',
      name: 'Floor 196',
      enemies: {
        front: [THE_DEATHLESS_MARSHAL, CAIRNBOUND_SENTINEL],
        back: [RELIQUARY_BEARER, SKYSHRIKE, GRAVEWAKE_THRALL],
      },
    },
    {
      id: 't-human-f197',
      name: 'Floor 197',
      enemies: {
        front: [BARROW_SOVEREIGN, BONECHAIN_WARDEN],
        back: [RELIQUARY_BEARER, SHADE, HEADSMAN],
      },
    },
    {
      id: 't-human-f198',
      name: 'Floor 198',
      enemies: {
        front: [THE_DEATHLESS_MARSHAL, BONECHAIN_WARDEN],
        back: [RELIQUARY_BEARER, CAIRNWARD_HUSK, SKYSHRIKE],
      },
    },
    {
      id: 't-human-f199',
      name: 'Floor 199',
      enemies: {
        front: [OATHBREAKER, BONECHAIN_WARDEN],
        back: [RELIQUARY_BEARER, NIGHTMARCH_OUTRIDER, SHADE],
      },
    },
    {
      id: 't-human-f200',
      name: 'Floor 200 — The Deathless Marshal',
      enemies: {
        front: [THE_DEATHLESS_MARSHAL, BONECHAIN_WARDEN],
        back: [RELIQUARY_BEARER, SHADE, HEADSMAN],
      },
    },
    // -------------------------------------------------------------------------------------
    // The March Resumes — Floors 201–220, levels 95–104 — the Marshal is dead and the column is still walking. One body that keeps its own time, then two.
    // -------------------------------------------------------------------------------------
    {
      id: 't-human-f201',
      name: 'Floor 201',
      enemies: {
        front: [CORTEGE_LANCER, BLOODPACT_FIEND],
        back: [RENDFANG_JACKAL, CINDER_CULLER, BARROWMIST_KEENER],
      },
    },
    {
      id: 't-human-f202',
      name: 'Floor 202',
      enemies: {
        front: [CORTEGE_LANCER, RENDFANG_JACKAL],
        back: [PYRE, BARROWMIST_KEENER, CARRION_SWARM],
      },
    },
    {
      id: 't-human-f203',
      name: 'Floor 203',
      enemies: {
        front: [CORTEGE_LANCER, PYRE],
        back: [GRAVEWAKE_THRALL, CARRION_SWARM, REVENANT],
      },
    },
    {
      id: 't-human-f204',
      name: 'Floor 204',
      enemies: {
        front: [CORTEGE_LANCER, THORNBACK_GRAZER],
        back: [BLOODPACT_FIEND, REVENANT, CINDER_CULLER],
      },
    },
    {
      id: 't-human-f205',
      name: 'Floor 205',
      enemies: {
        front: [CORTEGE_LANCER, BLOODPACT_FIEND],
        back: [CAIRNWARD_HUSK, CINDER_CULLER, BARROWMIST_KEENER],
      },
    },
    {
      id: 't-human-f206',
      name: 'Floor 206',
      enemies: {
        front: [CORTEGE_LANCER, RENDFANG_JACKAL],
        back: [PYRE, BARROWMIST_KEENER, CARRION_SWARM],
      },
    },
    {
      id: 't-human-f207',
      name: 'Floor 207',
      enemies: {
        front: [CORTEGE_LANCER, PYRE],
        back: [THORNBACK_GRAZER, CARRION_SWARM, REVENANT],
      },
    },
    {
      id: 't-human-f208',
      name: 'Floor 208',
      enemies: {
        front: [CORTEGE_LANCER, THORNBACK_GRAZER],
        back: [THORNBACK_GRAZER, REVENANT, CINDER_CULLER],
      },
    },
    {
      id: 't-human-f209',
      name: 'Floor 209',
      enemies: {
        front: [CORTEGE_LANCER, BLOODPACT_FIEND],
        back: [CAIRNWARD_HUSK, CINDER_CULLER, BARROWMIST_KEENER],
      },
    },
    {
      id: 't-human-f210',
      name: 'Floor 210 — The Standard Recovered',
      enemies: {
        front: [BARROW_SOVEREIGN, CORTEGE_LANCER],
        back: [RENDFANG_JACKAL, CARRION_SWARM, UNSEALED_WRETCH],
      },
    },
    {
      id: 't-human-f211',
      name: 'Floor 211',
      enemies: {
        front: [CORTEGE_LANCER, PYRE],
        back: [GRAVEWAKE_THRALL, CARRION_SWARM, REVENANT],
      },
    },
    {
      id: 't-human-f212',
      name: 'Floor 212',
      enemies: {
        front: [CORTEGE_LANCER, THORNBACK_GRAZER],
        back: [THORNBACK_GRAZER, REVENANT, CINDER_CULLER],
      },
    },
    {
      id: 't-human-f213',
      name: 'Floor 213',
      enemies: {
        front: [CORTEGE_LANCER, CORTEGE_LANCER],
        back: [BLOODPACT_FIEND, UNSEALED_WRETCH, SHADE],
      },
    },
    {
      id: 't-human-f214',
      name: 'Floor 214',
      enemies: {
        front: [CORTEGE_LANCER, CORTEGE_LANCER],
        back: [RENDFANG_JACKAL, SHADE, UNSEALED_WRETCH],
      },
    },
    {
      id: 't-human-f215',
      name: 'Floor 215',
      enemies: {
        front: [CORTEGE_LANCER, CORTEGE_LANCER],
        back: [PYRE, UNSEALED_WRETCH, SEPULCHRE_HOUND],
      },
    },
    {
      id: 't-human-f216',
      name: 'Floor 216',
      enemies: {
        front: [CORTEGE_LANCER, CORTEGE_LANCER],
        back: [THORNBACK_GRAZER, CINDER_CULLER, MIREWHELP],
      },
    },
    {
      id: 't-human-f217',
      name: 'Floor 217',
      enemies: {
        front: [CORTEGE_LANCER, CORTEGE_LANCER],
        back: [BLOODPACT_FIEND, MIREWHELP, SHADE],
      },
    },
    {
      id: 't-human-f218',
      name: 'Floor 218',
      enemies: {
        front: [CORTEGE_LANCER, CORTEGE_LANCER],
        back: [RENDFANG_JACKAL, SHADE, UNSEALED_WRETCH],
      },
    },
    {
      id: 't-human-f219',
      name: 'Floor 219',
      enemies: {
        front: [CORTEGE_LANCER, CORTEGE_LANCER],
        back: [PYRE, CARRION_SWARM, SEPULCHRE_HOUND],
      },
    },
    {
      id: 't-human-f220',
      name: 'Floor 220 — The Pace Set',
      enemies: {
        front: [THE_GRAVEWRIGHT, CORTEGE_LANCER],
        back: [THORNBACK_GRAZER, CORTEGE_LANCER, THORNBACK_GRAZER],
      },
    },
    // -------------------------------------------------------------------------------------
    // The Cortege — Floors 221–245, levels 105–116 — three abreast, and the first thing on the stair that is fast *and* armoured.
    // -------------------------------------------------------------------------------------
    {
      id: 't-human-f221',
      name: 'Floor 221',
      enemies: {
        front: [CORTEGE_LANCER, CORTEGE_LANCER],
        back: [BLOODPACT_FIEND, BLOODPACT_FIEND, RELIQUARY_BEARER],
      },
    },
    {
      id: 't-human-f222',
      name: 'Floor 222',
      enemies: {
        front: [CORTEGE_LANCER, CORTEGE_LANCER],
        back: [RENDFANG_JACKAL, PYRE, COVENANT_EXECUTOR],
      },
    },
    {
      id: 't-human-f223',
      name: 'Floor 223',
      enemies: {
        front: [CORTEGE_LANCER, CORTEGE_LANCER],
        back: [PYRE, RENDFANG_JACKAL, NIGHTMARCH_OUTRIDER],
      },
    },
    {
      id: 't-human-f224',
      name: 'Floor 224',
      enemies: {
        front: [CORTEGE_LANCER, CORTEGE_LANCER],
        back: [THORNBACK_GRAZER, BLOODPACT_FIEND, RAVAGER],
      },
    },
    {
      id: 't-human-f225',
      name: 'Floor 225',
      enemies: {
        front: [CORTEGE_LANCER, CORTEGE_LANCER],
        back: [BLOODPACT_FIEND, BLOODPACT_FIEND, GRAVEMOURN_KEEPER],
      },
    },
    {
      id: 't-human-f226',
      name: 'Floor 226',
      enemies: {
        front: [CORTEGE_LANCER, CORTEGE_LANCER],
        back: [RENDFANG_JACKAL, PYRE, WRATHBORN],
      },
    },
    {
      id: 't-human-f227',
      name: 'Floor 227',
      enemies: {
        front: [CORTEGE_LANCER, CORTEGE_LANCER],
        back: [PYRE, RENDFANG_JACKAL, CAIRNBOUND_SENTINEL],
      },
    },
    {
      id: 't-human-f228',
      name: 'Floor 228',
      enemies: {
        front: [CORTEGE_LANCER, CORTEGE_LANCER],
        back: [THORNBACK_GRAZER, BLOODPACT_FIEND, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-human-f229',
      name: 'Floor 229',
      enemies: {
        front: [CORTEGE_LANCER, CORTEGE_LANCER],
        back: [BLOODPACT_FIEND, BLOODPACT_FIEND, HEADSMAN],
      },
    },
    {
      id: 't-human-f230',
      name: 'Floor 230 — The Column Reformed',
      enemies: {
        front: [THE_GRAVEWRIGHT, CORTEGE_LANCER],
        back: [SERAPH_ADJUDICANT, CORTEGE_LANCER, RAVAGER],
      },
    },
    {
      id: 't-human-f231',
      name: 'Floor 231',
      enemies: {
        front: [CORTEGE_LANCER, CORTEGE_LANCER],
        back: [PYRE, RENDFANG_JACKAL, GRAVETIDE_HERALD],
      },
    },
    {
      id: 't-human-f232',
      name: 'Floor 232',
      enemies: {
        front: [CORTEGE_LANCER, CORTEGE_LANCER],
        back: [THORNBACK_GRAZER, BLOODPACT_FIEND, KNELL_CHANTER],
      },
    },
    {
      id: 't-human-f233',
      name: 'Floor 233',
      enemies: {
        front: [CORTEGE_LANCER, CORTEGE_LANCER],
        back: [CORTEGE_LANCER, BLOODPACT_FIEND, GRAVEMOURN_KEEPER],
      },
    },
    {
      id: 't-human-f234',
      name: 'Floor 234',
      enemies: {
        front: [CORTEGE_LANCER, CORTEGE_LANCER],
        back: [CORTEGE_LANCER, RENDFANG_JACKAL, SEALWARD_CUSTODIAN],
      },
    },
    {
      id: 't-human-f235',
      name: 'Floor 235',
      enemies: {
        front: [CORTEGE_LANCER, CORTEGE_LANCER],
        back: [CORTEGE_LANCER, PYRE, CAIRNBOUND_SENTINEL],
      },
    },
    {
      id: 't-human-f236',
      name: 'Floor 236',
      enemies: {
        front: [CORTEGE_LANCER, CORTEGE_LANCER],
        back: [CORTEGE_LANCER, THORNBACK_GRAZER, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-human-f237',
      name: 'Floor 237',
      enemies: {
        front: [CORTEGE_LANCER, CORTEGE_LANCER],
        back: [CORTEGE_LANCER, BLOODPACT_FIEND, HEADSMAN],
      },
    },
    {
      id: 't-human-f238',
      name: 'Floor 238',
      enemies: {
        front: [CORTEGE_LANCER, CORTEGE_LANCER],
        back: [CORTEGE_LANCER, RENDFANG_JACKAL, WRATHBORN],
      },
    },
    {
      id: 't-human-f239',
      name: 'Floor 239',
      enemies: {
        front: [CORTEGE_LANCER, CORTEGE_LANCER],
        back: [CORTEGE_LANCER, PYRE, GRAVETIDE_HERALD],
      },
    },
    {
      id: 't-human-f240',
      name: 'Floor 240 — The Night Stage',
      enemies: {
        front: [BARROW_SOVEREIGN, CORTEGE_LANCER],
        back: [RELIQUARY_BEARER, CORTEGE_LANCER, WRATHBORN],
      },
    },
    {
      id: 't-human-f241',
      name: 'Floor 241',
      enemies: {
        front: [CORTEGE_LANCER, CORTEGE_LANCER],
        back: [CORTEGE_LANCER, BLOODPACT_FIEND, BONECHAIN_WARDEN],
      },
    },
    {
      id: 't-human-f242',
      name: 'Floor 242',
      enemies: {
        front: [CORTEGE_LANCER, CORTEGE_LANCER],
        back: [IRONWAKE_VANGUARD, RENDFANG_JACKAL, COVENANT_EXECUTOR],
      },
    },
    {
      id: 't-human-f243',
      name: 'Floor 243',
      enemies: {
        front: [CORTEGE_LANCER, CORTEGE_LANCER],
        back: [IRONWAKE_VANGUARD, PYRE, RELIQUARY_BEARER],
      },
    },
    {
      id: 't-human-f244',
      name: 'Floor 244',
      enemies: {
        front: [CORTEGE_LANCER, CORTEGE_LANCER],
        back: [IRONWAKE_VANGUARD, THORNBACK_GRAZER, RAVAGER],
      },
    },
    {
      id: 't-human-f245',
      name: 'Floor 245',
      enemies: {
        front: [IRONWAKE_VANGUARD, CORTEGE_LANCER],
        back: [GRAVETIDE_HERALD, CORTEGE_LANCER, CINDER_CULLER],
      },
    },
    // -------------------------------------------------------------------------------------
    // The Ironwake — Floors 246–270, levels 116–128 — the Vanguard sets the pace and the board keeps it. One, then two.
    // -------------------------------------------------------------------------------------
    {
      id: 't-human-f246',
      name: 'Floor 246',
      enemies: {
        front: [IRONWAKE_VANGUARD, CORTEGE_LANCER],
        back: [RENDFANG_JACKAL, RIFTSTEP_REAVER, GRAVEMOURN_KEEPER],
      },
    },
    {
      id: 't-human-f247',
      name: 'Floor 247',
      enemies: {
        front: [IRONWAKE_VANGUARD, CORTEGE_LANCER],
        back: [PYRE, GRAVEMOURN_KEEPER, BONECHAIN_WARDEN],
      },
    },
    {
      id: 't-human-f248',
      name: 'Floor 248',
      enemies: {
        front: [IRONWAKE_VANGUARD, CORTEGE_LANCER],
        back: [THORNBACK_GRAZER, SEALWARD_CUSTODIAN, CAIRNBOUND_SENTINEL],
      },
    },
    {
      id: 't-human-f249',
      name: 'Floor 249',
      enemies: {
        front: [IRONWAKE_VANGUARD, CORTEGE_LANCER],
        back: [BLOODPACT_FIEND, CAIRNBOUND_SENTINEL, RELIQUARY_BEARER],
      },
    },
    {
      id: 't-human-f250',
      name: 'Floor 250 — The Relay',
      enemies: {
        front: [BARROW_SOVEREIGN, IRONWAKE_VANGUARD],
        back: [RELIQUARY_BEARER, CORTEGE_LANCER, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-human-f251',
      name: 'Floor 251',
      enemies: {
        front: [IRONWAKE_VANGUARD, CORTEGE_LANCER],
        back: [PYRE, HEADSMAN, NIGHTMARCH_OUTRIDER],
      },
    },
    {
      id: 't-human-f252',
      name: 'Floor 252',
      enemies: {
        front: [IRONWAKE_VANGUARD, CORTEGE_LANCER],
        back: [THORNBACK_GRAZER, WRATHBORN, GRAVETIDE_HERALD],
      },
    },
    {
      id: 't-human-f253',
      name: 'Floor 253',
      enemies: {
        front: [IRONWAKE_VANGUARD, CORTEGE_LANCER],
        back: [BLOODPACT_FIEND, GRAVETIDE_HERALD, GRAVEMOURN_KEEPER],
      },
    },
    {
      id: 't-human-f254',
      name: 'Floor 254',
      enemies: {
        front: [IRONWAKE_VANGUARD, CORTEGE_LANCER],
        back: [RENDFANG_JACKAL, KNELL_CHANTER, BONECHAIN_WARDEN],
      },
    },
    {
      id: 't-human-f255',
      name: 'Floor 255',
      enemies: {
        front: [IRONWAKE_VANGUARD, CORTEGE_LANCER],
        back: [PYRE, BONECHAIN_WARDEN, CAIRNBOUND_SENTINEL],
      },
    },
    {
      id: 't-human-f256',
      name: 'Floor 256',
      enemies: {
        front: [IRONWAKE_VANGUARD, CORTEGE_LANCER],
        back: [THORNBACK_GRAZER, COVENANT_EXECUTOR, RELIQUARY_BEARER],
      },
    },
    {
      id: 't-human-f257',
      name: 'Floor 257',
      enemies: {
        front: [IRONWAKE_VANGUARD, CORTEGE_LANCER],
        back: [BLOODPACT_FIEND, RELIQUARY_BEARER, HEADSMAN],
      },
    },
    {
      id: 't-human-f258',
      name: 'Floor 258',
      enemies: {
        front: [IRONWAKE_VANGUARD, IRONWAKE_VANGUARD],
        back: [CORTEGE_LANCER, RENDFANG_JACKAL, RAVAGER],
      },
    },
    {
      id: 't-human-f259',
      name: 'Floor 259',
      enemies: {
        front: [IRONWAKE_VANGUARD, IRONWAKE_VANGUARD],
        back: [CORTEGE_LANCER, PYRE, NIGHTMARCH_OUTRIDER],
      },
    },
    {
      id: 't-human-f260',
      name: 'Floor 260 — The Forced March',
      enemies: {
        front: [THE_GRAVEWRIGHT, IRONWAKE_VANGUARD],
        back: [RELIQUARY_BEARER, CORTEGE_LANCER, RIFTSTEP_REAVER],
      },
    },
    {
      id: 't-human-f261',
      name: 'Floor 261',
      enemies: {
        front: [IRONWAKE_VANGUARD, IRONWAKE_VANGUARD],
        back: [CORTEGE_LANCER, BLOODPACT_FIEND, GRAVEMOURN_KEEPER],
      },
    },
    {
      id: 't-human-f262',
      name: 'Floor 262',
      enemies: {
        front: [IRONWAKE_VANGUARD, IRONWAKE_VANGUARD],
        back: [CORTEGE_LANCER, RENDFANG_JACKAL, SEALWARD_CUSTODIAN],
      },
    },
    {
      id: 't-human-f263',
      name: 'Floor 263',
      enemies: {
        front: [IRONWAKE_VANGUARD, IRONWAKE_VANGUARD],
        back: [CORTEGE_LANCER, PYRE, CAIRNBOUND_SENTINEL],
      },
    },
    {
      id: 't-human-f264',
      name: 'Floor 264',
      enemies: {
        front: [IRONWAKE_VANGUARD, IRONWAKE_VANGUARD],
        back: [CORTEGE_LANCER, THORNBACK_GRAZER, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-human-f265',
      name: 'Floor 265',
      enemies: {
        front: [IRONWAKE_VANGUARD, IRONWAKE_VANGUARD],
        back: [CORTEGE_LANCER, BLOODPACT_FIEND, HEADSMAN],
      },
    },
    {
      id: 't-human-f266',
      name: 'Floor 266',
      enemies: {
        front: [IRONWAKE_VANGUARD, IRONWAKE_VANGUARD],
        back: [CORTEGE_LANCER, RENDFANG_JACKAL, WRATHBORN],
      },
    },
    {
      id: 't-human-f267',
      name: 'Floor 267',
      enemies: {
        front: [IRONWAKE_VANGUARD, IRONWAKE_VANGUARD],
        back: [CORTEGE_LANCER, PYRE, GRAVETIDE_HERALD],
      },
    },
    {
      id: 't-human-f268',
      name: 'Floor 268',
      enemies: {
        front: [IRONWAKE_VANGUARD, IRONWAKE_VANGUARD],
        back: [CORTEGE_LANCER, THORNBACK_GRAZER, KNELL_CHANTER],
      },
    },
    {
      id: 't-human-f269',
      name: 'Floor 269',
      enemies: {
        front: [IRONWAKE_VANGUARD, IRONWAKE_VANGUARD],
        back: [CORTEGE_LANCER, BLOODPACT_FIEND, BONECHAIN_WARDEN],
      },
    },
    {
      id: 't-human-f270',
      name: 'Floor 270 — The Broken Oath',
      enemies: {
        front: [OATHBREAKER, IRONWAKE_VANGUARD],
        back: [RELIQUARY_BEARER, IRONWAKE_VANGUARD, CORTEGE_LANCER],
      },
    },
    // -------------------------------------------------------------------------------------
    // The Quicklime Yard — Floors 271–290, levels 128–137 — three abreast, and the Serjeant that keeps the time they march to.
    // -------------------------------------------------------------------------------------
    {
      id: 't-human-f271',
      name: 'Floor 271',
      enemies: {
        front: [IRONWAKE_VANGUARD, IRONWAKE_VANGUARD],
        back: [CORTEGE_LANCER, COVENANT_EXECUTOR, RELIQUARY_BEARER],
      },
    },
    {
      id: 't-human-f272',
      name: 'Floor 272',
      enemies: {
        front: [IRONWAKE_VANGUARD, IRONWAKE_VANGUARD],
        back: [CORTEGE_LANCER, SERAPH_ADJUDICANT, RAVAGER],
      },
    },
    {
      id: 't-human-f273',
      name: 'Floor 273',
      enemies: {
        front: [IRONWAKE_VANGUARD, IRONWAKE_VANGUARD],
        back: [CORTEGE_LANCER, RAVAGER, NIGHTMARCH_OUTRIDER],
      },
    },
    {
      id: 't-human-f274',
      name: 'Floor 274',
      enemies: {
        front: [IRONWAKE_VANGUARD, IRONWAKE_VANGUARD],
        back: [CORTEGE_LANCER, WRATHBORN, RIFTSTEP_REAVER],
      },
    },
    {
      id: 't-human-f275',
      name: 'Floor 275',
      enemies: {
        front: [IRONWAKE_VANGUARD, IRONWAKE_VANGUARD],
        back: [CORTEGE_LANCER, RIFTSTEP_REAVER, GRAVEMOURN_KEEPER],
      },
    },
    {
      id: 't-human-f276',
      name: 'Floor 276',
      enemies: {
        front: [IRONWAKE_VANGUARD, IRONWAKE_VANGUARD],
        back: [CORTEGE_LANCER, KNELL_CHANTER, SEALWARD_CUSTODIAN],
      },
    },
    {
      id: 't-human-f277',
      name: 'Floor 277',
      enemies: {
        front: [IRONWAKE_VANGUARD, IRONWAKE_VANGUARD],
        back: [CORTEGE_LANCER, SEALWARD_CUSTODIAN, CAIRNBOUND_SENTINEL],
      },
    },
    {
      id: 't-human-f278',
      name: 'Floor 278',
      enemies: {
        front: [IRONWAKE_VANGUARD, IRONWAKE_VANGUARD],
        back: [CORTEGE_LANCER, COVENANT_EXECUTOR, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-human-f279',
      name: 'Floor 279',
      enemies: {
        front: [IRONWAKE_VANGUARD, IRONWAKE_VANGUARD],
        back: [CORTEGE_LANCER, SERAPH_ADJUDICANT, HEADSMAN],
      },
    },
    {
      id: 't-human-f280',
      name: 'Floor 280 — The Quicklime Yard',
      enemies: {
        front: [THE_DEATHLESS_MARSHAL, IRONWAKE_VANGUARD],
        back: [RELIQUARY_BEARER, CORTEGE_LANCER, COVENANT_EXECUTOR],
      },
    },
    {
      id: 't-human-f281',
      name: 'Floor 281',
      enemies: {
        front: [QUICKLIME_SERJEANT, IRONWAKE_VANGUARD],
        back: [IRONWAKE_VANGUARD, WRATHBORN, GRAVETIDE_HERALD],
      },
    },
    {
      id: 't-human-f282',
      name: 'Floor 282',
      enemies: {
        front: [QUICKLIME_SERJEANT, IRONWAKE_VANGUARD],
        back: [IRONWAKE_VANGUARD, RIFTSTEP_REAVER, KNELL_CHANTER],
      },
    },
    {
      id: 't-human-f283',
      name: 'Floor 283',
      enemies: {
        front: [QUICKLIME_SERJEANT, IRONWAKE_VANGUARD],
        back: [IRONWAKE_VANGUARD, KNELL_CHANTER, BONECHAIN_WARDEN],
      },
    },
    {
      id: 't-human-f284',
      name: 'Floor 284',
      enemies: {
        front: [QUICKLIME_SERJEANT, IRONWAKE_VANGUARD],
        back: [IRONWAKE_VANGUARD, SEALWARD_CUSTODIAN, COVENANT_EXECUTOR],
      },
    },
    {
      id: 't-human-f285',
      name: 'Floor 285',
      enemies: {
        front: [QUICKLIME_SERJEANT, IRONWAKE_VANGUARD],
        back: [IRONWAKE_VANGUARD, COVENANT_EXECUTOR, RELIQUARY_BEARER],
      },
    },
    {
      id: 't-human-f286',
      name: 'Floor 286',
      enemies: {
        front: [QUICKLIME_SERJEANT, IRONWAKE_VANGUARD],
        back: [IRONWAKE_VANGUARD, SERAPH_ADJUDICANT, RAVAGER],
      },
    },
    {
      id: 't-human-f287',
      name: 'Floor 287',
      enemies: {
        front: [QUICKLIME_SERJEANT, IRONWAKE_VANGUARD],
        back: [IRONWAKE_VANGUARD, RAVAGER, NIGHTMARCH_OUTRIDER],
      },
    },
    {
      id: 't-human-f288',
      name: 'Floor 288',
      enemies: {
        front: [QUICKLIME_SERJEANT, IRONWAKE_VANGUARD],
        back: [IRONWAKE_VANGUARD, WRATHBORN, RIFTSTEP_REAVER],
      },
    },
    {
      id: 't-human-f289',
      name: 'Floor 289',
      enemies: {
        front: [QUICKLIME_SERJEANT, IRONWAKE_VANGUARD],
        back: [IRONWAKE_VANGUARD, RIFTSTEP_REAVER, GRAVEMOURN_KEEPER],
      },
    },
    {
      id: 't-human-f290',
      name: 'Floor 290 — The Last Halt',
      enemies: {
        front: [THE_DEATHLESS_MARSHAL, QUICKLIME_SERJEANT],
        back: [RELIQUARY_BEARER, IRONWAKE_VANGUARD, CHARNEL_DRUDGE],
      },
    },
    // -------------------------------------------------------------------------------------
    // The Hourless March — Floors 291–300, levels 138–142 — two voices keeping time, and the thing that never halted.
    // -------------------------------------------------------------------------------------
    {
      id: 't-human-f291',
      name: 'Floor 291',
      enemies: {
        front: [QUICKLIME_SERJEANT, IRONWAKE_VANGUARD],
        back: [IRONWAKE_VANGUARD, SEALWARD_CUSTODIAN, CAIRNBOUND_SENTINEL],
      },
    },
    {
      id: 't-human-f292',
      name: 'Floor 292',
      enemies: {
        front: [IRONWAKE_VANGUARD, QUICKLIME_SERJEANT],
        back: [CORTEGE_LANCER, COVENANT_EXECUTOR, RELIQUARY_BEARER],
      },
    },
    {
      id: 't-human-f293',
      name: 'Floor 293',
      enemies: {
        front: [QUICKLIME_SERJEANT, IRONWAKE_VANGUARD],
        back: [IRONWAKE_VANGUARD, SERAPH_ADJUDICANT, HEADSMAN],
      },
    },
    {
      id: 't-human-f294',
      name: 'Floor 294',
      enemies: {
        front: [IRONWAKE_VANGUARD, QUICKLIME_SERJEANT],
        back: [CORTEGE_LANCER, RAVAGER, NIGHTMARCH_OUTRIDER],
      },
    },
    {
      id: 't-human-f295',
      name: 'Floor 295',
      enemies: {
        front: [QUICKLIME_SERJEANT, IRONWAKE_VANGUARD],
        back: [IRONWAKE_VANGUARD, WRATHBORN, GRAVETIDE_HERALD],
      },
    },
    {
      id: 't-human-f296',
      name: 'Floor 296',
      enemies: {
        front: [IRONWAKE_VANGUARD, QUICKLIME_SERJEANT],
        back: [CORTEGE_LANCER, RIFTSTEP_REAVER, GRAVEMOURN_KEEPER],
      },
    },
    {
      id: 't-human-f297',
      name: 'Floor 297',
      enemies: {
        front: [QUICKLIME_SERJEANT, IRONWAKE_VANGUARD],
        back: [IRONWAKE_VANGUARD, KNELL_CHANTER, BONECHAIN_WARDEN],
      },
    },
    {
      id: 't-human-f298',
      name: 'Floor 298',
      enemies: {
        front: [IRONWAKE_VANGUARD, QUICKLIME_SERJEANT],
        back: [CORTEGE_LANCER, SEALWARD_CUSTODIAN, CAIRNBOUND_SENTINEL],
      },
    },
    {
      id: 't-human-f299',
      name: 'Floor 299',
      enemies: {
        front: [QUICKLIME_SERJEANT, IRONWAKE_VANGUARD],
        back: [IRONWAKE_VANGUARD, COVENANT_EXECUTOR, RELIQUARY_BEARER],
      },
    },
    {
      id: 't-human-f300',
      name: 'Floor 300 — The Hourless March',
      enemies: {
        front: [THE_HOURLESS_MARCH, IRONWAKE_VANGUARD],
        back: [RELIQUARY_BEARER, QUICKLIME_SERJEANT, CORTEGE_LANCER],
      },
    },
    // -------------------------------------------------------------------------------------
    // The Harness Line — Floors 301–320, levels 142–151, Worn 1–Sturdy 4 — one body that came up wearing what it was buried in.
    // -------------------------------------------------------------------------------------
    {
      id: 't-human-f301',
      name: 'Floor 301',
      enemies: {
        front: [PLATEBOUND_HUSK, BARROWMIST_KEENER],
        back: [CINDER_CULLER, CARRION_SWARM, UNSEALED_WRETCH],
      },
    },
    {
      id: 't-human-f302',
      name: 'Floor 302',
      enemies: {
        front: [PLATEBOUND_HUSK, BARROWMIST_KEENER],
        back: [CINDER_CULLER, UNSEALED_WRETCH, CARRION_SWARM],
      },
    },
    {
      id: 't-human-f303',
      name: 'Floor 303',
      enemies: {
        front: [PLATEBOUND_HUSK, BARROWMIST_KEENER],
        back: [CINDER_CULLER, UNSEALED_WRETCH, CARRION_SWARM],
      },
    },
    {
      id: 't-human-f304',
      name: 'Floor 304',
      enemies: {
        front: [PLATEBOUND_HUSK, BARROWMIST_KEENER],
        back: [UNSEALED_WRETCH, CINDER_CULLER, PYRE],
      },
    },
    {
      id: 't-human-f305',
      name: 'Floor 305',
      enemies: {
        front: [PLATEBOUND_HUSK, BARROWMIST_KEENER],
        back: [UNSEALED_WRETCH, PYRE, CINDER_CULLER],
      },
    },
    {
      id: 't-human-f306',
      name: 'Floor 306',
      enemies: {
        front: [PLATEBOUND_HUSK, BARROWMIST_KEENER],
        back: [UNSEALED_WRETCH, PYRE, CINDER_CULLER],
      },
    },
    {
      id: 't-human-f307',
      name: 'Floor 307',
      enemies: {
        front: [PLATEBOUND_HUSK, BARROWMIST_KEENER],
        back: [PYRE, UNSEALED_WRETCH, MIREWHELP],
      },
    },
    {
      id: 't-human-f308',
      name: 'Floor 308',
      enemies: {
        front: [PLATEBOUND_HUSK, BARROWMIST_KEENER],
        back: [PYRE, MIREWHELP, UNSEALED_WRETCH],
      },
    },
    {
      id: 't-human-f309',
      name: 'Floor 309',
      enemies: {
        front: [PLATEBOUND_HUSK, BARROWMIST_KEENER],
        back: [MIREWHELP, PYRE, BLOODPACT_FIEND],
      },
    },
    {
      id: 't-human-f310',
      name: 'Floor 310 — The Harness Line',
      enemies: {
        front: [PLATEBOUND_HUSK, SEPULCHRE_HOUND],
        back: [BLOODPACT_FIEND, RENDFANG_JACKAL, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-human-f311',
      name: 'Floor 311',
      enemies: {
        front: [PLATEBOUND_HUSK, BARROWMIST_KEENER],
        back: [MIREWHELP, BLOODPACT_FIEND, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-human-f312',
      name: 'Floor 312',
      enemies: {
        front: [PLATEBOUND_HUSK, SEPULCHRE_HOUND],
        back: [MIREWHELP, BLOODPACT_FIEND, PYRE],
      },
    },
    {
      id: 't-human-f313',
      name: 'Floor 313',
      enemies: {
        front: [PLATEBOUND_HUSK, SEPULCHRE_HOUND],
        back: [BLOODPACT_FIEND, MIREWHELP, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-human-f314',
      name: 'Floor 314',
      enemies: {
        front: [PLATEBOUND_HUSK, SEPULCHRE_HOUND],
        back: [BLOODPACT_FIEND, RENDFANG_JACKAL, MIREWHELP],
      },
    },
    {
      id: 't-human-f315',
      name: 'Floor 315',
      enemies: {
        front: [PLATEBOUND_HUSK, SEPULCHRE_HOUND],
        back: [BLOODPACT_FIEND, RENDFANG_JACKAL, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-human-f316',
      name: 'Floor 316',
      enemies: {
        front: [PLATEBOUND_HUSK, SEPULCHRE_HOUND],
        back: [SERAPH_ADJUDICANT, BLOODPACT_FIEND, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-human-f317',
      name: 'Floor 317',
      enemies: {
        front: [PLATEBOUND_HUSK, SHADE],
        back: [SERAPH_ADJUDICANT, BLOODPACT_FIEND, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-human-f318',
      name: 'Floor 318',
      enemies: {
        front: [PLATEBOUND_HUSK, SHADE],
        back: [SERAPH_ADJUDICANT, BLOODPACT_FIEND, BOAR],
      },
    },
    {
      id: 't-human-f319',
      name: 'Floor 319',
      enemies: {
        front: [PLATEBOUND_HUSK, SHADE],
        back: [SERAPH_ADJUDICANT, BOAR, BLOODPACT_FIEND],
      },
    },
    {
      id: 't-human-f320',
      name: 'Floor 320 — The Kit Issued',
      enemies: {
        front: [PLATEBOUND_HUSK, HAG],
        back: [KNELL_CHANTER, BOAR, RIFTSTEP_REAVER],
      },
    },
    // -------------------------------------------------------------------------------------
    // The Kit Store — Floors 321–345, levels 152–163, Sturdy 5–Sturdy 34 — two of them, and the grade steps to Sturdy underneath.
    // -------------------------------------------------------------------------------------
    {
      id: 't-human-f321',
      name: 'Floor 321',
      enemies: {
        front: [PLATEBOUND_HUSK, PANOPLY_BEARER],
        back: [BARROWMIST_KEENER, PYRE, UNSEALED_WRETCH],
      },
    },
    {
      id: 't-human-f322',
      name: 'Floor 322',
      enemies: {
        front: [PLATEBOUND_HUSK, PANOPLY_BEARER],
        back: [BARROWMIST_KEENER, MIREWHELP, PYRE],
      },
    },
    {
      id: 't-human-f323',
      name: 'Floor 323',
      enemies: {
        front: [PLATEBOUND_HUSK, PANOPLY_BEARER],
        back: [BARROWMIST_KEENER, MIREWHELP, BLOODPACT_FIEND],
      },
    },
    {
      id: 't-human-f324',
      name: 'Floor 324',
      enemies: {
        front: [PLATEBOUND_HUSK, PANOPLY_BEARER],
        back: [BARROWMIST_KEENER, BLOODPACT_FIEND, MIREWHELP],
      },
    },
    {
      id: 't-human-f325',
      name: 'Floor 325',
      enemies: {
        front: [PLATEBOUND_HUSK, PANOPLY_BEARER],
        back: [SEPULCHRE_HOUND, MIREWHELP, BLOODPACT_FIEND],
      },
    },
    {
      id: 't-human-f326',
      name: 'Floor 326',
      enemies: {
        front: [PLATEBOUND_HUSK, PANOPLY_BEARER],
        back: [SEPULCHRE_HOUND, BLOODPACT_FIEND, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-human-f327',
      name: 'Floor 327',
      enemies: {
        front: [PLATEBOUND_HUSK, PANOPLY_BEARER],
        back: [SEPULCHRE_HOUND, BLOODPACT_FIEND, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-human-f328',
      name: 'Floor 328',
      enemies: {
        front: [PLATEBOUND_HUSK, PANOPLY_BEARER],
        back: [SEPULCHRE_HOUND, SERAPH_ADJUDICANT, BLOODPACT_FIEND],
      },
    },
    {
      id: 't-human-f329',
      name: 'Floor 329',
      enemies: {
        front: [PLATEBOUND_HUSK, PANOPLY_BEARER],
        back: [SHADE, SERAPH_ADJUDICANT, BLOODPACT_FIEND],
      },
    },
    {
      id: 't-human-f330',
      name: 'Floor 330 — The Store Opened',
      enemies: {
        front: [PLATEBOUND_HUSK, PANOPLY_BEARER],
        back: [HAG, KNELL_CHANTER, BOAR],
      },
    },
    {
      id: 't-human-f331',
      name: 'Floor 331',
      enemies: {
        front: [PLATEBOUND_HUSK, PANOPLY_BEARER],
        back: [SHADE, BOAR, SERAPH_ADJUDICANT],
      },
    },
    {
      id: 't-human-f332',
      name: 'Floor 332',
      enemies: {
        front: [PLATEBOUND_HUSK, PANOPLY_BEARER],
        back: [SHADE, BOAR, RIFTSTEP_REAVER],
      },
    },
    {
      id: 't-human-f333',
      name: 'Floor 333',
      enemies: {
        front: [PLATEBOUND_HUSK, PANOPLY_BEARER],
        back: [REVENANT, BOAR, RIFTSTEP_REAVER],
      },
    },
    {
      id: 't-human-f334',
      name: 'Floor 334',
      enemies: {
        front: [PLATEBOUND_HUSK, PANOPLY_BEARER],
        back: [REVENANT, BOAR, RIFTSTEP_REAVER],
      },
    },
    {
      id: 't-human-f335',
      name: 'Floor 335',
      enemies: {
        front: [PLATEBOUND_HUSK, PANOPLY_BEARER],
        back: [REVENANT, KNELL_CHANTER, BOAR],
      },
    },
    {
      id: 't-human-f336',
      name: 'Floor 336',
      enemies: {
        front: [PLATEBOUND_HUSK, PANOPLY_BEARER],
        back: [HAG, KNELL_CHANTER, BOAR],
      },
    },
    {
      id: 't-human-f337',
      name: 'Floor 337',
      enemies: {
        front: [PLATEBOUND_HUSK, PANOPLY_BEARER],
        back: [HAG, KNELL_CHANTER, BOAR],
      },
    },
    {
      id: 't-human-f338',
      name: 'Floor 338',
      enemies: {
        front: [PLATEBOUND_HUSK, PANOPLY_BEARER],
        back: [HAG, KNELL_CHANTER, BOAR],
      },
    },
    {
      id: 't-human-f339',
      name: 'Floor 339',
      enemies: {
        front: [PLATEBOUND_HUSK, PANOPLY_BEARER],
        back: [HAG, KNELL_CHANTER, COVENANT_EXECUTOR],
      },
    },
    {
      id: 't-human-f340',
      name: 'Floor 340 — The Weight Taken',
      enemies: {
        front: [PLATEBOUND_HUSK, PANOPLY_BEARER],
        back: [CAIRNWARD_HUSK, COVENANT_EXECUTOR, KNELL_CHANTER],
      },
    },
    {
      id: 't-human-f341',
      name: 'Floor 341',
      enemies: {
        front: [PLATEBOUND_HUSK, PANOPLY_BEARER],
        back: [HAG, KNELL_CHANTER, COVENANT_EXECUTOR],
      },
    },
    {
      id: 't-human-f342',
      name: 'Floor 342',
      enemies: {
        front: [PLATEBOUND_HUSK, PANOPLY_BEARER],
        back: [CAIRNWARD_HUSK, KNELL_CHANTER, BOAR],
      },
    },
    {
      id: 't-human-f343',
      name: 'Floor 343',
      enemies: {
        front: [PLATEBOUND_HUSK, PANOPLY_BEARER],
        back: [CAIRNWARD_HUSK, KNELL_CHANTER, COVENANT_EXECUTOR],
      },
    },
    {
      id: 't-human-f344',
      name: 'Floor 344',
      enemies: {
        front: [PLATEBOUND_HUSK, PANOPLY_BEARER],
        back: [CAIRNWARD_HUSK, KNELL_CHANTER, COVENANT_EXECUTOR],
      },
    },
    {
      id: 't-human-f345',
      name: 'Floor 345',
      enemies: {
        front: [PLATEBOUND_HUSK, PANOPLY_BEARER],
        back: [CAIRNWARD_HUSK, KNELL_CHANTER, COVENANT_EXECUTOR],
      },
    },
    // -------------------------------------------------------------------------------------
    // The Plated March — Floors 346–365, levels 164–173, Sturdy 35–Fine 18 — the Marshal takes the front, and the plate arrives.
    // -------------------------------------------------------------------------------------
    {
      id: 't-human-f346',
      name: 'Floor 346',
      enemies: {
        front: [PANOPLY_BEARER, GRAVEPLATE_MARSHAL],
        back: [HAG, KNELL_CHANTER, BOAR],
      },
    },
    {
      id: 't-human-f347',
      name: 'Floor 347',
      enemies: {
        front: [PANOPLY_BEARER, GRAVEPLATE_MARSHAL],
        back: [HAG, KNELL_CHANTER, BOAR],
      },
    },
    {
      id: 't-human-f348',
      name: 'Floor 348',
      enemies: {
        front: [PANOPLY_BEARER, GRAVEPLATE_MARSHAL],
        back: [HAG, KNELL_CHANTER, BOAR],
      },
    },
    {
      id: 't-human-f349',
      name: 'Floor 349',
      enemies: {
        front: [PANOPLY_BEARER, GRAVEPLATE_MARSHAL],
        back: [HAG, KNELL_CHANTER, BOAR],
      },
    },
    {
      id: 't-human-f350',
      name: 'Floor 350 — The Plate Arrives',
      enemies: {
        front: [PANOPLY_BEARER, GRAVEPLATE_MARSHAL],
        back: [CAIRNWARD_HUSK, KNELL_CHANTER, COVENANT_EXECUTOR],
      },
    },
    {
      id: 't-human-f351',
      name: 'Floor 351',
      enemies: {
        front: [PANOPLY_BEARER, GRAVEPLATE_MARSHAL],
        back: [HAG, KNELL_CHANTER, COVENANT_EXECUTOR],
      },
    },
    {
      id: 't-human-f352',
      name: 'Floor 352',
      enemies: {
        front: [PANOPLY_BEARER, GRAVEPLATE_MARSHAL],
        back: [HAG, KNELL_CHANTER, COVENANT_EXECUTOR],
      },
    },
    {
      id: 't-human-f353',
      name: 'Floor 353',
      enemies: {
        front: [PANOPLY_BEARER, GRAVEPLATE_MARSHAL],
        back: [HAG, KNELL_CHANTER, COVENANT_EXECUTOR],
      },
    },
    {
      id: 't-human-f354',
      name: 'Floor 354',
      enemies: {
        front: [PANOPLY_BEARER, GRAVEPLATE_MARSHAL],
        back: [HAG, KNELL_CHANTER, COVENANT_EXECUTOR],
      },
    },
    {
      id: 't-human-f355',
      name: 'Floor 355',
      enemies: {
        front: [PANOPLY_BEARER, GRAVEPLATE_MARSHAL],
        back: [HAG, KNELL_CHANTER, COVENANT_EXECUTOR],
      },
    },
    {
      id: 't-human-f356',
      name: 'Floor 356',
      enemies: {
        front: [PANOPLY_BEARER, GRAVEPLATE_MARSHAL],
        back: [HAG, KNELL_CHANTER, COVENANT_EXECUTOR],
      },
    },
    {
      id: 't-human-f357',
      name: 'Floor 357',
      enemies: {
        front: [PANOPLY_BEARER, GRAVEPLATE_MARSHAL],
        back: [HAG, KNELL_CHANTER, COVENANT_EXECUTOR],
      },
    },
    {
      id: 't-human-f358',
      name: 'Floor 358',
      enemies: {
        front: [PANOPLY_BEARER, GRAVEPLATE_MARSHAL],
        back: [HAG, KNELL_CHANTER, COVENANT_EXECUTOR],
      },
    },
    {
      id: 't-human-f359',
      name: 'Floor 359',
      enemies: {
        front: [PANOPLY_BEARER, GRAVEPLATE_MARSHAL],
        back: [CAIRNWARD_HUSK, KNELL_CHANTER, BOAR],
      },
    },
    {
      id: 't-human-f360',
      name: 'Floor 360 — The Marshal Kitted',
      enemies: {
        front: [PANOPLY_BEARER, GRAVEPLATE_MARSHAL],
        back: [GRAVEMOURN_KEEPER, COVENANT_EXECUTOR, KNELL_CHANTER],
      },
    },
    {
      id: 't-human-f361',
      name: 'Floor 361',
      enemies: {
        front: [PANOPLY_BEARER, GRAVEPLATE_MARSHAL],
        back: [CAIRNWARD_HUSK, KNELL_CHANTER, BOAR],
      },
    },
    {
      id: 't-human-f362',
      name: 'Floor 362',
      enemies: {
        front: [PANOPLY_BEARER, GRAVEPLATE_MARSHAL],
        back: [CAIRNWARD_HUSK, KNELL_CHANTER, COVENANT_EXECUTOR],
      },
    },
    {
      id: 't-human-f363',
      name: 'Floor 363',
      enemies: {
        front: [PANOPLY_BEARER, GRAVEPLATE_MARSHAL],
        back: [CAIRNWARD_HUSK, KNELL_CHANTER, COVENANT_EXECUTOR],
      },
    },
    {
      id: 't-human-f364',
      name: 'Floor 364',
      enemies: {
        front: [PANOPLY_BEARER, GRAVEPLATE_MARSHAL],
        back: [CAIRNWARD_HUSK, KNELL_CHANTER, COVENANT_EXECUTOR],
      },
    },
    {
      id: 't-human-f365',
      name: 'Floor 365',
      enemies: {
        front: [PANOPLY_BEARER, GRAVEPLATE_MARSHAL],
        back: [CAIRNWARD_HUSK, KNELL_CHANTER, COVENANT_EXECUTOR],
      },
    },
    // -------------------------------------------------------------------------------------
    // The Full Muster — Floors 366–385, levels 173–182, Fine 19–Fine 42 — three kitted bodies, and the weight eases as the grade climbs.
    // -------------------------------------------------------------------------------------
    {
      id: 't-human-f366',
      name: 'Floor 366',
      enemies: {
        front: [PLATEBOUND_HUSK, PANOPLY_BEARER],
        back: [GRAVEPLATE_MARSHAL, SERAPH_ADJUDICANT, BOAR],
      },
    },
    {
      id: 't-human-f367',
      name: 'Floor 367',
      enemies: {
        front: [PLATEBOUND_HUSK, PANOPLY_BEARER],
        back: [GRAVEPLATE_MARSHAL, SERAPH_ADJUDICANT, BOAR],
      },
    },
    {
      id: 't-human-f368',
      name: 'Floor 368',
      enemies: {
        front: [PLATEBOUND_HUSK, PANOPLY_BEARER],
        back: [GRAVEPLATE_MARSHAL, SERAPH_ADJUDICANT, BLOODPACT_FIEND],
      },
    },
    {
      id: 't-human-f369',
      name: 'Floor 369',
      enemies: {
        front: [PLATEBOUND_HUSK, PANOPLY_BEARER],
        back: [GRAVEPLATE_MARSHAL, SERAPH_ADJUDICANT, BLOODPACT_FIEND],
      },
    },
    {
      id: 't-human-f370',
      name: 'Floor 370 — The Muster Called',
      enemies: {
        front: [PLATEBOUND_HUSK, PANOPLY_BEARER],
        back: [GRAVEPLATE_MARSHAL, KNELL_CHANTER, BOAR],
      },
    },
    {
      id: 't-human-f371',
      name: 'Floor 371',
      enemies: {
        front: [PLATEBOUND_HUSK, PANOPLY_BEARER],
        back: [GRAVEPLATE_MARSHAL, BLOODPACT_FIEND, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-human-f372',
      name: 'Floor 372',
      enemies: {
        front: [PLATEBOUND_HUSK, PANOPLY_BEARER],
        back: [GRAVEPLATE_MARSHAL, BLOODPACT_FIEND, RENDFANG_JACKAL],
      },
    },
    {
      id: 't-human-f373',
      name: 'Floor 373',
      enemies: {
        front: [PLATEBOUND_HUSK, PANOPLY_BEARER],
        back: [GRAVEPLATE_MARSHAL, BLOODPACT_FIEND, MIREWHELP],
      },
    },
    {
      id: 't-human-f374',
      name: 'Floor 374',
      enemies: {
        front: [PLATEBOUND_HUSK, PANOPLY_BEARER],
        back: [GRAVEPLATE_MARSHAL, MIREWHELP, BLOODPACT_FIEND],
      },
    },
    {
      id: 't-human-f375',
      name: 'Floor 375',
      enemies: {
        front: [PLATEBOUND_HUSK, PANOPLY_BEARER],
        back: [GRAVEPLATE_MARSHAL, MIREWHELP, BLOODPACT_FIEND],
      },
    },
    {
      id: 't-human-f376',
      name: 'Floor 376',
      enemies: {
        front: [PLATEBOUND_HUSK, PANOPLY_BEARER],
        back: [GRAVEPLATE_MARSHAL, MIREWHELP, PYRE],
      },
    },
    {
      id: 't-human-f377',
      name: 'Floor 377',
      enemies: {
        front: [PLATEBOUND_HUSK, PANOPLY_BEARER],
        back: [GRAVEPLATE_MARSHAL, MIREWHELP, PYRE],
      },
    },
    {
      id: 't-human-f378',
      name: 'Floor 378',
      enemies: {
        front: [PLATEBOUND_HUSK, PANOPLY_BEARER],
        back: [GRAVEPLATE_MARSHAL, PYRE, MIREWHELP],
      },
    },
    {
      id: 't-human-f379',
      name: 'Floor 379',
      enemies: {
        front: [PLATEBOUND_HUSK, PANOPLY_BEARER],
        back: [GRAVEPLATE_MARSHAL, PYRE, UNSEALED_WRETCH],
      },
    },
    {
      id: 't-human-f380',
      name: 'Floor 380 — The Column Armed',
      enemies: {
        front: [PLATEBOUND_HUSK, PANOPLY_BEARER],
        back: [GRAVEPLATE_MARSHAL, SERAPH_ADJUDICANT, BLOODPACT_FIEND],
      },
    },
    {
      id: 't-human-f381',
      name: 'Floor 381',
      enemies: {
        front: [PLATEBOUND_HUSK, PANOPLY_BEARER],
        back: [GRAVEPLATE_MARSHAL, UNSEALED_WRETCH, PYRE],
      },
    },
    {
      id: 't-human-f382',
      name: 'Floor 382',
      enemies: {
        front: [PLATEBOUND_HUSK, PANOPLY_BEARER],
        back: [GRAVEPLATE_MARSHAL, UNSEALED_WRETCH, CINDER_CULLER],
      },
    },
    {
      id: 't-human-f383',
      name: 'Floor 383',
      enemies: {
        front: [PLATEBOUND_HUSK, PANOPLY_BEARER],
        back: [GRAVEPLATE_MARSHAL, UNSEALED_WRETCH, CINDER_CULLER],
      },
    },
    {
      id: 't-human-f384',
      name: 'Floor 384',
      enemies: {
        front: [PLATEBOUND_HUSK, PANOPLY_BEARER],
        back: [GRAVEPLATE_MARSHAL, CINDER_CULLER, UNSEALED_WRETCH],
      },
    },
    {
      id: 't-human-f385',
      name: 'Floor 385',
      enemies: {
        front: [PLATEBOUND_HUSK, PANOPLY_BEARER],
        back: [GRAVEPLATE_MARSHAL, CINDER_CULLER, UNSEALED_WRETCH],
      },
    },
    // -------------------------------------------------------------------------------------
    // The Panoply — Floors 386–400, levels 182–189, Fine 43–Fine 60 — the whole harness, and the muster nobody called.
    // -------------------------------------------------------------------------------------
    {
      id: 't-human-f386',
      name: 'Floor 386',
      enemies: {
        front: [PLATEBOUND_HUSK, PANOPLY_BEARER],
        back: [GRAVEPLATE_MARSHAL, CARRION_SWARM, CINDER_CULLER],
      },
    },
    {
      id: 't-human-f387',
      name: 'Floor 387',
      enemies: {
        front: [PLATEBOUND_HUSK, PANOPLY_BEARER],
        back: [GRAVEPLATE_MARSHAL, CARRION_SWARM, CINDER_CULLER],
      },
    },
    {
      id: 't-human-f388',
      name: 'Floor 388',
      enemies: {
        front: [PLATEBOUND_HUSK, PANOPLY_BEARER],
        back: [GRAVEPLATE_MARSHAL, CARRION_SWARM, CINDER_CULLER],
      },
    },
    {
      id: 't-human-f389',
      name: 'Floor 389',
      enemies: {
        front: [PLATEBOUND_HUSK, PANOPLY_BEARER],
        back: [GRAVEPLATE_MARSHAL, CARRION_SWARM, CINDER_CULLER],
      },
    },
    {
      id: 't-human-f390',
      name: 'Floor 390 — The Last Harness',
      enemies: {
        front: [PLATEBOUND_HUSK, PANOPLY_BEARER],
        back: [GRAVEPLATE_MARSHAL, CINDER_CULLER, CARRION_SWARM],
      },
    },
    {
      id: 't-human-f391',
      name: 'Floor 391',
      enemies: {
        front: [PLATEBOUND_HUSK, PANOPLY_BEARER],
        back: [GRAVEPLATE_MARSHAL, CARRION_SWARM, CINDER_CULLER],
      },
    },
    {
      id: 't-human-f392',
      name: 'Floor 392',
      enemies: {
        front: [PLATEBOUND_HUSK, PANOPLY_BEARER],
        back: [GRAVEPLATE_MARSHAL, CARRION_SWARM, CINDER_CULLER],
      },
    },
    {
      id: 't-human-f393',
      name: 'Floor 393',
      enemies: {
        front: [PLATEBOUND_HUSK, PANOPLY_BEARER],
        back: [GRAVEPLATE_MARSHAL, CARRION_SWARM, CINDER_CULLER],
      },
    },
    {
      id: 't-human-f394',
      name: 'Floor 394',
      enemies: {
        front: [PLATEBOUND_HUSK, PANOPLY_BEARER],
        back: [GRAVEPLATE_MARSHAL, CARRION_SWARM, CINDER_CULLER],
      },
    },
    {
      id: 't-human-f395',
      name: 'Floor 395',
      enemies: {
        front: [PLATEBOUND_HUSK, PANOPLY_BEARER],
        back: [GRAVEPLATE_MARSHAL, CARRION_SWARM, CINDER_CULLER],
      },
    },
    {
      id: 't-human-f396',
      name: 'Floor 396',
      enemies: {
        front: [PLATEBOUND_HUSK, PANOPLY_BEARER],
        back: [GRAVEPLATE_MARSHAL, CARRION_SWARM, CINDER_CULLER],
      },
    },
    {
      id: 't-human-f397',
      name: 'Floor 397',
      enemies: {
        front: [PLATEBOUND_HUSK, PANOPLY_BEARER],
        back: [GRAVEPLATE_MARSHAL, CARRION_SWARM, CINDER_CULLER],
      },
    },
    {
      id: 't-human-f398',
      name: 'Floor 398',
      enemies: {
        front: [PLATEBOUND_HUSK, PANOPLY_BEARER],
        back: [GRAVEPLATE_MARSHAL, CARRION_SWARM, CINDER_CULLER],
      },
    },
    {
      id: 't-human-f399',
      name: 'Floor 399',
      enemies: {
        front: [PLATEBOUND_HUSK, PANOPLY_BEARER],
        back: [GRAVEPLATE_MARSHAL, CARRION_SWARM, CINDER_CULLER],
      },
    },
    {
      id: 't-human-f400',
      name: 'Floor 400 — The Panoply',
      enemies: {
        front: [THE_PANOPLY, CARRION_SWARM],
        back: [CINDER_CULLER, BARROWMIST_KEENER, WISP],
      },
    },
  ],
} as const;
