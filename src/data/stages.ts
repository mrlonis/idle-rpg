import {
  ACOLYTE,
  BANDIT,
  BOAR,
  BULWARK_ENEMY,
  GOLEM,
  HAG,
  PYRE,
  RIMEPLATE,
  SHADE,
  SLIME,
  WARDEN,
  WISP,
} from './enemies';

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
 * Not by multiplying stats. There is no level scaling here on purpose — the curve has not
 * earned it yet, and a scaling factor is a balance number that would have to live in `data/`
 * anyway. Stages escalate by asking harder questions, and each new lock arrives on its own
 * before it is combined with anything:
 *
 * | # | Stage             | What it asks                                          |
 * | - | ----------------- | ----------------------------------------------------- |
 * | 1 | Mossy Hollow      | nothing. It exists so the first tap pays.             |
 * | 2 | Sunken Path       | three bodies instead of two.                          |
 * | 3 | Wisplight Marsh   | something fast, standing behind something else.       |
 * | 4 | Bramble Run       | a real HP pool in front.                              |
 * | 5 | Cutthroat Camp    | damage that reaches your back rank.                   |
 * | 6 | Thornwood Clearing| five bodies. Single-target damage falls behind.       |
 * | 7 | Marsh Shrine      | **a healer you cannot reach by default.**            |
 * | 8 | Hagfen            | a party-wide debuff, on top of a healer.              |
 * | 9 | Broken Causeway   | armour that physical damage bounces off.              |
 * |10 | Ashen Span        | a refreshed absorb, and a magical wave behind it.     |
 * |11 | The Warden's Gate | a stun, and something that dodges half of what you do.|
 * |12 | Rimeplate Deep    | both defences up, and three casters behind them.      |
 *
 * ## Where the ladder is tuned to
 *
 * **The three starting characters clear stages 1–4 comfortably and stall around 5–6.** That
 * boundary is deliberate and is the single most important number in this file. Two of the five
 * formation slots start empty, so the first stall is not a wall — it is the moment the summon
 * economy becomes the answer, which is exactly when a new player has banked enough first-clear
 * crystals to do something about it.
 *
 * Nothing past stage 6 is meant to fall to three level-1 commons. `stages.spec.ts` asserts both
 * halves of that: the early ladder clears, and the late ladder does not.
 *
 * ## The four rates, and the one lump
 *
 * `rates` is the real prize. Clearing a stage permanently raises idle income on **every**
 * currency, and a rate compounds with time away in a way a lump sum cannot. Gold runs 0.5/s to
 * 25/s across the ladder; the others are scaled to sit where `levels.ts` needs them, with
 * essence deliberately stingiest.
 *
 * `reward` is the smaller half: a one-off lump paid on every clear, tuned to roughly forty
 * seconds of the income the stage unlocks, so it reads as a bonus rather than as the
 * progression.
 *
 * **Summon crystals are deliberately absent from `reward`.** They accrue idly and on a first
 * clear, and nowhere else. A repeatable crystal payout would make tap-farming the shortest
 * stage the fastest way to pull — stage 1 resolves in a few seconds — and the correct play in a
 * game about a party climbing a ladder would be to never leave the bottom of it. Tying crystals
 * to the rate and to genuine progress removes that incentive completely rather than balancing
 * against it.
 *
 * `firstClearSummons` totals 5,000 across the ladder — fifty pulls, five of them as ten-pulls —
 * so a new player who fights their way up fills both empty formation slots and then some.
 */
export const STAGES = [
  {
    id: 'stage-1',
    name: 'Mossy Hollow',
    enemies: { front: [SLIME], back: [SLIME] },
    reward: { gold: 25, xp: 4 },
    rates: { gold: 0.5, xp: 0.1, essence: 0.0015, summons: 0.0015 },
    firstClearSummons: 200,
  },
  {
    id: 'stage-2',
    name: 'Sunken Path',
    enemies: { front: [SLIME, SLIME], back: [SLIME] },
    reward: { gold: 40, xp: 8 },
    rates: { gold: 1, xp: 0.2, essence: 0.003, summons: 0.0025 },
    firstClearSummons: 200,
  },
  {
    // First speed check, and the first time the back rank matters: two Wisps act nearly twice
    // as often as anything the party has, and they are standing behind something.
    id: 'stage-3',
    name: 'Wisplight Marsh',
    enemies: { front: [SLIME], back: [WISP, WISP] },
    reward: { gold: 65, xp: 12 },
    rates: { gold: 1.5, xp: 0.3, essence: 0.005, summons: 0.0035 },
    firstClearSummons: 250,
  },
  {
    id: 'stage-4',
    name: 'Bramble Run',
    enemies: { front: [BOAR], back: [SLIME, SLIME] },
    reward: { gold: 100, xp: 20, essence: 1 },
    rates: { gold: 2.5, xp: 0.5, essence: 0.008, summons: 0.005 },
    firstClearSummons: 300,
  },
  {
    // First real damage check, and the first thing that reaches past the front rank: Bandits
    // carry Cutpurse, so a 430-HP Rin standing safely behind two bodies is not safe at all.
    id: 'stage-5',
    name: 'Cutthroat Camp',
    enemies: { front: [BANDIT, BANDIT], back: [WISP, SLIME] },
    reward: { gold: 160, xp: 32, essence: 1 },
    rates: { gold: 4, xp: 0.8, essence: 0.013, summons: 0.007 },
    firstClearSummons: 350,
  },
  {
    // The widest wave in the ladder: five bodies, two of them fast. Single-target damage starts
    // losing to volume here, which is what makes Volley, Grave Tide and Ruin Unbound worth a
    // turn.
    id: 'stage-6',
    name: 'Thornwood Clearing',
    enemies: { front: [BOAR, BOAR], back: [WISP, WISP, SLIME] },
    reward: { gold: 220, xp: 42, essence: 2 },
    rates: { gold: 5.5, xp: 1.05, essence: 0.017, summons: 0.008 },
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
    reward: { gold: 300, xp: 56, essence: 2 },
    rates: { gold: 7.5, xp: 1.4, essence: 0.022, summons: 0.009 },
    firstClearSummons: 400,
  },
  {
    // Debuff plus sustain. The Hag weakens the whole party and slows the front rank, and the
    // Acolyte undoes whatever damage gets through — so the party needs a cleanse *and* reach,
    // which is the first stage that asks for two answers at once.
    id: 'stage-8',
    name: 'Hagfen',
    enemies: { front: [BOAR, BANDIT], back: [HAG, ACOLYTE] },
    reward: { gold: 400, xp: 74, essence: 3 },
    rates: { gold: 10, xp: 1.85, essence: 0.029, summons: 0.011 },
    firstClearSummons: 450,
  },
  {
    // The armour check. Almost nothing physical the party does lands for full value against 62
    // DEF, and the Pyre Caster behind it means grinding through slowly is not free either. A
    // Golem's `mdef` is only 20 — this is where a caster earns a slot.
    id: 'stage-9',
    name: 'Broken Causeway',
    enemies: { front: [GOLEM], back: [WISP, PYRE] },
    reward: { gold: 520, xp: 96, essence: 3 },
    rates: { gold: 13, xp: 2.4, essence: 0.037, summons: 0.013 },
    firstClearSummons: 500,
  },
  {
    // The absorb lock. A Bulwark re-applies a party-wide barrier faster than chip damage can
    // eat it, so the party needs burst — and the Pyre Caster punishes the all-physical-armour
    // parties that answer everything else.
    id: 'stage-10',
    name: 'Ashen Span',
    enemies: { front: [BULWARK_ENEMY, BOAR], back: [PYRE] },
    reward: { gold: 650, xp: 120, essence: 5 },
    rates: { gold: 16, xp: 3, essence: 0.05, summons: 0.014 },
    firstClearSummons: 600,
  },
  {
    // The gate. A Warden takes turns away, a Shade dodges over half of what is aimed at it, and
    // an Acolyte undoes the rest. Accuracy stops being a stat nobody reads.
    id: 'stage-11',
    name: 'The Warden’s Gate',
    enemies: { front: [WARDEN, BANDIT], back: [ACOLYTE, SHADE] },
    reward: { gold: 800, xp: 152, essence: 6 },
    rates: { gold: 20, xp: 3.8, essence: 0.063, summons: 0.016 },
    firstClearSummons: 700,
  },
  {
    // The end of the authored ladder, and every lock at once: both defences up in front, three
    // things that punish patience behind. Winnable, expensively, by a built party that brought
    // penetration or a Sunder — and not by anything else.
    id: 'stage-12',
    name: 'Rimeplate Deep',
    enemies: { front: [RIMEPLATE, BULWARK_ENEMY], back: [HAG, PYRE] },
    reward: { gold: 1000, xp: 188, essence: 8 },
    rates: { gold: 25, xp: 4.7, essence: 0.08, summons: 0.018 },
    firstClearSummons: 900,
  },
] as const;
