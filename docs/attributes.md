# Attributes

The combatant stat block: what exists today, what replaces it in milestone 8, and the rules that
decide which stats are allowed to grow.

**Two of the guards here are termination arguments rather than balance opinions** — the `spd`
clamp and the hit-chance floor. They are spelled out under "the rules that decide what may scale",
and they are not tuning knobs.

See [glossary](glossary.md) for the vocabulary and [milestones](milestones.md) for the reasoning
behind the rework.

---

## What ships today: seventeen stats

Authored in [`data/characters.ts`](../src/data/characters.ts) and
[`data/enemies.ts`](../src/data/enemies.ts), parsed and clamped by
[`core/battle/content.ts`](../src/core/battle/content.ts).

| Stat             | Meaning                                                        | Scales? |
| ---------------- | -------------------------------------------------------------- | ------- |
| `hp`             | Health.                                                        | ✅      |
| `patk`           | Physical attack. Every basic attack in the game is physical.   | ✅      |
| `matk`           | Magic attack. Only skills read it.                             | ✅      |
| `pdef`           | Physical defence.                                              | ✅      |
| `mdef`           | Magic defence.                                                 | ✅      |
| `spd`            | ATB gauge gained per tick, against a threshold of 1000.        | ❌      |
| `critChance`     | Probability of a critical hit, 0–1.                            | ❌      |
| `critMultiplier` | Damage multiplier on a crit. Never below 1.                    | ❌      |
| `mp`             | Skill-point pool. Zero or absent means the kit pays no MP.     | ❌      |
| `mpRegen`        | MP regained at the start of each of the combatant's own turns. | ❌      |
| `lifesteal`      | Fraction of damage dealt returned as healing.                  | ❌      |
| `effectHit`      | Added to a status effect's application chance when applying.   | ❌      |
| `tenacity`       | Subtracted from that chance when receiving.                    | ❌      |
| `armorPen`       | Fraction of the target's `pdef` ignored. Capped below 1.       | ❌      |
| `magicPen`       | Fraction of the target's `mdef` ignored. Capped below 1.       | ❌      |
| `dodge`          | Subtracted from an incoming attack's hit chance.               | ❌      |
| `accuracy`       | Base hit chance before dodge. Absent means a certain hit.      | ❌      |

**Only the five quantities scale with level and rarity.** That is not a simplification, and the
next section is why.

---

## The rules that decide what may scale

A stat may grow with level only if it is a **quantity**. Everything else is bounded by definition,
by a termination argument, or by being measured against something authored.

- **`spd` must not scale — this is a termination argument, not a balance opinion.** It is gauge
  per tick against a fixed threshold, so it would hit its clamp within eighty levels and turn the
  one stat that buys turns into a constant. A `spd` moved by a haste or a slow is re-clamped for
  the same reason the authored value is.
- **Hit chance is `accuracy - dodge`, floored above zero.** Also a termination argument: a
  combatant nobody can hit turns every fight against it into a run to the tick cap.
- **Every probability is bounded by 1 by definition.** Nothing to scale.
- **Penetration is capped below 1** so a defensive stat can never be erased outright, and it is a
  _percentage_ rather than a subtraction — so a shredder makes a wall feel like a body rather than
  like an empty square.
- **`mp` is a budget measured against authored skill costs.** Growing it would silently delete the
  metering that makes a healer's pool run out.

**A compounding power curve makes these guards more important, not less.** Milestone 10 aims at
roughly ×10⁹ across the level range; at that scale an unbounded `spd` or an uncapped penetration
stops being a balance problem and becomes a hang.

---

## Planned: the milestone 8 rework

_Not built. Milestone 8 replaces the block above._ The set is derived from AFK Arena's, with two
deliberate departures noted below.

### The scaling four

| Stat       | Meaning                                                                            |
| ---------- | ---------------------------------------------------------------------------------- |
| `hp`       | Health.                                                                            |
| `atk`      | Attack. **One stat** — damage type moves onto the skill.                           |
| `def`      | Defence. **One stat** — reduces both damage types before the resists apply.        |
| `recovery` | Health recovered naturally over time. **Must scale**, or it is a no-op at ×10⁹ hp. |

### The bounded rest

| Stat               | Meaning                                                                                      |
| ------------------ | -------------------------------------------------------------------------------------------- |
| `haste`            | Gauge fill per tick — what `spd` is today, renamed. **Still clamped**, same argument.        |
| `attackSpeed`      | Extra gauge that accrues only while the next action would be a basic attack.                 |
| `critChance`       | Crit rating.                                                                                 |
| `critDamageAmp`    | Crit damage amplification. Opposed by the target's resistance rather than a flat multiplier. |
| `critDamageResist` | Reduces incoming crit damage, by point difference against the attacker's amplification.      |
| `critBlock`        | Reduces the chance of being crit at all.                                                     |
| `accuracy`         | Hit chance before dodge.                                                                     |
| `dodge`            | Subtracted from incoming hit chance.                                                         |
| `physicalResist`   | Percentage reduction of incoming physical damage, after `def`.                               |
| `magicResist`      | Percentage reduction of incoming magic damage, after `def`.                                  |
| `physicalPierce`   | Ignores a fraction of physical defence. Was `armorPen`.                                      |
| `magicPierce`      | Ignores a fraction of magic defence. Was `magicPen`. **Never abbreviate to MP.**             |
| `lifeLeech`        | Fraction of damage dealt returned as healing. Was `lifesteal`.                               |
| `insight`          | Chance to land control effects. Was `effectHit`.                                             |
| `tenacity`         | Chance to resist them.                                                                       |
| `healthRegen`      | Percentage amplifier on `recovery`.                                                          |
| `receivedHealing`  | Percentage amplifier on healing received from others.                                        |

Plus **energy**, a 0–100 resource rather than a stat: it fills from acting and is spent only on
ultimates. `mp` and `mpRegen` are deleted.

### Four opposed pairs, and you already ship two of them

The set is more coherent than its length suggests. Four stats are meaningless alone and only
resolve against their opposite number on the other combatant:

| Attacker side   | Defender side      | Already built? |
| --------------- | ------------------ | -------------- |
| `accuracy`      | `dodge`            | ✅             |
| `insight`       | `tenacity`         | ✅             |
| `critDamageAmp` | `critDamageResist` | ❌             |
| `critChance`    | `critBlock`        | ❌             |

So this is not a foreign system bolted on — it is the pattern already in
[`core/battle/damage.ts`](../src/core/battle/damage.ts), extended consistently.

### Two departures from the source material

**`recovery` and `healthRegen` overlap.** The source lists both: one is the quantity healed, the
other a percentage amplifier on it. That is close to redundant, and collapsing them into a single
scaling quantity is worth considering before authoring twenty-three kits against both.

**`haste` and `attackSpeed` collapse in an ATB system unless separated on purpose.** In a
real-time game, casting frequency and attack animation speed are genuinely different things. Here
`gauge += spd` per tick makes both just gauge fill. The proposed split is above — haste for
everything, attack speed only while the next action would be a basic attack — and it is **the one
mapping in this document with no precedent in the codebase.** Validate it against a ladder sweep
rather than treating it as settled.

---

## What the collapse to one `atk` costs

Milestone 4's back-row bonus is "+5% to whichever offensive stat is already higher, and only that
one" — which pays a caster on `matk` where its damage actually comes from, and quietly stops
paying a caster that has run out of MP. **With a single attack stat that design has no meaning.**

The front/back asymmetry is what makes the front rank a real cost rather than a free wall, so the
bonus needs _replacing_, not dropping. Deciding what replaces it is part of milestone 8.

---

## What survives the rescale, and what quietly does not

- **Multiplicative edges survive at any magnitude.** The faction matrix's 5–10% is 5–10% whether
  the numbers are 10² or 10¹². That design needs no rework.
- **Anything additive or threshold-shaped does not.** A flat bonus, or any authored constant
  compared against a scaling quantity, silently becomes a no-op. Audit for these rather than
  waiting to notice.
- **The tier fall-off is the thing to preserve on purpose.** Common tier is meant to be a genuine
  early answer that becomes a joke at cap. Steepening every tier by the same factor preserves that
  ratio; steepening them unevenly is a retune of a central promise and should be somebody's
  decision rather than a side effect of picking three numbers.
