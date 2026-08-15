import {
  AEGIS,
  BARRIER,
  BLEED,
  BLOODRISEN,
  BURN,
  CHAINBOND,
  DOOMBRAND,
  EMBER_SEED,
  GUARD,
  HASTE,
  HEXBRAND,
  OATHSHIELD,
  POISON,
  RALLY,
  REGENERATION,
  ROOTBOUND,
  SAVAGED,
  SLOW,
  STUN,
  SUNDER,
  THORNMAIL,
  WEAKEN,
} from './statuses';

/**
 * Every skill in the game.
 *
 * Plain data, and the only file that knows what a character or an enemy actually *does*.
 * `characters.ts` and `enemies.ts` are stat blocks that point here, which keeps a stat line
 * readable and means a kit can be retuned without touching the numbers it is attached to.
 *
 * ## How a turn is decided
 *
 * `core/battle/skills.ts` walks a combatant's kit in descending `priority` and takes the first
 * skill whose condition holds, whose cooldown has elapsed, that it can pay for, and that has
 * somebody to hit. Failing all of those it swings. So a kit is a **preference list**, and the
 * three ways to say "not this turn" are a condition, a cooldown and a price.
 *
 * ## Two ways to meter a skill, since milestone 8b
 *
 * - **Ordinary** — free, and metered by its cooldown alone. Always eventually available, so each
 *   one has to be individually weaker.
 * - **`ultimate: true`** — metered by a full energy bar and nothing else. No cooldown; the bar is
 *   the cooldown. **Every playable character declares exactly one**, asserted in
 *   `characters.spec.ts`.
 *
 * It was three before. `mp` was a pool that started full and ran dry, and `hp` was the Undead
 * paying for tempo in their own life. Both went with the MP stat, and what replaced the second of
 * them is worth reading in the Undead section below — the faction kept its bargain by inverting
 * it rather than by losing it.
 *
 * ## An ultimate opens a fight unavailable, which is the whole change
 *
 * A cooldown skill is ready on turn one; MP was full on turn one. An energy bar is **empty** on
 * turn one and fills from fighting. So the shape of a fight moved: the opening is basic attacks
 * and cheap cooldowns, and the marquee turns arrive once both sides have committed. A kit's
 * ultimate is therefore its answer to a fight going long, not its opener — and authoring one that
 * only makes sense in the first ten seconds is the mistake this section exists to prevent.
 *
 * A **condition on an ultimate means "wait", never "never".** A healer holding its bar until
 * somebody is hurt is the system working; an ultimate gated on something a stage may not contain
 * is a meter the player watches fill and never spend.
 *
 * ## Cooldowns are in battle ticks
 *
 * A combatant acts every `1000 / haste` ticks, so a 40-tick cooldown is roughly every fourth
 * turn at a middling speed and every sixth for something fast. Quoting them in ticks rather
 * than turns means a haste genuinely shortens the wait, which it would not if cooldowns were
 * counted in the caster's own actions.
 *
 * ## Power numbers
 *
 * `power` multiplies the **result** of the damage formula, not the attack stat. A 1.5 hits for
 * half again what a basic attack does, and there is no quadratic surprise hiding in it. Single
 * target skills sit between 1.4 and 2.5; anything that hits a whole row lands between 0.75 and
 * 1.2, because five small hits against the diminishing-DEF curve are worth far less than one
 * big one and the multiplier has to be read against that, not against the target count.
 */

// ---------------------------------------------------------------------------------------
// Humans — versatile, and the faction with an adequate answer to everything
//
// They *were* "the only mortal faction with both a healer and a cleanse", and milestone 8e spent
// that line deliberately. A mono-faction lineup bonus is only a decision if all seven mono-fives
// are fieldable, and a faction with no sustain is not a team, so every faction now owns an answer
// to health in its own idiom. What Humans keep is the shape of the promise rather than a monopoly
// on it: Wren does both halves on one body, cheaply, at common tier, which nobody else manages.
// ---------------------------------------------------------------------------------------

/** Mira. Opens armour for whoever swings next, which is the most useful thing a generalist does. */
export const GUARD_BREAK = {
  id: 'guard-break',
  name: 'Guard Break',
  target: 'enemy-front',
  effects: [
    { kind: 'damage', damageType: 'physical', power: 1.55 },
    { kind: 'status', status: SUNDER, chance: 0.9 },
  ],
  ultimate: true,
  priority: 2,
} as const;

/**
 * Mira's second skill, and the clearest statement of what a generalist is for.
 *
 * She has no spike and no wall, so what her extra turn buys is **not needing either**: a trickle
 * of health that costs her nothing and never runs out. It is the smallest sustain in the game and
 * the only one on a character nobody would call a healer, which is exactly the reading — a
 * bruiser who outlasts the fight she was never going to win quickly.
 */
export const SECOND_WIND = {
  id: 'second-wind',
  name: 'Second Wind',
  target: 'self',
  effects: [{ kind: 'status', status: REGENERATION }],
  cooldown: 65,
  priority: 1,
} as const;

/** Seren. A party-wide `atk` buff, and since 8a it is worth the same to a caster as to a blade. */
export const OATH_OF_ARMS = {
  id: 'oath-of-arms',
  name: 'Oath of Arms',
  target: 'ally-all',
  effects: [{ kind: 'status', status: RALLY }],
  ultimate: true,
  priority: 3,
} as const;

/** Seren's filler, so her turns between buffs are not merely basic attacks. */
export const SWORN_STRIKE = {
  id: 'sworn-strike',
  name: 'Sworn Strike',
  target: 'enemy-front',
  effects: [{ kind: 'damage', damageType: 'physical', power: 1.7 }],
  cooldown: 40,
  priority: 1,
} as const;

/**
 * Seren's third, and the roster's only stun.
 *
 * A turn taken away was an enemy tool — the Warden's, on a 75-tick cooldown — and pointing it back
 * at the player's side is what a legendary-tier Human is for: no new axis, the most useful
 * ordinary thing in the game, done dependably. Deliberately a coin flip rather than certainty, and
 * on a long cooldown, because a stun the player can schedule is a lock rather than a spike.
 */
export const POMMEL_STRIKE = {
  id: 'pommel-strike',
  name: 'Pommel Strike',
  target: 'enemy-front',
  effects: [
    { kind: 'damage', damageType: 'physical', power: 1.45 },
    { kind: 'status', status: STUN, chance: 0.4 },
  ],
  cooldown: 60,
  priority: 2,
} as const;

/** Aurelia. Both halves of a tempo buff at once, and the most expensive thing a Human casts. */
export const MARSHALS_CALL = {
  id: 'marshals-call',
  name: "Marshal's Call",
  target: 'ally-all',
  effects: [
    { kind: 'status', status: RALLY },
    { kind: 'status', status: HASTE },
  ],
  ultimate: true,
  priority: 3,
} as const;

/** Aurelia finishing something off. Ignores rank, which is what makes her a closer. */
export const DECISIVE_STRIKE = {
  id: 'decisive-strike',
  name: 'Decisive Strike',
  target: 'enemy-lowest',
  effects: [{ kind: 'damage', damageType: 'physical', power: 2 }],
  cooldown: 40,
  priority: 2,
} as const;

/**
 * Aurelia's third: the marshal's actual job, which is not killing anything.
 *
 * Armour for everybody, on a cooldown rather than a bar — the same status Korrin spends his
 * ultimate on. That overlap is the point of a versatile faction: a Human buys at three skills deep
 * what a Dwarf is built around, and pays for it by being worse at it than he is.
 */
export const HOLD_THE_LINE = {
  id: 'hold-the-line',
  name: 'Hold the Line',
  target: 'ally-all',
  effects: [{ kind: 'status', status: GUARD }],
  cooldown: 55,
  priority: 4,
} as const;

/**
 * Aurelia's fourth, and the only wide turn a Human takes.
 *
 * Small damage across the front rank with the armour opened behind it, which is a setup rather
 * than a swing: it is worth most on the turn before everybody else acts. That is what the last
 * skill of a support kit should be — the one that makes the other four members better rather than
 * the one that finally makes her a damage dealer.
 */
export const SWEEPING_COMMAND = {
  id: 'sweeping-command',
  name: 'Sweeping Command',
  target: 'enemy-row-front',
  effects: [
    { kind: 'damage', damageType: 'physical', power: 1.1 },
    { kind: 'status', status: SUNDER, chance: 0.75 },
  ],
  cooldown: 55,
  priority: 1,
} as const;

/**
 * Wren. The mortal answer to needing a healer.
 *
 * Angels are the natural healers and they walk the luck-only ascension ladder, so a run that
 * never pulls one would otherwise have no sustain at all. That is the wrong kind of bad luck:
 * it is not a fight lost, it is a category of answer the player can never buy.
 */
export const FIELD_DRESSING = {
  id: 'field-dressing',
  name: 'Field Dressing',
  target: 'ally-lowest',
  effects: [{ kind: 'heal', power: 1.5 }],
  ultimate: true,
  condition: { kind: 'ally-hurt', fraction: 0.8 },
  priority: 3,
} as const;

/** Wren again: a small heal attached to a cleanse, so a debuff wave is survivable. */
export const TRIAGE = {
  id: 'triage',
  name: 'Triage',
  target: 'ally-afflicted',
  effects: [
    { kind: 'cleanse', count: 1 },
    { kind: 'heal', power: 0.6 },
  ],
  cooldown: 45,
  condition: { kind: 'ally-afflicted' },
  priority: 4,
} as const;

/**
 * Halric. The wall a Human five did not have, and the one defensive verb the faction did not own.
 *
 * An absorb pool rather than an armour buff, deliberately. Humans already buy `def` twice — Aurelia
 * spends a whole skill on it and a Dwarf is built out of it — so a shield is the thing that was
 * missing rather than a third spelling of the thing that was not. It is also the half of the pair
 * worth most on a party nobody has hit yet, which is exactly the exchange a front rank opens with.
 */
export const SHIELDSWORN_OATH = {
  id: 'shieldsworn-oath',
  name: 'Shieldsworn Oath',
  target: 'ally-all',
  effects: [{ kind: 'status', status: BARRIER }],
  ultimate: true,
  priority: 3,
} as const;

/** Halric's other turn. A wall's second job is making the rank in front of it hit softer. */
export const BRACING_BLOW = {
  id: 'bracing-blow',
  name: 'Bracing Blow',
  target: 'enemy-front',
  effects: [
    { kind: 'damage', damageType: 'physical', power: 1.35 },
    { kind: 'status', status: WEAKEN, chance: 0.8 },
  ],
  cooldown: 50,
  priority: 1,
} as const;

/** Ysolde. The first answer to a protected back rank that is not an Elf, and the whole reason a
 * mono-Human five can fight a formation. */
export const TRUESIGHT_VOLLEY = {
  id: 'truesight-volley',
  name: 'Truesight Volley',
  target: 'enemy-back',
  effects: [{ kind: 'damage', damageType: 'physical', power: 1.85 }],
  ultimate: true,
  priority: 3,
} as const;

/**
 * Ysolde naming the biggest thing on the field.
 *
 * `enemy-highest` is the rule almost nothing in the roster uses, and against a wall it is the one
 * that matters: a Human party's damage is spread thin, so opening the armour on the target every
 * other member is already grinding against is worth more than another 1.5× somewhere else.
 */
export const MARKED_QUARRY = {
  id: 'marked-quarry',
  name: 'Marked Quarry',
  target: 'enemy-highest',
  effects: [
    { kind: 'damage', damageType: 'physical', power: 1.5 },
    { kind: 'status', status: SUNDER, chance: 0.8 },
  ],
  cooldown: 50,
  priority: 2,
} as const;

/** Ysolde's third: the same reach spread across the whole back rank, priced per head like every
 * other wide skill in the file. */
export const LOOSE_THE_FLIGHT = {
  id: 'loose-the-flight',
  name: 'Loose the Flight',
  target: 'enemy-row-back',
  effects: [{ kind: 'damage', damageType: 'physical', power: 0.9 }],
  cooldown: 55,
  priority: 1,
} as const;

/** Ivo. The Human closer, and the only mortal executioner outside the Elves. */
export const BLACKLANCE_THRUST = {
  id: 'blacklance-thrust',
  name: 'Blacklance Thrust',
  target: 'enemy-lowest',
  effects: [{ kind: 'damage', damageType: 'physical', power: 2.05 }],
  ultimate: true,
  priority: 3,
} as const;

/** Ivo's filler, and the faction's only bleed. Small on the turn it lands and worth more than the
 * number says against anything that was going to survive a while. */
export const RIPOSTE = {
  id: 'riposte',
  name: 'Riposte',
  target: 'enemy-front',
  effects: [
    { kind: 'damage', damageType: 'physical', power: 1.6 },
    { kind: 'status', status: BLEED, chance: 0.75 },
  ],
  cooldown: 45,
  priority: 2,
} as const;

/** Ivo's third. Tempo for himself rather than for the party, which is the difference between a
 * duellist and a marshal. */
export const DUELISTS_READ = {
  id: 'duelists-read',
  name: "Duelist's Read",
  target: 'self',
  effects: [{ kind: 'status', status: HASTE }],
  cooldown: 65,
  priority: 1,
} as const;

/**
 * Corvane's ultimate, and the first turn in the game that puts a milestone-17 status on the
 * party's own side of the board.
 *
 * A {@link CHAINBOND} moves two fifths of every hit off its target and splits it across the rest
 * of the board. On the enemy side that is what stopped a party banking the kill it had earned;
 * here it is what stops a boss doing the same thing to five characters one at a time. **Damage is
 * conserved either way** — the board loses exactly as much health per hit as it would have — so
 * what this buys is not survival, it is *order*, and the party's healer gets to answer a spread
 * instead of a deletion.
 *
 * Paired with {@link GUARD} rather than cast bare, because the two clauses say one thing between
 * them: the hit is smaller, and it is not all landing in one place.
 */
export const CHAINWARD = {
  id: 'chainward',
  name: 'Chainward',
  target: 'ally-all',
  effects: [
    { kind: 'status', status: CHAINBOND },
    { kind: 'status', status: GUARD },
  ],
  ultimate: true,
  priority: 3,
} as const;

/** Corvane's opener. Blunting a whole front rank is the defensive half of the same sentence the
 * Chainward speaks, and it is the reason he is authored as control rather than as damage. */
export const BLUNT_THE_EDGE = {
  id: 'blunt-the-edge',
  name: 'Blunt the Edge',
  target: 'enemy-row-front',
  effects: [
    { kind: 'damage', damageType: 'magical', power: 1.1 },
    { kind: 'status', status: WEAKEN, chance: 0.8 },
  ],
  cooldown: 50,
  priority: 1,
} as const;

/** The Human answer to a back rank that is not an arrow. Ysolde reaches past a front rank by
 * shooting over it; a Sending simply arrives. */
export const SENDING = {
  id: 'sending',
  name: 'Sending',
  target: 'enemy-back',
  effects: [{ kind: 'damage', damageType: 'magical', power: 1.8 }],
  cooldown: 45,
  priority: 2,
} as const;

/** Corvane's last turn, and the second cleanse the mortal ladder offers. Wren's is the one a run
 * can buy early; this is the one that arrives with tempo attached and answers two statuses at
 * once, which is what the boards past the Bound Marches ask for. */
export const THE_NINTH_HOLDS = {
  id: 'the-ninth-holds',
  name: 'The Ninth Holds',
  target: 'ally-all',
  effects: [
    { kind: 'cleanse', count: 2 },
    { kind: 'status', status: HASTE },
  ],
  cooldown: 60,
  priority: 4,
} as const;

// ---------------------------------------------------------------------------------------
// Dwarves — refusing to lose, and since 8e able to do something about it
//
// "Cannot close a fight; can refuse to lose one" was a niche while a Dwarf stood next to four
// other factions and a ceiling the moment five of them stood together: Bran, Dorn, Korrin and
// Thraun in one formation survive essentially anything and kill essentially nothing, which is the
// ninety-second timeout with a stat block on. Hedda is the answer to that and Orin is the answer
// to a back rank, and both are legendary tier — so the faction still opens the way it always did.
// ---------------------------------------------------------------------------------------

/** Bran. Free, on a long cooldown, and only ever about himself. */
export const SHIELD_WALL = {
  id: 'shield-wall',
  name: 'Shield Wall',
  target: 'self',
  effects: [{ kind: 'status', status: GUARD }],
  ultimate: true,
  priority: 2,
} as const;

/**
 * Bran's second skill, and it is Korrin's third with the edges filed off.
 *
 * At 34 `atk` the damage on this is nearly decoration; what it buys is a quarter off whatever the
 * front rank hits for, which is the only way a character who cannot finish a fight contributes to
 * winning one. Deliberately a weaker {@link HAMMER_CHECK} — the faction's tier story is that
 * Korrin is a sharper Bran, and a shared tool at two settings says that more plainly than two
 * unrelated ones would.
 */
export const IRON_REBUKE = {
  id: 'iron-rebuke',
  name: 'Iron Rebuke',
  target: 'enemy-front',
  effects: [
    { kind: 'damage', damageType: 'physical', power: 1.3 },
    { kind: 'status', status: WEAKEN, chance: 0.8 },
  ],
  cooldown: 55,
  priority: 1,
} as const;

/** Korrin. The same armour, for everybody, at a price. */
export const ANVIL_STANCE = {
  id: 'anvil-stance',
  name: 'Anvil Stance',
  target: 'ally-all',
  effects: [{ kind: 'status', status: GUARD }],
  ultimate: true,
  priority: 3,
} as const;

/** Korrin's other half: he cannot kill anything, so he makes it hit less hard instead. */
export const HAMMER_CHECK = {
  id: 'hammer-check',
  name: 'Hammer Check',
  target: 'enemy-front',
  effects: [
    { kind: 'damage', damageType: 'physical', power: 1.4 },
    { kind: 'status', status: WEAKEN, chance: 0.85 },
  ],
  cooldown: 45,
  priority: 2,
} as const;

/**
 * Korrin's third, and the Dwarven answer to a wave rather than to a hit.
 *
 * `recovery` and `healthRegen` are the faction's stat block; this is the same idea spent on
 * somebody else. A regeneration is worth less than the equivalent heal up front and far more than
 * it across a long fight, which is precisely the fight a Dwarf line-up is trying to have.
 */
export const FORGELIGHT_VIGIL = {
  id: 'forgelight-vigil',
  name: 'Forgelight Vigil',
  target: 'ally-all',
  effects: [{ kind: 'status', status: REGENERATION }],
  cooldown: 70,
  priority: 1,
} as const;

/** Thraun. A party-wide absorb pool, which is the most durability one turn can buy. */
export const DEEP_WARD = {
  id: 'deep-ward',
  name: 'Deep Ward',
  target: 'ally-all',
  effects: [{ kind: 'status', status: BARRIER }],
  ultimate: true,
  priority: 3,
} as const;

/** Thraun's one offensive turn, and it is really a slow with damage attached. */
export const GROUND_SLAM = {
  id: 'ground-slam',
  name: 'Ground Slam',
  target: 'enemy-row-front',
  effects: [
    { kind: 'damage', damageType: 'physical', power: 1.05 },
    { kind: 'status', status: SLOW, chance: 0.7 },
  ],
  cooldown: 50,
  priority: 2,
} as const;

/**
 * Thraun's third: the worst attacker in the game making somebody else's attack land.
 *
 * He will never take the killing blow — 29 `atk` guarantees it — so his offensive turn is spent
 * on the one thing that pays regardless of who swings next. Against the diminishing-DEF curve a
 * quarter off a wall's armour is worth more to a Monster standing beside him than any damage he
 * could have dealt himself.
 */
export const DEEPSTONE_GRASP = {
  id: 'deepstone-grasp',
  name: 'Deepstone Grasp',
  target: 'enemy-front',
  effects: [
    { kind: 'damage', damageType: 'physical', power: 1.5 },
    { kind: 'status', status: SUNDER, chance: 0.8 },
  ],
  cooldown: 50,
  priority: 1,
} as const;

/**
 * Thraun's fourth, and the deepest single turn of durability the game has.
 *
 * A second absorb pool on everybody, stacked on top of {@link DEEP_WARD} rather than replacing it
 * — the two are different statuses, so a fully ascended Thraun genuinely carries the party behind
 * two shields at once. That is what the top of a wall's kit should be: not more armour, which
 * diminishes, but a second pool, which does not.
 */
export const WARD_UNBROKEN = {
  id: 'ward-unbroken',
  name: 'The Ward Unbroken',
  target: 'ally-all',
  effects: [{ kind: 'status', status: AEGIS }],
  cooldown: 85,
  priority: 4,
} as const;

/** Dorn. Two debuffs off one ally, cheap and often — the cleanse a mortal roster can rely on. */
export const SALTBEARD_REMEDY = {
  id: 'saltbeard-remedy',
  name: 'Saltbeard Remedy',
  target: 'ally-afflicted',
  effects: [{ kind: 'cleanse', count: 2 }],
  cooldown: 30,
  condition: { kind: 'ally-afflicted' },
  priority: 4,
} as const;

/**
 * Dorn's contribution to a rank he is not standing in.
 *
 * Was the magical half of {@link SHIELD_WALL} before the defences collapsed into one. What
 * distinguishes it now is reach — every ally rather than the front row — which is the same
 * thing it was always for: covering the axis a Dwarf line-up is worst on.
 */
export const STOUT_WARD = {
  id: 'stout-ward',
  name: 'Stout Ward',
  target: 'ally-all',
  effects: [{ kind: 'status', status: GUARD }],
  ultimate: true,
  priority: 2,
} as const;

/**
 * Grimna. The Dwarven heal, and the first one on the mortal ladder that is not Human.
 *
 * A party heal on a common-tier character reads generous until it is multiplied out: Dwarves carry
 * the lowest `atk` in the game and every restoration in the file prices against it, so 0.8 from
 * Grimna is worth less per head than 0.9 from Celia and far less than Ithuriel's 0.95. That is the
 * trade the faction has always made — she keeps a party standing and cannot pull anybody back from
 * the edge, which is what {@link QUENCHING_DRAUGHT} is for.
 */
export const COALSONG = {
  id: 'coalsong',
  name: 'Coalsong',
  target: 'ally-all',
  effects: [{ kind: 'heal', power: 0.8 }],
  ultimate: true,
  condition: { kind: 'ally-hurt', fraction: 0.85 },
  priority: 3,
} as const;

/** Grimna's single-target heal: the one that actually saves somebody, on a cooldown rather than a
 * bar so it is available in the opening exchange the ultimate cannot reach. */
export const QUENCHING_DRAUGHT = {
  id: 'quenching-draught',
  name: 'Quenching Draught',
  target: 'ally-lowest',
  effects: [{ kind: 'heal', power: 1.25 }],
  cooldown: 45,
  condition: { kind: 'ally-hurt', fraction: 0.75 },
  priority: 2,
} as const;

/**
 * Hedda. The Dwarf who can finish a fight, which nothing else in the faction can.
 *
 * "Cannot close a fight; can refuse to lose one" is the faction's line and it was becoming a
 * ceiling rather than a niche: a mono-Dwarf five with Bran, Dorn, Korrin and Thraun in it survives
 * indefinitely and kills nothing, which is the ninety-second timeout wearing a stat block. She is
 * the answer, and she pays for it by being the softest Dwarf authored.
 */
export const GRUDGE_SETTLED = {
  id: 'grudge-settled',
  name: 'Grudge Settled',
  target: 'enemy-highest',
  effects: [
    { kind: 'damage', damageType: 'physical', power: 1.95 },
    { kind: 'status', status: SUNDER, chance: 0.85 },
  ],
  ultimate: true,
  priority: 3,
} as const;

/** Hedda's filler. Nothing clever — a Dwarf hitting something, which is novel enough. */
export const RUNE_STRUCK = {
  id: 'rune-struck',
  name: 'Rune-Struck',
  target: 'enemy-front',
  effects: [{ kind: 'damage', damageType: 'physical', power: 1.6 }],
  cooldown: 45,
  priority: 2,
} as const;

/**
 * Hedda's third, and attrition read as an offensive stat for once.
 *
 * Conditioned on her own health rather than freely available, which is what keeps it a comeback:
 * she is worth the most in the fight that has already gone long, which is the only kind of fight
 * her faction ever has.
 */
export const STOKE_THE_GRUDGE = {
  id: 'stoke-the-grudge',
  name: 'Stoke the Grudge',
  target: 'self',
  effects: [{ kind: 'status', status: RALLY }],
  cooldown: 60,
  condition: { kind: 'self-hurt', fraction: 0.6 },
  priority: 1,
} as const;

/** Orin. A hurled anvil, and the first time a Dwarf reaches anything standing behind anything
 * else. */
export const HURLED_ANVIL = {
  id: 'hurled-anvil',
  name: 'Hurled Anvil',
  target: 'enemy-back',
  effects: [{ kind: 'damage', damageType: 'physical', power: 1.7 }],
  ultimate: true,
  priority: 3,
} as const;

/** Orin's wide turn: the whole enemy back rank slowed, which is worth more than the damage on it
 * against anything that was going to act twice. */
export const CAVERN_ECHO = {
  id: 'cavern-echo',
  name: 'Cavern Echo',
  target: 'enemy-row-back',
  effects: [
    { kind: 'damage', damageType: 'physical', power: 0.9 },
    { kind: 'status', status: SLOW, chance: 0.7 },
  ],
  cooldown: 55,
  priority: 2,
} as const;

/**
 * Orin's third, and the only shield in the game pointed at one person.
 *
 * A Dwarf standing in the back rank has given up the front-row defence bonus and is carrying the
 * faction's reach instead, so what he needs is enough absorb to survive the one skill that goes
 * past the gate — not a party-wide pool that would be spent on people nothing is aimed at.
 */
export const PIT_PROPS = {
  id: 'pit-props',
  name: 'Pit-Props',
  target: 'self',
  effects: [{ kind: 'status', status: BARRIER }],
  cooldown: 55,
  priority: 1,
} as const;

/**
 * Vurn's ultimate, and the answer to the oldest complaint about this faction.
 *
 * "Cannot close a fight; can refuse to lose one" was the Dwarven bargain, and Hedda was the first
 * exception to it — a Dwarf who kills, bought by being less of a Dwarf. This is the other route:
 * {@link THORNMAIL} returns a quarter of what reaches the wearer, so a party that refuses to lose
 * is *paid* for the refusing. Nothing about the faction changes; the attrition it was already
 * winning starts having a number attached.
 *
 * ⚠️ **Permanent, and safe to be, for the reason its own comment gives**: reflected damage is
 * applied as status damage and never re-enters the attack path, so it cannot answer itself and it
 * is strictly extra damage on a schedule the party controls. It can only ever shorten a fight,
 * which on a faction whose failure mode is the ninety-second timeout is the direction that matters.
 */
export const RUNES_OF_RETURN = {
  id: 'runes-of-return',
  name: 'Runes of Return',
  target: 'ally-all',
  effects: [{ kind: 'status', status: THORNMAIL }],
  ultimate: true,
  priority: 3,
} as const;

/** Vurn's damage, such as it is. A rune struck into the thing in front of him and left to burn —
 * magical, which is what a `physicalResist` front rank was never built to answer. */
export const GRUDGEFIRE = {
  id: 'grudgefire',
  name: 'Grudgefire',
  target: 'enemy-front',
  effects: [
    { kind: 'damage', damageType: 'magical', power: 1.6 },
    { kind: 'status', status: BURN, chance: 0.8 },
  ],
  cooldown: 45,
  priority: 2,
} as const;

/** The pool that keeps the thorns lit. A Dwarf's reflect is worth exactly as many blows as the
 * Dwarf survives, so an absorb over the whole party is offence on this one character. */
export const WARDSTONE = {
  id: 'wardstone',
  name: 'Wardstone',
  target: 'ally-all',
  effects: [{ kind: 'status', status: BARRIER }],
  cooldown: 55,
  priority: 4,
} as const;

/** Vurn's last turn, and the faction's second way past a front rank. Orin shoots over it; this
 * goes under. */
export const SUNKEN_RUNE = {
  id: 'sunken-rune',
  name: 'Sunken Rune',
  target: 'enemy-row-back',
  effects: [
    { kind: 'damage', damageType: 'magical', power: 1.05 },
    { kind: 'status', status: WEAKEN, chance: 0.75 },
  ],
  cooldown: 55,
  priority: 1,
} as const;

// ---------------------------------------------------------------------------------------
// Elves — speed, and the first answer to a back rank
// ---------------------------------------------------------------------------------------

/**
 * Rin. The reason a starting party can fight a formation at all.
 *
 * Free, on a short cooldown, and it reaches over the front rank. Every encounter built around
 * a protected healer or a protected caster is answerable from the first minute of a run
 * because this exists — which is what stops back-line design from being a wall the player has
 * to gamble their way past.
 */
export const PIERCING_SHOT = {
  id: 'piercing-shot',
  name: 'Piercing Shot',
  target: 'enemy-back',
  effects: [{ kind: 'damage', damageType: 'physical', power: 1.5 }],
  ultimate: true,
  priority: 2,
} as const;

/**
 * Rin's second skill, and it is not a second arrow.
 *
 * The obvious choice was more damage, and the reason it is wrong is what she is standing behind:
 * at 430 HP her problem has never been output, it is the turn on which something reaches her. A
 * third off the front rank's gauge is a third of everything it was going to do — the same reason
 * {@link SLOW} is the quietest strong debuff in the game — and it costs the party nothing to have
 * an Elf apply it while everyone else swings.
 */
export const SNARE_ARROW = {
  id: 'snare-arrow',
  name: 'Snare Arrow',
  target: 'enemy-front',
  effects: [
    { kind: 'damage', damageType: 'physical', power: 1.2 },
    { kind: 'status', status: SLOW, chance: 0.6 },
  ],
  cooldown: 55,
  priority: 1,
} as const;

/** Lysha buying herself turns, which on a 134-speed body is worth more than any damage skill. */
export const WINDSTEP = {
  id: 'windstep',
  name: 'Windstep',
  target: 'self',
  effects: [{ kind: 'status', status: HASTE }],
  cooldown: 70,
  priority: 2,
} as const;

/** Lysha executing. Ignores rank entirely. */
export const THROAT_CUT = {
  id: 'throat-cut',
  name: 'Throat Cut',
  target: 'enemy-lowest',
  effects: [{ kind: 'damage', damageType: 'physical', power: 1.9 }],
  ultimate: true,
  priority: 3,
} as const;

/**
 * Lysha's third, and the rung at which she stops being a pure executioner.
 *
 * Reach is the Elven axis and she was the one member of the faction without it — Rin opens with
 * it, Aelrindel is built on it, and Lysha killed only whatever was already dying. This is the
 * skill that makes her a second answer to a protected healer rather than a worse Aelrindel, and it
 * arrives late enough to be an investment rather than a starting condition.
 */
export const NIGHTREACH = {
  id: 'nightreach',
  name: 'Nightreach',
  target: 'enemy-back',
  effects: [{ kind: 'damage', damageType: 'physical', power: 1.6 }],
  cooldown: 50,
  priority: 1,
} as const;

/** Aelrindel. The sharpest back-line answer authored, and the reason a Warden hides badly. */
export const FIRST_ARROW = {
  id: 'first-arrow',
  name: 'First Arrow',
  target: 'enemy-back',
  effects: [{ kind: 'damage', damageType: 'physical', power: 2.1 }],
  ultimate: true,
  priority: 3,
} as const;

/** Only worth a turn against a wide wave, which is exactly what the condition says. */
export const VOLLEY = {
  id: 'volley',
  name: 'Volley',
  target: 'enemy-all',
  effects: [{ kind: 'damage', damageType: 'physical', power: 0.75 }],
  cooldown: 60,
  condition: { kind: 'enemies-at-least', count: 3 },
  priority: 2,
} as const;

/**
 * Aelrindel's third, and the literal reading of "can delete a back rank on his own".
 *
 * {@link FIRST_ARROW} says it one target at a time and this says it to the whole rank at once —
 * the mirror of the Shrike's dive, pointed the other way. Small per target for the reason every
 * wide skill is: against the party compositions that hide three carries behind two bodies, 0.95
 * landing on the three softest stat blocks on the field is the widest damage in the game by what
 * it actually takes off.
 */
export const SPLITTING_SHAFT = {
  id: 'splitting-shaft',
  name: 'Splitting Shaft',
  target: 'enemy-row-back',
  effects: [{ kind: 'damage', damageType: 'physical', power: 0.95 }],
  cooldown: 55,
  priority: 2,
} as const;

/**
 * Aelrindel's fourth: the shot that ignores rank altogether.
 *
 * Every other thing in his kit is a statement about **where** a target is standing. This one is
 * not, which is what makes it the last of them — a fully ascended sniper has run out of places
 * left to reach and starts reaching for whoever is closest to dying instead.
 */
export const ARROW_OF_ENDING = {
  id: 'arrow-of-ending',
  name: 'Arrow of Ending',
  target: 'enemy-lowest',
  effects: [{ kind: 'damage', damageType: 'physical', power: 1.95 }],
  cooldown: 55,
  priority: 1,
} as const;

/**
 * Faelen. The Elven heal, and the fastest one in the game.
 *
 * Weaker per cast than anything a Dwarf or an Angel does and cast far more often, which is the
 * faction's whole argument applied to sustain rather than to damage. Against a wide, grinding wave
 * that is worth more than it looks; against one enormous hit it is worth nothing at all, and the
 * Elf it was aimed at is already dead.
 */
export const SYLVAN_REFRAIN = {
  id: 'sylvan-refrain',
  name: 'Sylvan Refrain',
  target: 'ally-lowest',
  effects: [{ kind: 'heal', power: 1.45 }],
  ultimate: true,
  condition: { kind: 'ally-hurt', fraction: 0.8 },
  priority: 3,
} as const;

/** Faelen's other turn, and the only thing an Elf does that pays out slowly. */
export const WINDWOVEN_BALM = {
  id: 'windwoven-balm',
  name: 'Windwoven Balm',
  target: 'ally-all',
  effects: [{ kind: 'status', status: REGENERATION }],
  cooldown: 65,
  priority: 1,
} as const;

/**
 * Cirien. The only Elf who can stand in a front rank, and the reason a mono-Elf five is a party
 * rather than a demonstration.
 *
 * Made of slightly less paper than the rest, and it costs him the thing the faction is for: at 104
 * haste he is the slowest Elf authored, and his 8 points of attack speed are less than half
 * Aelrindel's. A body, bought with tempo.
 */
export const THORNGUARD = {
  id: 'thornguard',
  name: 'Thornguard',
  target: 'enemy-front',
  effects: [{ kind: 'damage', damageType: 'physical', power: 1.75 }],
  ultimate: true,
  priority: 2,
} as const;

/** Cirien's other turn: the enemy front rank opened up and left bleeding, which is what a slow Elf
 * does instead of reaching past it. */
export const CUT_THE_VANGUARD = {
  id: 'cut-the-vanguard',
  name: 'Cut the Vanguard',
  target: 'enemy-row-front',
  effects: [
    { kind: 'damage', damageType: 'physical', power: 1.05 },
    { kind: 'status', status: BLEED, chance: 0.7 },
  ],
  cooldown: 55,
  priority: 1,
} as const;

/**
 * Naerin. The Elven controller, and the faction's answer to a wave rather than to a formation.
 *
 * Slow across the whole field is the most quietly powerful thing in the status library — haste
 * buys turns, and a third off everybody's gauge is a third of everything the encounter was ever
 * going to do. Priced as a wide skill, so the damage attached to it is nominal.
 */
export const DUSKWEAVE = {
  id: 'duskweave',
  name: 'Duskweave',
  target: 'enemy-all',
  effects: [
    { kind: 'damage', damageType: 'physical', power: 0.85 },
    { kind: 'status', status: SLOW, chance: 0.7 },
  ],
  ultimate: true,
  priority: 3,
} as const;

/** Naerin picking off whatever the party is already grinding against. */
export const FADESHOT = {
  id: 'fadeshot',
  name: 'Fadeshot',
  target: 'enemy-highest',
  effects: [{ kind: 'damage', damageType: 'physical', power: 1.6 }],
  cooldown: 45,
  priority: 2,
} as const;

/** Naerin's third. A blunted front rank, which is the defensive half of a controller's job. */
export const WITHERING_GAZE = {
  id: 'withering-gaze',
  name: 'Withering Gaze',
  target: 'enemy-front',
  effects: [
    { kind: 'damage', damageType: 'physical', power: 1.3 },
    { kind: 'status', status: WEAKEN, chance: 0.85 },
  ],
  cooldown: 50,
  priority: 1,
} as const;

/** Sylvara. Aelrindel's reach at legendary tier, which is to say most of it and none of the
 * `physicalPierce` that makes his version answer armour. */
export const SUNSPEAR_CAST = {
  id: 'sunspear-cast',
  name: 'Sunspear Cast',
  target: 'enemy-back',
  effects: [{ kind: 'damage', damageType: 'physical', power: 1.95 }],
  ultimate: true,
  priority: 3,
} as const;

/** Sylvara pinning the largest thing on the field in place. Against something slow it is nearly
 * free; against a Wisp it is most of the fight. */
export const PINNING_SHOT = {
  id: 'pinning-shot',
  name: 'Pinning Shot',
  target: 'enemy-highest',
  effects: [
    { kind: 'damage', damageType: 'physical', power: 1.55 },
    { kind: 'status', status: SLOW, chance: 0.7 },
  ],
  cooldown: 50,
  priority: 2,
} as const;

/** Sylvara's third: the cheap wide shot an archer takes when nothing in particular needs killing. */
export const QUIVER_UNSLUNG = {
  id: 'quiver-unslung',
  name: 'Quiver Unslung',
  target: 'enemy-row-front',
  effects: [{ kind: 'damage', damageType: 'physical', power: 0.95 }],
  cooldown: 50,
  priority: 1,
} as const;

/** Maelis's ultimate. Tempo and a pool, which is the Elven spelling of "hold the line" — the
 * faction does not survive a blow, it takes another turn before the blow arrives. */
export const SUNLIT_BOUGH = {
  id: 'sunlit-bough',
  name: 'Sunlit Bough',
  target: 'ally-all',
  effects: [
    { kind: 'status', status: HASTE },
    { kind: 'status', status: BARRIER },
  ],
  ultimate: true,
  priority: 3,
} as const;

/**
 * The party's own taunt, and the only one in the game aimed at a body nothing can hit.
 *
 * An {@link OATHSHIELD} draws every single-target attack onto its wearer and **overrides the row
 * gate** while it is up. On the enemy side that was a lock — the party's back-rank reach stopped
 * being worth anything. Pointed the other way it is the cleanest defensive turn an Elf can take:
 * 20% dodge and a front-row defence bonus applied to every single-target attack on the board,
 * instead of to the one that happened to be aimed at him.
 *
 * ⚠️ **60 against a 45-tick status, which is the duty-cycle rule and it binds on the party too.**
 * `skills.spec.ts` derives that bound from both numbers rather than restating either, so this
 * clause is checked here for exactly the reason it is checked on {@link DRAW_THE_OATH}. It is also
 * why the taunt is **not** on the ultimate: an ultimate carries no cooldown at all, so a taunt on
 * one could never satisfy the rule — a fact worth knowing before authoring the obvious version of
 * this character.
 */
export const STAND_AND_BE_SEEN = {
  id: 'stand-and-be-seen',
  name: 'Stand and Be Seen',
  target: 'self',
  effects: [{ kind: 'status', status: OATHSHIELD }],
  cooldown: 60,
  priority: 4,
} as const;

/** Maelis's one offensive turn. A wall that cannot threaten anything is a wall the enemy walks
 * past, and a taunt is only a decision if ignoring it costs something. */
export const BRAMBLECUT = {
  id: 'bramblecut',
  name: 'Bramblecut',
  target: 'enemy-front',
  effects: [
    { kind: 'damage', damageType: 'physical', power: 1.5 },
    { kind: 'status', status: BLEED, chance: 0.8 },
  ],
  cooldown: 45,
  priority: 2,
} as const;

/** The grove closing. Slowing a front rank buys the same thing the taunt does — turns the party
 * gets and the enemy does not — which is why it is the last skill rather than a second attack. */
export const ROOT_AND_BOUGH = {
  id: 'root-and-bough',
  name: 'Root and Bough',
  target: 'enemy-row-front',
  effects: [
    { kind: 'damage', damageType: 'physical', power: 1.05 },
    { kind: 'status', status: SLOW, chance: 0.8 },
  ],
  cooldown: 55,
  priority: 1,
} as const;

// ---------------------------------------------------------------------------------------
// Undead — enormous HP and almost no armour, so life is the currency they take
//
// The bargain used to run the other way: Sable and Nekros paid for their best turns in their own
// health, which was the one resource a faction with the largest pools and no armour had to spare.
// Milestone 8b deleted HP costs along with MP, and the identity survived by **inverting** rather
// than by being replaced. Every Undead kit is now built on `drain`, and their meter is the one
// thing their stat block guarantees: `onHurt` is the largest energy source in the game, and the
// Undead are the faction that gets hit. They no longer spend life for tempo — they are handed
// tempo for having spent it, and they take the life back out of whatever hit them.
//
// That is why every one of them siphons. A Dwarf refuses to lose by not being hurt; an Undead
// refuses to lose by being hurt profitably.
//
// **Milestone 8e added the one thing drain cannot do, and it is worth naming the gap.** A siphon
// only ever pays its caster, so five Undead standing together were five separate solo runs — each
// one sustaining itself and none of them able to reach the body that was actually dying. Vesper's
// {@link GRAVECALL} is the fix, and it is authored small on purpose: the faction's answer to
// damage is still the exchange rather than the heal, and she is worse at healing than anybody
// whose job it is.
// ---------------------------------------------------------------------------------------

/** Mortlach. Free sustain, which is what keeps a body with 12 DEF standing. */
export const GRAVE_GRASP = {
  id: 'grave-grasp',
  name: 'Grave Grasp',
  target: 'enemy-front',
  effects: [{ kind: 'drain', damageType: 'physical', power: 1.3, siphon: 0.45 }],
  ultimate: true,
  priority: 2,
} as const;

/**
 * Mortlach's second, and the same drain aimed somewhere else.
 *
 * {@link GRAVE_GRASP} feeds on whatever is standing in front of him; this feeds on whatever is
 * closest to falling over, which is worth more precisely when the fight is going badly and his 11
 * `def` is starting to tell. A faction that refuses to lose by being hurt profitably should have
 * its best turn on the turn it is losing.
 */
export const CARRION_FEAST = {
  id: 'carrion-feast',
  name: 'Carrion Feast',
  target: 'enemy-lowest',
  effects: [{ kind: 'drain', damageType: 'physical', power: 1.45, siphon: 0.4 }],
  cooldown: 50,
  priority: 1,
} as const;

/**
 * Sable. The clearest statement of the Undead bargain, now that the bargain runs the other way.
 *
 * It cost 55 of her own health before energy existed, and the trade it described was "spend life
 * for a drain that usually returns more than it cost". The drain is untouched and so is the way it
 * loses outright to magic resist; what changed is what buys the turn. She is paid for having been
 * hit, and this is what she does with it.
 */
export const BLOOD_PACT = {
  id: 'blood-pact',
  name: 'Blood Pact',
  target: 'enemy-front',
  effects: [{ kind: 'drain', damageType: 'magical', power: 1.7, siphon: 0.55 }],
  ultimate: true,
  priority: 2,
} as const;

/**
 * Sable's second, and the only defensive turn an Undead takes.
 *
 * It is defensive by being offensive, which is the faction's whole grammar: nothing about her 8
 * `def` improves, but the rank hitting her acts a third less often. Cold rather than blood — she
 * is the Unquiet, and the Unquiet slow a room down by being in it.
 */
export const GRAVE_CHILL = {
  id: 'grave-chill',
  name: 'Grave Chill',
  target: 'enemy-row-front',
  effects: [
    { kind: 'damage', damageType: 'magical', power: 1 },
    { kind: 'status', status: SLOW, chance: 0.65 },
  ],
  cooldown: 55,
  priority: 2,
} as const;

/**
 * Sable's third: {@link BLOOD_PACT} without the bar, at the price of being smaller.
 *
 * The ordinary skill a kit built on one drain wants is another drain, and the interesting question
 * is only what it goes after. This one executes, which is what makes it more than a discount
 * ultimate — she opens with the bar on whatever is in front and closes with this on whatever is
 * nearly gone.
 */
export const UNQUIET_HUNGER = {
  id: 'unquiet-hunger',
  name: 'Unquiet Hunger',
  target: 'enemy-lowest',
  effects: [{ kind: 'drain', damageType: 'magical', power: 1.55, siphon: 0.5 }],
  cooldown: 50,
  priority: 1,
} as const;

/**
 * Nekros. A wave-wide poison, and the biggest thing the Undead do with a full bar.
 *
 * **Its `enemies-at-least` condition went with the HP cost that justified it.** The condition
 * existed to stop Nekros spending ninety health on a single target, which was a bad trade rather
 * than a bad idea. Energy is already the meter, and against one large enemy a full bar spent on a
 * poison is exactly what an ultimate is for — whereas an ultimate that cannot fire is a bar the
 * player watches stay full. Conditions on an ultimate are for kits that should *wait* (a healer
 * holding for somebody to be hurt), not for kits that should never spend.
 */
export const GRAVE_TIDE = {
  id: 'grave-tide',
  name: 'Grave Tide',
  target: 'enemy-all',
  effects: [
    { kind: 'damage', damageType: 'magical', power: 0.95 },
    { kind: 'status', status: POISON, chance: 0.85 },
  ],
  ultimate: true,
  priority: 3,
} as const;

/** Nekros paying himself back. */
export const SOUL_SIPHON = {
  id: 'soul-siphon',
  name: 'Soul Siphon',
  target: 'enemy-lowest',
  effects: [{ kind: 'drain', damageType: 'magical', power: 1.6, siphon: 0.6 }],
  cooldown: 45,
  priority: 2,
} as const;

/**
 * Nekros' third, and the one drain in the game that goes for the biggest thing on the field.
 *
 * Every other siphon in the file is opportunistic — the front rank, or whatever is nearly dead.
 * A Grave Sovereign takes his tithe from whatever has the most to give, which against a wall is
 * both the largest health pool and the target his 15 `magicPierce` was authored for.
 */
export const SOVEREIGNS_TOLL = {
  id: 'sovereigns-toll',
  name: "Sovereign's Toll",
  target: 'enemy-highest',
  effects: [{ kind: 'drain', damageType: 'magical', power: 1.7, siphon: 0.5 }],
  cooldown: 55,
  priority: 2,
} as const;

/**
 * Nekros' fourth: the Undead bargain finally spent on himself.
 *
 * `onHurt` is the largest energy source in the game and the Undead are the faction with no
 * armour, so the thing a fully ascended one has most of is tempo he was paid for being hit. This
 * is what he does with it — both halves of a buff at once, on the character least able to survive
 * needing a second turn to apply them.
 */
export const SOUL_TITHE = {
  id: 'soul-tithe',
  name: 'Soul Tithe',
  target: 'self',
  effects: [
    { kind: 'status', status: RALLY },
    { kind: 'status', status: HASTE },
  ],
  cooldown: 70,
  priority: 1,
} as const;

/**
 * Ghaul. The Undead body, and the only one of them authored to be stood in front of somebody.
 *
 * Poison across the front rank rather than a drain, which is the faction bargain read from the
 * other end: he is not taking life back, he is making the exchange cost more than it pays. A
 * lingering DoT is also the one damage type an enormous HP pool can afford to wait for.
 */
export const BLOATBURST = {
  id: 'bloatburst',
  name: 'Bloatburst',
  target: 'enemy-row-front',
  effects: [
    { kind: 'damage', damageType: 'magical', power: 1 },
    { kind: 'status', status: POISON, chance: 0.85 },
  ],
  ultimate: true,
  priority: 2,
} as const;

/** Ghaul's other turn, and the faction's cheapest siphon. He is not fast enough to use it often,
 * which is what keeps the largest common-tier HP pool from also sustaining itself. */
export const GRASPING_ROT = {
  id: 'grasping-rot',
  name: 'Grasping Rot',
  target: 'enemy-front',
  effects: [{ kind: 'drain', damageType: 'magical', power: 1.2, siphon: 0.3 }],
  cooldown: 50,
  priority: 1,
} as const;

/**
 * Vesper. The Undead blunting a line, which is the closest this faction gets to a defensive skill.
 *
 * Undead have almost no armour and nothing that adds any, so the only way they reduce incoming
 * damage is at the source. That is a real answer and a fragile one — it lasts forty-five ticks and
 * it lands on whoever happens to be in the front rank when she casts it.
 */
export const HOLLOWBIND = {
  id: 'hollowbind',
  name: 'Hollowbind',
  target: 'enemy-row-front',
  effects: [
    { kind: 'damage', damageType: 'magical', power: 0.9 },
    { kind: 'status', status: WEAKEN, chance: 0.85 },
  ],
  ultimate: true,
  priority: 2,
} as const;

/**
 * Vesper's second, and the first heal an Undead has ever cast on somebody else.
 *
 * Drain is the faction's sustain and it only ever pays the caster, which made a mono-Undead five
 * five separate solo runs. This is the fix, and it is deliberately small: life pulled out of the
 * ground rather than out of a target, so it costs a turn and buys less than an actual healer's.
 */
export const GRAVECALL = {
  id: 'gravecall',
  name: 'Gravecall',
  target: 'ally-lowest',
  effects: [{ kind: 'heal', power: 1.15 }],
  cooldown: 45,
  condition: { kind: 'ally-hurt', fraction: 0.75 },
  priority: 1,
} as const;

/** Ossuary. The Undead answer to a back rank, spread thin across the whole of it. */
export const OSSUARY_TIDE = {
  id: 'ossuary-tide',
  name: 'Ossuary Tide',
  target: 'enemy-row-back',
  effects: [{ kind: 'drain', damageType: 'magical', power: 0.95, siphon: 0.3 }],
  ultimate: true,
  priority: 3,
} as const;

/** Ossuary reaching past the gate for one target, which is what he does between tides. */
export const MARROW_DRAW = {
  id: 'marrow-draw',
  name: 'Marrow Draw',
  target: 'enemy-back',
  effects: [{ kind: 'drain', damageType: 'magical', power: 1.4, siphon: 0.35 }],
  cooldown: 50,
  priority: 2,
} as const;

/** Ossuary's third: a slow trickle of his own, for the turns when nothing is in reach. */
export const BONE_CHOIR = {
  id: 'bone-choir',
  name: 'Bone Choir',
  target: 'self',
  effects: [{ kind: 'status', status: REGENERATION }],
  cooldown: 60,
  priority: 1,
} as const;

/**
 * Karsith. Attrition pointed outwards, and the one Undead kit that is not built on siphoning.
 *
 * Bleed and poison across a rank do their arithmetic on the target's turns rather than on his, so
 * a slow, enormous body is the ideal thing to attach them to — every tick he survives is a tick
 * they are still running. It is the same "refuse to lose" the Dwarves trade in, with the sign
 * flipped: he does not outlast the fight, he makes the fight outlast the other side.
 */
export const CROWN_OF_FLIES = {
  id: 'crown-of-flies',
  name: 'Crown of Flies',
  target: 'enemy-row-front',
  effects: [
    { kind: 'damage', damageType: 'magical', power: 1.1 },
    { kind: 'status', status: BLEED, chance: 0.85 },
  ],
  ultimate: true,
  priority: 2,
} as const;

/** Karsith's second, and the longest-running debuff he applies. Cleansing it early is worth far
 * more than cleansing it late, which is what makes it a question rather than a tax. */
export const FESTER = {
  id: 'fester',
  name: 'Fester',
  target: 'enemy-front',
  effects: [
    { kind: 'damage', damageType: 'magical', power: 1.5 },
    { kind: 'status', status: POISON, chance: 0.9 },
  ],
  cooldown: 50,
  priority: 2,
} as const;

/** Karsith's third, and the one drain he keeps — a faction identity is not a kit, but it should
 * appear in every one of them. */
export const FEAST_ON_RUIN = {
  id: 'feast-on-ruin',
  name: 'Feast on Ruin',
  target: 'enemy-lowest',
  effects: [{ kind: 'drain', damageType: 'magical', power: 1.5, siphon: 0.35 }],
  cooldown: 45,
  priority: 1,
} as const;

/**
 * Carrow's ultimate: the faction's reach and the faction's sustain on one turn.
 *
 * Every Undead siphons, and until now none of them could reach past a front rank to do it — the
 * faction's answer to a back line was Nekros's wave, which pays nobody. A drain aimed over the
 * gate is the first turn that takes life from the thing the party actually needed dead.
 */
export const THE_LAST_VOLLEY = {
  id: 'the-last-volley',
  name: 'The Last Volley',
  target: 'enemy-back',
  effects: [{ kind: 'drain', damageType: 'physical', power: 2.1, siphon: 0.5 }],
  ultimate: true,
  priority: 3,
} as const;

/** Carrow's opener: the whole back rank left bleeding, which is the cheapest thing an archer can
 * do to a line that was counting on being unreachable. */
export const BONEWHISTLE = {
  id: 'bonewhistle',
  name: 'Bonewhistle',
  target: 'enemy-row-back',
  effects: [
    { kind: 'damage', damageType: 'physical', power: 1.05 },
    { kind: 'status', status: BLEED, chance: 0.75 },
  ],
  cooldown: 55,
  priority: 1,
} as const;

/** The finisher, and where the life comes back. Aimed at whatever is nearly dead for the reason
 * every Undead drain is: the cheapest kill is the one that also feeds. */
export const BONESHOT = {
  id: 'boneshot',
  name: 'Boneshot',
  target: 'enemy-lowest',
  effects: [{ kind: 'drain', damageType: 'physical', power: 1.8, siphon: 0.55 }],
  cooldown: 45,
  priority: 2,
} as const;

/** Carrow's last turn. Slowing the whole field is not damage and is worth more than damage against
 * anything the party is racing, which is the fight an Undead five is always in. */
export const THE_QUIET_FIELD = {
  id: 'the-quiet-field',
  name: 'The Quiet Field',
  target: 'enemy-all',
  effects: [
    { kind: 'damage', damageType: 'physical', power: 1.1 },
    { kind: 'status', status: SLOW, chance: 0.7 },
  ],
  cooldown: 65,
  priority: 1,
} as const;

// ---------------------------------------------------------------------------------------
// Monsters — raw ATK, and the answer to armour
//
// The shortest kits in the file, and deliberately so. Every other faction's later skills buy a
// new verb — a stun, a slow, a second absorb pool; a Monster's buy more of the one it already
// has. That is the same statement the six-line stat blocks in `characters.ts` make, and it is
// worth making twice: a faction with nothing but a number is a faction that says what it is.
//
// **Milestone 8e held that line where it cost something.** Every other faction was given an
// answer to sustain so that its mono-five is a real party; the Monsters were given `lifeLeech` and
// a siphon instead of a healer, because the alternative was solving a composition problem by
// deleting the faction. What they *were* given is reach — Ghorrak's {@link TRAMPLE} — and that is
// not a softening: with no way at all to select a protected healer, five Monsters did not lose the
// fight narrowly, they lost it by arithmetic no amount of ATK could touch.
// ---------------------------------------------------------------------------------------

/** Gnash. A bleed priced against a Monster's `atk` is a lot of damage for a free skill. */
export const REND = {
  id: 'rend',
  name: 'Rend',
  target: 'enemy-front',
  effects: [
    { kind: 'damage', damageType: 'physical', power: 1.65 },
    { kind: 'status', status: BLEED, chance: 0.85 },
  ],
  ultimate: true,
  priority: 2,
} as const;

/** Gnash's second, and there is nothing else to say about it. No status, no reach, no condition. */
export const MAUL = {
  id: 'maul',
  name: 'Maul',
  target: 'enemy-front',
  effects: [{ kind: 'damage', damageType: 'physical', power: 1.5 }],
  cooldown: 50,
  priority: 1,
} as const;

/** Ruk. One enormous predictable hit, which is what the diminishing-DEF curve rewards. */
export const MOUNTAIN_BREAKER = {
  id: 'mountain-breaker',
  name: 'Mountain Breaker',
  target: 'enemy-front',
  effects: [{ kind: 'damage', damageType: 'physical', power: 2.2 }],
  ultimate: true,
  priority: 2,
} as const;

/**
 * Ruk's second: the armour answer said with a debuff instead of with a stat.
 *
 * His 25 `physicalPierce` only ever helps Ruk. This helps whoever swings next as well, which is
 * the difference between a Monster who beats a Golem and a Monster who is the reason the party
 * does.
 */
export const SUNDER_STONE = {
  id: 'sunder-stone',
  name: 'Sunder Stone',
  target: 'enemy-front',
  effects: [
    { kind: 'damage', damageType: 'physical', power: 1.45 },
    { kind: 'status', status: SUNDER, chance: 0.85 },
  ],
  cooldown: 50,
  priority: 2,
} as const;

/**
 * Ruk's third, and the trade it makes is the file's own rule read backwards.
 *
 * One big hit beats several small ones against the diminishing-DEF curve, so a Monster spreading
 * its damage is giving up its best argument — which is exactly why this is the *third* skill
 * rather than the first. It is what a kit reaches for once its single-target turns are already
 * spoken for, and against a wide wave it is the one thing his stat block cannot do.
 */
export const AVALANCHE = {
  id: 'avalanche',
  name: 'Avalanche',
  target: 'enemy-row-front',
  effects: [{ kind: 'damage', damageType: 'physical', power: 1.1 }],
  cooldown: 55,
  priority: 1,
} as const;

/** Vharok going for the biggest thing on the field and opening it up for everyone else. */
export const WORLDS_MAW = {
  id: 'worlds-maw',
  name: "World's Maw",
  target: 'enemy-highest',
  effects: [
    { kind: 'damage', damageType: 'physical', power: 2.45 },
    { kind: 'status', status: SUNDER, chance: 0.9 },
  ],
  ultimate: true,
  priority: 3,
} as const;

/** Vharok's filler, and the only sustain a Monster gets. */
export const DEVOUR = {
  id: 'devour',
  name: 'Devour',
  target: 'enemy-lowest',
  effects: [{ kind: 'drain', damageType: 'physical', power: 1.6, siphon: 0.5 }],
  cooldown: 45,
  priority: 2,
} as const;

/** Vharok's third. The largest ordinary hit in the game, on the largest `atk` in the game. */
export const GORGE = {
  id: 'gorge',
  name: 'Gorge',
  target: 'enemy-front',
  effects: [{ kind: 'damage', damageType: 'physical', power: 1.9 }],
  cooldown: 45,
  priority: 2,
} as const;

/**
 * Vharok's fourth, and the only wave a Monster ever throws.
 *
 * At 80 `atk` and 35 `physicalPierce`, 1.15 across everything living is not the small number it
 * looks like next to {@link WORLDS_MAW} — it is the same stat block applied five times. The
 * cooldown is what keeps that from being the only thing he ever does.
 */
export const DEVOURING_TIDE = {
  id: 'devouring-tide',
  name: 'Devouring Tide',
  target: 'enemy-all',
  effects: [{ kind: 'damage', damageType: 'physical', power: 1.15 }],
  cooldown: 70,
  priority: 1,
} as const;

/** Skarn. A Monster with armour on, which is as close to a tank as this faction is allowed to
 * get: he still cannot buff, heal, cleanse or reach, and he still hits harder than most walls. */
export const BONEBREAK = {
  id: 'bonebreak',
  name: 'Bonebreak',
  target: 'enemy-front',
  effects: [{ kind: 'damage', damageType: 'physical', power: 1.8 }],
  ultimate: true,
  priority: 2,
} as const;

/** Skarn's other turn, and the only defensive verb any Monster owns. Pointed at himself, because a
 * faction that says nothing but a number does not get to say it on somebody else's behalf. */
export const THICK_HIDE = {
  id: 'thick-hide',
  name: 'Thick Hide',
  target: 'self',
  effects: [{ kind: 'status', status: GUARD }],
  cooldown: 55,
  priority: 1,
} as const;

/**
 * Yerrik. The Monster answer to sustain, and it is deliberately not a heal.
 *
 * A mono-Monster five has no healer and will not get one — the faction is authored as raw ATK and
 * penetration and nothing else, and handing it a support would delete the identity to solve a
 * composition problem. What it gets instead is life taken out of whatever it is already hitting:
 * `lifeLeech` on the stat block, a siphon on the ultimate, and no way at all to keep anybody else
 * standing. The party sustains by winning the exchange, which is the only thing Monsters do.
 */
export const BLOOD_GORGE = {
  id: 'blood-gorge',
  name: 'Blood Gorge',
  target: 'enemy-front',
  effects: [{ kind: 'drain', damageType: 'physical', power: 1.5, siphon: 0.35 }],
  ultimate: true,
  priority: 2,
} as const;

/** Yerrik's other turn. Wide, cheap and unremarkable, which is most of what a Monster does between
 * the turns that matter. */
export const RAGGED_SWIPE = {
  id: 'ragged-swipe',
  name: 'Ragged Swipe',
  target: 'enemy-row-front',
  effects: [{ kind: 'damage', damageType: 'physical', power: 1 }],
  cooldown: 50,
  priority: 1,
} as const;

/**
 * Ghorrak. The first Monster that gets past a front rank, and the last faction to be given one.
 *
 * Monsters were the only faction in the game with no reach whatsoever, which against a protected
 * healer meant a mono-Monster five simply lost — no amount of ATK answers a target it cannot
 * select. He answers it by running through the gate rather than shooting over it, which is why the
 * reach is wide and blunt where an Elf's is a single precise shot.
 */
export const TRAMPLE = {
  id: 'trample',
  name: 'Trample',
  target: 'enemy-row-back',
  effects: [{ kind: 'damage', damageType: 'physical', power: 1.15 }],
  ultimate: true,
  priority: 3,
} as const;

/** Ghorrak picking one thing out of the back rank, on a cooldown rather than a bar. */
export const SUNDERJAW = {
  id: 'sunderjaw',
  name: 'Sunderjaw',
  target: 'enemy-back',
  effects: [{ kind: 'damage', damageType: 'physical', power: 1.65 }],
  cooldown: 50,
  priority: 2,
} as const;

/** Ghorrak's third: the front rank opened up on the way through it. */
export const BREAK_THE_HERD = {
  id: 'break-the-herd',
  name: 'Break the Herd',
  target: 'enemy-row-front',
  effects: [
    { kind: 'damage', damageType: 'physical', power: 1.05 },
    { kind: 'status', status: SUNDER, chance: 0.75 },
  ],
  cooldown: 55,
  priority: 1,
} as const;

/** Ozza. The heaviest siphon in the game, on the faction with the fewest ways to spend a turn. */
export const NINEFANG_FEAST = {
  id: 'ninefang-feast',
  name: 'Ninefang Feast',
  target: 'enemy-lowest',
  effects: [{ kind: 'drain', damageType: 'physical', power: 1.8, siphon: 0.4 }],
  ultimate: true,
  priority: 3,
} as const;

/** Ozza's wide turn, and the faction's only bleed. */
export const GNASHING_TIDE = {
  id: 'gnashing-tide',
  name: 'Gnashing Tide',
  target: 'enemy-row-front',
  effects: [
    { kind: 'damage', damageType: 'physical', power: 1.05 },
    { kind: 'status', status: BLEED, chance: 0.8 },
  ],
  cooldown: 55,
  priority: 2,
} as const;

/** Ozza's third. The biggest thing on the field, hit until it is not. */
export const MARROW_CRUNCH = {
  id: 'marrow-crunch',
  name: 'Marrow Crunch',
  target: 'enemy-highest',
  effects: [{ kind: 'damage', damageType: 'physical', power: 1.75 }],
  cooldown: 50,
  priority: 1,
} as const;

/**
 * Vrakk's ultimate, and the faction's argument spoken in the other damage type.
 *
 * Monsters are the answer to armour: raw output plus enough penetration that `def` stops meaning
 * what it says. Every one of them has made that argument physically, which leaves the faction with
 * nothing to say to a `physicalResist` wall. This is the same sentence aimed at `magicResist`
 * instead — and it is still one enormous hit rather than several small ones, because against the
 * diminishing `def` curve that is the whole of why a Monster works.
 */
export const CORROSION = {
  id: 'corrosion',
  name: 'Corrosion',
  target: 'enemy-front',
  effects: [{ kind: 'damage', damageType: 'magical', power: 2.3 }],
  ultimate: true,
  priority: 3,
} as const;

/** The shred. A Monster sets up its own next hit and nobody else's, which is what having no
 * support in the faction actually means on a turn-by-turn basis. */
export const BILESPRAY = {
  id: 'bilespray',
  name: 'Bilespray',
  target: 'enemy-row-front',
  effects: [
    { kind: 'damage', damageType: 'magical', power: 1.15 },
    { kind: 'status', status: SUNDER, chance: 0.7 },
  ],
  cooldown: 50,
  priority: 2,
} as const;

/** Where Vrakk's health comes from. Monsters sustain through a siphon or they do not sustain —
 * the faction has no healer on purpose, and this is the version of that rule cast at range. */
export const GULLET = {
  id: 'gullet',
  name: 'Gullet',
  target: 'enemy-lowest',
  effects: [{ kind: 'drain', damageType: 'magical', power: 1.75, siphon: 0.55 }],
  cooldown: 45,
  priority: 2,
} as const;

/** Vrakk's last turn, and the faction's second answer to a back rank. Ghorrak reaches one thing;
 * this reaches the row and asks nothing of the front. */
export const ACID_WIND = {
  id: 'acid-wind',
  name: 'Acid Wind',
  target: 'enemy-row-back',
  effects: [{ kind: 'damage', damageType: 'magical', power: 1.1 }],
  cooldown: 55,
  priority: 1,
} as const;

// ---------------------------------------------------------------------------------------
// Angels — sustain, and the reason a party can lose a race and still win a fight
// ---------------------------------------------------------------------------------------

/** Celia. Cheap, frequent, single-target. The first real heal a run is likely to own. */
export const CHOIRLIGHT = {
  id: 'choirlight',
  name: 'Choirlight',
  target: 'ally-lowest',
  effects: [{ kind: 'heal', power: 1.7 }],
  ultimate: true,
  condition: { kind: 'ally-hurt', fraction: 0.85 },
  priority: 3,
} as const;

/**
 * Celia's second, and the reason her ultimate stops being the whole of her.
 *
 * Half a {@link CHOIRLIGHT} on a cooldown, which sounds like a worse version of the same thing
 * and is not: an energy bar opens a fight empty. The first thirty seconds of every encounter were
 * a common-tier Angel standing there being consistent about nothing. This is what she does before
 * the bar arrives.
 */
export const SOOTHING_VERSE = {
  id: 'soothing-verse',
  name: 'Soothing Verse',
  target: 'ally-lowest',
  effects: [{ kind: 'heal', power: 0.9 }],
  cooldown: 45,
  condition: { kind: 'ally-hurt', fraction: 0.9 },
  priority: 2,
} as const;

/** Ithuriel. Less per target, but everybody, which answers a wave rather than a spike. */
export const VERSE_OF_DAWN = {
  id: 'verse-of-dawn',
  name: 'Verse of Dawn',
  target: 'ally-all',
  effects: [{ kind: 'heal', power: 0.95 }],
  ultimate: true,
  condition: { kind: 'ally-hurt', fraction: 0.8 },
  priority: 3,
} as const;

/** The celestial cleanse, and the deepest one in the game. */
export const ABSOLUTION = {
  id: 'absolution',
  name: 'Absolution',
  target: 'ally-afflicted',
  effects: [{ kind: 'cleanse', count: 3 }],
  cooldown: 35,
  condition: { kind: 'ally-afflicted' },
  priority: 4,
} as const;

/**
 * Ithuriel's third: sustain that arrives before the damage does.
 *
 * Both of his other turns answer something that has already happened — a heal needs somebody hurt,
 * a cleanse needs somebody afflicted. An absorb pool is the only restorative in the game that is
 * worth casting into a full-health party, and handing the faction's healer one is what makes an
 * Angel line-up an answer to burst rather than only to attrition.
 */
export const DAWNWARD = {
  id: 'dawnward',
  name: 'Dawnward',
  target: 'ally-all',
  effects: [{ kind: 'status', status: BARRIER }],
  cooldown: 70,
  priority: 2,
} as const;

/** Seraphine. A wave heal with a tail on it — the most a full bar buys anybody. */
export const UNWAVERING_LIGHT = {
  id: 'unwavering-light',
  name: 'Unwavering Light',
  target: 'ally-all',
  effects: [
    { kind: 'heal', power: 1.05 },
    { kind: 'status', status: REGENERATION },
  ],
  ultimate: true,
  condition: { kind: 'ally-hurt', fraction: 0.85 },
  priority: 3,
} as const;

/** Absorb rather than restore, so it is worth casting *before* the party is hurt. */
export const AEGIS_SKILL = {
  id: 'aegis',
  name: 'Aegis',
  target: 'ally-all',
  effects: [{ kind: 'status', status: AEGIS }],
  cooldown: 80,
  priority: 2,
} as const;

/**
 * Seraphine's third: the single-target heal her kit had no room for below it.
 *
 * Both of her other restorative turns are wide, which is the right shape for a party losing
 * slowly and the wrong one for a party losing one member fast. This is the answer to the second,
 * and it is deliberately the least interesting skill in her kit — a character whose whole design
 * position is having no variance should end up with the tool that always does the same thing.
 */
export const VIGIL = {
  id: 'vigil',
  name: 'Vigil',
  target: 'ally-lowest',
  effects: [{ kind: 'heal', power: 1.3 }],
  cooldown: 40,
  condition: { kind: 'ally-hurt', fraction: 0.9 },
  priority: 2,
} as const;

/**
 * Seraphine's fourth, and the only damage an Angel deals on purpose.
 *
 * She cannot crit at all, so this is the one wide attack in the game with no variance whatsoever —
 * the same number every time, against everything. That is not a large number, and it is not meant
 * to be: what it buys a party of healers is the ability to eventually finish a fight it was
 * already never going to lose, which is the failure mode a full sustain line-up otherwise has.
 */
export const JUDGEMENT = {
  id: 'judgement',
  name: 'Judgement',
  target: 'enemy-all',
  effects: [{ kind: 'damage', damageType: 'magical', power: 0.9 }],
  cooldown: 60,
  priority: 1,
} as const;

/**
 * Nael. Armour for everybody, from the faction that has the most of it to give.
 *
 * Angels were three healers and nothing else, which made a mono-Angel five a party that could not
 * die and could not win — the exact ninety-second timeout the sweep exists to catch. He is half of
 * the fix and {@link LIGHTSPEAR} is the other half: a body that holds a rank, and something that
 * kills what is standing in it.
 */
export const SANCTUARY = {
  id: 'sanctuary',
  name: 'Sanctuary',
  target: 'ally-all',
  effects: [{ kind: 'status', status: GUARD }],
  ultimate: true,
  priority: 3,
} as const;

/** Nael's other turn. Magical, like everything an Angel does, so a physical-resist wall is not the
 * answer to him. */
export const WARDING_STRIKE = {
  id: 'warding-strike',
  name: 'Warding Strike',
  target: 'enemy-front',
  effects: [
    { kind: 'damage', damageType: 'magical', power: 1.3 },
    { kind: 'status', status: SUNDER, chance: 0.8 },
  ],
  cooldown: 50,
  priority: 1,
} as const;

/** Ilyra. The first Angel authored to kill something, and the faction's answer to a back rank. */
export const LIGHTSPEAR = {
  id: 'lightspear',
  name: 'Lightspear',
  target: 'enemy-back',
  effects: [{ kind: 'damage', damageType: 'magical', power: 1.55 }],
  ultimate: true,
  priority: 2,
} as const;

/** Ilyra's other turn. Small, magical and utterly predictable, which is the faction in one line. */
export const KINDLED_WORD = {
  id: 'kindled-word',
  name: 'Kindled Word',
  target: 'enemy-front',
  effects: [{ kind: 'damage', damageType: 'magical', power: 1.4 }],
  cooldown: 45,
  priority: 1,
} as const;

/**
 * Zaphiel. Judgement pointed at the largest thing on the field, with its attack taken away.
 *
 * The `enemy-highest` rule and a `WEAKEN` on the same turn is a specific claim: whatever is
 * biggest is usually also what is hitting hardest, so an Angel spending an ultimate on it is
 * buying the party the exchange rather than the kill. Seraphine's Judgement is the wide version
 * of the same instinct.
 */
export const EVEN_HAND = {
  id: 'even-hand',
  name: 'The Even Hand',
  target: 'enemy-highest',
  effects: [
    { kind: 'damage', damageType: 'magical', power: 1.9 },
    { kind: 'status', status: WEAKEN, chance: 0.85 },
  ],
  ultimate: true,
  priority: 3,
} as const;

/** Zaphiel finishing. The only Angel who does. */
export const WEIGHED_AND_FOUND = {
  id: 'weighed-and-found',
  name: 'Weighed and Found',
  target: 'enemy-lowest',
  effects: [{ kind: 'damage', damageType: 'magical', power: 1.8 }],
  cooldown: 45,
  priority: 2,
} as const;

/** Zaphiel's third: tempo for the party, which is the one buff Angels never had. */
export const LEVEL_GROUND = {
  id: 'level-ground',
  name: 'Level Ground',
  target: 'ally-all',
  effects: [{ kind: 'status', status: HASTE }],
  cooldown: 65,
  priority: 1,
} as const;

/**
 * Raziel. The only shield in the game a combatant puts on itself and nobody else, and the largest.
 *
 * `AEGIS` is the big, brief absorb pool; every other holder spreads it across the party, where a
 * fixed quantity divided five ways is a badge. On one combatant it is a wall — which is what a
 * front rank standing in front of four Angels who cannot take a hit actually needs.
 */
export const KEEPERS_CHARGE = {
  id: 'keepers-charge',
  name: "Keeper's Charge",
  target: 'self',
  effects: [{ kind: 'status', status: AEGIS }],
  ultimate: true,
  priority: 2,
} as const;

/** Raziel's second. Slowing whatever is in front of him is how a wall makes the fight last long
 * enough for the four people behind it to matter. */
export const GATEBREAKERS_ANSWER = {
  id: 'gatebreakers-answer',
  name: "Gatebreaker's Answer",
  target: 'enemy-front',
  effects: [
    { kind: 'damage', damageType: 'magical', power: 1.5 },
    { kind: 'status', status: SLOW, chance: 0.8 },
  ],
  cooldown: 50,
  priority: 2,
} as const;

/** Raziel's third, and armour for himself on the turns nothing needs slowing. */
export const UNYIELDING = {
  id: 'unyielding',
  name: 'Unyielding',
  target: 'self',
  effects: [{ kind: 'status', status: GUARD }],
  cooldown: 55,
  priority: 1,
} as const;

/**
 * Cassiel's ultimate, and the turn this faction has never had.
 *
 * Angels answer a spike, hold a rank and keep a party standing, and the failure that comes with is
 * on record: three healers made a mono-Angel five a fight nobody could finish, which is a
 * **timeout, and a timeout is a defeat**. Nael and Raziel were the first half of the answer — a
 * wall so the healers had something to heal. This is the second half, and it is the opposite kind
 * of body: no heal, no shield, no cleanse, nothing on the whole kit that keeps anybody alive.
 *
 * Aimed at the largest thing standing rather than the weakest, because what an Angel five cannot
 * do is close, and the thing it cannot close on is the boss.
 */
export const THE_DRAWN_SWORD = {
  id: 'the-drawn-sword',
  name: 'The Drawn Sword',
  target: 'enemy-highest',
  effects: [{ kind: 'damage', damageType: 'physical', power: 2.4 }],
  ultimate: true,
  priority: 3,
} as const;

/** Cassiel's opener. Blunting the thing in front is the one defensive clause in his kit, and it is
 * defensive by consequence rather than by intent. */
export const SENTENCE = {
  id: 'sentence',
  name: 'Sentence',
  target: 'enemy-front',
  effects: [
    { kind: 'damage', damageType: 'physical', power: 1.75 },
    { kind: 'status', status: WEAKEN, chance: 0.8 },
  ],
  cooldown: 45,
  priority: 2,
} as const;

/** The wide turn, and the shred the Angels' two casters were never carrying. */
export const BLADE_OF_THE_CHOIR = {
  id: 'blade-of-the-choir',
  name: 'Blade of the Choir',
  target: 'enemy-row-front',
  effects: [
    { kind: 'damage', damageType: 'physical', power: 1.15 },
    { kind: 'status', status: SUNDER, chance: 0.8 },
  ],
  cooldown: 50,
  priority: 1,
} as const;

/** Cassiel's last turn: the reach the faction buys with Ilyra's and Zaphiel's spells, on a body
 * that can also finish what it reaches. */
export const ANSWERED_IN_KIND = {
  id: 'answered-in-kind',
  name: 'Answered in Kind',
  target: 'enemy-back',
  effects: [{ kind: 'damage', damageType: 'physical', power: 1.8 }],
  cooldown: 50,
  priority: 2,
} as const;

// ---------------------------------------------------------------------------------------
// Demons — magical damage, and the only faction that ignores armour entirely
// ---------------------------------------------------------------------------------------

/** Pyra. Magical, so a Dwarf's armour does nothing about it. */
export const EMBERBURST = {
  id: 'emberburst',
  name: 'Emberburst',
  target: 'enemy-front',
  effects: [
    { kind: 'damage', damageType: 'magical', power: 1.6 },
    { kind: 'status', status: BURN, chance: 0.85 },
  ],
  ultimate: true,
  priority: 2,
} as const;

/**
 * Pyra's second, and it is her first turn rather than her best one.
 *
 * No burn, no status, nothing to set up — a Demon's whole argument is that armour does not answer
 * her, and this is that argument at a smaller size while the bar fills. At 25% crit for 1.9× it is
 * also the cheapest place in the game to watch what variance actually feels like.
 */
export const CINDERLASH = {
  id: 'cinderlash',
  name: 'Cinderlash',
  target: 'enemy-front',
  effects: [{ kind: 'damage', damageType: 'magical', power: 1.45 }],
  cooldown: 50,
  priority: 1,
} as const;

/** Malakar reaching the back rank the way an Elf does, but with a spell rather than an arrow. */
export const GAMBLERS_CUT = {
  id: 'gamblers-cut',
  name: "Gambler's Cut",
  target: 'enemy-back',
  effects: [{ kind: 'damage', damageType: 'magical', power: 2 }],
  ultimate: true,
  priority: 3,
} as const;

/** Setup for everything magical that follows, including his own. */
export const HEXFIRE = {
  id: 'hexfire',
  name: 'Hexfire',
  target: 'enemy-front',
  effects: [
    { kind: 'damage', damageType: 'magical', power: 1.35 },
    { kind: 'status', status: SUNDER, chance: 0.85 },
  ],
  cooldown: 45,
  priority: 2,
} as const;

/**
 * Malakar's third, and the most on-the-nose skill in the file.
 *
 * A third of his swings land for over double and the other two thirds are why he is called the
 * Gambler. This raises the stake rather than the odds: {@link RALLY} multiplies `atk`, and `atk`
 * is what the crit is a multiple *of*, so a good fight gets better and a bad one is exactly as
 * bad as it was.
 */
export const DOUBLE_OR_NOTHING = {
  id: 'double-or-nothing',
  name: 'Double or Nothing',
  target: 'self',
  effects: [{ kind: 'status', status: RALLY }],
  cooldown: 60,
  priority: 1,
} as const;

/** Azrathoth against a wave. Expensive enough that he casts it roughly twice a fight. */
export const RUIN_UNBOUND = {
  id: 'ruin-unbound',
  name: 'Ruin Unbound',
  target: 'enemy-all',
  effects: [
    { kind: 'damage', damageType: 'magical', power: 1.15 },
    { kind: 'status', status: SUNDER, chance: 0.75 },
  ],
  cooldown: 70,
  condition: { kind: 'enemies-at-least', count: 3 },
  priority: 3,
} as const;

/** Azrathoth against one enormous thing, which is the other half of what a gate is. */
export const UNMAKING = {
  id: 'unmaking',
  name: 'Unmaking',
  target: 'enemy-highest',
  effects: [{ kind: 'damage', damageType: 'magical', power: 2.45 }],
  ultimate: true,
  priority: 2,
} as const;

/**
 * Azrathoth's third: the Demon answer to a rank, which nothing else in the faction but Malakar
 * has.
 *
 * Ruin Unbound needs three targets and Unmaking wants the largest, so a protected healer behind
 * two bodies was a question a fully invested Azrathoth could not ask. This is the rung that fixes
 * it, and 20 `magicPierce` is what makes it land on the kind of thing that hides.
 */
export const ENTROPY = {
  id: 'entropy',
  name: 'Entropy',
  target: 'enemy-back',
  effects: [{ kind: 'damage', damageType: 'magical', power: 1.85 }],
  cooldown: 50,
  priority: 1,
} as const;

/**
 * Azrathoth's fourth, and the mirror of his own ultimate.
 *
 * {@link UNMAKING} takes the biggest thing on the field; this takes the smallest. A kit that can
 * name either end of the fight is what "Ruin Unbound" should mean at the top of the ladder — and
 * on a 45% crit chance, either one is a coin flip between finishing something and wasting a turn.
 */
export const LONG_SILENCE = {
  id: 'long-silence',
  name: 'The Long Silence',
  target: 'enemy-lowest',
  effects: [{ kind: 'damage', damageType: 'magical', power: 2.1 }],
  cooldown: 55,
  priority: 2,
} as const;

/** Vexis. The Demon bargain in its oldest form: whatever she burns, she takes some of back. */
export const SINSONG = {
  id: 'sinsong',
  name: 'Sinsong',
  target: 'enemy-front',
  effects: [{ kind: 'drain', damageType: 'magical', power: 1.45, siphon: 0.35 }],
  ultimate: true,
  priority: 2,
} as const;

/** Vexis's other turn, and a burn across the whole front rank rather than on one of it. */
export const WICKERBURN = {
  id: 'wickerburn',
  name: 'Wickerburn',
  target: 'enemy-row-front',
  effects: [
    { kind: 'damage', damageType: 'magical', power: 0.95 },
    { kind: 'status', status: BURN, chance: 0.8 },
  ],
  cooldown: 55,
  priority: 1,
} as const;

/**
 * Threx. A Demon with enough health to be hit, which none of the others are.
 *
 * "Ignore armour entirely; die to anything" is the faction line, and the second half of it made a
 * mono-Demon five unfieldable rather than fragile: five combatants averaging 440 HP have no front
 * rank at all, and the gate that protects a back rank protects nobody when everybody is behind it.
 * He is the exception, and he pays for it in the stat the faction is named for — the lowest
 * `critChance` any Demon has.
 */
export const CHAINBREAK = {
  id: 'chainbreak',
  name: 'Chainbreak',
  target: 'enemy-front',
  effects: [{ kind: 'damage', damageType: 'magical', power: 1.65 }],
  ultimate: true,
  priority: 2,
} as const;

/** Threx's other turn. A Demon holding a rank still has nothing to hold it with, so the answer is
 * to make the thing in front of him swing softer. */
export const IRONS_BROKEN = {
  id: 'irons-broken',
  name: 'Irons Broken',
  target: 'enemy-front',
  effects: [
    { kind: 'damage', damageType: 'magical', power: 1.2 },
    { kind: 'status', status: WEAKEN, chance: 0.85 },
  ],
  cooldown: 50,
  priority: 1,
} as const;

/** Nyxara. The whole field set alight, priced per head like everything wide. */
export const THIRD_WHISPER = {
  id: 'third-whisper',
  name: 'The Third Whisper',
  target: 'enemy-all',
  effects: [
    { kind: 'damage', damageType: 'magical', power: 1.05 },
    { kind: 'status', status: BURN, chance: 0.8 },
  ],
  ultimate: true,
  priority: 3,
} as const;

/** Nyxara's second: the front rank blunted, which is a caster keeping herself alive by proxy. */
export const HEX_THE_HEARTH = {
  id: 'hex-the-hearth',
  name: 'Hex the Hearth',
  target: 'enemy-row-front',
  effects: [
    { kind: 'damage', damageType: 'magical', power: 1 },
    { kind: 'status', status: WEAKEN, chance: 0.85 },
  ],
  cooldown: 55,
  priority: 2,
} as const;

/**
 * Nyxara's third, and a comeback rather than an opener.
 *
 * Conditioned on her own health, like Hedda's, and for the same reason inverted: a Demon below
 * half is a Demon about to die, so the turn it buys has to be worth more than the turn it costs.
 * Haste rather than attack, because what she needs is to act again at all.
 */
export const WHISPERED_BARGAIN = {
  id: 'whispered-bargain',
  name: 'Whispered Bargain',
  target: 'self',
  effects: [{ kind: 'status', status: HASTE }],
  cooldown: 60,
  condition: { kind: 'self-hurt', fraction: 0.5 },
  priority: 1,
} as const;

/**
 * Sanguine. The Demon heal, and the only sustain on the celestial ladder that is not an Angel's.
 *
 * Angels are the natural support and they walk the luck-only ladder — which is the argument that
 * put Wren and Dorn on the mortal one. The same argument applies inside the celestial pair: a run
 * that pulls Demons and no Angels had no sustain at any price. She is smaller than any Angel's
 * heal and attached to a body that can crit, which is the trade.
 */
export const RED_TITHE = {
  id: 'red-tithe',
  name: 'Red Tithe',
  target: 'ally-lowest',
  effects: [{ kind: 'heal', power: 1.15 }],
  ultimate: true,
  condition: { kind: 'ally-hurt', fraction: 0.8 },
  priority: 3,
} as const;

/** Sanguine collecting. The biggest thing on the field pays for the heal that goes out next turn. */
export const TITHE_COLLECTED = {
  id: 'tithe-collected',
  name: 'Tithe Collected',
  target: 'enemy-highest',
  effects: [{ kind: 'drain', damageType: 'magical', power: 1.55, siphon: 0.4 }],
  cooldown: 50,
  priority: 2,
} as const;

/** Sanguine's third, and the celestial ladder's second cleanse. Small heal attached, because a
 * cleanse that arrives on the turn somebody is dying should do something about that too. */
export const CRIMSON_SIGIL = {
  id: 'crimson-sigil',
  name: 'Crimson Sigil',
  target: 'ally-afflicted',
  effects: [
    { kind: 'cleanse', count: 1 },
    { kind: 'heal', power: 0.65 },
  ],
  cooldown: 40,
  condition: { kind: 'ally-afflicted' },
  priority: 4,
} as const;

/** Nazreth's ultimate: the wall, hit once and hard. Aimed at the front rather than at the largest
 * thing standing so that it does not land on whatever {@link SEEDED_SHAFT} has just seeded — the
 * one target in the kit that wants to be left alone. */
export const THE_HEX_COMES_DUE = {
  id: 'the-hex-comes-due',
  name: 'The Hex Comes Due',
  target: 'enemy-front',
  effects: [{ kind: 'damage', damageType: 'magical', power: 2.3 }],
  ultimate: true,
  priority: 2,
} as const;

/**
 * The party's bomb, and the one turn in the roster that wants its target to stay alive.
 *
 * A {@link HEXBRAND} does nothing at all for twenty-four ticks and then lands in one piece. The
 * Bound Marches taught the mechanic from the wrong end — a payload on the party's back rank, and a
 * decision about *when* to spend a cleanse rather than whether to. Pointed the other way it asks a
 * question nothing else in the roster asks: it punishes a **slow** kill, so it is worth most
 * against exactly the boards a party grinds down rather than bursts.
 *
 * ⚠️ **Two things here are the opposite of {@link EMBERSEED}, and both had to be, because the two
 * sides of the board kill at completely different speeds.** The enemy seeds the party's back rank
 * on a forty-tick fuse; a party copying that aims into the one rank all five of its own members
 * are already converging on, and the host dies before the fuse runs. Measured with the shaft
 * pointed at `enemy-back` and carrying an {@link EMBER_SEED}, **not one of 57 seeds across forty
 * fights ever detonated** — 53 died with their carrier. So the target is the largest remaining
 * health pool, which is the only body a party reliably cannot delete, and the fuse is its own
 * shorter status. See {@link HEXBRAND}.
 */
export const SEEDED_SHAFT = {
  id: 'seeded-shaft',
  name: 'Seeded Shaft',
  target: 'enemy-highest',
  effects: [
    { kind: 'damage', damageType: 'magical', power: 1.5 },
    { kind: 'status', status: HEXBRAND, chance: 0.85 },
  ],
  cooldown: 50,
  priority: 3,
} as const;

/** The tempo turn, and Nazreth's only wide one. A slowed back rank takes fewer turns while the
 * seed runs down, which is the closest a bomb ever comes to having a setup — the fuse is a fixed
 * number of ticks and nothing in the game can lengthen it. */
export const PATIENT_MALICE = {
  id: 'patient-malice',
  name: 'Patient Malice',
  target: 'enemy-row-back',
  effects: [
    { kind: 'damage', damageType: 'magical', power: 1.1 },
    { kind: 'status', status: SLOW, chance: 0.75 },
  ],
  cooldown: 55,
  priority: 1,
} as const;

/** Nazreth's last turn. Demons price everything as a debt, and this is the one that comes to
 * collect from whatever the seeds have already half-paid. */
export const THE_RECKONING = {
  id: 'the-reckoning',
  name: 'The Reckoning',
  target: 'enemy-lowest',
  effects: [{ kind: 'damage', damageType: 'magical', power: 2.0 }],
  cooldown: 50,
  priority: 2,
} as const;

// ---------------------------------------------------------------------------------------
// Enemy kits — the locks
//
// **No enemy has an ultimate, and that asymmetry is deliberate.** Energy is a character system:
// it exists so a player can watch a bar fill and know what it buys, and so milestone 8c has
// something to hang a skill ceiling on. An enemy has no roster screen, does not ascend, and is
// read by the player as a rhythm rather than as a resource — so its pacing is authored directly
// in cooldowns, where an encounter designer can set it exactly.
//
// It is also what keeps skills shareable. Several of these are fielded by two or three different
// enemies, and `ultimate` is a property of the skill; marking one would make the Unmade a
// combatant with two ultimates sharing one bar, where the lower-priority of them could never fire.
//
// Deleting the enemy MP pools cost almost nothing, which is the useful thing to know before
// retuning any of this. In every case the pool regenerated more between casts than the cast cost —
// the Acolyte's Mend regained 11 against a price of 12, the Hag's Witherhex 24 against 14 — so the
// cooldown was already the binding meter and the pool was decoration.
// ---------------------------------------------------------------------------------------

/**
 * A Wisp reaching past the front rank.
 *
 * The first thing in the ladder that punishes assuming the back row is safe. It is small, and
 * it is meant to be: the lesson it teaches is that a rank is cover rather than immunity.
 */
export const MOTE_LANCE = {
  id: 'mote-lance',
  name: 'Mote Lance',
  target: 'enemy-back',
  effects: [{ kind: 'damage', damageType: 'magical', power: 1.1 }],
  cooldown: 60,
  priority: 2,
} as const;

/** A Boar committing to one target hard enough to matter. */
export const GORE = {
  id: 'gore',
  name: 'Gore',
  target: 'enemy-front',
  effects: [
    { kind: 'damage', damageType: 'physical', power: 1.55 },
    { kind: 'status', status: BLEED, chance: 0.7 },
  ],
  cooldown: 55,
  priority: 2,
} as const;

/** A Bandit going for the soft target, because that is what a bandit is. */
export const CUTPURSE = {
  id: 'cutpurse',
  name: 'Cutpurse',
  target: 'enemy-back',
  effects: [{ kind: 'damage', damageType: 'physical', power: 1.35 }],
  cooldown: 60,
  priority: 2,
} as const;

/** A Golem punishing a crowded front rank, and taking the party's tempo with it. */
export const STONE_FIST = {
  id: 'stone-fist',
  name: 'Stone Fist',
  target: 'enemy-row-front',
  effects: [
    { kind: 'damage', damageType: 'physical', power: 1.15 },
    { kind: 'status', status: SLOW, chance: 0.6 },
  ],
  cooldown: 65,
  priority: 2,
} as const;

/**
 * The Warden's answer to everything: hit the whole party, and take a turn off somebody.
 *
 * A stun on a cooldown this long is a spike to survive, not a lock to be held under.
 *
 * It used to carry an MP price on top of that cooldown, and the price was doing nothing: the
 * Warden regenerated 28 points between casts against a cost of 30, so the cooldown was already the
 * only meter. That was true of **every** enemy MP skill in the file, which is why deleting the
 * stat moved the ladder by so much less than it moved the roster — see the note on enemy metering
 * at the head of this section.
 */
export const GATE_SLAM = {
  id: 'gate-slam',
  name: 'Gate Slam',
  target: 'enemy-all',
  effects: [
    { kind: 'damage', damageType: 'physical', power: 0.85 },
    { kind: 'status', status: STUN, chance: 0.35 },
  ],
  cooldown: 75,
  priority: 3,
} as const;

/**
 * The healer lock, and the clearest thing this milestone builds.
 *
 * An Acolyte standing behind two bodies out-heals a party's chip damage indefinitely. The
 * answer is not more damage — it is *reach*: a Piercing Shot, a Gambler's Cut, a First Arrow,
 * or killing the front rank fast enough to get behind it. An encounter with one of these in it
 * asks a question that milestone 2's "attack whatever has the least HP" could not even hear.
 */
export const MEND = {
  id: 'mend',
  name: 'Mend',
  target: 'ally-lowest',
  effects: [{ kind: 'heal', power: 1.6 }],
  cooldown: 20,
  condition: { kind: 'ally-hurt', fraction: 0.9 },
  priority: 3,
} as const;

/**
 * The Hierophant's own heal, and the reason it does not simply borrow {@link MEND}.
 *
 * The two enemies that heal are metered very differently and used to be metered by something
 * other than their cooldowns. The Acolyte at stage 7 spent 12 MP against 12 regenerated every two
 * turns — exactly break-even, so its pool never bit and `MEND`'s 20-tick cooldown always was its
 * real cadence. The Hierophant heals **and** shields, so it spent 12 + 16 against 6 a turn and
 * genuinely ran down; deleting MP handed it an unmetered heal every second turn, and stage 24
 * went from a fight to a 102-second attrition war it usually lost.
 *
 * Splitting the skill is what keeps that fix from landing on stage 7. Raising `MEND` instead
 * would have worked — the sweep goes green at 32 — but the Acolyte's cadence would have gone from
 * every two turns to every three as collateral, weakening the ladder's most important early lock
 * to solve a problem at its last. **The two locks now tune independently, which is what they
 * always should have done.**
 *
 * A four-turn heal against the Hierophant's 104 haste, which is roughly where the MP pool left it.
 */
export const LITANY = {
  id: 'litany',
  name: 'Litany',
  target: 'ally-lowest',
  effects: [{ kind: 'heal', power: 1.6 }],
  // ⚠️ 32 until the milestone-14 ladder retune. A heal every 3.2s priced off the Hierophant's own
  // attack was a speed bump when chapter 2 ran to enemy level 126; against the flatter ladder it
  // out-paced the damage of any party that had gear but had not yet out-levelled the stage, and
  // that band ran the ninety-second clock out rather than resolving. The Hierophant is still the
  // healer that has to be burst — it just cannot out-heal a party indefinitely.
  cooldown: 44,
  condition: { kind: 'ally-hurt', fraction: 0.9 },
  priority: 3,
} as const;

/**
 * The debuff lock. Party-wide, and re-applied only once it has worn off.
 *
 * `status-absent` is what makes this worth cleansing: without it the Hag would spend every
 * cooldown refreshing a debuff that was already running, and a cleanse would buy the party a
 * few ticks. With it, removing the debuff genuinely costs the Hag its next cast.
 */
export const WITHERHEX = {
  id: 'witherhex',
  name: 'Witherhex',
  target: 'enemy-all',
  effects: [{ kind: 'status', status: WEAKEN, chance: 0.9 }],
  cooldown: 55,
  condition: { kind: 'status-absent', statusId: 'weaken' },
  priority: 3,
} as const;

/** The Hag's other half: tempo denial on whoever is standing in front. */
export const MIRE = {
  id: 'mire',
  name: 'Mire',
  target: 'enemy-row-front',
  effects: [{ kind: 'status', status: SLOW, chance: 0.8 }],
  cooldown: 60,
  condition: { kind: 'status-absent', statusId: 'slow' },
  priority: 2,
} as const;

/**
 * The wide-wave lock: a caster that hits the whole party for magical damage every few turns.
 *
 * Punishes a party built entirely of physical resist, which is otherwise the cheapest durability
 * in the game. The answer is magic resist, or killing it — and it is fragile precisely so that
 * killing it is a real option for a party that can reach it.
 */
export const CINDER_STORM = {
  id: 'cinder-storm',
  name: 'Cinder Storm',
  target: 'enemy-all',
  effects: [
    { kind: 'damage', damageType: 'magical', power: 0.9 },
    { kind: 'status', status: BURN, chance: 0.6 },
  ],
  cooldown: 55,
  priority: 3,
} as const;

/**
 * The shielder lock: absorb, refreshed, on everything.
 *
 * Different from a healer in the way that matters here — a barrier applied before the damage
 * arrives cannot be raced by chip damage at all, so the party either has burst or has a
 * problem.
 */
export const BULWARK = {
  id: 'bulwark',
  name: 'Bulwark',
  target: 'ally-all',
  effects: [{ kind: 'status', status: BARRIER }],
  // ⚠️ **Must stay longer than `BARRIER.duration` (70), and that is a termination argument rather
  // than a balance knob.** At 60 this recast ten ticks *before* the shield it applies expires, so
  // a Hierophant or a Bulwark kept a party-wide absorb up permanently — and a party doing steady
  // damage into permanent absorb, while taking little back, resolves nothing. Every stall the
  // milestone-14 retune surfaced was a stage with one of those two on it.
  //
  // It was invisible before because the old ladder killed the party first; flattening the levels
  // removed the thing that was hiding it. A shield that cannot lapse is not a lock the party can
  // answer with burst, which is what `BARRIER` is documented to be.
  cooldown: 85,
  priority: 3,
} as const;

/** The Bulwark's filler. It is not there to kill anybody. */
export const SHIELD_BASH = {
  id: 'shield-bash',
  name: 'Shield Bash',
  target: 'enemy-front',
  effects: [{ kind: 'damage', damageType: 'physical', power: 1.2 }],
  cooldown: 40,
  priority: 1,
} as const;

/**
 * The armour gate, on both axes at once.
 *
 * A Golem is a physical wall and folds to a spell; a Rimeplate does not, which makes
 * penetration and {@link SUNDER} the only real answers rather than "bring the other damage
 * type". That is deliberately the last lock the ladder teaches.
 */
export const GLACIAL_SLAM = {
  id: 'glacial-slam',
  name: 'Glacial Slam',
  target: 'enemy-front',
  effects: [
    { kind: 'damage', damageType: 'physical', power: 1.8 },
    { kind: 'status', status: SLOW, chance: 0.5 },
  ],
  cooldown: 60,
  priority: 2,
} as const;

/**
 * The evasion lock. A Shade dodges more than half of what is aimed at it.
 *
 * The floor under hit chance is what keeps this beatable at all; beyond that the answers are
 * accuracy, or enough attacks that the misses stop mattering.
 */
export const FADE = {
  id: 'fade',
  name: 'Fade',
  target: 'self',
  effects: [{ kind: 'status', status: HASTE }],
  cooldown: 70,
  priority: 2,
} as const;

/** A Shade draining what it does connect with, which is why ignoring one does not work. */
export const WITHERING_TOUCH = {
  id: 'withering-touch',
  name: 'Withering Touch',
  target: 'enemy-back',
  effects: [{ kind: 'drain', damageType: 'magical', power: 1.3, siphon: 0.5 }],
  cooldown: 45,
  priority: 1,
} as const;

// ---------------------------------------------------------------------------------------
// Enemy kits — the late locks
//
// Most of these exist because the vocabulary in `core/battle/types.ts` had targets and a
// condition that nothing in the game had ever used. `enemy-row-back` (Shrike Dive),
// `enemy-lowest` (Headsman's Arc), `enemy-highest` (Tyrant's Claim) and the `self-hurt` condition
// (Wrath Unbound) were all authorable from milestone 4 onward and all sat idle, which meant four
// questions the roster already had answers to that nothing was asking. Flense and Ruinous Arc are
// the ordinary turns the Ravager and the Wrathborn take between them — a lock still has to be
// attached to something that fights.
//
// Named rather than counted on purpose: a count goes stale the first time this list grows, and
// this comment has already done that once.
// ---------------------------------------------------------------------------------------

/**
 * The back-rank lock: the whole of it, at once.
 *
 * A Wisp's Mote Lance taught that a rank is cover rather than immunity, one target at a time.
 * This says the same thing to a party that took the lesson and stacked three fragile carries
 * behind two bodies anyway — which by the second half of the ladder is most parties, because
 * every encounter below has rewarded it. The answers are durability on the carries, a barrier
 * that lands before the dive does, or killing something with 24 `def` before it acts twice.
 *
 * Deliberately not enormous per target. Three back-rank hits at 0.95 against the party's softest
 * three stat blocks is already the widest damage in the game by the value it actually lands.
 */
export const SHRIKE_DIVE = {
  id: 'shrike-dive',
  name: 'Shrike Dive',
  target: 'enemy-row-back',
  effects: [{ kind: 'damage', damageType: 'physical', power: 0.95 }],
  cooldown: 50,
  priority: 2,
} as const;

/** The Ravager opening both front bodies up for its own penetration. */
export const FLENSE = {
  id: 'flense',
  name: 'Flense',
  target: 'enemy-row-front',
  effects: [
    { kind: 'damage', damageType: 'physical', power: 1.15 },
    { kind: 'status', status: BLEED, chance: 0.8 },
  ],
  cooldown: 55,
  priority: 2,
} as const;

/**
 * The escalation lock: a thing that gets worse the closer it is to dying.
 *
 * `self-hurt` is the condition this exists to use. Every other meter in the game says "not yet" —
 * a cooldown, a pool, an ally who is not hurt enough to be worth healing. This one says "not
 * until you have already committed", which inverts the usual shape: chipping a Wrathborn down is
 * the thing that turns it on. Burst it through the window, or blunt the window with a slow.
 */
export const WRATH_UNBOUND = {
  id: 'wrath-unbound',
  name: 'Wrath Unbound',
  target: 'self',
  effects: [
    { kind: 'status', status: RALLY },
    { kind: 'status', status: HASTE },
  ],
  cooldown: 60,
  condition: { kind: 'self-hurt', fraction: 0.5 },
  priority: 3,
} as const;

/** The Wrathborn's ordinary turn, so the fight before the window is not a formality. */
export const RUINOUS_ARC = {
  id: 'ruinous-arc',
  name: 'Ruinous Arc',
  target: 'enemy-front',
  effects: [{ kind: 'damage', damageType: 'magical', power: 1.7 }],
  cooldown: 40,
  priority: 2,
} as const;

/**
 * The execution lock: rank buys nobody safety, and the weakest member is the target.
 *
 * `enemy-lowest` is the player's own executioner rule — Throat Cut, Decisive Strike, Devour —
 * pointed back at them. What it asks for is the one thing a party that has been winning by
 * out-damaging everything has not needed: keeping a nearly-dead member alive rather than
 * finishing the fight before it matters.
 */
export const HEADSMANS_ARC = {
  id: 'headsmans-arc',
  name: "Headsman's Arc",
  target: 'enemy-lowest',
  effects: [{ kind: 'damage', damageType: 'physical', power: 2.1 }],
  cooldown: 45,
  priority: 3,
} as const;

/**
 * The wall-breaker lock: it goes for the biggest thing you brought.
 *
 * The mirror of {@link HEADSMANS_ARC}, and a sharper question than it looks. A front rank works
 * because ordinary attacks have to pass through it; a Tyrant does not attack *through* anything,
 * it attacks the party's largest HP pool — which is the wall itself. Sundering it on the way
 * means the second hit lands harder than the first, so the answer is sustain on the tank or a
 * cleanse, not a second body.
 */
export const TYRANTS_CLAIM = {
  id: 'tyrants-claim',
  name: "Tyrant's Claim",
  target: 'enemy-highest',
  effects: [
    { kind: 'damage', damageType: 'physical', power: 2.05 },
    { kind: 'status', status: SUNDER, chance: 0.85 },
  ],
  cooldown: 55,
  priority: 3,
} as const;

// ---------------------------------------------------------------------------------------
// Enemy kits — the tower locks
//
// Milestone 15c authored six more towers, and the thing it needed was not more difficulty but
// more *questions*: a tower biased toward a faction with one archetype is the same fight a
// hundred times. Elves had one block and Angels had one, so the six new towers had nothing to
// draw on until these existed.
//
// Each of these names a question nothing on the enemy side had asked before, which is the same
// bar the late locks above were held to:
//
// | Skill          | The question                                        | The answer                    |
// | -------------- | --------------------------------------------------- | ----------------------------- |
// | Wilding Bloom  | what if the board heals without a healer to burst?  | reach, or out-damage the tick |
// | Moonsong       | what if your *whole party* acts less often?         | a cleanse, or tenacity        |
// | Thornlash      | what if the wall that slows you also outlives you?  | penetration, or going around  |
// | Herald's Anthem| what if killing the small thing is the priority?    | reach, before the board grows |
// | Choir of Ash   | a refreshed absorb on five bodies rather than one   | burst, and a lot of it        |
// | Pillar of Light| the back-rank dive, magical                         | magic resist on the carries   |
// | Sevenfold Hex  | what if a cleanse can only take one of two?         | sustain, or killing it        |
// | Runeward       | what if *your* debuffs come off?                    | damage that needs no setup    |
// | Pall of Years  | what if it drains all five of you at once?          | burst inside one cast cycle   |
//
// ⚠️ **Every recurring buff here has a cooldown longer than the status it applies**, which is the
// rule {@link BULWARK} records in full and the one thing in this section that is a termination
// argument rather than tuning. A shield or a regeneration that cannot lapse turns a fight into a
// stalemate the ninety-second timer has to end.
// ---------------------------------------------------------------------------------------

/**
 * The Elven answer to a healer being killable: do not have one.
 *
 * A Marsh Acolyte behind two bodies is a *target* — unreachable, but a thing that dies once
 * reached. A regeneration is not a target at all: the Warden that applied it can be dead and its
 * whole side is still healing. So the answer moves from "get to it" to "out-damage the tick", and
 * a party built to burst one protected body finds nothing to burst.
 *
 * ⚠️ **65 against a 60-tick {@link REGENERATION}**, so it genuinely lapses. See {@link BULWARK}.
 */
export const WILDING_BLOOM = {
  id: 'wilding-bloom',
  name: 'Wilding Bloom',
  target: 'ally-all',
  effects: [{ kind: 'status', status: REGENERATION }],
  cooldown: 65,
  priority: 3,
} as const;

/**
 * The tempo lock, pointed at the whole party rather than at the front rank.
 *
 * A Bog Hag's {@link MIRE} slows the two bodies standing in front, which the party has already
 * decided are the expendable half. This takes a third of the gauge off all five, including the
 * healer and the carry — so it is not a defensive debuff, it is fewer turns in the fight. Gated
 * on the status being absent for the same reason `MIRE` is: a cleanse has to cost it a cast.
 */
export const MOONSONG = {
  id: 'moonsong',
  name: 'Moonsong',
  target: 'enemy-all',
  effects: [
    { kind: 'damage', damageType: 'magical', power: 0.8 },
    { kind: 'status', status: SLOW, chance: 0.85 },
  ],
  cooldown: 60,
  condition: { kind: 'status-absent', statusId: 'slow' },
  priority: 3,
} as const;

/** The Wyrdroot's own turn: the front rank held still while the thing in front of it regrows. */
export const THORNLASH = {
  id: 'thornlash',
  name: 'Thornlash',
  target: 'enemy-row-front',
  effects: [
    { kind: 'damage', damageType: 'physical', power: 1.05 },
    { kind: 'status', status: SLOW, chance: 0.7 },
  ],
  cooldown: 55,
  priority: 2,
} as const;

/**
 * The priority lock: a small thing that makes everything beside it bigger.
 *
 * Every wall on the ladder asks to be got past and every healer asks to be reached. A Herald asks
 * neither — it asks to be killed *first*, which is a different decision, because the party that
 * spends its opening turns on a 640-HP support is the party that has not yet touched the two
 * ascended blocks in front of it. The answer is reach, spent early.
 *
 * ⚠️ **70 against a 45-tick {@link RALLY}.** A permanent board-wide attack buff is not a lock.
 */
export const HERALDS_ANTHEM = {
  id: 'heralds-anthem',
  name: "Herald's Anthem",
  target: 'ally-all',
  effects: [{ kind: 'status', status: RALLY }],
  cooldown: 70,
  priority: 3,
} as const;

/**
 * {@link BULWARK} widened from one body to five, which is a different problem rather than a
 * bigger one.
 *
 * An Iron Bulwark's absorb sits on an Iron Bulwark, so burst spent on it is burst spent on the
 * thing the party wanted dead anyway. This puts the same pool on the fodder as well, so the
 * cheapest way through the board is the way the shield is best at stopping. Smaller per head than
 * a Bulwark's for exactly that reason.
 *
 * ⚠️ **90 against a 70-tick {@link BARRIER}**, which is the rule `BULWARK`'s comment argues.
 */
export const CHOIR_OF_ASH = {
  id: 'choir-of-ash',
  name: 'Choir of Ash',
  target: 'ally-all',
  effects: [{ kind: 'status', status: BARRIER }],
  cooldown: 90,
  priority: 3,
} as const;

/** A Sky-Shrike's dive said in the other damage type, so armour on the carries is not the answer. */
export const PILLAR_OF_LIGHT = {
  id: 'pillar-of-light',
  name: 'Pillar of Light',
  target: 'enemy-row-back',
  effects: [{ kind: 'damage', damageType: 'magical', power: 0.9 }],
  cooldown: 50,
  priority: 2,
} as const;

/**
 * Two hostile statuses at once, which is what makes a cleanse a choice rather than an answer.
 *
 * Every cleanse in the roster removes a fixed count, so a single debuff is cancelled outright and
 * two are halved. That is the whole of this lock: the party still has the answer it always had,
 * and this is the first thing that charges it twice for using it. Priced small per tick, because
 * two lingering procs on five bodies is already the widest damage-over-time in the game.
 */
export const SEVENFOLD_HEX = {
  id: 'sevenfold-hex',
  name: 'Sevenfold Hex',
  target: 'enemy-all',
  effects: [
    { kind: 'status', status: POISON, chance: 0.85 },
    { kind: 'status', status: BURN, chance: 0.85 },
  ],
  cooldown: 65,
  condition: { kind: 'status-absent', statusId: 'poison' },
  priority: 3,
} as const;

/**
 * The cleanse, pointed the other way — and the one enemy turn that takes an answer back.
 *
 * Sunder, Weaken and Slow have been the party's setup against every wall since milestone 4, and
 * nothing on the enemy side had ever removed one. A Colossus refuses them with tenacity, which is
 * a dice check the party can out-invest; this removes them after they land, which it cannot. What
 * is left is damage that needs no setup — which is a real thing to own and not every party does.
 *
 * ⚠️ **60 against a 45-tick {@link GUARD}**, so the armour half lapses between casts.
 */
export const RUNEWARD = {
  id: 'runeward',
  name: 'Runeward',
  target: 'ally-all',
  effects: [
    { kind: 'cleanse', count: 2 },
    { kind: 'status', status: GUARD },
  ],
  cooldown: 60,
  priority: 3,
} as const;

/**
 * The drain, widened to the whole party — the Sovereign's answer to being out-numbered.
 *
 * A Shade's {@link WITHERING_TOUCH} siphons off one target, so ignoring it is a decision about
 * one exchange. This siphons off five at once, which means the board's largest health pool is
 * refilled by whatever the party is still standing in — and the more of the party is alive, the
 * faster it heals. The answer is burst inside one cast cycle, which is why the cooldown is long
 * enough to have one.
 */
export const PALL_OF_YEARS = {
  id: 'pall-of-years',
  name: 'Pall of Years',
  target: 'enemy-all',
  effects: [{ kind: 'drain', damageType: 'magical', power: 0.8, siphon: 0.3 }],
  cooldown: 60,
  priority: 3,
} as const;

// ---------------------------------------------------------------------------------------
// The Bound Marches — milestone 17
//
// Four turns, one per new mechanic. Three of them do no damage at all, which is unusual for an
// enemy kit and is the chapter's whole thesis: what these spend a turn on is **where the party's
// damage is allowed to go**, and that is worth more than a hit at this end of the ladder.
// ---------------------------------------------------------------------------------------

/**
 * The wall steps forward, and nothing can be aimed past it.
 *
 * ⚠️ **60 against a 45-tick {@link OATHSHIELD}**, which is the duty-cycle rule its comment argues:
 * a party with no way to reach a whole row has to be given a window at whatever is standing
 * behind this, and a cooldown at or under the duration would never open one.
 */
export const DRAW_THE_OATH = {
  id: 'draw-the-oath',
  name: 'Draw the Oath',
  target: 'self',
  effects: [{ kind: 'status', status: OATHSHIELD }],
  cooldown: 60,
  priority: 4,
} as const;

/**
 * The board is bound together, so no one thing on it can be removed on its own.
 *
 * The Cantor's whole contribution, and it deals nothing: what it buys its side is that the party's
 * opening — kill the support, then the wall — stops resolving. The answer is to kill the Cantor,
 * which is the one body the link cannot protect from a party that has noticed.
 *
 * ⚠️ **80 against a 60-tick {@link CHAINBOND}.** Same rule, and here the window is what lets a
 * party bank a kill it has already earned.
 */
export const BIND_THE_CONCORD = {
  id: 'bind-the-concord',
  name: 'Bind the Concord',
  target: 'ally-all',
  effects: [{ kind: 'status', status: CHAINBOND }],
  cooldown: 80,
  priority: 3,
} as const;

/**
 * Seeds the back rank, where the party keeps everything that cannot take a hit.
 *
 * Aimed there rather than at the front on purpose: a payload on a wall is a payload the party was
 * always going to survive, and the decision this asks for — spend the cleanse now or trust the
 * heal to arrive — only exists when the thing carrying it would die.
 */
export const EMBERSEED = {
  id: 'emberseed',
  name: 'Emberseed',
  target: 'enemy-row-back',
  effects: [{ kind: 'status', status: EMBER_SEED, chance: 0.9 }],
  cooldown: 55,
  priority: 3,
} as const;

/**
 * Five payloads at once, on a fifty-tick fuse.
 *
 * The chapter's closing question, and it is a question about the party's *answer* rather than about
 * its damage: every cleanse in the roster removes a fixed count from one ally, so a brand on all
 * five is the first thing in the game that cannot be fully answered — only triaged.
 */
export const DOOMKNELL = {
  id: 'doomknell',
  name: 'Doomknell',
  target: 'enemy-all',
  effects: [{ kind: 'status', status: DOOMBRAND, chance: 0.85 }],
  cooldown: 75,
  priority: 3,
} as const;

// ---------------------------------------------------------------------------------------
// The Sundered Vault — milestone 18
//
// ⚠️ **Five turns, and not one new mechanic among them.** Milestone 17 spent the last of the
// vocabulary's headroom and said so; these are recombinations, deliberately and on the record.
// What makes them worth authoring is that each is a **pairing** the game has never made — a taunt
// welded to an absorb, a cleanse welded to a tempo buff, a wide hit gated on the party still being
// whole. The chapter's distinctness comes from those pairs and from the matchup matrix (every
// celestial hits every mortal for 1.10 with nothing coming back), not from a new lever.
//
// Read that as the honest version of milestone 17's argument rather than a weaker one: a ninth
// spelling of an existing skill is what that milestone refused, and a *new pair of existing
// skills on one body* is not that. Nothing below duplicates a skill already in this file.
// ---------------------------------------------------------------------------------------

/**
 * The jailer wears the pool it was going to spend on the door.
 *
 * ⚠️ **`self` rather than `ally-all`, and that is what keeps the Custodian answerable.** Spread
 * across a board this would be {@link WARD_UNBROKEN} pointed the wrong way — a fixed quantity
 * divided five ways, refreshed forever, in front of a party that has just been told what it may
 * hit. On the one body the taunt is dragging the party onto, it is a wall the party is *already
 * aimed at*: the pool depletes, nothing refills it, and the fight resolves.
 *
 * ⚠️ **70 against a 55-tick {@link AEGIS}**, the same duty-cycle rule {@link BULWARK} argues at
 * length. The gap is where the party's burst goes.
 */
export const WARD_THE_SEAL = {
  id: 'ward-the-seal',
  name: 'Ward the Seal',
  target: 'self',
  effects: [{ kind: 'status', status: AEGIS }],
  cooldown: 70,
  priority: 3,
} as const;

/**
 * The cleanse, pointed the other way *and* paid for in tempo.
 *
 * {@link RUNEWARD} already takes the party's setup back — that lock is chapter 3's and this does
 * not restate it. What is new is the second half: a Runewarden spends its cleanse on **armour**,
 * so the answer is to out-damage a wall that keeps standing back up. This spends it on **speed**,
 * so the board that just shrugged off the party's opening also starts acting more often. One says
 * "your setup did nothing"; this says "your setup did nothing, and now you are behind".
 *
 * ⚠️ **65 against a 45-tick {@link HASTE}**, so the tempo half lapses between casts and the board
 * is not permanently quickened. The cleanse half has no such window by design — that is the lock.
 */
export const ANTIPHON = {
  id: 'antiphon',
  name: 'Antiphon',
  target: 'ally-all',
  effects: [
    { kind: 'cleanse', count: 2 },
    { kind: 'status', status: HASTE },
  ],
  cooldown: 65,
  priority: 3,
} as const;

/**
 * What comes through a broken seal, and it is worst in the first ten seconds.
 *
 * ⚠️ **`enemies-at-least: 4` inverts the shape every other wide skill in this file has.** A fight
 * normally gets easier as the party thins, because the board's damage is spread over fewer
 * targets and its wide turns hit less; this one simply **switches off** once the party is down to
 * three, which means the encounter is at its hardest while the party is intact and cannot be
 * out-lasted. A party that opens slowly eats every cast of it.
 *
 * The pairing with {@link SUNDER} is what makes it more than chip: the party is softest exactly
 * when this is firing, so the debuff lands on a full board and the next cast is bigger.
 */
export const RIFTFALL = {
  id: 'riftfall',
  name: 'Riftfall',
  target: 'enemy-all',
  effects: [
    { kind: 'damage', damageType: 'magical', power: 1.1 },
    { kind: 'status', status: SUNDER, chance: 0.7 },
  ],
  cooldown: 70,
  condition: { kind: 'enemies-at-least', count: 4 },
  priority: 3,
} as const;

/**
 * An oath that only means anything once it has been broken.
 *
 * {@link WRATH_UNBOUND} is the roster's statement of `self-hurt` and it buffs the caster; this is
 * the other way to spend that condition, and the difference matters to the party holding the
 * damage. A Wrathborn that has been chipped is a body to burst *through*. This one answers the
 * chipping by reaching past the front rank at whatever is biggest — so wounding it is not a step
 * toward killing it, it is the thing that points it at the party's carry.
 */
export const BROKEN_COVENANT = {
  id: 'broken-covenant',
  name: 'Broken Covenant',
  target: 'enemy-highest',
  effects: [
    { kind: 'damage', damageType: 'physical', power: 2.3 },
    { kind: 'status', status: WEAKEN, chance: 0.6 },
  ],
  cooldown: 45,
  condition: { kind: 'self-hurt', fraction: 0.5 },
  priority: 4,
} as const;

/**
 * The Vault opens, and the chapter's closing question is asked in tempo rather than in damage.
 *
 * The Chainsworn's {@link DOOMKNELL} brands all five and asks *when* the cleanse is spent. This
 * asks something a cleanse cannot answer at all: a {@link STUN} is the shortest status in the game
 * and it is not removable, so the only defences are tenacity and having already banked the turn.
 * At 0.35 on five bodies it takes about two turns off the party per cast, which against a board
 * this one has just hastened is the difference between trading and being traded with.
 *
 * ⚠️ **Deliberately the cheapest of the three things the Seraph does.** A boss whose marquee turn
 * is a board-wide stun would be a fight decided by a dice roll; the damage is ordinary wide-skill
 * damage and the stun is the tail on it.
 */
export const THE_SEAL_BREAKS = {
  id: 'the-seal-breaks',
  name: 'The Seal Breaks',
  target: 'enemy-all',
  effects: [
    { kind: 'damage', damageType: 'magical', power: 1.1 },
    { kind: 'status', status: STUN, chance: 0.35 },
  ],
  cooldown: 80,
  priority: 3,
} as const;

// ---------------------------------------------------------------------------------------
// The Waking Barrows — milestone 21a
//
// ⚠️ **Three turns, no new status, and no new mechanic.** Milestone 21 licenses up to three new
// statuses across its four chapters and states that the budget is a ceiling rather than a quota —
// so this chapter, which is the first of the four, spends none of it. Everything below is either a
// piece of the vocabulary aimed somewhere it has never been aimed, or two known parts on one body.
//
// | Skill              | The part that is new                                    |
// | ------------------ | ------------------------------------------------------- |
// | Barrow Tithe       | a bomb on `enemy-highest` — the fuse lands on the wall   |
// | The Barrow Forgets | the first `ally-afflicted` turn on the enemy side        |
// | Wake the Bone      | {@link THORNMAIL} applied by a skill rather than authored as an `opening` |
//
// The chapter's other two questions are **board pairs** and need no skill at all: a taunt worn by a
// thorned body ({@link CAIRNBOUND_SENTINEL}), and a taunt standing in front of a linked board
// ({@link CAIRNBOUND_SENTINEL} beside {@link BONECHAIN_WARDEN}). Both are built entirely out of
// {@link DRAW_THE_OATH}, {@link BIND_THE_CONCORD} and statuses that already ship.
// ---------------------------------------------------------------------------------------

/**
 * The barrow takes its due from the largest thing standing.
 *
 * ⚠️ **A bomb aimed at `enemy-highest`, which is where no payload in the game has ever been
 * planted.** {@link EMBERSEED} seeds the back rank and {@link DOOMKNELL} brands everybody, and both
 * are aimed at bodies a party already expects to lose — so a cleanse spent on either is a cleanse
 * spent where it was always going to go. This lands on the one body a party never watches, because
 * the whole reason it is there is that it survives things.
 *
 * The consequence is a decision rather than a hit: the brand prices off **the applier's** attack,
 * not the target's health, so a wall is no safer carrying one than a carry is — and answering it
 * means pointing a cleanse at the member who looks least at risk, on the turn it was wanted
 * somewhere else.
 *
 * {@link DOOMBRAND} rather than {@link EMBER_SEED} on purpose: the fifty-tick fuse is the longest
 * in the library, which is what gives the party time to notice and still get the decision wrong.
 */
export const BARROW_TITHE = {
  id: 'barrow-tithe',
  name: 'Barrow Tithe',
  target: 'enemy-highest',
  effects: [
    { kind: 'damage', damageType: 'physical', power: 1.9 },
    { kind: 'status', status: DOOMBRAND, chance: 0.9 },
  ],
  cooldown: 60,
  priority: 4,
} as const;

/**
 * Whatever was done to the dead, the barrow does not keep.
 *
 * ⚠️ **The first enemy turn to use `ally-afflicted`**, which has been in `core/battle/types.ts`
 * since milestone 4 and spent entirely on the player's side. It is not {@link ANTIPHON} at a
 * smaller size: a board-wide cleanse takes two statuses off everybody and is answered by having
 * more of them, while this takes **three off the one body carrying the most** — so the party's
 * habit of stacking a Sunder, a Weaken and a Slow onto the thing it wants dead is the exact
 * behaviour it punishes, and spreading the same debuffs thinly is what it cannot answer.
 *
 * The condition is what keeps it honest. Without it the Keeper would burn its turn cleansing a
 * board with nothing on it; with it, the cast only ever happens because the party spent turns
 * setting up.
 *
 * ⚠️ **A cleanse and not a heal, which is why it may stand behind a taunt.** Removing a status puts
 * no health back, so nothing here can outrun the ninety-second clock — the failure a healer behind
 * a wall produces and that `docs/combat.md` scores as a defeat.
 */
export const THE_BARROW_FORGETS = {
  id: 'the-barrow-forgets',
  name: 'The Barrow Forgets',
  target: 'ally-afflicted',
  effects: [{ kind: 'cleanse', count: 3 }],
  cooldown: 50,
  condition: { kind: 'ally-afflicted' },
  priority: 3,
} as const;

/**
 * The bone remembers being armour.
 *
 * {@link THORNMAIL} has only ever been an `opening` — a thing that is simply true of a stat block
 * from the first tick. Spending a **turn** on it is what makes it a question: the board the party
 * has been cutting through freely becomes a board that charges for the swing, part way into a fight
 * it had already worked out how to have.
 *
 * ⚠️ **Permanent, board-wide, and safe to be both** — for the reason {@link THORNMAIL} itself
 * argues. A reflect can only ever *shorten* a fight: it is strictly extra damage on a schedule the
 * party controls, it resolves through `statusDamage` and so cannot cascade, and it puts nothing
 * back. There is no version of this that runs the clock out, which is exactly what a defensive
 * board-wide buff of any other kind would risk.
 *
 * A ninety-tick cooldown against a permanent status, which means it is cast once and then almost
 * never again. That is deliberate: what it costs its own side is the opening turn, and a Gravewright
 * that spent every third turn re-applying a status already up would be a body that never kills
 * anybody.
 */
export const WAKE_THE_BONE = {
  id: 'wake-the-bone',
  name: 'Wake the Bone',
  target: 'ally-all',
  effects: [{ kind: 'status', status: THORNMAIL }],
  cooldown: 90,
  // Above everything else its two carriers hold, so the board is thorned on the opening turn rather
  // than part way through. `toSkill` sorts by descending priority with a stable sort, so this is
  // the one clause that decides whether the chapter's third band happens at all on a mini-boss.
  priority: 5,
} as const;

// ---------------------------------------------------------------------------------------
// The Sunless Weald — milestone 21b
//
// Three turns, and all three are about **where** the party's damage is allowed to land. That is
// the same axis the Bound Marches worked and a different question on it: 17 asked *what the party
// is permitted to hit* and this asks *whether hitting it is worth what it used to be*.
//
// | Skill              | The aiming that is new                                              |
// | ------------------ | ------------------------------------------------------------------- |
// | Rootwake           | {@link ROOTBOUND} applied by a skill, where it is otherwise a passive |
// | The Long Loose     | the first debuff aimed at `enemy-row-back` — the party's safe half   |
// | Draw into the Root | a link cast **reactively**, on `ally-lowest`, as a heal would be     |
//
// The chapter's other two questions need no skill at all. **Evasion is a stat block** — `dodge`
// cannot be a status, because `ModifiableStat` is `atk`, `def` and `haste` and nothing else, and
// widening it is a `core/` change this milestone forbids. And **a bound back rank is an `opening`**,
// which is the whole of {@link ROOTBOUND}'s argument.
// ---------------------------------------------------------------------------------------

/**
 * The roots come up, and everything standing in them is one thing with several names.
 *
 * {@link ROOTBOUND} is otherwise a passive, exactly as {@link THORNMAIL} was until
 * {@link WAKE_THE_BONE}, and this is the same move for the same reason: a board the party has
 * already worked out how to take apart becomes a board it cannot take apart *in that order*, part
 * way into the fight.
 *
 * ⚠️ **Board-wide and permanent, and both are safe because a link conserves damage.** Nothing is
 * multiplied and nothing is refunded — the encounter's total health falls at the rate it always
 * did. What the party loses is its route, which is the difference between a lock and a clock. A
 * defensive board-wide buff of almost any other kind would be the second thing.
 *
 * Ninety ticks against a permanent status, so it is cast once and then effectively never again —
 * the same shape and the same reason as {@link WAKE_THE_BONE}. What it costs its own side is the
 * opening turn.
 */
export const ROOTWAKE = {
  id: 'rootwake',
  name: 'Rootwake',
  target: 'ally-all',
  effects: [{ kind: 'status', status: ROOTBOUND }],
  cooldown: 90,
  // Above everything else its carriers hold, so the board is bound on the opening turn rather than
  // part way through — the clause that decides whether the chapter's third band happens at all on
  // a mini-boss board.
  priority: 5,
} as const;

/**
 * The wood shoots the half of the party that was never being shot at.
 *
 * ⚠️ **The first debuff in the game aimed at `enemy-row-back`.** {@link EMBERSEED} plants there and
 * {@link SHRIKE_DIVE} hits there, so the party's back rank has been damaged before — but every
 * status the enemy side has ever applied lands on the front rank ({@link MIRE}), on one chosen body
 * ({@link TYRANTS_CLAIM}) or on everybody ({@link WITHERHEX}, {@link MOONSONG}). A {@link SUNDER}
 * on the three bodies the party keeps behind its wall is a statement that the wall stopped mattering.
 *
 * The pair it is authored for is the band's whole content: this opens the back rank, and the
 * archers standing beside it already reach there. Neither half is new and the sequence is.
 *
 * Ordinary damage rather than a large hit, because what it is spending its turn on is the setup.
 */
export const THE_LONG_LOOSE = {
  id: 'the-long-loose',
  name: 'The Long Loose',
  target: 'enemy-row-back',
  effects: [
    { kind: 'damage', damageType: 'physical', power: 0.9 },
    { kind: 'status', status: SUNDER, chance: 0.85 },
  ],
  cooldown: 60,
  condition: { kind: 'status-absent', statusId: 'sunder' },
  priority: 3,
} as const;

/**
 * The hurt one is pulled back into the whole.
 *
 * ⚠️ **A link cast reactively, which is a shape this game has only ever expressed as a heal.**
 * {@link BIND_THE_CONCORD} and {@link ROOTWAKE} are pre-emptive and board-wide; this waits until
 * the party has committed to killing something and then binds *that* body, so the damage already
 * aimed at it starts arriving somewhere else. It is {@link MEND}'s slot in a kit and it is not a
 * heal.
 *
 * ⚠️ **Which is exactly why it is allowed to stand behind a taunt, and a heal is not.** It puts no
 * health back — it moves what has not landed yet — so nothing here can outrun the ninety-second
 * clock. Sustain the party cannot aim at is the failure `docs/combat.md` scores as a defeat, and
 * this is the one answer to focus fire that is not that.
 *
 * The condition is what stops it being a second {@link ROOTWAKE}: with nobody hurt there is nothing
 * to pull back, and the cast only ever happens because the party chose a target.
 */
export const DRAW_INTO_THE_ROOT = {
  id: 'draw-into-the-root',
  name: 'Draw into the Root',
  target: 'ally-lowest',
  effects: [{ kind: 'status', status: ROOTBOUND }],
  cooldown: 50,
  condition: { kind: 'ally-hurt', fraction: 0.7 },
  priority: 4,
} as const;

// ---------------------------------------------------------------------------------------
// The Hollow Anvil — milestone 21c
//
// ⚠️ **Three turns and no new status.** Milestone 21 licenses three statuses across its four
// chapters, 21a spent none and 21b spent one; two remain and this chapter spends none of them. Each
// of these is a piece of the shipped vocabulary **aimed somewhere it has never been aimed**, which
// is the bar `AGENTS.md` sets and the bar 21a met.
//
// | Skill           | The aiming that is new                                                    |
// | --------------- | ------------------------------------------------------------------------- |
// | The Quench      | the first **status** of any kind aimed at `enemy-lowest`                   |
// | Iron for Iron   | the first reflect applied to a *chosen* ally, and the first reactive one   |
// | The Anvil Falls | the first stun aimed at **one body** rather than at the whole board        |
//
// The chapter's other two questions need no skill at all. **Refusal is a stat block** — `tenacity`
// is not a {@link ModifiableStat}, so it cannot be a status without a `core/` change this milestone
// forbids, and it does not need to be; that is band 1, and it is the same move the Sunless Weald
// made with `dodge`. And **band 4 is a pair**: {@link DRAW_THE_OATH} worn by a body whose `tenacity`
// and resists mean the one thing the party is permitted to hit is the one thing it cannot open.
// ---------------------------------------------------------------------------------------

/**
 * The hold puts the hot iron in the water, and what the party mended stops being mended.
 *
 * ⚠️ **The first status of any kind aimed at `enemy-lowest`.** The game has aimed *damage* there
 * since {@link HEADSMANS_ARC} — it is where a finisher goes — but never a payload, and the
 * difference is the whole band. `ally-lowest` is where every heal in the game is pointed
 * ({@link MEND}, {@link LITANY}), so a fuse planted on `enemy-lowest` lands on precisely the body
 * the party's healer is already committed to. The heal arrives, the fuse arrives on top of it, and
 * the cleanse and the heal want the same turn.
 *
 * That is what distinguishes it from the barrows' two. {@link BARROW_TITHE} lands on the body a
 * party never watches and {@link DOOMKNELL} lands on everybody; both ask *where to spend the
 * cleanse*. This one asks whether the cleanse is worth more than the heal on the one member the
 * party has already decided to save — and it re-asks it every time the party succeeds.
 *
 * {@link EMBER_SEED} rather than {@link DOOMBRAND}: forty ticks rather than fifty, because a fuse
 * racing a heal has to land while the memory of the heal is still on the screen. Magical, so the
 * physical resist a party brings to a hold full of hammers does not answer it.
 */
export const THE_QUENCH = {
  id: 'the-quench',
  name: 'The Quench',
  target: 'enemy-lowest',
  effects: [
    { kind: 'damage', damageType: 'physical', power: 1.5 },
    { kind: 'status', status: EMBER_SEED, chance: 0.9 },
  ],
  cooldown: 55,
  priority: 4,
} as const;

/**
 * Whatever the hold is losing, it armours — and it armours it with spines.
 *
 * ⚠️ **The first reflect applied to a chosen ally, and the first reactive one.**
 * {@link THORNMAIL} has been an `opening` since milestone 17 and a board-wide cast since
 * {@link WAKE_THE_BONE}; both are statements the board makes before the party has done anything.
 * This waits until the party has committed to killing something and then thorns *that* body, so the
 * damage the party has already decided to spend is the damage it is charged for.
 *
 * It is {@link DRAW_INTO_THE_ROOT}'s shape with a different answer in it, and the two are worth
 * reading together: a link moves what has not landed yet and asks the party to *spread*; this lets
 * the blow land in full and bills for it, which asks the party to **finish**. Against a bound board
 * the answer to focus fire is to stop focusing; against this one it is to focus harder.
 *
 * ⚠️ **Safe for the clock in the way every reflect is**: it puts nothing back and it can only ever
 * *shorten* a fight, because it is strictly extra damage on a schedule the party controls. It
 * resolves through `statusDamage`, so it cannot cascade and thorns cannot answer thorns.
 *
 * A forty-five tick cooldown against a permanent status, which is longer than it looks: the target
 * is whoever is lowest *now*, so a board that keeps losing different bodies keeps spending this,
 * and one that is losing the same body spends it once.
 */
export const IRON_FOR_IRON = {
  id: 'iron-for-iron',
  name: 'Iron for Iron',
  target: 'ally-lowest',
  effects: [{ kind: 'status', status: THORNMAIL }],
  cooldown: 45,
  condition: { kind: 'ally-hurt', fraction: 0.75 },
  priority: 4,
} as const;

/**
 * The hammer comes down on the biggest thing in the room.
 *
 * ⚠️ **The first stun aimed at one body rather than at the whole board.** {@link GATE_SLAM} and
 * {@link THE_SEAL_BREAKS} both take a third of everybody's next turn, which is a tax spread thin
 * enough that a party never plans around it. This takes the turn of the single body a party is
 * least able to do without, and it takes it reliably.
 *
 * `enemy-highest` is the party's wall by construction, and a wall's whole job is to be standing in
 * the front rank when an attack arrives — a job it keeps doing while stunned. What it stops doing is
 * everything else: the guard it was about to put up, the taunt it was about to wear, the blow that
 * was the party's only answer to a body it cannot debuff. On a board whose other question is that
 * the party's setup does not stick, the turn that would have re-applied it is the turn this takes.
 *
 * Answerable, and by things the roster already carries: `tenacity` is on six characters and this is
 * the first content that makes carrying it on the *front rank* worth anything, a cleanse pointed at
 * the front rank ends it early, and a party that does not field one enormous body has nothing here
 * for it to aim at.
 */
export const THE_ANVIL_FALLS = {
  id: 'the-anvil-falls',
  name: 'The Anvil Falls',
  target: 'enemy-highest',
  effects: [
    { kind: 'damage', damageType: 'physical', power: 1.6 },
    { kind: 'status', status: STUN, chance: 0.6 },
  ],
  cooldown: 60,
  priority: 4,
} as const;

// ---------------------------------------------------------------------------------------
// The Bleeding Wild — milestone 21d
//
// ⚠️ **Seven turns and the milestone's last two statuses.** 21a spent none of the three, 21b spent
// one and 21c spent none; both remaining go here, and the argument for each is in
// [`statuses.ts`](./statuses.ts) rather than restated. What the turns below are for is *aiming*
// them: {@link BLOODRISEN} at three weights and {@link SAVAGED} at two, because a lock the party
// meets once is a stat block and a lock it meets at fodder, at weight and board-wide is a chapter.
//
// | Skill             | What it says                                                          |
// | ----------------- | --------------------------------------------------------------------- |
// | Blood Risen       | hurting it is what arms it, and it does not calm down                 |
// | Blood Calls Blood | the pack arms whatever the party has committed to                     |
// | The Pack Answers  | one wounded body arms all of them                                     |
// | Rake              | a wound that runs until somebody spends a turn on it                  |
// | Open the Vein     | the same wound, on the body the party cannot spare                    |
// | Challenge Bellow  | the one thing you may hit is the thing you least want to wound        |
// | The Long Bleed    | all five of them, at once, on the body that grows as it dies          |
//
// **Three of the seven are the same status at three widths, which is deliberate rather than lazy.**
// A `self` frenzy is a body's own decision, an `ally-lowest` one is a support making it for the body
// the party chose, and an `ally-all` one is the board making it for everything at once — three
// different questions about who the party's damage is spent on, which is the shape
// {@link IRON_FOR_IRON} and {@link DRAW_INTO_THE_ROOT} already proved on their own statuses.
//
// ⚠️ **Nothing here puts health back, and on this chapter that is a rule rather than a preference.**
// The Monster idiom is `lifeLeech`, which is sustain tied to damage dealt — so a board that leeches
// *and* grows as it is hurt is the ninety-second clock with extra steps. The leech stays on the stat
// blocks, at the sizes the faction already carries, and never on a board with a taunt.
// ---------------------------------------------------------------------------------------

/**
 * The wounded thing, and it does not calm down.
 *
 * ⚠️ **{@link WRATH_UNBOUND}'s condition with a permanent status on the end of it**, and the pair is
 * worth reading together because the difference is the whole band. A Wrathborn below half health
 * rallies and hastens itself for forty-five ticks: a **window**, and a party that weathers four
 * turns has weathered it. This does not lapse, so the party is not being asked whether it can
 * survive a window — it is being asked **how it spends its damage**. Chipping five bodies without
 * killing them arms five of them for the rest of the fight; finishing one at a time arms at most
 * one.
 *
 * That is the inverse of the Sunless Weald's third band, which is why the two stand a chapter apart:
 * {@link ROOTBOUND} punishes focus and rewards spreading, and this punishes spreading and rewards
 * finishing. A party arriving with the weald's habit is holding exactly the wrong one.
 *
 * ⚠️ **Safe for the clock, and by the same argument every permanent status on the enemy side has
 * had to make**: it is a multiplier on the board's *attack*, so every version of this ends the fight
 * sooner. The defensive mirror — a body that armoured itself as it was hurt — is the one shape of
 * this nobody may author.
 *
 * ⚠️ **A cooldown does not stop a body re-applying a permanent status, it only paces it** — nothing
 * in the vocabulary can express "unless I already have this", since `status-absent` reads the
 * *opposing* side. So a body that lives long enough spends a turn every sixty ticks refreshing what
 * it already has, which is pure waste. **Sixty is kept because the waste was measured and is
 * nearly nothing**: fights on these boards run 150 to 250 ticks and the condition is met late in
 * them, so the chapter final measures 100% and 4.00 survivors either way, and the two only separate
 * past the tuned level (68% against 63% at 594). If a later chapter fields this on something that
 * survives a long fight, raise the cooldown past `MAX_BATTLE_TICKS` rather than assuming the same
 * holds.
 */
export const BLOOD_RISEN = {
  id: 'blood-risen',
  name: 'Blood Risen',
  target: 'self',
  effects: [{ kind: 'status', status: BLOODRISEN }],
  cooldown: 60,
  condition: { kind: 'self-hurt', fraction: 0.6 },
  priority: 3,
} as const;

/**
 * The pack arms whatever the party has decided to kill.
 *
 * {@link IRON_FOR_IRON} and {@link DRAW_INTO_THE_ROOT} are the two shipped statements of this shape
 * — a support waiting until the party commits, and then doing something to *that* body — and this is
 * the third and the most direct. Both of those change what the party's damage **costs** or **where it
 * goes**; this changes what the body being killed is **worth to the board while it dies**.
 *
 * ⚠️ **It is the reason band 1 is not answered by "just kill the wounded thing first".** A frenzy on
 * `self` is a body's own decision and the party can pre-empt it by finishing what it started; this
 * one arrives on the body the party has already committed to, on a turn the party does not control.
 */
export const BLOOD_CALLS_BLOOD = {
  id: 'blood-calls-blood',
  name: 'Blood Calls Blood',
  target: 'ally-lowest',
  effects: [{ kind: 'status', status: BLOODRISEN }],
  cooldown: 50,
  condition: { kind: 'ally-hurt', fraction: 0.75 },
  priority: 4,
} as const;

/**
 * One of them bleeds and all of them answer.
 *
 * The chapter's lieutenant signature, and ⚠️ **reactive rather than an opening turn**, which is the
 * shape {@link THE_GRUDGEKEEPER} found and this keeps. The Gravewright and the Longshadow set their
 * boards up on tick one and then stopped; a chapter about what the party's damage *does* cannot
 * state its lock before the party has done any.
 *
 * At `ally-all` it is the widest the frenzy goes, and the condition is looser than
 * {@link BLOOD_CALLS_BLOOD}'s on purpose — one chipped body is enough. So the board's answer to a
 * row attack is total, and the party that opened with one has armed everything it did not kill.
 *
 * ⚠️ **A seventy-tick cooldown, and it fires perhaps twice in a fight.** Re-applying refreshes
 * rather than stacks, so the second cast is only ever worth what it catches that the first missed —
 * the bodies that were still whole when the pack first answered.
 */
export const THE_PACK_ANSWERS = {
  id: 'the-pack-answers',
  name: 'The Pack Answers',
  target: 'ally-all',
  effects: [{ kind: 'status', status: BLOODRISEN }],
  cooldown: 70,
  condition: { kind: 'ally-hurt', fraction: 0.85 },
  priority: 5,
} as const;

/**
 * A wound that runs until somebody spends a turn on it.
 *
 * ⚠️ **The first hostile status in the game that does not expire**, and what that does to a party is
 * change what a cleanse *is*. Every debuff on the ladder so far runs out on its own, so a cleanse has
 * been an optimisation — spend it and take less, skip it and take the rest. {@link SAVAGED} makes the
 * cleanse the only clock, and a party fielding none carries every wound it takes to the end of the
 * fight.
 *
 * Deliberately small per proc and deliberately certain: there is no `chance` on it, because a
 * question about *whether to spend the answer* is ruined by a version of it that sometimes does not
 * need answering. What varies is how many of them are running at once.
 */
export const RAKE = {
  id: 'rake',
  name: 'Rake',
  target: 'enemy-front',
  effects: [
    { kind: 'damage', damageType: 'physical', power: 1.5 },
    { kind: 'status', status: SAVAGED },
  ],
  cooldown: 35,
  priority: 3,
} as const;

/**
 * The same wound, on the body the party can least afford to spend a cleanse on.
 *
 * `enemy-back` is where the party's healer stands, and a healer carrying a bleed that never lapses
 * is a healer choosing between mending somebody else and stopping its own. That is the band's
 * second half: {@link RAKE} asks how many wounds the party can carry, and this asks **which** of
 * them it is willing to.
 */
export const OPEN_THE_VEIN = {
  id: 'open-the-vein',
  name: 'Open the Vein',
  target: 'enemy-back',
  effects: [
    { kind: 'damage', damageType: 'physical', power: 1.7 },
    { kind: 'status', status: SAVAGED },
  ],
  cooldown: 45,
  priority: 4,
} as const;

/**
 * It stands up, and everything else on the board stops being a legal target.
 *
 * ⚠️ **The pair band 4 is built from, and it is a different sentence from the Hollow Anvil's.** That
 * chapter put a taunt on a body the party could not *open*; this puts one on a body the party had
 * better not **wound** — it carries {@link BLOOD_RISEN}, so the one thing a single-target party is
 * permitted to hit is the one thing that gets permanently stronger for being hit. Reach is worth
 * nothing while the door is shut, and the door arms itself while the party knocks.
 *
 * The answer is the one the taunt rule has always left open: kill it inside the window, or bring a
 * row attack and spend the door's own turns hitting what is behind it.
 *
 * ⚠️ **Sixty ticks against a forty-five tick taunt**, which `skills.spec.ts` holds and which is what
 * leaves a single-target party a window at the rest of the board.
 */
export const CHALLENGE_BELLOW = {
  id: 'challenge-bellow',
  name: 'Challenge Bellow',
  target: 'self',
  effects: [{ kind: 'status', status: OATHSHIELD }],
  cooldown: 60,
  priority: 4,
} as const;

/**
 * All five of them at once, from the thing that grows as it dies.
 *
 * {@link DOOMKNELL} is the shape — a payload on every member, against a cleanse that removes a fixed
 * count — and the difference is that a doom goes off and this one does not stop. Five permanent
 * bleeds against one cleanse is the chapter's second band restated as arithmetic the party cannot
 * win outright: it can clear the two that matter and the other three run to the end of the fight.
 *
 * ⚠️ **Wide, so the damage clause is small** — `skills.spec.ts` caps a row or wave skill at 1.2, and
 * this sits under it because the bleed is the point and the swing is the delivery.
 */
export const THE_LONG_BLEED = {
  id: 'the-long-bleed',
  name: 'The Long Bleed',
  target: 'enemy-all',
  effects: [
    { kind: 'damage', damageType: 'physical', power: 1.1 },
    { kind: 'status', status: SAVAGED, chance: 0.85 },
  ],
  cooldown: 60,
  priority: 4,
} as const;

// ---------------------------------------------------------------------------------------
// The Human Tower's second hundred floors — milestone 21e
//
// Three skills for four Undead blocks, and the ratio is the point: a tower's second hundred is not
// a chapter and does not get a vocabulary. What it needs is **attrition** — a hundred floors each
// climbed exactly once, so what a floor costs matters more than what it teaches — and two of these
// three exist to raise that cost out of parts that already ship.
// ---------------------------------------------------------------------------------------

/**
 * Past the wall rather than through it.
 *
 * The reach the Undead bench did not have at speed. {@link CUTPURSE} goes for the back rank too and
 * is a `common`'s turn; this is what a body built to arrive first does with the same target, and it
 * leaves a {@link SLOW} behind so the member it opened on is slower to answer.
 *
 * ⚠️ **Aimed at the row the party's own healing lives in**, which is the whole reason a tower wants
 * one. A climb is a hundred fights with no re-try, so a board that only ever hits the front rank is
 * a board the party's support never has to be protected from.
 */
export const NIGHT_RIDE = {
  id: 'night-ride',
  name: 'Night Ride',
  target: 'enemy-back',
  effects: [
    { kind: 'damage', damageType: 'physical', power: 1.75 },
    { kind: 'status', status: SLOW, chance: 0.55 },
  ],
  cooldown: 55,
  priority: 3,
} as const;

/**
 * What the reliquary is for.
 *
 * ⚠️ **A shield rather than a heal, and on a tower that distinction is the difference between
 * content and a defeat.** Sustain on the enemy side is how a floor stops being a lock and becomes
 * the ninety-second clock — the Dwarf Tower's roof was exactly that in 15c — but a shield banks a
 * pool once and depletes, so it cannot outrun rising damage the way a regeneration can. That is the
 * same argument `docs/signature-items.md` makes about Seraphine's item, read from the other side of
 * the board.
 *
 * {@link BULWARK} is the shape and this is not a copy of it: a barrier is 1.5 and an aegis is 2.3,
 * so this is what a board gets when it is worth spending a heavier turn on, and the cooldown is
 * longer than the pool lasts so there is always a stretch with no shield up.
 */
export const RELIQUARY_SEAL = {
  id: 'reliquary-seal',
  name: 'Reliquary Seal',
  target: 'ally-all',
  effects: [{ kind: 'status', status: AEGIS }],
  cooldown: 75,
  priority: 4,
} as const;

/**
 * The order that raised them, given once more.
 *
 * ⚠️ **The first board-wide `atk` buff any Undead block has carried**, and the reason the tower's
 * roof gets it rather than a chapter is that a roof is the one fight in a climb a player cannot
 * route around. {@link HERALDS_ANTHEM} is the same status on the Angel bench; what is new is the
 * body it is attached to, which also executes.
 *
 * ⚠️ **It lapses, deliberately**, unlike the permanent rallies milestone 21d authored. Forty-five
 * ticks against a seventy-tick cooldown is a window the party can wait out — which is what keeps a
 * roof a fight about timing rather than a race the board wins by standing still. A permanent one
 * here would be the boss reading its own stat block twice.
 */
export const THE_LAST_MUSTER = {
  id: 'the-last-muster',
  name: 'The Last Muster',
  target: 'ally-all',
  effects: [{ kind: 'status', status: RALLY }],
  cooldown: 70,
  priority: 5,
} as const;

// ---------------------------------------------------------------------------------------
// The Dwarf Tower's second hundred floors — milestone 21f
//
// Three skills for four Human blocks, the ratio 21e set. What is different is the **axis**: these
// all spend their turn on the party's own numbers rather than on the board's.
//
// ⚠️ **Measured, not assumed.** A Dwarf five carries the lowest `atk` in the game and the alternate
// arrangement is three tanks, so what threatens it is never bulk — it out-lasts bulk, and the
// ninety-second clock is what it loses to. At equal weight an *offensive* board resolves about
// twelve seconds faster than a bulky one and both Dwarf crews clear it, where only one clears the
// bulky one. So the tower escalates through what the board does per turn, and every skill here
// either lands damage or opens the armour that is stopping it.
//
// No new status: milestone 21's budget was spent and closed by 21d, and a tower does not re-open
// it. {@link SUNDER} is the game's only defence shred and it had never been pointed at the faction
// with the deepest armour in it.
// ---------------------------------------------------------------------------------------

/**
 * A charge needs a line to break.
 *
 * The heaviest single hit on the Human bench, and the first one that is simply damage — Humans
 * field a healer, a caster and a taunt-wall at `legendary`, so until now the faction's answer to
 * anything was a turn spent not attacking.
 *
 * ⚠️ **Conditioned on the party being whole, which is what makes it a rhythm rather than a bigger
 * number.** A lance is spent on the charge; once a member is down the line is already broken and
 * this stops offering, so the block falls back to swinging. That front-loads the board's damage,
 * and a fight decided early is a fight that ends — which is the whole reason this tower reaches for
 * offence. The mirror of {@link HEADSMANS_ARC}, which only becomes interesting once somebody *is*
 * hurt.
 */
export const COUCHED_LANCE = {
  id: 'couched-lance',
  name: 'Couched Lance',
  target: 'enemy-front',
  effects: [{ kind: 'damage', damageType: 'physical', power: 2.15 }],
  cooldown: 50,
  condition: { kind: 'enemies-at-least', count: 4 },
  priority: 3,
} as const;

/**
 * You do not climb a dwarven wall. You go under it.
 *
 * {@link SUNDER} across the front rank, which is where a Dwarf party keeps everything it is proud
 * of. `statusChance` is `authored + insight − tenacity`, so a block built to land this carries
 * `insight` rather than a higher chance — the honest way to answer a faction that refuses debuffs
 * for a living.
 *
 * ⚠️ **A row rather than the board, and that is the difference from {@link WITHERHEX}.** The
 * board-wide version of a stat shred is a multiplier on everything the enemy side does for the rest
 * of the fight; aimed at the two bodies standing in front it is a statement about the *wall*, which
 * is the thing this tower is actually about. It carries a damage clause for the same reason every
 * wide skill does — a turn that only sets up is a turn a slow party is happy to be given.
 */
export const UNDERMINE = {
  id: 'undermine',
  name: 'Undermine',
  target: 'enemy-row-front',
  effects: [
    { kind: 'damage', damageType: 'physical', power: 1 },
    { kind: 'status', status: SUNDER, chance: 0.85 },
  ],
  cooldown: 55,
  priority: 3,
} as const;

/**
 * The moment the hold stopped being a hold.
 *
 * The roof's own turn, and it is a **single-target** hit rather than a board-wide one on purpose.
 * The board-wide version was authored first and measured: {@link SUNDER} on all five plus a wave of
 * damage from a body at this weight reads 0% for both Dwarf crews at the top floor, and no line-up
 * underneath it recovers that. Aimed at one body in the front rank it is the same idea at a size a
 * crew can answer — open the wall, then walk through the hole.
 *
 * ⚠️ **No sustain of any kind on this kit**, which is the sentence 15c's Dwarf Tower roof failure
 * wrote: a healer behind the last floor of a climb is the ninety-second clock rather than a lock,
 * and this is the tower that discovered it.
 */
export const THE_BREACH_GIVEN = {
  id: 'the-breach-given',
  name: 'The Breach Given',
  target: 'enemy-front',
  effects: [
    { kind: 'damage', damageType: 'physical', power: 1.9 },
    { kind: 'status', status: SUNDER, chance: 0.85 },
  ],
  cooldown: 55,
  priority: 4,
} as const;

// ---------------------------------------------------------------------------------------
// The Elf Tower's second hundred floors — milestone 21g
//
// Three skills for four Dwarf blocks, the ratio 21e set and 21f kept. The **axis** is a third one
// again, and it was measured rather than chosen: an Elf five carries the softest bodies in the game
// and answers a formation by going around it, so what these spend a turn on is the *back rank*.
//
// ⚠️ **Neither of the two shipped escalations transfers, and both were measured on this tower's own
// crews before anything was authored.** 21e thins the anchors and thickens the board's support —
// against the Elf pair a shield support in the back rank leaves the weaker arrangement at 100% with
// 4.25 of five alive, so it is worth nothing here. 21f escalates in front and forbids sustain
// because a Dwarf five loses to the clock — but an Elf five resolves the tower's heaviest authorable
// board in eleven seconds against a ninety-second timer, so the clock is not the constraint and a
// wall is affordable. What is scarce is *health*: two anchors take the weaker arrangement from 100%
// to 43%.
//
// So the wall is the point and it is not the threat. It buys time for something that deletes a
// 350 hp body, and the party's reach — the thing an Elf five believes it owns — has to be spent on
// one or the other.
//
// No new status: milestone 21's budget was spent and closed by 21d, and a tower does not re-open it.
// {@link SLOW} and {@link BARRIER} are the vocabulary here, and {@link GUARD} beside it.
// ---------------------------------------------------------------------------------------

/**
 * Over the wall rather than through it.
 *
 * The heaviest single hit on the Dwarf bench and the first one aimed past a front rank. Dwarves have
 * carried reach since 15c — {@link CUTPURSE} at ×1.35 and {@link MOTE_LANCE} at ×1.1 — and both are
 * chip damage that a party absorbs while it works on the wall. This is the size at which the back
 * rank has to be defended, which is what makes the wall in front of it a decision rather than a
 * delay.
 *
 * ⚠️ **`enemy-back` rather than `enemy-lowest`, and that is the whole of it.** An Elf five keeps its
 * support and its casters behind two bodies made of paper, so a skill that chases the wounded is
 * chasing whoever the board happened to hit — where this names the rank the party chose to protect
 * and charges it for the choice.
 */
export const SLUNG_ANVIL = {
  id: 'slung-anvil',
  name: 'Slung Anvil',
  target: 'enemy-back',
  effects: [{ kind: 'damage', damageType: 'physical', power: 2 }],
  cooldown: 55,
  priority: 3,
} as const;

/**
 * The wards were cut before anyone climbed them.
 *
 * The roof's defensive turn, and a **shield rather than a heal** — 15c measured what sustain on a
 * last floor is, and 21e wrote down the safe form of the same idea: a pool banked once depletes,
 * where a regeneration refills. {@link GUARD} rides beside it because the two answer different
 * halves of an Elf five, which lands many small hits rather than few large ones.
 *
 * ⚠️ **Affordable here and nowhere else so far.** The Dwarf Tower forbids sustain above floor 180
 * because a Dwarf five cannot burst and every point of it is a second of a ninety-second clock. An
 * Elf five takes this board in twenty-two seconds, so a banked pool costs it turns rather than the
 * fight. Do not carry the licence to a third tower without measuring that tower's own crews.
 */
export const THE_WARDS_HOLD = {
  id: 'the-wards-hold',
  name: 'The Wards Hold',
  target: 'ally-all',
  effects: [
    { kind: 'status', status: BARRIER },
    { kind: 'status', status: GUARD },
  ],
  cooldown: 75,
  priority: 3,
} as const;

/**
 * A line does not miss, and neither does anything standing on it.
 *
 * The roof's own answer to reach: it reaches further. A whole rank rather than one body, because the
 * rank is what an Elf five commits to — three soft bodies behind two soft bodies — and {@link SLOW}
 * on the survivors is aimed at the one stat the faction is actually built out of.
 *
 * ⚠️ **The power is the wide-skill ceiling and the ceiling is the reason, not a coincidence.** This
 * was authored at ×1.35 and `skills.spec.ts` refused it: a row skill is capped at ×1.2 because five
 * small hits against the diminishing-DEF curve are worth far less than one big one, so a wide
 * multiplier has to be read against the curve rather than against the target count. That is a design
 * rule this tower does not get to buy its way past, and what paid for the difference was the roof's
 * own stat line rather than a bigger number here.
 */
export const THE_LINE_TRUE = {
  id: 'the-line-true',
  name: 'The Line True',
  target: 'enemy-row-back',
  effects: [
    { kind: 'damage', damageType: 'physical', power: 1.2 },
    { kind: 'status', status: SLOW, chance: 0.6 },
  ],
  cooldown: 60,
  priority: 4,
} as const;

// ---------------------------------------------------------------------------------------
// The Undead Tower's second hundred floors — milestone 21h
//
// Three skills for four Elf blocks, the ratio 21e set and 21f and 21g kept. The **axis** is a
// fourth one again, and like the three before it, it was measured on this tower's own crews before
// anything was authored. Controlled at one anchor, two legendaries and two commons at the roof's
// level, only the mechanic varying:
//
//   dodge      ref  95% / alt  65%   ← the only shape that fails a bar
//   burst      ref 100% / alt  95%
//   healer     ref  98% / alt  90%   ← and the slowest board, 30.8s mean and 50s max
//   slow       ref 100% / alt 100%
//   link       ref 100% / alt 100%
//   reach      ref 100% / alt 100%
//
// ⚠️ **`dodge` is the lock here and the reason is structural rather than tuned.** No Undead
// character carries a point of `accuracy` — the stat lives on four Elves and one Human, and there
// is none in `gear.ts` or `signature.ts` either — so this is the one tower in the game where an
// evasion pool has no answer a player can buy. And every Undead body sustains on `drain` and
// `lifeLeech`, so a miss costs the hit *and* the health the hit would have returned. It is the
// faction's engine attacked at the source rather than a tax on its damage.
//
// ⚠️ **What keeps that fair is where the pools are put, which is the whole of the licence.** They
// sit on soft bodies, so reach and focus fire are the answer — the same argument 21g made for
// {@link PLUMBLINE_HAND}, and the reason no evasion goes on a body this crew already cannot burst.
// Unlike `tenacity`, which can refuse a debuff outright, `dodge` is a chance floored by
// `MIN_HIT_CHANCE`: it costs turns, it never closes a door.
//
// ⚠️ **21f's rule binds here too, and this is the second tower it has.** An Undead five takes the
// shipped floor 100 in 34.4 seconds with two of five alive — the slowest crew reading in any tower,
// against an Elf five's 10.8 — so sustain near the roof is the ninety-second clock rather than a
// lock. That is awkward, because a healer the party cannot out-drain is this tower's *own* first
// hundred's thesis. It is spent in the middle bands and forbidden above floor 160.
//
// No new status: milestone 21's budget was spent and closed by 21d, and a tower does not re-open it.
// {@link WEAKEN} and {@link SUNDER} are the vocabulary here, and the `dodge` stat beside them.
// ---------------------------------------------------------------------------------------

/**
 * The light comes through, and what it touches has less in it than it did.
 *
 * The second half of this tower's lock, and the half that answers the party's answer. Evasion means
 * a swing does not land; this means the swings that do land return less — and against a faction
 * whose every body siphons a fraction of the damage it deals, an `atk` debuff is charged **twice**,
 * once on the hit and once on the health the hit would have paid back. Nothing else in the status
 * library double-dips on this faction.
 *
 * ⚠️ **`enemy-all` rather than a rank, which is what makes it worth a turn against these crews.**
 * An Undead five has no shape to it — no protected healer, no body the debuff can be aimed at — so
 * a rank-wide version would blunt whichever two happened to be in front and leave the drains behind
 * them at full weight. ×0.85 is well under the ×1.2 wide-skill ceiling because the damage is not
 * the point.
 */
export const SUNFADE = {
  id: 'sunfade',
  name: 'Sunfade',
  target: 'enemy-all',
  effects: [
    { kind: 'damage', damageType: 'magical', power: 0.85 },
    { kind: 'status', status: WEAKEN, chance: 0.75 },
  ],
  cooldown: 60,
  priority: 3,
} as const;

/**
 * Above the canopy there is nothing to stand behind.
 *
 * The roof's reach, and it names the rank rather than chasing the wounded. An Undead five keeps
 * everything that is not a wall in its back rank — the heal, the reach and two of the three drains
 * — and it keeps them on bodies carrying 7 to 10 `def`, which is the softest back rank in the game.
 * {@link SUNDER} on the survivors is the second visit charged in advance.
 *
 * ⚠️ **×1.2 is the wide-skill ceiling and it is the ceiling on purpose**, exactly as
 * {@link THE_LINE_TRUE} was cut to it in 21g. Five small hits against the diminishing-DEF curve are
 * worth far less than one big one, so a wide multiplier is read against the curve rather than
 * against the target count, and what pays for a roof is its own stat line.
 */
export const THE_CANOPY_PARTS = {
  id: 'the-canopy-parts',
  name: 'The Canopy Parts',
  target: 'enemy-row-back',
  effects: [
    { kind: 'damage', damageType: 'physical', power: 1.2 },
    { kind: 'status', status: SUNDER, chance: 0.8 },
  ],
  cooldown: 60,
  priority: 4,
} as const;

/**
 * Noon, and nowhere on the board is out of it.
 *
 * The roof's second turn and the heaviest `enemy-all` hit in the game — ×1.0 against
 * {@link GRAVE_TIDE}'s ×0.95 and {@link MOONSONG}'s ×0.8, still under the ×1.2 ceiling. Aimed at
 * every body at once for a reason specific to what it is fighting: an Undead five's health bars are
 * a **shared pool** in practice, refilled out of whatever it manages to land, so pressure applied
 * to all five at once is pressure the siphon cannot keep pace with. Focused on one body it would be
 * healed off before the next turn came round.
 *
 * ⚠️ **It carries no status and it heals nothing**, which is the roof's whole discipline. This
 * tower's crew is the slowest in the game and its roof board has to resolve; a wide hit that simply
 * removes health is the shape that shortens a fight rather than lengthening it.
 */
export const THE_SUN_AT_NOON = {
  id: 'the-sun-at-noon',
  name: 'The Sun at Noon',
  target: 'enemy-all',
  effects: [{ kind: 'damage', damageType: 'magical', power: 1 }],
  cooldown: 70,
  priority: 3,
} as const;

// ---------------------------------------------------------------------------------------
// Milestone 21i — the Monster Tower's second hundred, floors 101–200.
//
// Four skills for four blocks, one block each in the four thinnest factions — angel, demon,
// monster, human. ⚠️ **Spread rather than leaned, and that is the tower rather than an exception
// to it.** Every faction counters Monsters, so "field what counters the crew" resolves to all
// seven; `towers.spec.ts` reads that off the matrix and bounds every faction's share of the boards
// between a third and a three-quarters of an even split instead of asserting a leader.
//
// ## The axis is *how many different questions one board asks*, and it was measured first
//
// Controlled at one anchor, one legendary and three commons at the roof's level, only the mechanic
// varying, against both Monster arrangements — mean survivors of five:
//
//   nothing            ref 4.35 / alt 4.00
//   one lock, ×4       ref 4.13 / alt 3.92
//   two questions      ref 4.05 / alt 3.90
//   three questions    ref 4.00 / alt 2.70
//   four questions     ref 4.00 / alt 2.98
//   five questions     ref 3.58 / alt 0.85
//
// ⚠️ **Repeating one lock is worth almost nothing and the count is worth everything**, which is the
// opposite of what the other three second hundreds found — the Human Tower thickened its support,
// the Dwarf Tower its front rank, the Elf Tower hid a burster behind a wall, and 21h's was a stat
// block. It is a fact about this crew: a Monster five answers any single question by out-damaging
// it, and has no second answer to spend when a board asks two more.
//
// ⚠️ **A link is worth *less* than nothing here and no board above floor 100 carries one.** Measured
// on a five-question board, `rootbound` took the alternate five from 2.42 survivors to 3.33 and a
// cast `chainbond` to 3.85. A link is a defence against **focus fire**, and this is the one crew
// that does not focus — four of its eight bodies open with a row attack and three of its four drains
// name `enemy-lowest`, so spreading a share of each blow is a board volunteering to die evenly.
//
// ## What the crew has no answer to buy, and what it does
//
// ⚠️ **Monsters are the only faction in the game with no heal, no regeneration and no shield.**
// Every other faction has at least two of the three; this one has `drain` and `lifeLeech` and
// nothing else, so every point of health it gets back has to be taken off a body it is currently
// hitting. It also carries no `tenacity`, no `accuracy` and no `dodge` on any of its eight
// characters. What that licenses is **charging turns and charging health that cannot come back** —
// the first hundred's own thesis, and what this band does with it is stop asking it one body at a
// time.
//
// ⚠️ **What it does *not* license is `dodge`, and the reason is that 21h already spent it.** No
// Monster character carries `accuracy` either, so an evasion board reads 100% / 50% here — the same
// unanswerable shape the Undead Tower is built on. Two towers with one lock is one tower shipped
// twice, so it is left on the shelf and appears only at the density the shipped hundred already
// used.
//
// ⚠️ **The weight ceiling is the lowest of the five towers extended so far, and it is what makes the
// count the axis.** At the roof's level one anchor over four *legendaries* measures 95% / 3% and any
// two anchors is 8% / 0% — so a board gets one heavy body and four soft ones, and the only way to
// make it ask more is to make the soft ones sharper. Every block below is cheap for what it says.
//
// ⚠️ **A taunt at common weight was authored, measured and cut, and the finding is worth keeping.**
// The idea was that a taunt narrows the pool *before* the row rule is consulted, so a soft one would
// make a five-question board answer itself in the board's order rather than the party's. It does the
// opposite: on an otherwise plain board at the roof's level it took the reference five from 4.42
// survivors to **4.70** and the alternate from 3.90 to 4.00. A taunt on a body the party kills in a
// turn is not a door, it is a **cheap target volunteered** — and a multi-target selection ignores a
// taunt entirely, so the four row attacks in this crew's kit never see it at all. Every taunt in the
// game is a legendary carrying 1020 to 1180 hp, and that turns out to be the mechanic's price rather
// than a habit of how it has been authored.
//
// No new status. Milestone 21's three-status budget was spent and closed by 21d; 21e recorded that a
// tower does not re-open it, and 21f through 21h did not need to either.
// ---------------------------------------------------------------------------------------

/**
 * It is not standing in front of you. It is directly above you, and so is everything else.
 *
 * ⚠️ **The first common in the game to reach a whole rank.** `enemy-row-back` is carried by six
 * blocks and every one of them is a legendary or an `ascended` — {@link SERAPH_ADJUDICANT},
 * {@link LONGBOUGH_MARKSMAN}, {@link SKYSHRIKE}, {@link EMBERSEED_WARLOCK}, and the three Elf
 * anchors — so reaching a back rank has always cost a board one of its two heavy slots. That is
 * exactly the constraint this tower cannot afford: its crew's weight ceiling is one anchor over four
 * soft bodies, so a board that had to buy reach at legendary weight could ask at most two other
 * questions.
 *
 * ⚠️ **It is also Angels' first cheap question of any kind, which was the largest hole in the
 * bench.** Every other faction ships a common that asks something — a stun, a bomb, thorns, a link,
 * evasion, a slow, a permanent bleed — and Angel's three ({@link GILDED_SENTRY},
 * {@link VAULTLIGHT_CENSER}, {@link LUMEN_ACOLYTE}) are plain attackers, because the faction's
 * vocabulary of shields, links and taunts all sits at legendary and above. It mattered here more
 * than anywhere: celestials take ten percent off Monsters where the mortals manage five, so an Angel
 * body is the hardest thing a board can carry and this tower could not previously carry one cheaply.
 *
 * ×0.75 is a long way under the ×1.2 wide ceiling and under {@link PILLAR_OF_LIGHT}'s ×0.9 on a
 * legendary. A cheap rank-wide hit is priced as chip: what it buys a board is that the crew's back
 * rank is never *safe*, not that it is threatened by this body alone.
 */
export const ZENITHFALL = {
  id: 'zenithfall',
  name: 'Zenithfall',
  target: 'enemy-row-back',
  effects: [{ kind: 'damage', damageType: 'magical', power: 0.75 }],
  cooldown: 50,
  priority: 2,
} as const;

/**
 * It does not land in front of you. It lands behind you, and it leaves lighter than it came.
 *
 * ⚠️ **The first block in the game to reach a whole back rank and feed off what it finds there.**
 * `enemy-row-back` exists on six blocks and `lifeLeech` on eleven, and the two have never been on
 * one body — reach has always been a way of skipping a wall, and leech a way of standing in front of
 * one. Against this crew the pairing is specific rather than decorative: a Monster five keeps three
 * of its five in the back rank and every point of damage it does lives there, so a body that takes
 * health out of that rank and puts it into itself is trading in the one currency the crew cannot
 * mint.
 *
 * ×1.05 is under the ×1.2 wide ceiling and well under it, because the leech is what the turn is for.
 */
export const RUINOUS_STOOP = {
  id: 'ruinous-stoop',
  name: 'Ruinous Stoop',
  target: 'enemy-row-back',
  effects: [
    { kind: 'damage', damageType: 'magical', power: 1.05 },
    { kind: 'status', status: SUNDER, chance: 0.6 },
  ],
  cooldown: 55,
  priority: 3,
} as const;

/**
 * The pack does not take the nearest. It takes the largest, and then it waits.
 *
 * ⚠️ **The first time {@link SAVAGED} has been aimed at one chosen body.** It is the only hostile
 * status in the game that does not expire, and every application of it so far has been broad —
 * `enemy-front` on four blocks, `enemy-back` on one, `enemy-all` on {@link THE_EVERWOUND}. Named at
 * `enemy-highest` it stops being weather and becomes a decision, because `enemy-highest` on a
 * Monster five is always its tank: the one body it fields for the purpose of still being there.
 *
 * ⚠️ **This is the crew's own targeting handed back to it.** `enemy-highest` is Monster vocabulary
 * — {@link TYRANT}, {@link THE_REDMAW}, {@link THE_EVERWOUND}, and Ozza and Vharok on the player's
 * side — and `monster → monster` is the matchup matrix's one self-edge, so on this tower and nowhere
 * else the faction is fighting the thing that reads it best.
 *
 * A wound that will not close is only a fight rather than an execution because it is small: 0.12 a
 * tick, the lightest dot in the library. What makes it bite is that the crew has no cleanse, no
 * heal, no regeneration and no shield — a Monster five's only way to put health back is to take it
 * off something, and this takes a little of it away again every tick for the rest of the fight.
 */
export const NAME_THE_QUARRY = {
  id: 'name-the-quarry',
  name: 'Name the Quarry',
  target: 'enemy-highest',
  effects: [
    { kind: 'damage', damageType: 'physical', power: 1.7 },
    { kind: 'status', status: SAVAGED, chance: 0.9 },
  ],
  cooldown: 50,
  priority: 3,
} as const;

/**
 * One note, and every banner on the field turns to face the same way.
 *
 * The roof's reach, and the turn that says what the whole band is about: it takes the rank the crew
 * keeps its damage in **and** takes the survivors' turns away, which are the two levers this crew
 * has no answer to buy. Measured separately at the roof's level they are the two strongest single
 * mechanics against these arrangements — reach costs the reference five more of its party than
 * anything else can, and turn denial is what the alternate cannot survive at all — and neither is a
 * new part.
 *
 * ×1.2 is the wide-skill ceiling, and it is the ceiling for the reason 21g and 21h both recorded:
 * five small hits read against the diminishing-DEF curve rather than against the target count, so
 * what pays for a roof is its own stat line and not a bigger multiplier on a wide swing.
 */
export const THE_HORN_SOUNDS = {
  id: 'the-horn-sounds',
  name: 'The Horn Sounds',
  target: 'enemy-row-back',
  effects: [
    { kind: 'damage', damageType: 'physical', power: 1.2 },
    { kind: 'status', status: SLOW, chance: 0.8 },
  ],
  cooldown: 60,
  priority: 4,
} as const;

/**
 * The field closes. There is no edge of it to be standing at.
 *
 * The roof's second turn, and the one that answers what a Monster five actually is: five bodies
 * whose health is a **shared pool** in practice, refilled out of whatever they land. Pressure on one
 * body is drained back before the next turn comes round; pressure on all five at once is not.
 *
 * ⚠️ **It carries no status and restores nothing.** A wide hit that simply removes health is the
 * shape that shortens a fight, which is the discipline every roof in this milestone has kept — and
 * it matters least here and is kept anyway, because a Monster crew is the fastest party in the game
 * and its roof resolves in a third of the clock.
 */
export const THE_FIELD_CLOSES = {
  id: 'the-field-closes',
  name: 'The Field Closes',
  target: 'enemy-all',
  effects: [{ kind: 'damage', damageType: 'physical', power: 1 }],
  cooldown: 70,
  priority: 3,
} as const;

// ---------------------------------------------------------------------------------------
// Milestone 21j — the Angel Tower's second hundred, floors 101–200.
//
// ## ⚠️ The measurement that set this band's axis: nothing else moved either crew at all
//
// Both Angel arrangements were pointed at twenty-two shapes at the roof's level, controlled at one
// anchor plus four bodies all asking the same question so that only the mechanic varied — mean
// survivors of five, reference / alternate:
//
// | ×4 board                                                                          | ref  | alt  |
// | --------------------------------------------------------------------------------- | ---- | ---- |
// | nothing                                                                           | 4.00 | 4.00 |
// | taunt, thorns, link, bomb, `SAVAGED`, `BLOODRISEN`, hex volume, `tenacity` 0.60    | 3.95 | 3.92 |
// | `dodge` 0.30, board stun, board slow, shield, `magicResist` 0.40                   | 3.98 | 3.98 |
// | a healer                                                                          | 4.00 | 4.00 |
//
// **Twenty-two mechanics and the whole spread is 0.15 survivors.** Four supports and a wall absorbs
// every lock in the library: the crew carries `GUARD`, `BARRIER`, `AEGIS`, two or three heals and a
// cleanse, and a single body asking a single question is answered before it matters. So this tower
// cannot escalate by vocabulary — 21i's count of distinct questions does nothing here either, since
// no individual question costs the crew anything to begin with.
//
// What *did* move them is **when the damage lands and where it is aimed**:
//
// | ×4 board                     | ref      | alt      |
// | ---------------------------- | -------- | -------- |
// | plain front-hitter           | 4.00     | 4.00     |
// | names `enemy-lowest`         | 3.00     | **2.00** |
// | drains `enemy-lowest`        | 3.33     | 2.88     |
// | reaches `enemy-back`         | 3.85     | 3.10     |
// | `haste` 140 on a thin body   | **2.67** | **0.15** |
// | names `enemy-highest`        | 4.50     | 4.33     |
//
// ⚠️ **Every Angel heal in the game names `ally-lowest`** — {@link CHOIRLIGHT},
// {@link SOOTHING_VERSE}, {@link VIGIL} — and every shield the crew has is behind a cooldown or an
// energy bar: {@link AEGIS_SKILL} at 80, {@link DAWNWARD} at 70, {@link SANCTUARY} and
// {@link KEEPERS_CHARGE} as ultimates. So a board that arrives *before* the ward does, and spends
// itself on the one body the choir has just committed to, is racing the crew's own cooldowns rather
// than trying to out-weigh them. Aiming at `enemy-highest` instead makes a board measurably
// **easier**, because that is where the crew's two tanks stand.
//
// ⚠️ **Both dials at once is past the edge and the numbers say so**: a board that is fast *and*
// names the lowest reads 0.00 / 0.00. The two are authored to arrive one band apart for that reason
// — aim in 121–160, speed from 161 — and the closing band carries at most two fast bodies.
//
// ⚠️ **Denial is not an escalation on this tower, it is a cost.** A healer, a slow, a shield or a
// resist wall leaves both crews at 4.00 survivors and buys nothing but seconds — the alternate's
// mean goes 26.0s → 37.8s against four healers. Against a 90-second clock whose cleared-fight
// headroom bar is 67.5s, and with the alternate already the slowest party in the game (its five
// characters field **four** damage skills between them at `elite`), those seconds are the scarce
// resource here. No board above floor 160 carries a heal.
// ---------------------------------------------------------------------------------------

/**
 * It does not fight the ones standing. It finishes the ones kneeling.
 *
 * ⚠️ **Demons' first body below `ascended` tier to name `enemy-lowest`.** The faction has owned the
 * aim since the campaign's fourth chapter and only ever on an anchor —
 * {@link ASHFALL_SOVEREIGN} through {@link HEADSMANS_ARC} — so a board wanting to race the choir's
 * heal to the body it is aimed at has had to spend one of its two heavy slots to do it. That is the
 * slot this tower's closing bands need for weight, which is what makes a *cheap* carrier the piece
 * that was missing rather than a stronger one.
 *
 * ⚠️ **Priced as chip and it is the whole point of the block.** ×0.85 is under
 * {@link ZENITHFALL}'s ×0.75 per target only in the sense that this hits one body — against
 * {@link HEADSMANS_ARC}'s ×2.1 it is a third of an execution. What it sells a board is that the
 * choir's heal is being *contested* every forty ticks by something that costs a common's slot; what
 * it cannot do is finish anybody on its own, which is what keeps three of them on a board a rhythm
 * rather than a wipe.
 */
export const CULL_THE_EMBERS = {
  id: 'cull-the-embers',
  name: 'Cull the Embers',
  target: 'enemy-lowest',
  effects: [{ kind: 'damage', damageType: 'magical', power: 0.85 }],
  cooldown: 40,
  priority: 3,
} as const;

/**
 * The rift does not open in front of you. It opens behind you.
 *
 * The other half of the aim, and the half that answers the *arrangement* rather than the wounded
 * body: an Angel five keeps three of its five in the back rank and both of its shields and all of
 * its heals live there. Reaching one of them is worth 4.00 → 3.10 survivors against the alternate
 * five, which is second only to the speed dial and needs no new part to say.
 *
 * ⚠️ **Single-target rather than `enemy-row-back`, which is not a smaller version of
 * {@link RUINOUS_STOOP} but a different question.** A row attack hits all three supports for a
 * fraction each and the crew heals the difference back; one body taking ×1.5 is a support that has
 * to be replaced. Against a party whose damage would not notice either, the distinction is the whole
 * block.
 *
 * The {@link SUNDER} is a roll rather than a certainty because the carrier acts so often — at
 * `haste` 136 it takes about three turns to the crew's two, and a certain debuff at that rate is a
 * permanent one wearing a chance's clothes.
 */
export const RIFTSTEP = {
  id: 'riftstep',
  name: 'Riftstep',
  target: 'enemy-back',
  effects: [
    { kind: 'damage', damageType: 'magical', power: 1.5 },
    { kind: 'status', status: SUNDER, chance: 0.5 },
  ],
  cooldown: 45,
  priority: 3,
} as const;

/**
 * What is owed is owed by whoever can least afford it.
 *
 * ⚠️ **The first block in the game to drain `enemy-lowest`.** Both halves of that have shipped
 * separately for a long time — {@link SOUL_SIPHON} drains the lowest for the Undead, and
 * {@link TITHE_COLLECTED} drains for the Demons — and the pairing is aimed at something only an
 * Angel crew does. Every heal the crew owns names `ally-lowest`, so a drain on the same body means
 * the choir's restoration is not merely outpaced, it is **collected**: the health goes out of the
 * party and into the thing that took it, and the heal that arrives next tick is topping up a body
 * that is about to be drained again.
 *
 * ⚠️ **The siphon is 0.5 and the carrier is soft, because enemy sustain is this tower's real
 * danger.** A drain pool is bounded by what its holder can land, unlike a heal, which refills the
 * board — but the Angel crew's whole failure mode is the ninety-second clock, so 21f's rule binds
 * harder here than anywhere: this block carries 24 `def` on 820 hp and stands on no board above
 * floor 160.
 */
export const THE_DEBT_CALLED = {
  id: 'the-debt-called',
  name: 'The Debt Called',
  target: 'enemy-lowest',
  effects: [{ kind: 'drain', damageType: 'magical', power: 1.7, siphon: 0.5 }],
  cooldown: 45,
  priority: 3,
} as const;

/**
 * The verse is sung. It simply arrives after you are gone.
 *
 * **The roof's turn, and the tower's thesis stated once in one skill.** ×2.2 on `enemy-lowest` is
 * the heaviest single-target aim in the game — over {@link HEADSMANS_ARC}'s ×2.1 — and it is
 * deliberately an execution rather than a threat: on a board that has already burnt all five bodies
 * with {@link CINDER_STORM}, whichever ally the choir is about to heal is the ally this removes.
 *
 * ⚠️ **The pairing is what makes it, and both halves are shipped parts.** A wide chip decides *who*
 * `enemy-lowest` resolves to, and this decides that they do not survive being it. Neither says
 * anything alone: {@link CINDER_STORM} has stood on demon boards since the first chapter and measures
 * at nothing against these crews, and an execution with no chip in front of it names whichever tank
 * happens to have taken a hit.
 *
 * ⚠️ **No status and nothing restored.** Every roof in this milestone has kept that discipline and it
 * matters most here: the alternate Angel five is the slowest party in the game, so a roof that
 * lengthened the fight rather than shortening it would be the ninety-second clock with a boss's stat
 * block on.
 */
export const NO_ANSWER_COMES = {
  id: 'no-answer-comes',
  name: 'No Answer Comes',
  target: 'enemy-lowest',
  effects: [{ kind: 'damage', damageType: 'magical', power: 2.2 }],
  cooldown: 50,
  priority: 4,
} as const;

// ---------------------------------------------------------------------------------------
// The Demon Tower's second hundred — milestone 21k's four, and the seventh answer to
// "how does a tower escalate"
//
// ⚠️ **A Demon five is answered board-wide or it is not answered at all.** Measured against both
// arrangements at the roof's level before anything here was authored, on a controlled board of one
// anchor plus four bodies all asking the same question, forty seeds — mean survivors of five,
// reference / alternate, against a **4.13 / 4.05** control:
//
// | one body at a time                                              | ref       | alt       |
// | --------------------------------------------------------------- | --------- | --------- |
// | stun · slow · weaken · sunder · poison · `SAVAGED` · `HEXBRAND` | 4.17–4.38 | 4.05–4.17 |
// | a taunt                                                         | **4.78**  | **4.85**  |
//
// **Seven mechanics one body at a time, and every one of them makes the board *easier* than saying
// nothing.** The reference five carries 9,416 to 12,822 hp a body at `elite`, so a question put to
// one of them is a turn the other four do not have to answer — and the taunt is worse still,
// because it narrows a pool the crew's damage largely does not consult.
//
// | the same turn, aimed at all five | ref      | alt      |
// | -------------------------------- | -------- | -------- |
// | wide damage alone                | 4.53     | 3.88     |
// | wide damage + {@link SLOW}       | 4.03     | **2.88** |
// | wide damage + {@link STUN}       | **3.95** | **1.85** |
//
// ⚠️ **The status has to ride the attack rather than cost a turn.** The same statuses on a skill of
// their own are the first table — a board that spends one turn saying something and the next doing
// something is a board this crew out-damages either way.
//
// ⚠️ **This is not a structural gap only Demons have, and the entry does not claim one.** The
// identical "wide damage + stun" board reads 2.40 / 0.60 against the Elf crews and 0.88 / 0.00
// against the Monster crews; what it is is a fact about the profile of *these* two, which is what
// 21f said to read before choosing. What it is measured against is the Angel five, where the same
// board reads **4.00 / 3.95** — the crew 21j found nothing moves at all.
//
// ⚠️ **The licence is placement, exactly as it is for an evasion pool.** Neither Demon arrangement
// unlocks a cleanse at `elite` — {@link CRIMSON_SIGIL} is Sanguine's third skill — and no Demon in
// the game carries a point of `tenacity`, so every one of these lands with certainty and there is
// no answer to buy. What keeps it a fight is that every carrier below the roof is soft enough to be
// removed in a turn or two: {@link KNELL_CHANTER} is 660 hp and {@link STILLNESS_CANTOR} 700,
// against an Angel legendary register running 590 to 1080. **The answer is to kill the voice**, and
// a board that put one behind a wall would be a lock rather than a question.
// ---------------------------------------------------------------------------------------

/**
 * Not aimed at anybody. Simply said, to the room.
 *
 * The cheapest board-wide turn in the game and the band that teaches the tower's second half. It
 * carries no rider at all, which is the whole of what a common may say here: what floors 101–120
 * are for is the party learning that a slot on these boards is now spent on **everybody**, before
 * anything starts riding along with it.
 *
 * ×0.7 against the ×1.2 wide ceiling, on 520 hp. Three of them on one board is a rhythm; one of
 * them is a tick of chip damage the crew does not notice, which is correct for floor 101.
 */
export const MASSED_LITANY = {
  id: 'massed-litany',
  name: 'Massed Litany',
  target: 'enemy-all',
  effects: [{ kind: 'damage', damageType: 'magical', power: 0.7 }],
  cooldown: 50,
  priority: 2,
} as const;

/**
 * The choir does not raise its voice. It takes yours down.
 *
 * The first rider, and {@link SLOW} rather than {@link STUN} because a slow is the half of turn
 * theft a party can still play around: it costs gauge rather than a turn outright, so a crew that
 * has already committed its cooldowns loses tempo instead of losing the exchange. Worth 4.08 → 2.67
 * survivors against the alternate five on a controlled board, against the stun's 1.63 — which is
 * the gap the two bands between them are for.
 *
 * ⚠️ **0.75 rather than certainty, on a body that acts every hundred ticks.** The three board-wide
 * slows already in the file run 0.7 ({@link DUSKWEAVE}, {@link THE_QUIET_FIELD}) to 0.85
 * ({@link MOONSONG}), and a certain one here would be a permanent one wearing a chance's clothes —
 * which is the note {@link RIFTSTEP} records from the other side.
 */
export const HUSH_THE_MANY = {
  id: 'hush-the-many',
  name: 'Hush the Many',
  target: 'enemy-all',
  effects: [
    { kind: 'damage', damageType: 'magical', power: 0.8 },
    { kind: 'status', status: SLOW, chance: 0.75 },
  ],
  cooldown: 55,
  priority: 3,
} as const;

/**
 * One note, and five bodies stop for it.
 *
 * ⚠️ **The strongest single thing measured against these crews, and only the third board-wide stun
 * in the game.** The other two are {@link GATE_SLAM} and {@link THE_SEAL_BREAKS}, both at 0.35,
 * both on anchors, and both a punctuation mark on a board doing something else. This is a legendary
 * whose *only* turn is the stun, which is what makes it the band rather than a moment in one.
 *
 * ⚠️ **0.4 and 660 hp, and both numbers are the licence.** Just above the shipped register for a
 * wide stun, on a body near the bottom of the Angel legendary range — the answer to it is to kill
 * it, and a board is only allowed to ask the question as often as it can keep this alive. The
 * damage is ×0.75, well under the wide ceiling, because the turn is not for the damage.
 */
export const THE_KNELL = {
  id: 'the-knell',
  name: 'The Knell',
  target: 'enemy-all',
  effects: [
    { kind: 'damage', damageType: 'magical', power: 0.75 },
    { kind: 'status', status: STUN, chance: 0.4 },
  ],
  cooldown: 60,
  priority: 3,
} as const;

/**
 * The whole choir, on one breath, at everybody.
 *
 * The roof's opening turn, and the heaviest board-wide damage this tower fields — ×1.1, which is
 * the top of a band shared with {@link RIFTFALL}, {@link THE_SEAL_BREAKS} and
 * {@link THE_QUIET_FIELD} and sits under {@link DEVOURING_TIDE}'s ×1.15. A wide skill is priced per
 * target against the diminishing-defence curve, which is why the ×1.2 ceiling is where it is.
 *
 * The {@link WEAKEN} is what makes it the *first* of three rather than one of three: it lands on
 * all five before either of the other two arrives, so the board's whole later output is measured
 * against a party already hitting for less.
 */
export const ONE_VOICE = {
  id: 'one-voice',
  name: 'One Voice',
  target: 'enemy-all',
  effects: [
    { kind: 'damage', damageType: 'magical', power: 1.1 },
    { kind: 'status', status: WEAKEN, chance: 0.85 },
  ],
  cooldown: 50,
  priority: 3,
} as const;

/**
 * Nothing in the room is exempt, and nothing in the room is quick.
 *
 * The roof's second turn: {@link HUSH_THE_MANY} restated at an anchor's weight and at the top of the
 * shipped register for a wide slow. 0.85 rather than 0.75 — level with {@link MOONSONG} and no
 * higher — because this arrives from a body the crew cannot remove inside a fight, where the Cantor
 * is something it can decide to answer.
 */
export const NOTHING_IS_SPARED = {
  id: 'nothing-is-spared',
  name: 'Nothing Is Spared',
  target: 'enemy-all',
  effects: [
    { kind: 'damage', damageType: 'magical', power: 1 },
    { kind: 'status', status: SLOW, chance: 0.85 },
  ],
  cooldown: 55,
  priority: 3,
} as const;

/**
 * The last thing sung, and it is sung to all of you.
 *
 * ⚠️ **The stun stays at 0.4 on the roof, which is the one number in this band that was not raised
 * with the body carrying it.** {@link THE_KNELL}'s chance is licensed by its carrier being killable
 * and The Unison is not; a certain board-wide stun from a body that survives the fight is the ninety
 * seconds with a boss's stat block on, which is the failure 21f recorded on the Dwarf Tower's roof
 * arriving by a different road. What escalates instead is that it is the **third** wide turn on one
 * board rather than the only one, and the sixty-five-tick cooldown is the longest of the three.
 */
export const THE_LAST_VERSE = {
  id: 'the-last-verse',
  name: 'The Last Verse',
  target: 'enemy-all',
  effects: [
    { kind: 'damage', damageType: 'magical', power: 0.9 },
    { kind: 'status', status: STUN, chance: 0.4 },
  ],
  cooldown: 65,
  priority: 4,
} as const;

// ---------------------------------------------------------------------------------------
// The Standing Line — chapter 11
//
// ⚠️ **Seven turns and no new status.** Milestone 21 licensed three statuses across four chapters,
// spent them and closed; a later chapter argues from nothing exactly as 17 and 21c did, and this one
// has nothing to argue. Every piece below is shipped vocabulary **aimed somewhere it has never been
// aimed**, which is the bar `AGENTS.md` sets.
//
// ## The chapter's sentence is the `condition` field, which is why this reads differently
//
// Chapters 7 through 10 each asked a question about the party's own damage — how it arrives, where
// it lands, whether it stays done, what it does to the thing it is spent on. This one asks **what
// the party spends it on first**, and the part of the vocabulary that says "first" is not a status
// at all. It is {@link SkillConditionData}, which has been on the enemy side since milestone 4 and
// carries seventeen skills, fourteen of which are one of two shapes.
//
// | Skill              | The aiming that is new                                                     |
// | ------------------ | -------------------------------------------------------------------------- |
// | Pass the Word      | the first board-wide buff carried by a **common**                          |
// | The Order Stands   | the first turn to apply **two** friendly stat-mods at once                  |
// | At the Halt        | the first `enemies-at-least: 5` — the party *entirely* whole                |
// | The Line Reforms   | the first `status-absent` gate aimed at the party's **back rank**           |
// | The Countersign    | the first **offensive** turn conditioned on `ally-afflicted`                |
// | The Colours Stand  | the first **shield** aimed at `ally-lowest`                                 |
// | The Standing Order | the first board-wide cleanse that is not also a ward                       |
//
// ## ⚠️ No taunt anywhere in this chapter, and that is the design rather than an omission
//
// Chapters 9 and 10 both close on a taunt band — the one body the party may hit is the one it
// cannot open, and then the one it must not wound. A taunt makes the order **forced**, and this
// chapter is about the order being *chosen wrongly*: every board here leaves the party free to aim
// anywhere and charges it for aiming badly. It also removes the clock risk that {@link GUARD} on
// five bodies would otherwise carry, which is the second reason and the one that would have decided
// it alone.
// ---------------------------------------------------------------------------------------

/**
 * The order is shouted down the line by somebody who is not going to survive shouting it.
 *
 * ⚠️ **The first board-wide buff in the game carried by a `common`.** Every other one — {@link
 * HERALDS_ANTHEM}, {@link ANTIPHON}, {@link RUNEWARD}, {@link THE_LAST_MUSTER} — sits on a legendary
 * or an anchor, which makes "kill the caller" a plan the party has to spend real damage on. On
 * fodder it becomes a *priority* instead: the cheapest, softest body on the board is the one that
 * has to die first, and a party that clears the front rank in the order the front rank presents
 * itself will never touch it.
 *
 * {@link HASTE} rather than {@link RALLY} or {@link GUARD}, because haste is the buff that is worth
 * the most and reads as the least — a third more gauge fill is a third more of everything the board
 * was ever going to do, arriving as "that fight felt fast" rather than as a number.
 *
 * ⚠️ **Safe for the clock, and deliberately the one of the chapter's three board-wide buffs that
 * is.** Haste on the enemy side can only ever make a fight resolve sooner. The band's other
 * statement, {@link THE_ORDER_STANDS}, is the one that lengthens a fight, and it is carried by a
 * body the party can also reach.
 */
export const PASS_THE_WORD = {
  id: 'pass-the-word',
  name: 'Pass the Word',
  target: 'ally-all',
  effects: [{ kind: 'status', status: HASTE }],
  cooldown: 70,
  priority: 4,
} as const;

/**
 * Nobody rescinded it, so it stands.
 *
 * ⚠️ **The first turn in the game to apply two friendly stat-mods at once.** {@link RUNEWARD} and
 * {@link ANTIPHON} pair a cleanse with one buff and {@link HERALDS_ANTHEM} casts one alone; this
 * braces and sharpens the whole line in a single action, which is what makes one back-rank body
 * worth more than either wall standing in front of it. The chapter's whole lock is that the party
 * has to notice.
 *
 * ⚠️ **Seventy-five against a forty-five tick {@link STANDARD} duration**, which is the same rule
 * every re-applying skill in this file keeps and it matters more here than usual: a thirty-tick gap
 * is the window in which a board that has just been re-armed is only itself, and it is where a party
 * that killed in the right order gets paid.
 *
 * ⚠️ **{@link GUARD} is the one part of this chapter that lengthens a fight**, and it is bounded on
 * purpose — `def` diminishes and can never reach zero, where a resist multiplies and can. It is also
 * why nothing in this chapter puts health back and why nothing in it wears a taunt: three ways to
 * make a fight longer on one board is the ninety-second clock, and a timeout is scored a defeat.
 */
export const THE_ORDER_STANDS = {
  id: 'the-order-stands',
  name: 'The Order Stands',
  target: 'ally-all',
  effects: [
    { kind: 'status', status: GUARD },
    { kind: 'status', status: RALLY },
  ],
  cooldown: 75,
  priority: 5,
} as const;

/**
 * A charge is delivered against a line that is still a line.
 *
 * ⚠️ **The first `enemies-at-least: 5` in the game** — the party *entirely* whole, where {@link
 * COUCHED_LANCE} and {@link RIFTFALL} both ask for four. One body is the whole difference: at four
 * the condition is a late-fight fade, and at five it switches off the moment the party takes its
 * first loss, which front-loads the board's weight into the opening exchange and hands the rest of
 * the fight back.
 *
 * **That is the band's argument and it is deliberately generous.** A chapter whose lock is *order*
 * has to make the opening turns the expensive ones, or "kill the right thing first" costs nothing to
 * get wrong. Pairing this with {@link COUCHED_LANCE} on the same block is a two-step decay: five
 * bodies and it lands both, four and it lands one, three and the block is a swinging body.
 *
 * `enemy-highest` is the party's wall by construction, so the charge goes where a charge goes.
 */
export const AT_THE_HALT = {
  id: 'at-the-halt',
  name: 'At the Halt',
  target: 'enemy-highest',
  effects: [{ kind: 'damage', damageType: 'physical', power: 2.2 }],
  cooldown: 50,
  condition: { kind: 'enemies-at-least', count: 5 },
  priority: 4,
} as const;

/**
 * The rank that was blunted steps back, and the one behind it steps up.
 *
 * ⚠️ **The first `status-absent` gate aimed at the party's back rank.** The five shipped gates are
 * {@link WITHERHEX}, {@link MOONSONG} and {@link SEVENFOLD_HEX} on the whole board, {@link MIRE} on
 * the front rank and {@link THE_LONG_LOOSE} on the back — and that last one is a **defence** shred,
 * which is a statement about a rank the party is not defending. This is {@link WEAKEN} on the three
 * bodies the party keeps its damage in, re-landing the instant it is cleared.
 *
 * **The gate is the point rather than the debuff.** A cleanse answers this exactly once and then
 * invites it back, so the turn the party spends on the symptom is a turn spent for nothing. The
 * answer is the body casting it, which stands in the enemy's own back rank — so the chapter's
 * question is asked twice on one board: reach past the wall, and pick the right thing when you get
 * there.
 *
 * Ordinary damage rather than a large hit, because what it spends its turn on is the setup.
 */
export const THE_LINE_REFORMS = {
  id: 'the-line-reforms',
  name: 'The Line Reforms',
  target: 'enemy-row-back',
  effects: [
    { kind: 'damage', damageType: 'physical', power: 0.9 },
    { kind: 'status', status: WEAKEN, chance: 0.85 },
  ],
  cooldown: 55,
  condition: { kind: 'status-absent', statusId: 'weaken' },
  priority: 3,
} as const;

/**
 * You gave a sign, and the line has one for it.
 *
 * ⚠️ **The first offensive turn in the game conditioned on `ally-afflicted`.** The condition has one
 * shipped use — {@link THE_BARROW_FORGETS}, which *cleanses* — so until now a party's setup turn
 * being noticed has only ever meant it being undone. This answers it with damage instead, and aims
 * that answer at `enemy-back`, which is where the setup came from.
 *
 * **It fires because the party acted, which is what makes it a question about order.** A board with
 * this on it charges for the debuff turn rather than refusing it, so opening with a shred is a
 * legitimate play that costs something and opening with damage is a legitimate play that does not.
 * Neither is wrong; the chapter only insists that the party has decided.
 *
 * {@link SLOW} rather than a wound, because what the turn takes back is *tempo* — the party spent an
 * action to make its next one better, and this is the line taking that action's value back out.
 * Forty-five ticks is the shortest cooldown in the chapter for the same reason {@link IRON_FOR_IRON}
 * carries one: it only ever fires in answer to something, so a party that never sets up never sees it.
 */
export const THE_COUNTERSIGN = {
  id: 'the-countersign',
  name: 'The Countersign',
  target: 'enemy-back',
  effects: [
    { kind: 'damage', damageType: 'physical', power: 1.85 },
    { kind: 'status', status: SLOW, chance: 0.8 },
  ],
  cooldown: 45,
  condition: { kind: 'ally-afflicted' },
  priority: 4,
} as const;

/**
 * The colours go to whoever the party has decided to kill.
 *
 * ⚠️ **The first shield aimed at `ally-lowest`.** Every board-wide shield in the game — {@link
 * BULWARK}, {@link CHOIR_OF_ASH}, {@link RELIQUARY_SEAL}, {@link THE_WARDS_HOLD} — is a statement the
 * board makes about itself. `ally-lowest` is where {@link IRON_FOR_IRON} and {@link
 * DRAW_INTO_THE_ROOT} put a **reactive** protection, and neither of those is a pool. This one banks
 * one on the exact body the party has committed to, so the kill it had already earned arrives a turn
 * or two later than it planned — which on a board that re-arms every seventy-five ticks is the
 * difference between a fight and the same fight twice.
 *
 * ⚠️ **A shield rather than a heal, and the distinction is a termination argument rather than a
 * preference.** Closing pressure amplifies damage without bound past `PRESSURE_AFTER_TICKS` and
 * deliberately does not amplify healing, so sustain that refills makes a fight longer and a long
 * fight is a **defeat**. {@link AEGIS} banks 2.3 of the applier's `atk` once and depletes; it cannot
 * outrun anything.
 *
 * **The lieutenant's signature, and conditioned rather than an opening turn**, which is the shape
 * {@link THE_GRUDGEKEEPER} and {@link THE_PACK_ANSWERS} both took and the reason a lieutenant standing
 * on four boards is four fights rather than one stat block four times. It does nothing at all until
 * the party has hurt something, so what it answers is what the party chose.
 */
export const THE_COLOURS_STAND = {
  id: 'the-colours-stand',
  name: 'The Colours Stand',
  target: 'ally-lowest',
  effects: [{ kind: 'status', status: AEGIS }],
  cooldown: 60,
  condition: { kind: 'ally-hurt', fraction: 0.6 },
  priority: 4,
} as const;

/**
 * It is given again, in the same words, to whoever is left to hear it.
 *
 * ⚠️ **The first board-wide cleanse in the game that is not also a ward.** {@link RUNEWARD} and
 * {@link ANTIPHON} pair two removals with a buff, which reads as a support keeping its own side
 * tidy; {@link THE_BARROW_FORGETS} takes three off **one** body. Three off *every* body, with the
 * whole line sharpened in the same action, is the chapter's sentence at an anchor's weight: every
 * setup turn the party has spent on this board is spent again, and the board is stronger for the
 * asking.
 *
 * ⚠️ **Eighty ticks, the longest cooldown in the chapter**, because this is the one turn on the one
 * body that can undo a whole opening. The gap is what the fight is fought in, and a party that opened
 * on the escort rather than on the thing casting this will meet it twice.
 *
 * **The final's own turn, and the only skill in the chapter it does not share.** Its other three are
 * bands 2, 3 and 4 in one body — the charge that only lands while the party is whole, the rank that
 * re-forms, and the answer to the party's own sign — which is what makes the last board the chapter
 * restated rather than a bigger stat block.
 */
export const THE_STANDING_ORDER = {
  id: 'the-standing-order',
  name: 'The Standing Order',
  target: 'ally-all',
  effects: [
    { kind: 'cleanse', count: 3 },
    { kind: 'status', status: RALLY },
  ],
  cooldown: 80,
  priority: 5,
} as const;

// ---------------------------------------------------------------------------------------
// The Human Tower's third hundred floors
//
// Four skills for four Undead blocks, the ratio a tower session runs on. The **axis is the stat
// block rather than the vocabulary**, and this section exists mostly to give four fast bodies
// something to do with the turns they keep taking.
//
// ⚠️ **Measured, and the negative result is the finding.** Against both Human arrangements at the
// band-3 crew, ten statuses one at a time — STUN, SLOW, WEAKEN, SUNDER, POISON, BLEED, BURN,
// SAVAGED, HEXBRAND, DOOMBRAND — span **0.14 survivors in total**, every row between 2.88 and 3.02
// against a 2.95 control. Aim is inert or negative, question *count* is worth nothing
// (2.90 → 2.92 → 2.92 across one, two and four distinct questions), and the second hundred's own
// axis — a thickened support line — is spent (taunt 4.78, link 4.83, shield 4.75 against a 4.92
// control, with the alternate flat at 4.00 for all four).
//
// What moves is `haste` on a body that **survives to use it**. So these skills are deliberately
// plain: a status riding one of them is texture, and nothing here may be load-bearing.
// ---------------------------------------------------------------------------------------

/**
 * The step never breaks, because the thing setting it stopped needing to breathe.
 *
 * ⚠️ **A short cooldown on a durable body, which is the whole band in one skill.** Every fast block
 * this game ships is thin — the heaviest thing above `haste` 125 is the Nightmarch Outrider at 760
 * hp — because {@link docs/towers.md} priced speed in softness on the Angel Tower, where `haste` on
 * a durable body was worth almost nothing and on a thin one was the strongest dial there was.
 * **Against a Human five that reads exactly backwards**: at `haste` 144 a 420-hp body leaves the
 * weaker arrangement at 3.77 survivors and an 1120-hp body leaves it at **1.07**, because a Human
 * five kills the thin one before it acts twice.
 *
 * So this is the plainest possible turn and the block around it is the mechanic.
 */
export const PROCESSION_STEP = {
  id: 'procession-step',
  name: 'Procession Step',
  target: 'enemy-front',
  effects: [{ kind: 'damage', damageType: 'physical', power: 1.35 }],
  cooldown: 40,
  priority: 2,
} as const;

/**
 * It was told to hold the pace. Nobody has told it anything since.
 *
 * A heavier version of the same statement, on a body with the armour to keep making it. ⚠️ **Aimed
 * at the front rank rather than past it, which is the correction this hundred is built on.** The
 * shipped tower reaches for the back row on the argument that it is where the party's healing
 * lives; measured against both Human arrangements at the band it ships in, `enemy-back` reads
 * 4.83 / 4.00 where `enemy-front` reads 4.00 / 3.88. **Reaching past the front rank makes a Human
 * board easier** — the alternate five fields no tank, so damage taken off its front row is time it
 * did not have to buy.
 */
export const IRONWAKE_CHARGE = {
  id: 'ironwake-charge',
  name: 'Ironwake Charge',
  target: 'enemy-front',
  effects: [{ kind: 'damage', damageType: 'physical', power: 1.55 }],
  cooldown: 45,
  priority: 3,
} as const;

/**
 * Quicklime does not slow anything down. That is rather the point of it.
 *
 * The closing band's rider, and the **second** dial rather than a replacement for the first: crit
 * inside the shipped register (0.18 / 1.0 are the ceilings) is worth 3.00 → 2.60 on its own, which
 * is barely more than the statuses that are worth nothing. Paired with `haste` 144 on four bodies it
 * reads **53%** for the weaker arrangement, against its own 75% bar.
 *
 * ⚠️ **So the two dials at once are past the edge, and they arrive a band apart.** No board below
 * the closing twenty carries both, and no board anywhere carries both on more than two bodies —
 * measured at 3.90 / 3.42 for two of four, against 2.50 / 1.02 for four of four.
 */
export const QUICKLIME_CUT = {
  id: 'quicklime-cut',
  name: 'Quicklime Cut',
  target: 'enemy-front',
  effects: [
    { kind: 'damage', damageType: 'physical', power: 1.6 },
    { kind: 'status', status: BLEED, chance: 0.5 },
  ],
  cooldown: 50,
  priority: 3,
} as const;

/**
 * The Marshal's column halted two hundred floors ago. This is what kept walking.
 *
 * The roof's own turn: the band's whole argument stated once, at the weight an anchor is allowed to
 * carry. ⚠️ **Conditioned on the party still being whole**, the shape {@link COUCHED_LANCE} uses and
 * for the same reason — it front-loads the board's damage, and a fight decided early is a fight that
 * *ends*. On a body this fast an unconditioned version of it would be the ninety-second clock rather
 * than a roof.
 *
 * ⚠️ **No _healer_ on the roof, and the distinction is the one 15c measured.** Against a party that
 * cannot burst, a heal on the last floor is the clock wearing a boss's stat block — the Dwarf
 * Tower's failure. A **shield** is the safe form of the same idea, because a pool banked once
 * depletes where a heal refills, which is why the Reliquary Bearer still stands on this board; the
 * small `lifeLeech` and `drain` the Undead legendaries carry are likewise not sustain the party has
 * to outpace. **No board in this hundred carries a heal at all**, checked with a script rather than
 * by reading.
 */
export const THE_HOUR_UNKEPT = {
  id: 'the-hour-unkept',
  name: 'The Hour Unkept',
  target: 'enemy-row-front',
  effects: [
    { kind: 'damage', damageType: 'physical', power: 1.2 },
    { kind: 'status', status: SUNDER, chance: 0.7 },
  ],
  cooldown: 55,
  condition: { kind: 'enemies-at-least', count: 4 },
  priority: 4,
} as const;

// ---------------------------------------------------------------------------------------
// The Dwarf Tower's third hundred floors — the Crownworks
//
// Five skills for five blocks. ⚠️ **Every one of them is a plain hit, and that is the finding
// rather than a shortcut.** Measured against both Dwarf arrangements at the band-3 crew, one
// anchor plus four bodies asking the same question, forty seeds, against a 4.38 / 4.00 control:
//
// - **Scope and aim are inert or negative.** `enemy-row-back` 5.00 / 4.28, `enemy-back`
//   5.00 / 4.17, `enemy-highest` 5.00 / 4.25, `enemy-all` 4.95 / 4.00, `enemy-lowest` 4.92 / 4.00
//   — every one of them at or *above* a board that simply hits the front rank. A Dwarf five heals
//   and shields `ally-all` and guards `ally-all`, so **spread damage is the shape it answers
//   best**. That is the exact inverse of the Demon Tower, where wide damage was the whole axis.
// - **Riders are inert.** A 50%-chance {@link STUN} reads 4.13 / 4.00, a poison 4.08 / 4.00, a
//   bomb 4.08 / 4.00. The stun buys 5.7 seconds against the weaker arrangement and not one life.
// - **Statics are small.** `tenacity` 0.40 / 0.60 / 0.85 reads 3.45 / 3.23 / 3.08 and
//   `physicalResist` 0.15 / 0.23 reads 3.58 / 3.33, both against crews that carry **no `insight`
//   and no `magicResist` at all** — the two gaps that looked like locks and are worth a tenth each.
//
// What moves a Dwarf five is `atk` **and** rate of action, as a product rather than a sum, and how
// many bodies on the board carry both. So the vocabulary stays shut and these are turns.
// ---------------------------------------------------------------------------------------

/**
 * The hammer comes down on whatever is under it, at the rate the wheel turns.
 *
 * ⚠️ **`atk` at the legendary ceiling on a body fast enough to spend it, and neither half is worth
 * anything alone.** Four bodies at `atk` 72 and `haste` 98 leave the weaker arrangement at 4.00
 * survivors; at `atk` 86 and `haste` 98, 3.17; at `atk` 72 and `haste` 126, 3.05; at both,
 * **1.77**. The second hundred escalated weight and speed as two dials and this hundred is the
 * product of them, which is why the Striker carries both and the texture around it carries neither.
 *
 * ⚠️ **`haste` 118 and not a point more, deliberately.** The Human Tower's third hundred is where
 * speed stopped costing softness, and its four blocks are recorded there as **the only ones in the
 * game above `haste` 125 that are not thin**. Reaching past 125 here would quietly make that claim
 * false about somebody else's tower; the ceiling on `atk` buys the same product without touching it.
 */
export const THE_STRIKE_FALLS = {
  id: 'the-strike-falls',
  name: 'The Strike Falls',
  target: 'enemy-front',
  effects: [{ kind: 'damage', damageType: 'physical', power: 1.55 }],
  cooldown: 40,
  priority: 2,
} as const;

/**
 * Slag over hide over slag again, and it has decided this doorway is its.
 *
 * The second dial, and it arrives a band after the first. ⚠️ **A taunt on a body that is *itself*
 * the durability**, which is the Sundered Vault's Sealward Custodian inversion and the only form of
 * "you may not choose your target" this tower is allowed: every pool the party is forced to chew
 * through depletes. At hp 1400 / def 45 it reads 3.98 / **3.02** against a 4.25 / 4.00 control,
 * which is the largest single dial found here that is not the swing itself.
 *
 * ⚠️ **It carries no restoration of any kind and it never stands on the roof.** Sustain behind
 * something the party cannot aim past is the ninety-second clock, and this tower is the one that
 * measured it: the Dwarf roof was once `Oathbreaker + Warden` behind a Marsh Acolyte and no Dwarf
 * five could close it. Measured here, the roof board with this body on it reads **15%** for the
 * weaker arrangement against its own 75% bar, and 95% without it.
 */
export const SLAG_SLAM = {
  id: 'slag-slam',
  name: 'Slag-Slam',
  target: 'enemy-front',
  effects: [{ kind: 'damage', damageType: 'physical', power: 1.3 }],
  cooldown: 40,
  priority: 1,
} as const;

/**
 * Bound to the kilns, and paid in what the kilns are pointed at.
 *
 * Magical, which against these two crews is the one type distinction that measures at all: **not
 * one of the ten Dwarves in the two swept arrangements carries a point of `magicResist`**, while
 * four of five carry 0.08 to 0.12 `physicalResist` — the highest mean in the game. ⚠️ **And it is
 * worth a tenth of a party member, not a lock**: four magical bodies read 3.40 against a physical
 * 3.88. Authored because it is free and true, not because a band could be built on it.
 *
 * The faction's own answer is Vurn Runewright, the only Dwarf with any magic resistance and a
 * member of neither swept five — which is the shape a lock is supposed to have.
 */
export const KILN_LIGHT = {
  id: 'kiln-light',
  name: 'Kiln-Light',
  target: 'enemy-front',
  effects: [{ kind: 'damage', damageType: 'magical', power: 1.5 }],
  cooldown: 45,
  priority: 2,
} as const;

/** Something came up the flues while the works were cold, and stayed. Opening-band texture. */
export const ASHPIT_RAKE = {
  id: 'ashpit-rake',
  name: 'Ashpit Rake',
  target: 'enemy-front',
  effects: [{ kind: 'damage', damageType: 'physical', power: 1.25 }],
  cooldown: 45,
  priority: 1,
} as const;

/**
 * The great wheel of the Crownworks, which the hold built and the host never thought to stop.
 *
 * The roof's turn. ⚠️ **Aimed at the front rank rather than spread**, against every instinct and
 * with the measurement behind it: a board that reaches the party's back row leaves a Dwarf five at
 * **5.00** survivors where the same power into the front row leaves it at 4.38. Dwarves put their
 * two largest bodies in front and heal from behind them, so damage taken off that front row is
 * damage their `ally-all` sustain never has to answer.
 *
 * ⚠️ **The row attack beside it is the exception that proves it**, and it is a *front*-row sweep:
 * it hits the two bodies the party has already committed to keeping alive rather than the three it
 * has hidden. Measured as authored, the roof reads 100% with 2.33 of five for the reference
 * arrangement and 95% with 1.60 for the weaker one.
 */
export const THE_WHEEL_TURNS = {
  id: 'the-wheel-turns',
  name: 'The Wheel Turns',
  target: 'enemy-front',
  effects: [{ kind: 'damage', damageType: 'physical', power: 1.9 }],
  cooldown: 55,
  priority: 2,
} as const;

/**
 * Nothing here was built to stop. The works simply run on over whoever is standing in them.
 *
 * The roof's second turn, and a **front-row** sweep for the reason {@link THE_WHEEL_TURNS} records.
 * ⚠️ **No status rides it.** Ten of them were measured one at a time against these crews and the
 * whole spread was a fifth of a party member; a rider here would be decoration on the one board in
 * the hundred that cannot afford any.
 */
export const THE_WORKS_RUN_ON = {
  id: 'the-works-run-on',
  name: 'The Works Run On',
  target: 'enemy-row-front',
  effects: [{ kind: 'damage', damageType: 'physical', power: 1.2 }],
  cooldown: 70,
  priority: 1,
} as const;

// ---------------------------------------------------------------------------------------
// The Splintering Yards — the Elf Tower's third hundred.
//
// ⚠️ **The whole band is one stat and no new vocabulary at all**, which is the finding rather
// than a shortcut. Twenty-odd shapes were measured against both Elf arrangements at the roof's
// level and almost every one was inert or a cliff: `enemy-all` reads 98 / 90 / 75% across one,
// two and three voices and then **0%** at four; `enemy-row-front` is flat at every count; reach
// and `enemy-highest` leave the board *easier* than saying nothing; a link takes the weaker five
// from 2.08 survivors to **4.97**. What grades smoothly is **being crit at**, and it does so
// entirely inside the register the game already ships.
// ---------------------------------------------------------------------------------------

/**
 * The yard's whole business, and the reason anything above it cuts.
 *
 * ⚠️ **A plain hit, and the band is on the stat block rather than in here.** The Crownworks
 * Striker's note makes the same call for the same reason: when the axis is a stat, a skill that
 * also carries a rider measures the rider instead. Cooldown 55 rather than the Striker's 40
 * because this hundred escalates by *how many bodies* ask rather than by how often one does —
 * repeating a question is worth almost nothing and the count is worth everything.
 */
export const PUT_THE_EDGE_ON = {
  id: 'put-the-edge-on',
  name: 'Put the Edge On',
  target: 'enemy-front',
  effects: [{ kind: 'damage', damageType: 'physical', power: 1.85 }],
  cooldown: 55,
  priority: 2,
} as const;

/**
 * It sings the note the metal was cut to, and finds whoever is closest to breaking on it.
 *
 * ⚠️ **`enemy-lowest` and not `enemy-back`, which is the opposite of the shipped instinct here.**
 * The second hundred reaches for the rank an Elf five hides its support in, and measured against
 * these crews at the roof's level that rank is a **gift**: `enemy-back` reads 100% / 98% against a
 * control's 100% / 88%, because damage spent behind the front row is damage the party's two paper
 * bodies never took. `enemy-lowest` is the only aim that measured *harder* than saying nothing
 * (85%), and against the thinnest five in the game it is the honest one.
 */
export const THE_KEENING_NOTE = {
  id: 'the-keening-note',
  name: 'The Keening Note',
  target: 'enemy-lowest',
  effects: [{ kind: 'damage', damageType: 'magical', power: 1.9 }],
  cooldown: 58,
  priority: 2,
} as const;

/**
 * The light the yards work by, folded until it is thin enough to be an edge.
 *
 * Magical, so the fourth voice is not the same voice a fourth time — and fast, because this block's
 * contribution is **crit rolls per fight** rather than the size of any one of them.
 */
export const GLASSLIGHT_VERDICT = {
  id: 'glasslight-verdict',
  name: 'Glasslight Verdict',
  target: 'enemy-front',
  effects: [{ kind: 'damage', damageType: 'magical', power: 1.75 }],
  cooldown: 52,
  priority: 2,
} as const;

/** What is left over when the light is folded. Opening-band texture that still carries an edge. */
export const SHARDLIGHT = {
  id: 'shardlight',
  name: 'Shardlight',
  target: 'enemy-front',
  effects: [{ kind: 'damage', damageType: 'magical', power: 1.5 }],
  cooldown: 50,
  priority: 2,
} as const;

/**
 * The roof's turn, and the only one in the hundred that was ever going to land on its own.
 *
 * ⚠️ **`enemy-front`, and the measurement that settles it is the same one the Crownworks recorded
 * in the mirror direction.** Against an Elf five the front rank is two bodies of 430 to 560 hp that
 * the party cannot afford to lose and cannot hide, so the front row is where a roof's damage is
 * worth the most — reaching past it reads 100% / 98% where this reads 100% / 88%.
 */
export const THE_EDGE_IS_MADE = {
  id: 'the-edge-is-made',
  name: 'The Edge Is Made',
  target: 'enemy-front',
  effects: [{ kind: 'damage', damageType: 'physical', power: 2.1 }],
  cooldown: 55,
  priority: 3,
} as const;

/**
 * Everything holds an edge for a while. The Edgewright has never met the thing that holds one.
 *
 * The roof's second turn. ⚠️ **No status rides it and no rank is swept.** Four wide voices on one
 * board is the single cliff this hundred found — 75% for the weaker arrangement at three and
 * **0%** at four — so the roof is the one board in the tower that may not carry one at all.
 */
export const NOTHING_HOLDS_AN_EDGE = {
  id: 'nothing-holds-an-edge',
  name: 'Nothing Holds an Edge',
  target: 'enemy-front',
  effects: [{ kind: 'damage', damageType: 'physical', power: 1.55 }],
  cooldown: 62,
  priority: 2,
} as const;

// ---------------------------------------------------------------------------------------
// The Seedfall — the Undead Tower's third hundred.
//
// ⚠️ **The axis is durability and the skills are deliberately plain**, which is the finding rather
// than a shortcut. Nineteen shapes were measured against both Undead arrangements at the roof's
// level, controlled at one anchor plus four identical bodies, and almost every *mechanic* was worth
// nothing: aim and scope read at or **above** a 3.83 / 4.00 control (`enemy-lowest` 4.00 / 4.00,
// `enemy-back` 4.00 / 4.00, `enemy-highest` 4.00 / 4.00, `enemy-all` 4.00 / 4.00), a status one at a
// time is worth between 0.10 and 0.63 of the reference five and **exactly zero** of the alternate,
// and question *count* is nearly flat (3.88 → 3.42 → 3.45 → 3.10 → 3.00 across zero to four).
//
// What grades is how long the board takes to kill. See the head of the Seedfall section in
// [`enemies.ts`](./enemies.ts) for why that is this crew's and nobody else's.
// ---------------------------------------------------------------------------------------

/**
 * Bark closes over the wound, and the wound was the point of the last twenty minutes.
 *
 * ⚠️ **A plain hit on a long cooldown, because this block's contribution is its own health bar.**
 * The Crownworks Striker and the Splinteryard Honer make the same call for the same reason: when
 * the axis is a stat, a skill carrying a rider measures the rider instead. Sixty rather than
 * fifty-five because the Heartwood is the slowest thing on most of these boards and a shorter
 * cooldown would quietly make it a damage block.
 */
export const CLOSE_OVER_IT = {
  id: 'close-over-it',
  name: 'Close Over It',
  target: 'enemy-front',
  effects: [{ kind: 'damage', damageType: 'physical', power: 1.75 }],
  cooldown: 60,
  priority: 2,
} as const;

/**
 * The light is put round the seed, and nothing gets at the seed until the light is spent.
 *
 * ⚠️ **A shield and never a heal, and on this tower that is a rule rather than a preference.** An
 * Undead five cannot burst, so enemy sustain on a long board is the ninety-second clock wearing a
 * defence — which is why the tower's first hundred spends its heal in the Green Vigil and nothing
 * above floor 160 heals, drains or regenerates. A banked pool depletes: measured against a
 * 3.83 / 4.00 control this is worth **3.00 / 4.00**, real and finite.
 *
 * ⚠️ **Cooldown 70 against {@link AEGIS}'s 55-tick duration**, so the ward is down for fifteen ticks
 * in every cycle. A status that outlasts the cooldown applying it is a permanent absorb, which is
 * the {@link BARRIER}-at-70-recast-every-60 mistake.
 */
export const KEEP_THE_SEED = {
  id: 'keep-the-seed',
  name: 'Keep the Seed',
  target: 'ally-all',
  effects: [{ kind: 'status', status: AEGIS }],
  cooldown: 70,
  priority: 4,
} as const;

/** The Keeper's own turn, when the seed is already kept. Magical, against a crew carrying 0.04. */
export const SEEDLIGHT = {
  id: 'seedlight',
  name: 'Seedlight',
  target: 'enemy-front',
  effects: [{ kind: 'damage', damageType: 'magical', power: 1.6 }],
  cooldown: 58,
  priority: 2,
} as const;

/**
 * Something in the seedfall burns faster than the wood grows, and it has been waiting to.
 *
 * The hundred's **second** dial, arriving at floor 266 and never more than one to a board.
 * ⚠️ **Weight and rate are a product here rather than two dials, and the product is a cliff.**
 * Against the same control: four bodies at `haste` 126 read 2.98 / 3.77, four at hp 1200 read
 * 2.88 / 3.77, and four at **both** read 2.00 / **1.75** — which is also the only measurement in
 * which the alternate five is the weaker of the two. Two of these behind an anchor at the roof's
 * level reads 0%, so the Quickening spends one and the Seedcrown spends one.
 */
export const RUN_THE_SEED_DOWN = {
  id: 'run-the-seed-down',
  name: 'Run the Seed Down',
  target: 'enemy-front',
  effects: [{ kind: 'damage', damageType: 'magical', power: 1.7 }],
  cooldown: 48,
  priority: 2,
} as const;

/**
 * Everything that has climbed this wood fell off it, and every one of them fed it.
 *
 * The roof's turn. ⚠️ **`enemy-front` and no rider**, on the same measurement the Splintering Yards
 * recorded a hundred floors of another tower away: against these two crews the front rank is where a
 * roof's damage is worth the most, and every aim that reaches past it leaves the board **easier**
 * than saying nothing.
 */
export const WHAT_FALLS_IS_SOWN = {
  id: 'what-falls-is-sown',
  name: 'What Falls Is Sown',
  target: 'enemy-front',
  effects: [{ kind: 'damage', damageType: 'physical', power: 2.05 }],
  cooldown: 55,
  priority: 3,
} as const;

/**
 * The roof's second turn, and the only wide voice in the hundred.
 *
 * `enemy-row-front` rather than `enemy-all`: the row is the two bodies an Undead five cannot hide,
 * and spreading damage across all five measured **at** the control on both arrangements — a Dwarf
 * Tower result arriving on a second crew, for the same reason. It is here for rhythm against
 * {@link WHAT_FALLS_IS_SOWN} rather than as an escalation.
 *
 * ⚠️ **1.2 because it is wide, which is a rule and not a choice** — `skills.spec.ts` caps every
 * `enemy-all` and `enemy-row-*` skill there so a sweep can never out-earn a single target. It was
 * authored at 1.45 and the spec caught it, which is the whole reason that spec reads the target
 * rather than the tier.
 */
export const THE_WOOD_DOES_NOT_END = {
  id: 'the-wood-does-not-end',
  name: 'The Wood Does Not End',
  target: 'enemy-row-front',
  effects: [{ kind: 'damage', damageType: 'physical', power: 1.2 }],
  cooldown: 62,
  priority: 2,
} as const;

// ---------------------------------------------------------------------------------------
// The Closing — the Monster Tower's third hundred.
//
// ⚠️ **The axis is a stat and the skills are deliberately plain**, which is the Seedfall's finding
// arriving on a second tower for a different reason. Four shapes were measured against both Monster
// arrangements at the roof's level, one anchor plus four identical bodies, forty seeds, against a
// 4.00 / 3.35 control: a `tenacity` wall reads **4.00 / 3.50 at every value from 0.40 to 0.85** —
// dead, because this crew's kits are almost pure damage and there is nothing to refuse — and aim is
// inert or negative again (`enemy-back` 4.08 / 4.00, `enemy-row-back` 4.42 / 4.00, `enemy-highest`
// 4.25 / 4.00, all *easier* than saying nothing, the fourth tower to find it).
//
// What grades is `physicalResist`. See the head of the Closing section in
// [`enemies.ts`](./enemies.ts) for why that is this crew's and nobody else's, and why the skills
// below carry no riders: when the axis is a stat, a skill carrying one measures the rider instead.
//
// ⚠️ **Magical damage throughout, and that is the crew's stat block rather than faction flavour.**
// Both swept Monster arrangements carry **zero** `magicResist` across all ten slots against 0.18 and
// 0.23 of `physicalResist` summed, so a board that answers in the type the crew has no answer to
// costs it a few percent for free. It is worth naming because it is the mirror of the axis: the
// party is 100% physical and meets armour it cannot cut, and what comes back is the one type it
// never armoured against.
// ---------------------------------------------------------------------------------------

/**
 * A shell too green to be worth anything, on a body too small to be worth the turn.
 *
 * The hundred's **texture**, and the lightest thing carrying the wall. A plain hit because this
 * block's contribution is the 0.20 on its stat line — the Deepmast Heartwood and the Crownworks
 * Striker make the same call for the same reason.
 */
export const SHELLED_RUSH = {
  id: 'shelled-rush',
  name: 'Shelled Rush',
  target: 'enemy-front',
  effects: [{ kind: 'damage', damageType: 'magical', power: 1.3 }],
  cooldown: 55,
  priority: 2,
} as const;

/**
 * It has been run down before. It has never been opened.
 *
 * **The hundred's spine**, on more of its slots than anything else. `enemy-front` and nothing else:
 * against these two crews every aim that reaches past the front rank leaves a board measurably
 * easier, and the Splintering Yards and the Seedfall both recorded the same result before this.
 */
export const SLAGHIDE_LUNGE = {
  id: 'slaghide-lunge',
  name: 'Slaghide Lunge',
  target: 'enemy-front',
  effects: [{ kind: 'damage', damageType: 'magical', power: 1.55 }],
  cooldown: 55,
  priority: 2,
} as const;

/**
 * The pack is let go, and every one of them is wearing the yard's plate.
 *
 * The hundred's **second dial**, arriving at floor 271 and never more than one to a board.
 * ⚠️ **The wall and the rate are a product rather than two dials.** Against the same control, a
 * `physicalResist` 0.40 board reads 3.98 / 3.00 and a `haste` 132 board reads 4.00 / 3.00, and the
 * two **together** read 3.00 / **1.95**. A pool is the same story and worse — wall plus hp 1300
 * reads 2.92 / **1.00** at 42.4 seconds — which is why the closing bands spend the rate and leave
 * the pool alone.
 */
export const LOOSE_THE_PLATED_PACK = {
  id: 'loose-the-plated-pack',
  name: 'Loose the Plated Pack',
  target: 'enemy-front',
  effects: [{ kind: 'damage', damageType: 'magical', power: 1.45 }],
  cooldown: 46,
  priority: 2,
} as const;

/**
 * The ring the horn called for, standing where the ring is meant to close.
 *
 * The mini-boss body from floor 210 up, and the heaviest wall under the roof. ⚠️ **No ward, no
 * heal and no regeneration**, on a body that is itself the durability — the Sealward Custodian
 * inversion, and the only shape of shared defence this tower is allowed at these levels. A
 * board-wide ward on a closing Monster board is the ninety-second clock rather than a lock, which
 * the Seedfall measured at 75% / 55% and 45.1 seconds mean.
 */
export const SHUT_THE_RING = {
  id: 'shut-the-ring',
  name: 'Shut the Ring',
  target: 'enemy-front',
  effects: [{ kind: 'damage', damageType: 'magical', power: 1.6 }],
  cooldown: 58,
  priority: 2,
} as const;

/**
 * Two hundred floors of teeth, and not one of them has left a mark.
 *
 * The roof's turn. `enemy-front` and no rider, for the third tower running: the front rank is where
 * a roof's damage is worth the most against a crew with no tank behind it to protect.
 */
export const NOTHING_GETS_A_GRIP = {
  id: 'nothing-gets-a-grip',
  name: 'Nothing Gets a Grip',
  target: 'enemy-front',
  effects: [{ kind: 'damage', damageType: 'magical', power: 1.95 }],
  cooldown: 55,
  priority: 3,
} as const;

/**
 * The roof's second turn, and the only wide voice in the hundred.
 *
 * `enemy-row-front` rather than `enemy-all`, and for the reason the Seedfall gives: spreading damage
 * across all five measures **at** the control on both arrangements, where the row is the two bodies
 * a Monster five cannot pull out of the way. Rhythm against {@link NOTHING_GETS_A_GRIP} rather than
 * an escalation.
 *
 * ⚠️ **1.2 because it is wide**, which `skills.spec.ts` caps for every `enemy-all` and `enemy-row-*`
 * skill so a sweep can never out-earn a single target.
 */
export const THE_RING_IS_SHUT = {
  id: 'the-ring-is-shut',
  name: 'The Ring Is Shut',
  target: 'enemy-row-front',
  effects: [{ kind: 'damage', damageType: 'magical', power: 1.2 }],
  cooldown: 62,
  priority: 2,
} as const;

// ---------------------------------------------------------------------------------------
// The Angel Tower's third hundred — the blow that arrives whole
//
// ⚠️ **All four are the same idea at four sizes, and the idea is a *cadence* rather than a
// mechanic.** Everything measured at level 142, one anchor plus four identical bodies, forty seeds,
// against a **3.98 / 3.80** control — a body swinging the register's own median pairing of power
// 1.35 on a 55-tick cooldown. The negatives are half the finding:
//
//   magicResist 0.15 → 0.70    ref 4.00 → 3.88   alt 3.70 → 3.45   (18.5s → 24.6s)
//   physicalResist 0.45        ref 4.00          alt 3.77
//   dodge 0.30 on a 500 body   ref 4.00          alt 3.80
//   tenacity 0.60              ref 4.00          alt 3.60
//   hp 1000 / 1400 / 2000      ref 3.98/3.30/3.60 alt 3.45/3.08/2.25 (21.5s → 35.3s)
//   aim enemy-highest          ref 4.10          alt 4.05
//
// A magic ward is worth **0.10 and 0.35 of five across its entire range** and pays for it in six
// seconds a board, which is the Demon Tower's rejected ward arriving on the crew it looked designed
// for — this five deals no physical damage at all outside its basic attack and carries 0.12 of
// `magicPierce` summed across five, and it still does not care. Enemy durability is not monotonic
// and is paid in the clock. Aiming past the front rank leaves a board *easier* than saying nothing,
// for the fifth tower running.
//
// What moves an Angel five is the **size of one instance of damage**. Damage per second held
// constant, both endpoints inside the shipped cooldown register of 35 to 80:
//
//   power 1.55 / cd 35   ref 4.00          alt 3.52
//   power 2.20 / cd 50   ref 3.38 · 93%    alt 1.02 · 38%
//   power 3.10 / cd 70   ref 2.33 · 68%    alt 0.15 · 13%
//
// **Less total damage, delivered lumpier, kills more of this crew** — the burst body basic-attacks
// between casts, so it deals *less* over a fight than the control does. Every Angel heal in the game
// names `ally-lowest` and is metered by a cooldown or an energy bar, so a stream of chip is the one
// thing the choir is built to answer and a body removed between two heal ticks cannot be healed at
// all.
//
// ⚠️ **The licence here is margin rather than exclusivity, which is weaker than the Closing's and is
// recorded as such.** As a change on each crew's own control — calibrated per crew to the heaviest
// board that still reads ~4.00, then swapped chip for burst — angel-alt **−2.38**, elf-alt −2.08,
// undead-alt −1.80, angel-ref −1.35, demon-alt −1.27, human-ref −1.05, dwarf-ref −1.02, monster-ref
// −0.63. It costs everybody about a member and costs the choir two.
//
// ⚠️ **Zero timeouts on every row above**, which is what separates it from the clock: fights run 17
// to 46 seconds against a 90-second timer, and the collapse at the bottom is a wipe.
//
// ⚠️ **`haste` is sharper still and is deliberately not spent again** — 126 on the same chassis reads
// 1.98 · 78% and 0.30 · 20%. That is the second hundred's axis, its closing band already forbids
// three bodies above 126, and both dials at once reads 0.00 for both arrangements.
//
// ⚠️ **The band is built *at* the shipped register and only the roof steps past.** The ceiling on a
// single-target enemy swing is {@link BROKEN_COVENANT}'s 2.30 at cd 45, over 215 damage effects whose
// median is 1.35, and at exactly that pairing the blow is already worth **1.00 and 2.73** of five.
// That is the Splintering Yards' shape rather than the Closing's, and it is the difference between
// this and the Demon Tower's rejected magic ward, which was worth 0.00 at its own register.
// ---------------------------------------------------------------------------------------

/**
 * It does not cut twice. It has never had to.
 *
 * The hundred's spine, and the blow authored **at** the shipped ceiling: 2.30 on a 45-tick cooldown
 * is {@link BROKEN_COVENANT} exactly, so nothing in the first four bands asks for a number the game
 * has not already shipped. Between casts the body falls back to the basic attack, which is the whole
 * of the shape — the cadence is what is authored here, not the volume.
 */
export const THE_SINGLE_STROKE = {
  id: 'the-single-stroke',
  name: 'The Single Stroke',
  target: 'enemy-front',
  effects: [{ kind: 'damage', damageType: 'physical', power: 2.3 }],
  cooldown: 45,
  priority: 3,
} as const;

/**
 * It waits for the choir to choose, and then it takes what the choir chose.
 *
 * ⚠️ **The blow and the aim are a product rather than two dials**, which is why this arrives a band
 * after {@link THE_SINGLE_STROKE} and why no board carries more than two of it. At level 142 against
 * a 3.98 / 3.80 control, four bodies swinging 2.30 at the front rank read 2.98 · 95% / 1.07 · 57%;
 * four swinging **less** at 2.10 and naming `enemy-lowest` read **1.50 · 75% / 0.00**. Every Angel
 * heal in the game names `ally-lowest`, so this is the second half of the tower's own second-hundred
 * finding arriving with something heavy enough to finish the job.
 *
 * Shares {@link HEADSMANS_ARC}'s 2.10 and 45 exactly, which is the pairing eight shipped blocks
 * already use.
 */
export const SHATTERJAW = {
  id: 'shatterjaw',
  name: 'Shatterjaw',
  target: 'enemy-lowest',
  effects: [{ kind: 'damage', damageType: 'physical', power: 2.1 }],
  cooldown: 45,
  priority: 3,
} as const;

/**
 * A common's version of the same argument: smaller, and still one piece.
 *
 * The hundred's **texture**, and the cheapest thing on it that the choir cannot answer by out-healing.
 * 1.85 is under the register's ninetieth percentile of 2.05 and its 40-tick cooldown is above the
 * shipped floor of 35 — deliberately the least of the four, because a board's escalation here is how
 * many voices swing rather than how hard any one of them does.
 */
export const CLEAVE_THE_LINE = {
  id: 'cleave-the-line',
  name: 'Cleave the Line',
  target: 'enemy-front',
  effects: [{ kind: 'damage', damageType: 'physical', power: 1.85 }],
  cooldown: 40,
  priority: 2,
} as const;

/**
 * There is a wound the verse can close and a wound it cannot, and this is the far side of it.
 *
 * The roof's turn, and ⚠️ **the one thing in the hundred past the register**: 2.60 against a shipped
 * ceiling of 2.30, on the register's own median cooldown of 50. Stated here rather than discovered
 * later, because a future session has to be able to see which of the two shapes this band is —
 * the Splintering Yards built at their ceiling and stepped past only on the roof, and the Closing
 * stepped past across a whole hundred.
 *
 * `enemy-front` and no rider, for the fourth tower running. Aiming a roof past the front rank makes
 * it easier against a crew whose tanks stand there, which this tower measured for itself at
 * `enemy-highest` 4.10 / 4.05 against a 3.90 / 3.20 control.
 */
export const NOTHING_IS_MENDED = {
  id: 'nothing-is-mended',
  name: 'Nothing Is Mended',
  target: 'enemy-front',
  effects: [{ kind: 'damage', damageType: 'physical', power: 2.6 }],
  cooldown: 50,
  priority: 4,
} as const;

// ---------------------------------------------------------------------------------------
// The Demon Tower's third hundred — milestone 21r's three Angel blocks and one Monster
//
// ⚠️ **Four ordinary turns and nothing clever, because the hundred's axis is a stat rather than a
// mechanic.** What escalates across floors 201–300 is `critBlock` and `critDamageResist` on the
// bodies carrying these skills; the skills themselves are the register's own median so that
// nothing here confounds the measurement. See [`tower-demon.ts`](./tower-demon.ts) for the grade.
// ---------------------------------------------------------------------------------------

/**
 * The note held past the point where a voice should have broken.
 *
 * {@link EVENSONG_WARDEN}'s turn, and the hundred's spine. 1.35 magical on a 50-tick cooldown is the
 * shipped register's own median pairing — deliberately unremarkable, because the body swinging it
 * carries `critBlock` at exactly the shipped ceiling and **that** is what the band is made of. A
 * heavier blow here would have made the sweep unable to say which of the two was doing the work.
 */
export const EVENSONG = {
  id: 'evensong',
  name: 'Evensong',
  target: 'enemy-front',
  effects: [{ kind: 'damage', damageType: 'magical', power: 1.35 }],
  cooldown: 50,
  priority: 2,
} as const;

/**
 * Before anything is sung, somebody decides what true is.
 *
 * {@link PLAINSONG_PRECENTOR}'s turn, and the lightest of the four: 1.2 sits under the magical
 * register's median of 1.3, because the Precentor is the **texture** body — the one a board spends
 * to reach three carriers rather than two. The escalation in the opening bands is how many voices
 * refuse an edge, not how hard any of them swings.
 */
export const SET_THE_PITCH = {
  id: 'set-the-pitch',
  name: 'Set the Pitch',
  target: 'enemy-front',
  effects: [{ kind: 'damage', damageType: 'magical', power: 1.2 }],
  cooldown: 45,
  priority: 2,
} as const;

/**
 * A hide healed over so many times there is no seam left to open.
 *
 * {@link SCARWEAVE_TRAMPLER}'s turn, and the hundred's only **physical** one. That is the point of
 * fielding a Monster here rather than a fourth Angel: the boards need a body of comparable weight
 * that still counters Demons, and one whose damage arrives on the other axis keeps a five-Angel
 * board from being one repeated fight. 1.45 on 55 ticks is inside the register on both.
 */
export const GRIND_THE_SEAM = {
  id: 'grind-the-seam',
  name: 'Grind the Seam',
  target: 'enemy-front',
  effects: [{ kind: 'damage', damageType: 'physical', power: 1.45 }],
  cooldown: 55,
  priority: 2,
} as const;

/**
 * The blade goes in exactly where it was aimed, and finds the note unbroken.
 *
 * The roof's turn. 2.1 magical is under the shipped single-target magical ceiling of 2.45
 * ({@link UNMAKING}) and matches {@link LONG_SILENCE}'s pairing at 55 — ⚠️ **the blow is
 * deliberately not the escalation here**, which is what separates this roof from the Angel Tower's:
 * the Unmending's roof stepped past the register on its swing, and this one steps past on
 * `critBlock` and `critDamageResist` instead.
 *
 * `enemy-front` and no rider, for the fifth tower running. Aiming a roof past the front rank has
 * measured *easier* on every tower that tried it.
 */
export const NO_EDGE_FINDS_IT = {
  id: 'no-edge-finds-it',
  name: 'No Edge Finds It',
  target: 'enemy-front',
  effects: [{ kind: 'damage', damageType: 'magical', power: 2.1 }],
  cooldown: 55,
  priority: 4,
} as const;

/**
 * The choir, agreeing about one last thing.
 *
 * The roof's second turn, and **rhythm rather than escalation**. 0.95 across five is well under
 * {@link RUIN_UNBOUND}'s 1.15 ceiling on a wide magical turn, because board-wide damage is this
 * tower's *second* hundred and re-spending it at the top would be the Last Verse a hundred floors
 * later at a higher level. It is here so the roof has a second thing to do between swings, not
 * because the hundred needs it.
 */
export const THE_LAST_AMEN = {
  id: 'the-last-amen',
  name: 'The Last Amen',
  target: 'enemy-all',
  effects: [{ kind: 'damage', damageType: 'magical', power: 0.95 }],
  cooldown: 70,
  priority: 3,
} as const;

// ---------------------------------------------------------------------------------------
// The Rustwood — milestone 27, chapter 12
//
// The chapter asks how much of the party's damage survives contact, so its turns are about
// **arriving smaller** rather than about aim, order or persistence. Two shapes carry it: a pool
// banked in front of a body, and the party's own attack cut before it swings.
//
// ⚠️ **Both are shields and suppressions, and neither is a heal, a drain or a regeneration.** That
// is the ninety-second clock rather than a preference: mitigation already lengthens every fight on
// these boards, and sustain the party cannot aim past on top of it is a timeout — which is scored a
// defeat. A shield banks a pool once and depletes; a regeneration refills.
// ---------------------------------------------------------------------------------------

/**
 * The wood puts on what the field left, and the party's opening arrives against it.
 *
 * The Chanter's whole contribution and it deals nothing: a pool in front of **every** body on its
 * side, so the party's first exchange is spent on plate rather than on anything alive. The answer is
 * that a pool depletes — this is a tax on the opening, not a wall, and a party that keeps swinging
 * is through it inside two turns.
 *
 * ⚠️ **`AEGIS` runs 55 ticks against a 70-tick cooldown, and the fifteen-tick gap is the rule.** A
 * status that outlasts the skill applying it is a permanent absorb rather than a turn — `BARRIER` at
 * 70 recast every 60 is the shipped instance of that mistake, and it is what this cadence avoids.
 */
export const THE_RUST_HOLDS = {
  id: 'the-rust-holds',
  name: 'The Rust Holds',
  target: 'ally-all',
  effects: [{ kind: 'status', status: AEGIS }],
  cooldown: 70,
  priority: 4,
} as const;

/**
 * Everything the party swings has already been swung once.
 *
 * The other half of the chapter's question, asked from the party's own side of the board rather than
 * from the enemy's: {@link WEAKEN} on all five, so the damage that arrives is smaller because the
 * hand throwing it is. Paired with the plate on these boards it is the same sentence twice, which is
 * what makes The Rustwood a place rather than a stat line.
 *
 * ⚠️ **It carries damage as well, at ×0.8 under the ×1.2 wide ceiling.** A pure debuff turn on a
 * board already built to lengthen fights is a clock with a name; making the turn cost the party
 * health too is what keeps it a threat rather than a delay.
 */
export const EVERYTHING_COMES_BACK_BLUNT = {
  id: 'everything-comes-back-blunt',
  name: 'Everything Comes Back Blunt',
  target: 'enemy-all',
  effects: [
    { kind: 'damage', damageType: 'magical', power: 0.8 },
    { kind: 'status', status: WEAKEN, chance: 0.8 },
  ],
  cooldown: 60,
  priority: 3,
} as const;

/**
 * What the field left is fitted to whatever the party has just opened.
 *
 * The lieutenant's signature, and ⚠️ **conditioned rather than an opening turn** — the fourth chapter
 * running to take that shape, and the reason it works: it does nothing until the party has committed
 * to killing something, and then banks a pool on precisely the body the party chose. Four appearances
 * at four levels are four different fights, because the party arrives at each one with a different
 * opening.
 *
 * `ally-lowest` rather than `ally-all` is what makes it an answer instead of a wall: it protects the
 * one body that is losing, so the party's choice is re-priced rather than refused.
 */
export const WHAT_THE_FIELD_LEFT = {
  id: 'what-the-field-left',
  name: 'What the Field Left',
  target: 'ally-lowest',
  effects: [{ kind: 'status', status: AEGIS }],
  cooldown: 60,
  condition: { kind: 'ally-hurt', fraction: 0.8 },
  priority: 5,
} as const;

/**
 * Iron comes up through the wood, and there is nowhere on the board it does not reach.
 *
 * The final's reach, at ×1.0 against the ×1.2 wide ceiling — the same figure {@link THE_SUN_AT_NOON}
 * takes and for the same reason: five small hits against the diminishing-`def` curve are worth far
 * less than one big one, so a wide multiplier is read against the curve rather than against a
 * single-target one.
 *
 * ⚠️ **It restores nothing and shields nothing.** The Ironbloom's own plate is in its stat block,
 * where it depletes with the body rather than being re-banked on a cadence — which is the difference
 * between a fight that ends and one the clock ends.
 */
export const THE_IRON_COMES_UP = {
  id: 'the-iron-comes-up',
  name: 'The Iron Comes Up',
  target: 'enemy-all',
  effects: [
    { kind: 'damage', damageType: 'physical', power: 1 },
    { kind: 'status', status: SUNDER, chance: 0.8 },
  ],
  cooldown: 70,
  priority: 4,
} as const;

// ---------------------------------------------------------------------------------------
// The Quarry — chapter 13
//
// The chapter asks whether the party's damage lands **at all**, where The Rustwood asked how much
// of it survived contact. So its turns are about the swing failing rather than about the swing
// arriving smaller: a body that is already somewhere else, a face that comes down on everybody, and
// a side that shrugs off whatever the party pinned to it.
//
// ⚠️ **Three of the five carry {@link SLOW} and none of them carries a heal, a drain or a
// regeneration.** A slow is the one debuff that lengthens a fight from the *party's* side — it buys
// the enemy no health, only the party fewer turns — so it is the one shape here that has to be
// counted against `MAX_BATTLE_TICKS` rather than assumed safe. Two of the three are conditioned on
// {@link SLOW} being absent, which is what stops the board re-spending a turn on a party that is
// already slowed and what bounds the whole band. The timeout count is asserted at zero by
// `chapters.balance.ts`; see the chapter header for what it measured.
// ---------------------------------------------------------------------------------------

/**
 * The gallery is a hundred feet of dark and it was never where the swing went.
 *
 * The Slipfang's turn: `enemy-back` at 1.7 physical, under the shipped single-target physical
 * ceiling and matching {@link SUNDERJAW}'s reach. It is a **reach** rather than a lock — the block's
 * argument is `dodge: 0.28` in the stat block, and the skill is there so the body that cannot be hit
 * is also a body worth hitting.
 */
export const ALREADY_BEHIND_YOU = {
  id: 'already-behind-you',
  name: 'Already Behind You',
  target: 'enemy-back',
  effects: [{ kind: 'damage', damageType: 'physical', power: 1.7 }],
  cooldown: 50,
  priority: 3,
} as const;

/**
 * Stone dust, packed into every seam the party opened.
 *
 * The Grinder's turn, and deliberately plain: 1.1 across the front rank with no rider at all. The
 * band's whole question is in the stat block — `critBlock: 0.24` and `critDamageResist: 0.32`, both
 * **at** the shipped register rather than past it — and a skill carrying a second lock on top would
 * make the measurement unattributable.
 */
export const FLATTEN_THE_EDGE = {
  id: 'flatten-the-edge',
  name: 'Flatten the Edge',
  target: 'enemy-row-front',
  effects: [{ kind: 'damage', damageType: 'physical', power: 1.1 }],
  cooldown: 50,
  priority: 3,
} as const;

/**
 * Whatever the party pinned to it comes off with the next fall of spoil.
 *
 * The tenacity band stated as a turn rather than as a stat: two hostile statuses off **every** body
 * on its side, on a sixty-tick cadence. `RUNEWARD` and `ANTIPHON` are the shipped precedents for the
 * shape and both pair the cleanse with a buff; this one does not, because the band is about the
 * party's control failing and not about the board getting stronger for it.
 *
 * ⚠️ **A cleanse is not sustain and this distinction is the reason the band is allowed.** It
 * restores no health and banks no pool — what it costs the party is the turn it spent applying
 * something, which is a re-priced choice rather than a fight the clock ends.
 */
export const NOTHING_TAKES_HOLD = {
  id: 'nothing-takes-hold',
  name: 'Nothing Takes Hold',
  target: 'ally-all',
  effects: [{ kind: 'cleanse', count: 2 }],
  cooldown: 60,
  priority: 4,
} as const;

/**
 * A drift mouth closes on whoever was standing in the front of it.
 *
 * The Choker's turn: a row, and the party a third slower for it. ×1.05 across the front rank sits
 * under the wide physical ceiling, and the chance of 0.75 is the shipped figure for a row-wide
 * status rather than a new one.
 */
export const CHOKE_THE_DRIFT = {
  id: 'choke-the-drift',
  name: 'Choke the Drift',
  target: 'enemy-row-front',
  effects: [
    { kind: 'damage', damageType: 'physical', power: 1.05 },
    { kind: 'status', status: SLOW, chance: 0.75 },
  ],
  cooldown: 55,
  priority: 3,
} as const;

/**
 * Sixty feet of working face, arriving all at once.
 *
 * The band's wide turn, and ⚠️ **conditioned on {@link SLOW} being absent** for the reason
 * {@link MOONSONG} and {@link MIRE} are: a board that re-spends this on an already-slowed party is
 * a turn tax with no decision in it, and four boards carrying it would then be one board carried
 * four times. Conditioned, it fires once and then waits for the party to shed it — so a party that
 * cleanses is asking for it again and a party that does not is simply slower.
 *
 * ×0.85 across five, under the ×1.15 wide physical ceiling, because five small hits against the
 * diminishing-`def` curve are worth far less than one big one.
 */
export const THE_FACE_COMES_DOWN = {
  id: 'the-face-comes-down',
  name: 'The Face Comes Down',
  target: 'enemy-all',
  effects: [
    { kind: 'damage', damageType: 'physical', power: 0.85 },
    { kind: 'status', status: SLOW, chance: 0.8 },
  ],
  cooldown: 65,
  condition: { kind: 'status-absent', statusId: 'slow' },
  priority: 4,
} as const;

/**
 * It takes the ground out from under the block before it takes the block.
 *
 * The lieutenant's signature, and ⚠️ **conditioned rather than an opening turn** — the fifth chapter
 * running to take that shape. It does nothing while the party is already slowed, so what it asks
 * changes with what the party did on the four boards it stands on: a party that cleanses meets it
 * every sixty ticks, a party that eats the slow meets it once.
 *
 * ⚠️ **Undercutting is what a quarry does to a block it means to drop, and the party is the block.**
 * The name is the mechanic: the turn removed is the one the party had already earned.
 */
export const CUT_BENEATH_IT = {
  id: 'cut-beneath-it',
  name: 'Cut Beneath It',
  target: 'enemy-all',
  effects: [
    { kind: 'damage', damageType: 'physical', power: 0.9 },
    { kind: 'status', status: SLOW, chance: 0.85 },
  ],
  cooldown: 60,
  condition: { kind: 'status-absent', statusId: 'slow' },
  priority: 5,
} as const;

/**
 * The whole working goes, and there is nothing on the floor of it that is not under the fall.
 *
 * The final's reach, at ×1.0 against the ×1.15 wide physical ceiling — the same figure
 * {@link THE_IRON_COMES_UP} takes, and read against the diminishing-`def` curve for the same reason.
 *
 * ⚠️ **Unconditioned, unlike the three above it, and that is the final saying the chapter once more
 * without the escape valve.** A party that has learned to shed the slow on the boards below arrives
 * here and finds the answer does not work — but it costs a **cooldown** rather than a permanent
 * state, so it is a harder fight rather than a longer one. ⚠️ **It restores nothing**, and that is
 * the chapter's one absolute claim: no heal, no drain, no shield and no regeneration on this board.
 */
export const THE_GROUND_GOES = {
  id: 'the-ground-goes',
  name: 'The Ground Goes',
  target: 'enemy-all',
  effects: [
    { kind: 'damage', damageType: 'physical', power: 1 },
    { kind: 'status', status: SLOW, chance: 0.8 },
  ],
  cooldown: 70,
  priority: 4,
} as const;

/**
 * Every skill, for the specs that check ids are unique and that every kit points at a real one.
 *
 * One list rather than `Object.values(module)`, because `data/` is plain data and that is a
 * function call.
 */
export const SKILLS = [
  GUARD_BREAK,
  SECOND_WIND,
  OATH_OF_ARMS,
  SWORN_STRIKE,
  POMMEL_STRIKE,
  MARSHALS_CALL,
  DECISIVE_STRIKE,
  HOLD_THE_LINE,
  SWEEPING_COMMAND,
  FIELD_DRESSING,
  TRIAGE,
  SHIELDSWORN_OATH,
  BRACING_BLOW,
  TRUESIGHT_VOLLEY,
  MARKED_QUARRY,
  LOOSE_THE_FLIGHT,
  BLACKLANCE_THRUST,
  RIPOSTE,
  DUELISTS_READ,
  CHAINWARD,
  BLUNT_THE_EDGE,
  SENDING,
  THE_NINTH_HOLDS,
  SHIELD_WALL,
  IRON_REBUKE,
  ANVIL_STANCE,
  HAMMER_CHECK,
  FORGELIGHT_VIGIL,
  DEEP_WARD,
  GROUND_SLAM,
  DEEPSTONE_GRASP,
  WARD_UNBROKEN,
  SALTBEARD_REMEDY,
  STOUT_WARD,
  COALSONG,
  QUENCHING_DRAUGHT,
  GRUDGE_SETTLED,
  RUNE_STRUCK,
  STOKE_THE_GRUDGE,
  HURLED_ANVIL,
  CAVERN_ECHO,
  PIT_PROPS,
  RUNES_OF_RETURN,
  GRUDGEFIRE,
  WARDSTONE,
  SUNKEN_RUNE,
  PIERCING_SHOT,
  SNARE_ARROW,
  WINDSTEP,
  THROAT_CUT,
  NIGHTREACH,
  FIRST_ARROW,
  VOLLEY,
  SPLITTING_SHAFT,
  ARROW_OF_ENDING,
  SYLVAN_REFRAIN,
  WINDWOVEN_BALM,
  THORNGUARD,
  CUT_THE_VANGUARD,
  DUSKWEAVE,
  FADESHOT,
  WITHERING_GAZE,
  SUNSPEAR_CAST,
  PINNING_SHOT,
  QUIVER_UNSLUNG,
  SUNLIT_BOUGH,
  STAND_AND_BE_SEEN,
  BRAMBLECUT,
  ROOT_AND_BOUGH,
  GRAVE_GRASP,
  CARRION_FEAST,
  BLOOD_PACT,
  GRAVE_CHILL,
  UNQUIET_HUNGER,
  GRAVE_TIDE,
  SOUL_SIPHON,
  SOVEREIGNS_TOLL,
  SOUL_TITHE,
  BLOATBURST,
  GRASPING_ROT,
  HOLLOWBIND,
  GRAVECALL,
  OSSUARY_TIDE,
  MARROW_DRAW,
  BONE_CHOIR,
  CROWN_OF_FLIES,
  FESTER,
  FEAST_ON_RUIN,
  THE_LAST_VOLLEY,
  BONEWHISTLE,
  BONESHOT,
  THE_QUIET_FIELD,
  REND,
  MAUL,
  MOUNTAIN_BREAKER,
  SUNDER_STONE,
  AVALANCHE,
  WORLDS_MAW,
  DEVOUR,
  GORGE,
  DEVOURING_TIDE,
  BONEBREAK,
  THICK_HIDE,
  BLOOD_GORGE,
  RAGGED_SWIPE,
  TRAMPLE,
  SUNDERJAW,
  BREAK_THE_HERD,
  NINEFANG_FEAST,
  GNASHING_TIDE,
  MARROW_CRUNCH,
  CORROSION,
  BILESPRAY,
  GULLET,
  ACID_WIND,
  CHOIRLIGHT,
  SOOTHING_VERSE,
  VERSE_OF_DAWN,
  ABSOLUTION,
  DAWNWARD,
  UNWAVERING_LIGHT,
  AEGIS_SKILL,
  VIGIL,
  JUDGEMENT,
  SANCTUARY,
  WARDING_STRIKE,
  LIGHTSPEAR,
  KINDLED_WORD,
  EVEN_HAND,
  WEIGHED_AND_FOUND,
  LEVEL_GROUND,
  KEEPERS_CHARGE,
  GATEBREAKERS_ANSWER,
  UNYIELDING,
  THE_DRAWN_SWORD,
  SENTENCE,
  BLADE_OF_THE_CHOIR,
  ANSWERED_IN_KIND,
  EMBERBURST,
  CINDERLASH,
  GAMBLERS_CUT,
  HEXFIRE,
  DOUBLE_OR_NOTHING,
  RUIN_UNBOUND,
  UNMAKING,
  ENTROPY,
  LONG_SILENCE,
  SINSONG,
  WICKERBURN,
  CHAINBREAK,
  IRONS_BROKEN,
  THIRD_WHISPER,
  HEX_THE_HEARTH,
  WHISPERED_BARGAIN,
  RED_TITHE,
  TITHE_COLLECTED,
  CRIMSON_SIGIL,
  THE_HEX_COMES_DUE,
  SEEDED_SHAFT,
  PATIENT_MALICE,
  THE_RECKONING,
  MOTE_LANCE,
  GORE,
  CUTPURSE,
  STONE_FIST,
  GATE_SLAM,
  LITANY,
  MEND,
  WITHERHEX,
  MIRE,
  CINDER_STORM,
  BULWARK,
  SHIELD_BASH,
  GLACIAL_SLAM,
  FADE,
  WITHERING_TOUCH,
  SHRIKE_DIVE,
  FLENSE,
  WRATH_UNBOUND,
  RUINOUS_ARC,
  HEADSMANS_ARC,
  TYRANTS_CLAIM,
  WILDING_BLOOM,
  MOONSONG,
  THORNLASH,
  HERALDS_ANTHEM,
  CHOIR_OF_ASH,
  PILLAR_OF_LIGHT,
  SEVENFOLD_HEX,
  RUNEWARD,
  PALL_OF_YEARS,
  DRAW_THE_OATH,
  BIND_THE_CONCORD,
  EMBERSEED,
  DOOMKNELL,
  WARD_THE_SEAL,
  ANTIPHON,
  RIFTFALL,
  BROKEN_COVENANT,
  THE_SEAL_BREAKS,
  BARROW_TITHE,
  THE_BARROW_FORGETS,
  WAKE_THE_BONE,
  ROOTWAKE,
  THE_LONG_LOOSE,
  DRAW_INTO_THE_ROOT,
  THE_QUENCH,
  IRON_FOR_IRON,
  THE_ANVIL_FALLS,
  BLOOD_RISEN,
  BLOOD_CALLS_BLOOD,
  THE_PACK_ANSWERS,
  RAKE,
  OPEN_THE_VEIN,
  CHALLENGE_BELLOW,
  THE_LONG_BLEED,
  NIGHT_RIDE,
  RELIQUARY_SEAL,
  THE_LAST_MUSTER,
  COUCHED_LANCE,
  UNDERMINE,
  THE_BREACH_GIVEN,
  SLUNG_ANVIL,
  THE_WARDS_HOLD,
  THE_LINE_TRUE,
  SUNFADE,
  THE_CANOPY_PARTS,
  THE_SUN_AT_NOON,
  ZENITHFALL,
  RUINOUS_STOOP,
  NAME_THE_QUARRY,
  THE_HORN_SOUNDS,
  THE_FIELD_CLOSES,
  CULL_THE_EMBERS,
  RIFTSTEP,
  THE_DEBT_CALLED,
  NO_ANSWER_COMES,
  MASSED_LITANY,
  HUSH_THE_MANY,
  THE_KNELL,
  ONE_VOICE,
  NOTHING_IS_SPARED,
  THE_LAST_VERSE,
  PASS_THE_WORD,
  THE_ORDER_STANDS,
  AT_THE_HALT,
  THE_LINE_REFORMS,
  THE_COUNTERSIGN,
  THE_COLOURS_STAND,
  THE_STANDING_ORDER,
  PROCESSION_STEP,
  IRONWAKE_CHARGE,
  QUICKLIME_CUT,
  THE_HOUR_UNKEPT,
  THE_STRIKE_FALLS,
  SLAG_SLAM,
  KILN_LIGHT,
  ASHPIT_RAKE,
  THE_WHEEL_TURNS,
  THE_WORKS_RUN_ON,
  PUT_THE_EDGE_ON,
  THE_KEENING_NOTE,
  GLASSLIGHT_VERDICT,
  SHARDLIGHT,
  THE_EDGE_IS_MADE,
  NOTHING_HOLDS_AN_EDGE,
  CLOSE_OVER_IT,
  KEEP_THE_SEED,
  SEEDLIGHT,
  RUN_THE_SEED_DOWN,
  WHAT_FALLS_IS_SOWN,
  THE_WOOD_DOES_NOT_END,
  SHELLED_RUSH,
  SLAGHIDE_LUNGE,
  LOOSE_THE_PLATED_PACK,
  SHUT_THE_RING,
  NOTHING_GETS_A_GRIP,
  THE_RING_IS_SHUT,
  THE_SINGLE_STROKE,
  SHATTERJAW,
  CLEAVE_THE_LINE,
  NOTHING_IS_MENDED,
  EVENSONG,
  SET_THE_PITCH,
  GRIND_THE_SEAM,
  NO_EDGE_FINDS_IT,
  THE_LAST_AMEN,
  THE_RUST_HOLDS,
  EVERYTHING_COMES_BACK_BLUNT,
  WHAT_THE_FIELD_LEFT,
  THE_IRON_COMES_UP,
  ALREADY_BEHIND_YOU,
  FLATTEN_THE_EDGE,
  NOTHING_TAKES_HOLD,
  CHOKE_THE_DRIFT,
  THE_FACE_COMES_DOWN,
  CUT_BENEATH_IT,
  THE_GROUND_GOES,
] as const;
