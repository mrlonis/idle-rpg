import {
  ACOLYTE,
  BANDIT,
  BOAR,
  BULWARK_ENEMY,
  COLOSSUS,
  GOLEM,
  HAG,
  HEADSMAN,
  HIEROPHANT,
  OATHBREAKER,
  PYRE,
  RAVAGER,
  REVENANT,
  RIMEPLATE,
  SENTINEL,
  SHADE,
  SKYSHRIKE,
  SLIME,
  STORMCALLER,
  TYRANT,
  UNMADE,
  WARDEN,
  WISP,
  WRATHBORN,
} from './enemies';

/**
 * Stages that must have been cleared before auto-battle unlocks.
 *
 * Twelve: the whole of the ladder as it stood before this milestone doubled it. The first half is
 * climbed by hand and the second is what auto-battle exists to chew on — a twenty-four stage
 * ladder tapped through one fight at a time would be *worse* than a twelve stage one, so the
 * unlock lands exactly where the new content starts.
 *
 * A count of clears rather than a stage id, because `clearedStages` is the field that keeps
 * counting after `stage` stops climbing at the top of the ladder — see `applyBattleResult`.
 */
export const AUTO_BATTLE_UNLOCK_CLEARS = 12;

/**
 * The stage ladder.
 *
 * One entry is one encounter, fielded in two ranks. Enemies are inlined by reference rather
 * than looked up by id: a lookup would need resolution logic (which `data/` may not contain)
 * and would introduce an "unknown enemy id" failure mode that can only ever be an authoring
 * bug. Repeating a reference fields multiple copies; the simulation numbers them in the log.
 *
 * ## Where an enemy stands is now content
 *
 * The front rank is a **gate**: an ordinary attack has to work through it before it can reach
 * the back. So putting an Acolyte behind two Boars is not decoration, it is the encounter — the
 * question is "can you get there", and the answers are reach (Rin, Malakar, Aelrindel), burst
 * through the front, or losing.
 *
 * ## How difficulty escalates
 *
 * **By `level`, since milestone 10, and by nothing else.** Every archetype in
 * [`enemies.ts`](./enemies.ts) is authored once at level 1 and fielded here at whatever level the
 * stage names; a Tusked Boar at stage 8 and the same Boar at stage 4 are the same fifteen lines of
 * content at two strengths.
 *
 * It used to escalate by authored stat block — no level-scaling factor at all, and bigger blocks
 * written by hand for the second half. That was defensible while the player's own curve spanned a
 * factor of forty. Past a billion it is not: a fixed stat block becomes a rounding error, so every
 * question the ladder had taught would decay into an empty square, and milestone 4's whole thesis
 * — composition matters because enemies ask things of you — would hold only in the early game.
 *
 * **What did not change is what the stages ask.** Each new lock still arrives on its own before it
 * is combined with anything, and the table below is the same table it was. The level is how hard,
 * the line-up is what for, and confusing the two is how a ladder becomes a wall of numbers.
 *
 * Read a stage's level as roughly **the level of the party it was tuned for**, running somewhat
 * above it because the enemy side has no ascension rungs and the player's have to be absorbed
 * somewhere. Stage 12 is level 40 against a party at level 40 with one rung; stage 24 is level 126
 * against a party at level 90 with four.
 *
 * | #  | Stage              | What it asks                                              |
 * | -- | ------------------ | --------------------------------------------------------- |
 * |  1 | Mossy Hollow       | nothing. It exists so the first tap pays.                 |
 * |  2 | Sunken Path        | three bodies instead of two.                              |
 * |  3 | Wisplight Marsh    | something fast, standing behind something else.           |
 * |  4 | Bramble Run        | a real HP pool in front.                                  |
 * |  5 | Cutthroat Camp     | damage that reaches your back rank.                       |
 * |  6 | Thornwood Clearing | five bodies. Single-target damage falls behind.           |
 * |  7 | Marsh Shrine       | **a healer you cannot reach by default.**                |
 * |  8 | Hagfen             | a party-wide debuff, on top of a healer.                  |
 * |  9 | Broken Causeway    | armour that physical damage bounces off.                  |
 * | 10 | Ashen Span         | a refreshed absorb, and a magical wave behind it.         |
 * | 11 | The Warden's Gate  | a stun, and something that dodges half of what you do.    |
 * | 12 | Rimeplate Deep     | both defences up, and three casters behind them.          |
 * | 13 | Ashfall Reach      | **your whole back rank as the target.**                  |
 * | 14 | The Cairn Line     | armour to grind through, with a clock running.            |
 * | 15 | Flensing Grounds   | **penetration: armour stops working.**                   |
 * | 16 | The Kindled Span   | **something that gets worse as you kill it.**            |
 * | 17 | Ravager's Deep     | both of those at once, with nothing your armour answers.  |
 * | 18 | The Hollow Choir   | **a healer and a shielder in one body, behind a wall.**  |
 * | 19 | Gallowmoor         | **an executioner that ignores rank.**                    |
 * | 20 | The Adamant Gate   | **a wall your debuffs bounce off.**                      |
 * | 21 | Bonefall           | **something that kills your wall first.**                |
 * | 22 | The Broken Oath    | five bodies, three locks, and sustain behind them.        |
 * | 23 | Tyrant's Rest      | the wall-breaker and the wall, together.                  |
 * | 24 | The Unmade         | every lock at once.                                       |
 *
 * ## Where the ladder is tuned to
 *
 * Three reference parties, all measured in
 * [`stages.balance.ts`](./stages.balance.ts) rather than asserted here:
 *
 * - **Three level-1 starters clear stages 1–6 and stop dead at the healer lock.** That boundary
 *   is the single most important number in the first half. Two of the five formation slots start
 *   empty, so the stall is not a wall — it is the moment the summon economy becomes the answer,
 *   which is exactly when a new player has banked enough first-clear crystals to do something.
 * - **Five common-tier characters at level 40, ascended once, clear the twelve stages that are
 *   climbed by hand**, and stop soon after. Auto-battle unlocks on finishing that half. Forty is
 *   the `rare` cap, so this is exactly the party a player holds the moment levelling first stops
 *   and ascending starts.
 * - **The same five at level 90, four rungs up at `legendary`, clear the whole ladder**, losing a
 *   member at the top. Still common tier: the second half asks for levels and ascension rungs,
 *   which are bought with time and duplicates, and never for a pull nobody can buy.
 *
 * **Both of those came down in milestone 10** — from level 80 and level 200 — and the reason is
 * the stomp requirement rather than the rescale. Holding them where they were meant the ladder had
 * to absorb the whole of the ×1.6-a-rung ascension gain on top of the levelling one, which left a
 * stage costing seventeen levels where a day of idle income bought six: a wall wearing a
 * compounding curve's clothes. Flattening the ladder is what turns an idle window back into a run
 * of cleared stages, and it is asserted rather than hoped for — see "the stomp" in
 * [`stages.balance.ts`](./stages.balance.ts).
 *
 * ## The three rates, and the one lump
 *
 * `rates` is the real prize. Clearing a stage permanently raises idle income, and a rate
 * compounds with time away in a way a lump sum cannot. Gold runs 0.5/s to 90/s across the ladder;
 * xp and essence are scaled to sit where `levels.ts` needs them, with essence deliberately
 * stingiest.
 *
 * **Three, not four: the crystal rate is not authored here.** It is a flat base plus a step per
 * first clear, held in [`banners.ts`](./banners.ts) as `SUMMON_RATE` and derived from
 * `clearedStages` by `core/`. Authoring it per stage put a compounding rate against a flat pull
 * price, which outruns it exponentially; it also meant one more number to type per stage, which
 * is not a thing anyone maintains at the hundreds of stages milestone 11 wants.
 *
 * **The gold slope decelerates across the second half, from about ×1.4 a stage to about ×1.1.**
 * That is deliberate and it is the one number here worth understanding before changing. The level
 * curve runs to 1000 and is meant to stay out of reach — milestone 11 makes level 1000 a
 * chapter-100 goal, thousands of stages away — so income that kept compounding at ×1.4 would put
 * the ceiling inside a fortnight and delete the vertical axis this milestone exists to protect.
 * [`levels.spec.ts`](./levels.spec.ts) reads its rates off the top of this file and fails when
 * that stops being true.
 *
 * `reward` is the smaller half: a one-off lump paid on every clear, tuned to roughly forty
 * seconds of the income the stage unlocks, so it reads as a bonus rather than as the
 * progression.
 *
 * **Summon crystals are deliberately absent from `reward`.** They accrue idly, and on a first
 * clear, and nowhere else. A repeatable crystal payout would make tap-farming the shortest
 * stage the fastest way to pull — stage 1 resolves in a few seconds — and the correct play in a
 * game about a party climbing a ladder would be to never leave the bottom of it. Tying crystals
 * to the rate and to genuine progress removes that incentive completely rather than balancing
 * against it.
 *
 * That is the same reason the crystal step is a first-clear unlock rather than a per-victory
 * bonus: the ladder pays +1/hr for a stage you have never beaten, and nothing at all for one you
 * have.
 *
 * `firstClearSummons` totals about 17,000 across the ladder — roughly 170 pulls for a full climb.
 * Generous on purpose: duplicates are the primary ascension path, and the top of the ladder is
 * tuned to a party several ascension rungs up, which is a lot of copies.
 */
export const STAGES = [
  {
    id: 'stage-1',
    name: 'Mossy Hollow',
    enemies: { front: [SLIME], back: [SLIME] },
    level: 1,
    reward: { gold: 25, xp: 4 },
    rates: { gold: 0.5, xp: 0.1, essence: 0.0015 },
    firstClearSummons: 200,
  },
  {
    id: 'stage-2',
    name: 'Sunken Path',
    enemies: { front: [SLIME, SLIME], back: [SLIME] },
    level: 2,
    reward: { gold: 40, xp: 8 },
    rates: { gold: 1, xp: 0.2, essence: 0.003 },
    firstClearSummons: 200,
  },
  {
    // First speed check, and the first time the back rank matters: two Wisps act nearly twice
    // as often as anything the party has, and they are standing behind something.
    id: 'stage-3',
    name: 'Wisplight Marsh',
    enemies: { front: [SLIME], back: [WISP, WISP] },
    level: 3,
    reward: { gold: 65, xp: 12 },
    rates: { gold: 1.5, xp: 0.3, essence: 0.005 },
    firstClearSummons: 250,
  },
  {
    id: 'stage-4',
    name: 'Bramble Run',
    enemies: { front: [BOAR], back: [SLIME, SLIME] },
    level: 4,
    reward: { gold: 100, xp: 20, essence: 1 },
    rates: { gold: 2.5, xp: 0.5, essence: 0.008 },
    firstClearSummons: 300,
  },
  {
    // First real damage check, and the first thing that reaches past the front rank: Bandits
    // carry Cutpurse, so a 430-HP Rin standing safely behind two bodies is not safe at all.
    id: 'stage-5',
    name: 'Cutthroat Camp',
    enemies: { front: [BANDIT, BANDIT], back: [WISP, SLIME] },
    level: 5,
    reward: { gold: 160, xp: 32, essence: 1 },
    rates: { gold: 4, xp: 0.8, essence: 0.013 },
    firstClearSummons: 350,
  },
  {
    // The widest wave in the ladder: five bodies, two of them fast. Single-target damage starts
    // losing to volume here, which is what makes Volley, Grave Tide and Ruin Unbound worth a
    // turn.
    id: 'stage-6',
    name: 'Thornwood Clearing',
    enemies: { front: [BOAR, BOAR], back: [WISP, WISP, SLIME] },
    level: 6,
    reward: { gold: 220, xp: 42, essence: 2 },
    rates: { gold: 5.5, xp: 1.05, essence: 0.017 },
    firstClearSummons: 350,
  },
  {
    // The healer lock, and the stage this whole milestone exists for. Two Boars standing in
    // front of an Acolyte that heals for more than a starting party can chip through: the party
    // has to reach past them or lose. "Attack whatever has the least HP" answers this by
    // attacking the Boars forever, which is why milestone 2's targeting could not have posed the
    // question at all.
    //
    // The gap is not subtle. Simulated over many seeds at level 20, a party holding Rin — whose
    // Piercing Shot is free and reaches the back rank — clears this almost every time, and the
    // same party with a Monster in her slot instead clears it almost never. `stages.spec.ts`
    // pins exactly that, because it is the thesis of the whole milestone.
    id: 'stage-7',
    name: 'Marsh Shrine',
    enemies: { front: [BOAR, BOAR], back: [ACOLYTE] },
    level: 16,
    reward: { gold: 300, xp: 56, essence: 2 },
    rates: { gold: 7.5, xp: 1.4, essence: 0.022 },
    firstClearSummons: 400,
  },
  {
    // Debuff plus sustain. The Hag weakens the whole party and slows the front rank, and the
    // Acolyte undoes whatever damage gets through — so the party needs a cleanse *and* reach,
    // which is the first stage that asks for two answers at once.
    id: 'stage-8',
    name: 'Hagfen',
    enemies: { front: [BOAR, BANDIT], back: [HAG, ACOLYTE] },
    level: 16,
    reward: { gold: 400, xp: 74, essence: 3 },
    rates: { gold: 10, xp: 1.85, essence: 0.029 },
    firstClearSummons: 450,
  },
  {
    // The armour check. Almost nothing physical the party does lands for full value against a
    // Golem's armour — 58 by the time it is fielded here — and the Pyre Caster behind it means
    // grinding through slowly is not free either. The Golem's resist is physical only, so this is
    // where a caster earns a slot.
    id: 'stage-9',
    name: 'Broken Causeway',
    enemies: { front: [GOLEM], back: [WISP, PYRE] },
    level: 24,
    reward: { gold: 520, xp: 96, essence: 3 },
    rates: { gold: 13, xp: 2.4, essence: 0.037 },
    firstClearSummons: 500,
  },
  {
    // The absorb lock. A Bulwark re-applies a party-wide barrier faster than chip damage can
    // eat it, so the party needs burst — and the Pyre Caster punishes the all-physical-armour
    // parties that answer everything else.
    id: 'stage-10',
    name: 'Ashen Span',
    enemies: { front: [BULWARK_ENEMY, BOAR], back: [PYRE] },
    level: 33,
    reward: { gold: 650, xp: 120, essence: 5 },
    rates: { gold: 16, xp: 3, essence: 0.05 },
    firstClearSummons: 600,
  },
  {
    // The gate. A Warden takes turns away, a Shade dodges over half of what is aimed at it, and
    // an Acolyte undoes the rest. Accuracy stops being a stat nobody reads.
    id: 'stage-11',
    name: 'The Warden’s Gate',
    enemies: { front: [WARDEN, BANDIT], back: [ACOLYTE, SHADE] },
    level: 40,
    reward: { gold: 800, xp: 152, essence: 6 },
    rates: { gold: 20, xp: 3.8, essence: 0.063 },
    firstClearSummons: 700,
  },
  {
    // The end of the authored ladder, and every lock at once: both defences up in front, three
    // things that punish patience behind. Winnable, expensively, by a built party that brought
    // penetration or a Sunder — and not by anything else.
    id: 'stage-12',
    name: 'Rimeplate Deep',
    enemies: { front: [RIMEPLATE, BULWARK_ENEMY], back: [HAG, PYRE] },
    level: 40,
    reward: { gold: 1000, xp: 188, essence: 8 },
    rates: { gold: 25, xp: 4.7, essence: 0.08 },
    firstClearSummons: 900,
  },

  // -------------------------------------------------------------------------------------
  // The Ashfall Reach — stages 13 to 24
  // -------------------------------------------------------------------------------------

  {
    // The back-rank lock. Twelve stages have rewarded putting the fragile things behind two
    // bodies; two Sky-Shrikes diving the whole back row at once is the bill for that. The
    // encounter is a race the party wins by noticing it — 1,700 HP and almost no armour die
    // quickly to anything that can reach them.
    id: 'stage-13',
    name: 'Ashfall Reach',
    enemies: { front: [REVENANT, REVENANT], back: [SKYSHRIKE, SKYSHRIKE] },
    level: 58,
    reward: { gold: 1160, xp: 218, essence: 9 },
    rates: { gold: 29, xp: 5.4, essence: 0.093 },
    firstClearSummons: 920,
  },
  {
    // Grind, with a clock on it. Two Cairn Sentinels are the most armour on the ladder so far and
    // the Stormcaller behind them makes taking a long time about it expensive.
    id: 'stage-14',
    name: 'The Cairn Line',
    enemies: { front: [SENTINEL, SENTINEL], back: [STORMCALLER] },
    level: 59,
    reward: { gold: 1320, xp: 248, essence: 11 },
    rates: { gold: 33, xp: 6.2, essence: 0.106 },
    firstClearSummons: 940,
  },
  {
    // Penetration arrives. A Ravager ignores nearly half of whichever defence the party bought,
    // which is the first time on the ladder that buying more of a defensive stat is not an answer.
    id: 'stage-15',
    name: 'Flensing Grounds',
    enemies: { front: [RAVAGER, REVENANT], back: [SKYSHRIKE, STORMCALLER] },
    level: 67,
    reward: { gold: 1520, xp: 286, essence: 12 },
    rates: { gold: 38, xp: 7.1, essence: 0.121 },
    firstClearSummons: 960,
  },
  {
    // The escalation lock. Chipping the Wrathborn down is what turns it on, so the fight the party
    // has been winning gets harder at exactly the moment it looks won. Burst through the window,
    // or take the speed back off it with a Slow.
    id: 'stage-16',
    name: 'The Kindled Span',
    enemies: { front: [WRATHBORN, SENTINEL], back: [STORMCALLER, SKYSHRIKE] },
    level: 74,
    reward: { gold: 1720, xp: 323, essence: 14 },
    rates: { gold: 43, xp: 8, essence: 0.137 },
    firstClearSummons: 980,
  },
  {
    // Both of the last two locks at once, and the first stage where armour is worth so little that
    // the party's HP pool is what is actually keeping it alive.
    id: 'stage-17',
    name: "Ravager's Deep",
    enemies: { front: [RAVAGER, RAVAGER], back: [WRATHBORN, STORMCALLER, SKYSHRIKE] },
    level: 80,
    reward: { gold: 1920, xp: 361, essence: 15 },
    rates: { gold: 48, xp: 9, essence: 0.155 },
    firstClearSummons: 1000,
  },
  {
    // A healer and a shielder in one body, standing behind a wall. Chip damage loses to the
    // barrier and burst loses to the heal, so the only answer left is the one the back rank was
    // built around: reach past the front and kill it.
    id: 'stage-18',
    name: 'The Hollow Choir',
    enemies: { front: [SENTINEL, REVENANT], back: [HIEROPHANT, SKYSHRIKE, STORMCALLER] },
    level: 85,
    reward: { gold: 2160, xp: 406, essence: 17 },
    rates: { gold: 54, xp: 10.1, essence: 0.175 },
    firstClearSummons: 1020,
  },
  {
    // The execution lock. A Headsman ignores rank and goes for whoever is closest to dying, which
    // is a demand for sustain aimed somewhere other than the front rank.
    id: 'stage-19',
    name: 'Gallowmoor',
    enemies: { front: [OATHBREAKER, REVENANT], back: [HEADSMAN, HIEROPHANT] },
    level: 100,
    reward: { gold: 2360, xp: 444, essence: 19 },
    rates: { gold: 59, xp: 11.1, essence: 0.196 },
    firstClearSummons: 1040,
  },
  {
    // The tenacity lock. Sunder, Weaken and Slow have answered every large thing below this, and
    // against 0.85 tenacity almost none of them land. What is left is raw damage and penetration.
    id: 'stage-20',
    name: 'The Adamant Gate',
    enemies: { front: [COLOSSUS, OATHBREAKER], back: [HIEROPHANT, STORMCALLER] },
    level: 100,
    reward: { gold: 2600, xp: 489, essence: 21 },
    rates: { gold: 65, xp: 12.2, essence: 0.219 },
    firstClearSummons: 1060,
  },
  {
    // The wall-breaker. A Tyrant attacks the party's largest HP pool rather than through the front
    // rank, so the wall is the first thing to die and a second body does not help.
    id: 'stage-21',
    name: 'Bonefall',
    enemies: { front: [TYRANT, OATHBREAKER], back: [HEADSMAN, STORMCALLER] },
    level: 111,
    reward: { gold: 2840, xp: 534, essence: 23 },
    rates: { gold: 71, xp: 13.3, essence: 0.244 },
    firstClearSummons: 1080,
  },
  {
    // Five bodies and three locks: a wall nothing sticks to, an executioner behind it, and the
    // heal-plus-barrier undoing whatever the party does not finish.
    id: 'stage-22',
    name: 'The Broken Oath',
    enemies: { front: [OATHBREAKER, COLOSSUS], back: [HEADSMAN, HIEROPHANT, STORMCALLER] },
    level: 113,
    reward: { gold: 3080, xp: 579, essence: 25 },
    rates: { gold: 77, xp: 14.4, essence: 0.271 },
    firstClearSummons: 1100,
  },
  {
    // The wall-breaker and the wall, together. Whatever the party puts in front dies to the Tyrant
    // and whatever it puts behind dies to the Headsman.
    id: 'stage-23',
    name: "Tyrant's Rest",
    enemies: { front: [TYRANT, COLOSSUS], back: [HIEROPHANT, OATHBREAKER, HEADSMAN] },
    level: 126,
    reward: { gold: 3320, xp: 624, essence: 27 },
    rates: { gold: 83, xp: 15.5, essence: 0.3 },
    firstClearSummons: 1120,
  },
  {
    // The end of the authored ladder. It takes the biggest thing the party brought, burns the
    // whole party, half-ignores both defences and shrugs off half of what is aimed back —
    // winnable, expensively, by a party that arrived with sustain, reach and penetration, and by
    // nothing that brought only one of them.
    id: 'stage-24',
    name: 'The Unmade',
    enemies: { front: [UNMADE, TYRANT], back: [HIEROPHANT, HEADSMAN, STORMCALLER] },
    level: 126,
    reward: { gold: 3600, xp: 677, essence: 29 },
    rates: { gold: 90, xp: 16.8, essence: 0.33 },
    firstClearSummons: 1150,
  },
] as const;
