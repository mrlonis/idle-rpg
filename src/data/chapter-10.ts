import {
  BANDIT,
  BARROW_SOVEREIGN,
  BARROWMIST_KEENER,
  BLOODGORGE_HOUND,
  BOAR,
  BRAMBLEHIDE_RAVENER,
  CAIRNWARD_HUSK,
  CARRION_SWARM,
  COLDFORGE_HAND,
  COLDHEARTH_IRONSWORN,
  DEEPGALLERY_RUNNER,
  FREE_BLADE,
  GLOAMVINE_CREEPER,
  GOLEM,
  GOREHIDE_MATRIARCH,
  GRAVEWAKE_THRALL,
  HOLLOWBARK_SENTRY,
  LONGBOUGH_MARKSMAN,
  MIREWHELP,
  OATHBREAKER,
  RAVAGER,
  REDWATER_STALKER,
  RENDFANG_JACKAL,
  RIMEPLATE,
  SCARBOUND_BELLOWER,
  SEPULCHRE_HOUND,
  SLAGBOUND_DRUDGE,
  SLIME,
  THE_EVERWOUND,
  THE_REDMAW,
  THORNBACK_GRAZER,
  TYRANT,
  WEALDSHADOW_STALKER,
  WHISPERLEAF_ARCHER,
} from './enemies';

/**
 * Chapter 10 — The Bleeding Wild.
 *
 * Fifty stages, enemy levels 490 to 588. It **opens at the level chapter 9 closed on**, which is the
 * rule every chapter boundary follows: a name change and a boss behind you, not a step.
 *
 * ## What it asks that the Hollow Anvil did not
 *
 * The barrows asked *how* the party's damage arrives, the weald *where* it lands, and the anvil
 * whether **anything the party does stays done**. This one asks what the party's damage **does to
 * the thing it is spent on**. Nine chapters have taught that damage is simply progress — spend it
 * anywhere, and the board is that much closer to gone. Out here what the party puts into a body is
 * what arms it, and what it takes back does not stop.
 *
 * | Band              | Stages | The lock it teaches                                     |
 * | ----------------- | ------ | ------------------------------------------------------- |
 * | The wounded thing | 1–10   | hurting it is what arms it                              |
 * | The red water     | 11–20  | what it does to you does not come off by itself         |
 * | The pack          | 21–30  | what you spread, you feed                               |
 * | The bellow        | 31–40  | the one thing you may hit is the one you must not wound |
 * | The bleeding wild | 41–50  | all four, on a body that grows as it dies               |
 *
 * ⚠️ **Both of milestone 21's remaining statuses are spent here, and they are the milestone's last.**
 * 21a spent none of the three, 21b spent one, 21c spent none. {@link BLOODRISEN} is the first status
 * conditioned on the holder's own wound that does not lapse, and {@link SAVAGED} is the first hostile
 * status in the game that never expires — so it is the first time a cleanse is the *only* way out
 * rather than a way to take less. Both arguments live in [`statuses.ts`](./statuses.ts).
 *
 * **Bands 1 and 2 are the two statuses; bands 3 and 4 are pairs of shipped parts.** The pack is
 * `lifeLeech` — the faction's own idiom since milestone 8e — standing on boards wide enough that
 * chipping them arms everything, and the bellow is a taunt worn by a body carrying the chapter's own
 * frenzy. ⚠️ **That last is deliberately the Hollow Anvil's pair with a different sentence in it**:
 * there the one thing the party could hit was the one thing it could not *open*, and here it is the
 * one thing it must not **wound**.
 *
 * ## Where the levels come from
 *
 * 490 to 588, almost exactly two levels a stage against the Anvil's 1.9 and the Weald's 1.8.
 * `ascended` caps at 500, so the margin is **+88** where chapter 9's was +70, chapter 8's +56 and
 * chapter 7's +45.
 *
 * ⚠️ **The roadmap said ~570 and that is a walkover** — the party the chapter is tuned for takes it
 * with all five alive in eight seconds. Bisecting instead: **100% at 592, 68% at 594, 25% at 596 and
 * 5% at 598**, which is the same step function every chapter since the weald has run into. Backing
 * off the edge to where the tuned party keeps four of five lands at 588.
 *
 * | Chapter | Party                   | Margin  | Ratio |
 * | ------- | ----------------------- | ------- | ----- |
 * | 7       | `legendary-plus` at 260 | +45     | ~1.16 |
 * | 8       | `mythic` at 340         | +56     | 1.10  |
 * | 9       | `mythic-plus` at 420    | +70     | 1.21  |
 * | 10      | `ascended` at 500       | **+88** | 1.12  |
 *
 * ⚠️ **The margin has now grown every chapter and the closed form has under-predicted it twice
 * running.** 21b's corrected rule — "+23 a chapter less whatever the enemy's own curve has taken" —
 * pointed at ~+70 here, four levels short of what 21c measured for chapter 9 and eighteen short of
 * this. The arithmetic is a starting bracket; the bisect is the answer.
 *
 * Still no lucky pull anywhere on the ladder: the rung is **sixty-two** duplicate copies of each of
 * the five, ten more than chapter 9 asked for, and every one of them is bought with time. ⚠️ **Ten
 * rather than the six the last two chapters cost**, because `MORTAL_LADDER` alternates a cheap rung
 * with an expensive one and `ascended` is an expensive one — the odd rungs run 3, 4, 5, 6 and the
 * even ones 7, 8, 9, 10.
 *
 * ## What it draws on
 *
 * Thirty-two archetypes excluding the lieutenant and the boss: **eight new, twenty-four returning** —
 * exactly the quarter milestone 21 asks of a chapter, measured over what the chapter *fields* rather
 * than over the shipped pool. All seven Monster blocks the ladder already had are fielded here for
 * the reason the anvil fielded every Dwarven one: this is where they live. The rest is the hold's
 * last patrol at the seam, the weald's edge along one side, and the scavengers that follow a land
 * that bleeds.
 *
 * ⚠️ **No celestial appears anywhere in this chapter, and it was checked against the boards rather
 * than asserted.** An Angel or a Demon deals ×1.10 to every mortal with no mortal → celestial row to
 * answer it — a standing multiplier on the enemy's damage that no composition addresses. This
 * chapter's own signature *is* a growing multiplier on the enemy's damage, earned rather than free,
 * and two of those on one board is the same tax twice.
 *
 * ⚠️ **The Everwound is the tenth body authored under the rule that a chapter's final is fielded
 * nowhere else**, and no other chapter's final appears here — which is why The Fenlord is absent
 * from a chapter of Monsters that would otherwise be its own.
 *
 * ## Three authoring rules this chapter runs on
 *
 * 1. ⚠️ **At most one taunt source per board**, unchanged since chapter 7. {@link SCARBOUND_BELLOWER}
 *    is the only block here that can taunt, which makes the rule free — and it is the rule that
 *    keeps a forty-five tick status against a sixty-tick cooldown from shutting the door for a whole
 *    fight.
 * 2. ⚠️ **Nothing that puts health back stands on a board with a taunt.** A taunt narrows the target
 *    pool *before* the row rule is consulted, so sustain the party cannot aim at is a ninety-second
 *    clock and a timeout is scored as a **defeat**. Here that rules out {@link BLOODGORGE_HOUND},
 *    {@link BRAMBLEHIDE_RAVENER} and {@link BARROW_SOVEREIGN} wherever the Bellower stands, and each
 *    appears only on boards with no taunt on them.
 * 3. ⚠️ **`lifeLeech` and {@link BLOODRISEN} never stand on the same block.** A body that hits harder
 *    for being hurt and heals from hitting is a closed loop, and a closed loop against a rising
 *    damage multiplier is the one shape of this chapter that could run the clock out. The leech
 *    lives on one legendary and nothing else carries it.
 */
export const CHAPTER_10 = {
  id: 'chapter-10',
  name: 'The Bleeding Wild',
  stages: [
    // -----------------------------------------------------------------------------------
    // The wounded thing — stages 1 to 10, levels 490 to 508
    // -----------------------------------------------------------------------------------
    {
      // The seam, at the Anvil's own closing level: the hold's last patrol standing in the gate it
      // was holding, and the first two things from outside it. The fight the party that took The
      // Anvil Crowned already knows how to have — except that the whelp it chipped on the way past
      // is a third stronger for the rest of it, and nothing on screen says why.
      id: 'c10-s1',
      name: 'The Hold Gate',
      enemies: {
        front: [COLDHEARTH_IRONSWORN, MIREWHELP],
        back: [COLDFORGE_HAND, SLAGBOUND_DRUDGE, MIREWHELP],
      },
      level: 490,
    },
    {
      // The lock stated plainly, on nothing but fodder. Neither of these is dangerous and both get
      // worse for being touched, which is the whole of what {@link BLOOD_RISEN} is: a tax on the
      // habit of spending damage everywhere rather than on the damage itself.
      id: 'c10-s2',
      name: 'Whelping Ground',
      enemies: {
        front: [MIREWHELP, THORNBACK_GRAZER],
        back: [MIREWHELP, CARRION_SWARM],
      },
      level: 492,
    },
    {
      // ⚠️ A probe sample, and the first in the chapter — `c10-s1` is skipped, because a sample
      // following a chapter boss is a step down by construction.
      id: 'c10-s3',
      name: 'The Torn Verge',
      enemies: {
        front: [THORNBACK_GRAZER, MIREWHELP],
        back: [MIREWHELP, CARRION_SWARM, WHISPERLEAF_ARCHER],
      },
      level: 494,
    },
    {
      id: 'c10-s4',
      name: 'Sloughwater',
      enemies: {
        front: [BOAR, MIREWHELP],
        back: [CARRION_SWARM, SLIME, DEEPGALLERY_RUNNER],
      },
      level: 496,
    },
    {
      // The Grazer at weight: fodder the party cannot clear in one turn, so the frenzy stops being
      // a matter of whether and becomes a matter of when.
      id: 'c10-s5',
      name: 'The Grazing Herd',
      enemies: {
        front: [THORNBACK_GRAZER, BOAR],
        back: [MIREWHELP, MIREWHELP, LONGBOUGH_MARKSMAN],
      },
      level: 498,
    },
    {
      id: 'c10-s6',
      name: 'Stonefall Scree',
      enemies: {
        front: [GOLEM, HOLLOWBARK_SENTRY],
        back: [CARRION_SWARM, CARRION_SWARM, MIREWHELP],
      },
      level: 500,
    },
    {
      // ⚠️ A probe sample, and the band's other half: the Matriarch does not kill anything, it arms
      // whatever the party has already committed to. This is what stops band 1 resolving into
      // "finish what you start" — the frenzy now arrives on a turn the party does not control.
      id: 'c10-s7',
      name: 'Blood Calls Blood',
      enemies: {
        front: [THORNBACK_GRAZER, MIREWHELP],
        back: [GOREHIDE_MATRIARCH, CARRION_SWARM, WHISPERLEAF_ARCHER],
      },
      level: 502,
    },
    {
      id: 'c10-s8',
      name: 'The Long Grass',
      enemies: {
        front: [BOAR, THORNBACK_GRAZER],
        back: [GOREHIDE_MATRIARCH, MIREWHELP, LONGBOUGH_MARKSMAN],
      },
      level: 504,
    },
    {
      id: 'c10-s9',
      name: 'What the Herd Remembers',
      enemies: {
        front: [GOLEM, THORNBACK_GRAZER],
        back: [GOREHIDE_MATRIARCH, CARRION_SWARM, WEALDSHADOW_STALKER],
      },
      level: 506,
    },
    {
      // Mini-boss, and the lieutenant's first appearance. ⚠️ **The same block stands on all four**,
      // at 508, 528, 548 and 568 — a recurring antagonist that gets harder because the ladder does,
      // rather than four one-shot stat blocks.
      //
      // ⚠️ **Reactive rather than an opening turn**, which is {@link THE_GRUDGEKEEPER}'s shape and
      // the second chapter running to take it — and here it is forced rather than chosen. A chapter
      // about what the party's damage *does* cannot state its lock before the party has dealt any.
      id: 'c10-s10',
      name: 'The Redmaw',
      enemies: {
        front: [THE_REDMAW, THORNBACK_GRAZER],
        back: [MIREWHELP, GOREHIDE_MATRIARCH, CARRION_SWARM],
      },
      level: 508,
    },

    // -----------------------------------------------------------------------------------
    // The red water — stages 11 to 20, levels 510 to 528
    // -----------------------------------------------------------------------------------
    {
      // ⚠️ **A band opener that is also a probe sample, which is the trap chapters 6, 7 and 8 all
      // fell into.** Band openings want to be light and the stride does not care, so this is
      // authored heavy on purpose: five bodies, a legendary pair in front, and both of the band's
      // planters already behind them. The fix for a step backwards is weight, never +3 enemy
      // levels — that would fight the level curve for about thirteen percent and lose.
      id: 'c10-s11',
      name: 'The Red Water',
      enemies: {
        front: [RIMEPLATE, REDWATER_STALKER],
        back: [RENDFANG_JACKAL, RENDFANG_JACKAL, WHISPERLEAF_ARCHER],
      },
      level: 510,
    },
    {
      id: 'c10-s12',
      name: 'Outriders',
      enemies: {
        front: [RENDFANG_JACKAL, FREE_BLADE],
        back: [REDWATER_STALKER, CARRION_SWARM, WHISPERLEAF_ARCHER],
      },
      level: 512,
    },
    {
      // Three planters against one cleanse. A single {@link RAKE} is answered on the turn it lands;
      // three of them is the party deciding which of its members bleeds until the fight is over.
      id: 'c10-s13',
      name: 'Three Wounds',
      enemies: {
        front: [THORNBACK_GRAZER, RENDFANG_JACKAL],
        back: [RENDFANG_JACKAL, RENDFANG_JACKAL, LONGBOUGH_MARKSMAN],
      },
      level: 514,
    },
    {
      id: 'c10-s14',
      name: 'Gloamvine Hollow',
      enemies: {
        front: [BOAR, RENDFANG_JACKAL],
        back: [REDWATER_STALKER, CARRION_SWARM, GLOAMVINE_CREEPER],
      },
      level: 516,
    },
    {
      // ⚠️ A probe sample. The Stalker goes past the wall at the party's own back rank, where the
      // healer stands — and a healer carrying a wound that never closes is a healer choosing between
      // mending somebody else and stopping its own.
      id: 'c10-s15',
      name: 'The Opened Vein',
      enemies: {
        front: [RIMEPLATE, RENDFANG_JACKAL],
        back: [REDWATER_STALKER, RENDFANG_JACKAL, WEALDSHADOW_STALKER],
      },
      level: 518,
    },
    {
      id: 'c10-s16',
      name: 'Slow Ground',
      enemies: {
        front: [GOLEM, MIREWHELP],
        back: [REDWATER_STALKER, RENDFANG_JACKAL, WHISPERLEAF_ARCHER],
      },
      level: 520,
    },
    {
      // What follows a land that bleeds. The barrows' scavengers are the one returning faction that
      // needed no excuse to be here.
      id: 'c10-s17',
      name: 'Carrion Road',
      enemies: {
        front: [SEPULCHRE_HOUND, RENDFANG_JACKAL],
        back: [REDWATER_STALKER, GRAVEWAKE_THRALL, BANDIT],
      },
      level: 522,
    },
    {
      // Two Stalkers, so both of the party's back-rank members are carrying a wound the cleanse can
      // only reach one of at a time.
      id: 'c10-s18',
      name: 'Both Wells Open',
      enemies: {
        front: [THORNBACK_GRAZER, SEPULCHRE_HOUND],
        back: [REDWATER_STALKER, REDWATER_STALKER, CARRION_SWARM],
      },
      level: 524,
    },
    {
      // ⚠️ A probe sample, and the band's hardest form: the wounds do not close, and the Matriarch
      // is arming whatever the party spends its cleanse-turn not killing.
      id: 'c10-s19',
      name: 'Nothing Closes',
      enemies: {
        front: [RIMEPLATE, REDWATER_STALKER],
        back: [REDWATER_STALKER, RENDFANG_JACKAL, GOREHIDE_MATRIARCH],
      },
      level: 526,
    },
    {
      // Mini-boss. The lieutenant with the band's lock beside it: every body the party leaves
      // standing is bleeding one of its own, and the pack answers the moment anything is chipped.
      id: 'c10-s20',
      name: "The Redmaw's Water",
      enemies: {
        front: [THE_REDMAW, RENDFANG_JACKAL],
        back: [REDWATER_STALKER, RENDFANG_JACKAL, CARRION_SWARM],
      },
      level: 528,
    },

    // -----------------------------------------------------------------------------------
    // The pack — stages 21 to 30, levels 530 to 548
    // -----------------------------------------------------------------------------------
    {
      // A band opener that is **not** a probe sample — the stride puts those on s23 and s27 in this
      // band — so this is free to be what a band opening wants to be: the lock taught small, one
      // leeching body behind two things that die easily.
      id: 'c10-s21',
      name: 'The Drinking Pack',
      enemies: {
        front: [BLOODGORGE_HOUND, MIREWHELP],
        back: [CARRION_SWARM, CARRION_SWARM, RENDFANG_JACKAL],
      },
      level: 530,
    },
    {
      id: 'c10-s22',
      name: 'Thin Blood',
      enemies: {
        front: [BLOODGORGE_HOUND, THORNBACK_GRAZER],
        back: [CARRION_SWARM, MIREWHELP, WHISPERLEAF_ARCHER],
      },
      level: 532,
    },
    {
      // ⚠️ A probe sample, and the band at legendary weight. Two bodies that are paid for every blow
      // they land, in front of the thing that arms whatever the party is killing — so a long fight
      // is the pack's plan rather than the party's.
      id: 'c10-s23',
      name: 'What You Spread',
      enemies: {
        front: [BLOODGORGE_HOUND, BRAMBLEHIDE_RAVENER],
        back: [CARRION_SWARM, RENDFANG_JACKAL, GOREHIDE_MATRIARCH],
      },
      level: 534,
    },
    {
      id: 'c10-s24',
      name: 'The Swarming Fen',
      enemies: {
        front: [BOAR, BLOODGORGE_HOUND],
        back: [CARRION_SWARM, CARRION_SWARM, LONGBOUGH_MARKSMAN],
      },
      level: 536,
    },
    {
      id: 'c10-s25',
      name: 'Feeding Time',
      enemies: {
        front: [BLOODGORGE_HOUND, MIREWHELP],
        back: [GOREHIDE_MATRIARCH, RENDFANG_JACKAL, WEALDSHADOW_STALKER],
      },
      level: 538,
    },
    {
      id: 'c10-s26',
      name: 'The Old Stones',
      enemies: {
        front: [GOLEM, BLOODGORGE_HOUND],
        back: [CARRION_SWARM, REDWATER_STALKER, GLOAMVINE_CREEPER],
      },
      level: 540,
    },
    {
      // ⚠️ A probe sample. Two Hounds, and the arithmetic the band is built on: the party's damage
      // is spread across five bodies, four of them get worse for it, and the two in front are being
      // paid for the trouble.
      id: 'c10-s27',
      name: 'Both Throats',
      enemies: {
        front: [BLOODGORGE_HOUND, BLOODGORGE_HOUND],
        back: [GOREHIDE_MATRIARCH, CARRION_SWARM, RENDFANG_JACKAL],
      },
      level: 542,
    },
    {
      id: 'c10-s28',
      name: 'The Husk Field',
      enemies: {
        front: [CAIRNWARD_HUSK, BLOODGORGE_HOUND],
        back: [REDWATER_STALKER, CARRION_SWARM, BARROWMIST_KEENER],
      },
      level: 544,
    },
    {
      id: 'c10-s29',
      name: 'Barbed Country',
      enemies: {
        front: [RAVAGER, BLOODGORGE_HOUND],
        back: [GOREHIDE_MATRIARCH, REDWATER_STALKER, CARRION_SWARM],
      },
      level: 546,
    },
    {
      // Mini-boss. The lieutenant on a board that drinks: one chipped body wakes the pack, and the
      // two that were feeding while it happened are the ones still standing.
      id: 'c10-s30',
      name: "The Redmaw's Pack",
      enemies: {
        front: [THE_REDMAW, BLOODGORGE_HOUND],
        back: [CARRION_SWARM, GOREHIDE_MATRIARCH, RENDFANG_JACKAL],
      },
      level: 548,
    },

    // -----------------------------------------------------------------------------------
    // The bellow — stages 31 to 40, levels 550 to 568
    // -----------------------------------------------------------------------------------
    {
      // ⚠️ **The second band opener on a probe sample, and it is heavy for the reason `c10-s11`
      // is.** Two legendaries in front, the band's lock already up, and the two supports behind
      // them. Weight rather than levels: composition moves difficulty by far more than a level does.
      //
      // ⚠️ No leech anywhere on this board or on any board the Bellower stands on. A taunt in front
      // of something that puts health back is the ninety-second timeout wearing a lock's clothes.
      id: 'c10-s31',
      name: 'The Bellow',
      enemies: {
        front: [SCARBOUND_BELLOWER, RIMEPLATE],
        back: [GOREHIDE_MATRIARCH, REDWATER_STALKER, RENDFANG_JACKAL],
      },
      level: 550,
    },
    {
      id: 'c10-s32',
      name: 'Nothing Else to Hit',
      enemies: {
        front: [SCARBOUND_BELLOWER, MIREWHELP],
        back: [RENDFANG_JACKAL, CARRION_SWARM, WHISPERLEAF_ARCHER],
      },
      level: 552,
    },
    {
      id: 'c10-s33',
      name: 'The Scarred Ground',
      enemies: {
        front: [SCARBOUND_BELLOWER, THORNBACK_GRAZER],
        back: [GOREHIDE_MATRIARCH, CARRION_SWARM, LONGBOUGH_MARKSMAN],
      },
      level: 554,
    },
    {
      id: 'c10-s34',
      name: 'Stone and Scar',
      enemies: {
        front: [GOLEM, SCARBOUND_BELLOWER],
        back: [REDWATER_STALKER, RENDFANG_JACKAL, WEALDSHADOW_STALKER],
      },
      level: 556,
    },
    {
      // ⚠️ A probe sample. The door is shut and what is behind it is quick: a Ravager's pierce goes
      // through the party's wall while the party is obliged to be hitting something else.
      id: 'c10-s35',
      name: 'Barbs at the Door',
      enemies: {
        front: [SCARBOUND_BELLOWER, RAVAGER],
        back: [GOREHIDE_MATRIARCH, RENDFANG_JACKAL, CARRION_SWARM],
      },
      level: 558,
    },
    {
      // ⚠️ **The Sepulchre Hound belongs on this board by every other measure and cannot stand on
      // it**: it carries `lifeLeech: 0.1`, and rule 2 forbids anything that puts health back from
      // sharing a board with the Bellower. It was authored here anyway and caught by checking the
      // boards against the header rather than by reading them — which is the third time in four
      // chapters a chapter's own absolute claim has been wrong about its own boards. The Keener is
      // the same faction at the same weight with nothing to refill.
      id: 'c10-s36',
      name: 'The Scavengers Wait',
      enemies: {
        front: [SCARBOUND_BELLOWER, BOAR],
        back: [REDWATER_STALKER, GRAVEWAKE_THRALL, BARROWMIST_KEENER],
      },
      level: 560,
    },
    {
      id: 'c10-s37',
      name: 'The Oathbreaker in the Grass',
      enemies: {
        front: [OATHBREAKER, SCARBOUND_BELLOWER],
        back: [GOREHIDE_MATRIARCH, RENDFANG_JACKAL, WHISPERLEAF_ARCHER],
      },
      level: 562,
    },
    {
      id: 'c10-s38',
      name: 'Two Wells and a Wall',
      enemies: {
        front: [SCARBOUND_BELLOWER, RIMEPLATE],
        back: [REDWATER_STALKER, REDWATER_STALKER, CARRION_SWARM],
      },
      level: 564,
    },
    {
      // ⚠️ A probe sample, and the band's hardest form: the only legal target arms itself while the
      // heaviest body on the field is free to work. The answer is the one a taunt has always left —
      // kill the door inside its window, or bring a row attack and spend its own turns past it.
      id: 'c10-s39',
      name: 'The Door and the Tyrant',
      enemies: {
        front: [SCARBOUND_BELLOWER, TYRANT],
        back: [GOREHIDE_MATRIARCH, REDWATER_STALKER, RENDFANG_JACKAL],
      },
      level: 566,
    },
    {
      // Mini-boss, and the last time the lieutenant is met. Every question the chapter has asked
      // except the last one: the door is shut by a body that gets stronger for being opened, the
      // party's wounds do not close, and one chipped body wakes everything still standing.
      id: 'c10-s40',
      name: 'The Redmaw Unbled',
      enemies: {
        front: [THE_REDMAW, SCARBOUND_BELLOWER],
        back: [GOREHIDE_MATRIARCH, REDWATER_STALKER, RENDFANG_JACKAL],
      },
      level: 568,
    },

    // -----------------------------------------------------------------------------------
    // The bleeding wild — stages 41 to 50, levels 570 to 588
    // -----------------------------------------------------------------------------------
    {
      // A band opener that is not a probe sample, so it is allowed to be the quiet one — and what it
      // is quiet about is that the heaviest thing in the game's Monster roster is now ordinary here.
      id: 'c10-s41',
      name: 'Under an Open Sky',
      enemies: {
        front: [TYRANT, MIREWHELP],
        back: [GOREHIDE_MATRIARCH, RENDFANG_JACKAL, CARRION_SWARM],
      },
      level: 570,
    },
    {
      // The barrows' own sovereign, out where the dead are not buried. Nothing taunts here, which is
      // the only shape in which this chapter is allowed to field something that puts health back.
      id: 'c10-s42',
      name: "The Sovereign's Range",
      enemies: {
        front: [BARROW_SOVEREIGN, THORNBACK_GRAZER],
        back: [REDWATER_STALKER, RENDFANG_JACKAL, BARROWMIST_KEENER],
      },
      level: 572,
    },
    {
      // ⚠️ A probe sample. Band 3 at ascended weight: the pack still drinks, and the thing in front
      // of it is the thing the party cannot afford to leave standing.
      id: 'c10-s43',
      name: 'The Pack and the Tyrant',
      enemies: {
        front: [TYRANT, BLOODGORGE_HOUND],
        back: [GOREHIDE_MATRIARCH, REDWATER_STALKER, CARRION_SWARM],
      },
      level: 574,
    },
    {
      id: 'c10-s44',
      name: 'Thorn and Bramble',
      enemies: {
        front: [OATHBREAKER, BRAMBLEHIDE_RAVENER],
        back: [GOREHIDE_MATRIARCH, RENDFANG_JACKAL, WEALDSHADOW_STALKER],
      },
      level: 576,
    },
    {
      id: 'c10-s45',
      name: 'The Last Herd',
      enemies: {
        front: [SCARBOUND_BELLOWER, RIMEPLATE],
        back: [REDWATER_STALKER, GOREHIDE_MATRIARCH, RENDFANG_JACKAL],
      },
      level: 578,
    },
    {
      id: 'c10-s46',
      name: 'Red Country',
      enemies: {
        front: [TYRANT, THORNBACK_GRAZER],
        back: [REDWATER_STALKER, REDWATER_STALKER, CARRION_SWARM],
      },
      level: 580,
    },
    {
      // ⚠️ A probe sample. Band 4 at its heaviest: an ascended body beside the door, and everything
      // behind it arming whatever the party is obliged to be hitting.
      id: 'c10-s47',
      name: 'What the Wild Keeps',
      enemies: {
        front: [OATHBREAKER, SCARBOUND_BELLOWER],
        back: [GOREHIDE_MATRIARCH, REDWATER_STALKER, RENDFANG_JACKAL],
      },
      level: 582,
    },
    {
      id: 'c10-s48',
      name: 'The Drinking Dead',
      enemies: {
        front: [BARROW_SOVEREIGN, BLOODGORGE_HOUND],
        back: [GOREHIDE_MATRIARCH, CARRION_SWARM, RENDFANG_JACKAL],
      },
      level: 584,
    },
    {
      // ⚠️ A probe sample, and the last one before the final. The chapter's two heaviest returning
      // bodies with the two blocks it was built out of behind them.
      id: 'c10-s49',
      name: 'The Way Out of the Wild',
      enemies: {
        front: [TYRANT, SCARBOUND_BELLOWER],
        back: [GOREHIDE_MATRIARCH, REDWATER_STALKER, CARRION_SWARM],
      },
      level: 586,
    },
    {
      // ⚠️ The chapter boss, and the tenth body on the ladder standing on exactly one stage. Three of
      // the chapter's four questions are on The Everwound alone and all three are the same question
      // at three widths: it arms itself when the party hurts it, it arms the whole board when
      // anything else is hurt, and {@link THE_LONG_BLEED} puts a wound on all five members that only
      // a cleanse will ever close.
      //
      // ⚠️ **The Bellower wears the taunt rather than the Everwound**, which is 21a's finding and not
      // this chapter's to re-derive: a boss that draws every attack onto itself aims them at the body
      // the party was going to focus anyway. Here it would be worse than neutral — it would hand the
      // party the one thing this chapter is built to withhold, which is a safe place to spend damage.
      //
      // **The Redmaw does not stand here, and that is this chapter's choice rather than a rule.**
      // What the rule forbids is a lieutenant being *the* fight; as support it is permitted, and
      // `c7-s50` fields the Gravewright for exactly that reason. This board does not need it: it
      // measures 4.00 survivors out of five. ⚠️ **Check the survivor count before copying either
      // choice**, because nothing asserts it once a later chapter takes over the top of the ladder.
      //
      // Deliberately **no healing, no drain, no shield and no leech anywhere on it**. A boss that
      // grew *harder to kill* as it was hurt is this chapter's idea pointed at the ninety-second
      // clock; everything standing here shortens the fight from one side or the other.
      id: 'c10-s50',
      name: 'The Everwound',
      enemies: {
        front: [THE_EVERWOUND, SCARBOUND_BELLOWER],
        back: [GOREHIDE_MATRIARCH, REDWATER_STALKER, RENDFANG_JACKAL],
      },
      level: 588,
    },
  ],
} as const;
