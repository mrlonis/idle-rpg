import {
  AEGIS,
  BARRIER,
  BLEED,
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
] as const;
