# Attributes

The combatant stat block: what a combatant is made of, and the rules that decide which parts of it
are allowed to grow.

**Three of the guards here are termination arguments rather than balance opinions** — the haste
clamp, the hit-chance floor and the resist cap. They are spelled out under "the rules that decide
what may scale", and they are not tuning knobs.

Milestone 8a rewrote this page and 8b replaced `mp`/`mpRegen` with `energyRegen`. See
[glossary](glossary.md) for the vocabulary and [milestones](milestones.md) for the reasoning behind
the rework.

**Three things now modify a stat block before a fight starts, and they apply in this order:** the
authored block is parsed and clamped, then the **row bonus** for where the character stands, then
the **lineup bonus** for the party's faction composition (8d, party side only — see
[combat](combat.md)). Every one of them re-clamps what it touches, which is why the guards below
are stated as properties of the block rather than of the authoring.

---

## The scaling four

Authored in [`data/characters.ts`](../src/data/characters.ts) and
[`data/enemies.ts`](../src/data/enemies.ts), parsed and clamped by
[`core/battle/content.ts`](../src/core/battle/content.ts), scaled for level and rarity by
[`core/roster/stats.ts`](../src/core/roster/stats.ts).

| Stat       | Meaning                                                                                |
| ---------- | -------------------------------------------------------------------------------------- |
| `hp`       | Health.                                                                                |
| `atk`      | Attack. **One stat** — every damaging skill reads it whatever type it declares.        |
| `def`      | Defence. **One stat** — reduces both damage types, before the matching resist applies. |
| `recovery` | Health restored at the top of each of the combatant's own turns, before `healthRegen`. |

**Only these four scale.** The next section is why, and why `recovery` had to be one of them.

## The bounded rest

| Stat               | Meaning                                                                                 |
| ------------------ | --------------------------------------------------------------------------------------- |
| `haste`            | ATB gauge per tick, against a threshold of 1000. Was `spd`.                             |
| `attackSpeed`      | Extra gauge, accruing **only** on the turn after a basic attack.                        |
| `critChance`       | Crit rating, before the target's `critBlock`.                                           |
| `critDamageAmp`    | Crit damage amplification, in **points**. A crit deals `1 + max(amp − resist, 0)`×.     |
| `critDamageResist` | Subtracted from an attacker's amplification.                                            |
| `critBlock`        | Subtracted from an attacker's crit rating.                                              |
| `accuracy`         | Hit chance before dodge. Absent means certainty. Capped at `MAX_ACCURACY` (2).          |
| `dodge`            | Subtracted from an incoming attack's hit chance.                                        |
| `physicalPierce`   | Fraction of the target's `def` a physical hit ignores. Was `armorPen`.                  |
| `magicPierce`      | The same for a magical hit. Was `magicPen`. **Never abbreviate to MP.**                 |
| `physicalResist`   | Fraction of incoming physical damage removed, **after** `def`.                          |
| `magicResist`      | The same for magical damage.                                                            |
| `lifeLeech`        | Fraction of damage dealt returned as healing. Was `lifesteal`.                          |
| `insight`          | Added to a status's application chance when applying. Was `effectHit`.                  |
| `tenacity`         | Subtracted from it when receiving.                                                      |
| `healthRegen`      | Percentage amplifier on `recovery`.                                                     |
| `receivedHealing`  | Percentage amplifier on healing received **from somebody else**.                        |
| `energyRegen`      | Energy regained at the top of each own turn. The authorable half of the ultimate meter. |

Only `hp`, `atk`, `def`, `haste`, `critChance` and `critDamageAmp` are required. Everything else
defaults to nothing — or, for `accuracy`, to certainty — so a stat block mentions a stat only when
that stat is part of the character's identity. A Monster's block is six lines.

---

## The rules that decide what may scale

A stat may grow with level only if it is a **quantity**. Everything else is bounded by definition,
by a termination argument, or by being measured against something authored.

- ⚠️ **`haste` must not scale.** It is gauge per tick against a fixed threshold, so it would hit
  its clamp within eighty levels and turn the one stat that buys turns into a constant. A haste
  moved by a buff or a slow is re-clamped for the same reason the authored value is, and
  `attackSpeed` is folded into the same sum before the same clamp — two stats that individually
  respected the bound and jointly did not would break turn ordering exactly as one oversized stat
  would.
- ⚠️ **Hit chance is `accuracy − dodge`, floored above zero.** A combatant nobody can hit turns
  every fight against it into a run to the tick cap.
- ⚠️ **Resist is capped below 1** (`MAX_RESIST`, 0.9). This is the guard 8a had to add, and it is
  a different argument from the penetration cap even though the number matches. `def` _diminishes_
  a hit and can never reach zero; resist _multiplies the result_ and can. A combatant at resist 1
  cannot be damaged by that type at all, which is the unwinnable fight arriving by a third route.
- **Every probability is bounded by 1 by definition.** Nothing to scale.
- **Penetration is capped below 1** so a defensive stat can never be erased outright, and it is a
  _percentage_ rather than a subtraction — so a shredder makes a wall feel like a body rather than
  like an empty square.
- **`energyRegen` is a budget measured against a fixed 100-point bar.** Growing it would put every
  ultimate in the game on a one-turn meter within about eighty levels. The argument is inherited
  verbatim from the `mp` pool 8b deleted — the resource changed shape and the reason did not.

**`recovery` is the exception, and it is the budget argument run backwards.** It is a quantity
measured against `hp`, so a fixed value becomes a no-op the moment health outgrows it — and
milestone 10 took the level range to roughly ×10⁹. `healthRegen` amplifies it as a
percentage and therefore stays where it was authored, which is the correct side of the line for
both. That pair is the one place this document keeps two stats where one would nearly do; the
alternative was a single scaling quantity with no way to say "this character recovers unusually
well for its size".

**A compounding power curve makes these guards more important, not less.** At ×10⁹ an unbounded
haste, an uncapped penetration or an uncapped resist stops being a balance problem and becomes a
hang. Milestone 10 shipped that curve and changed none of them, which is the whole of what
"survives the rescale" meant: the four quantities grew by nine orders of magnitude and every
bounded stat in this document is authored exactly where it was.

**Enemies scale on the same four quantities and the same three slopes.** Since milestone 10 an
archetype is a level-1 stat block plus a tier, and a stage fields it at a level — so everything
above applies unchanged to the other side of the board, including the reason a Wisp is still fast
and still fragile at stage 24.

---

## Four opposed pairs, and two of them are new

The set is more coherent than its length suggests. Eight stats are meaningless alone and only
resolve against their opposite number on the other combatant:

| Attacker side   | Defender side      | Resolves as                     |
| --------------- | ------------------ | ------------------------------- |
| `accuracy`      | `dodge`            | `accuracy − dodge`, floored     |
| `insight`       | `tenacity`         | `authored + insight − tenacity` |
| `critChance`    | `critBlock`        | `critChance − critBlock`        |
| `critDamageAmp` | `critDamageResist` | `1 + max(amp − resist, 0)`      |

The bottom two arrived in 8a and follow the shape the top two already had, which is what makes a
crit build answerable by something other than more dodge. All four live in
[`core/battle/damage.ts`](../src/core/battle/damage.ts).

Note which of them is allowed to reach an extreme. `critBlock` may reach total immunity, because a
hit that never crits still kills; `dodge` may not, because a hit that never lands never does.

---

## What the collapse to one `atk` and one `def` cost, and what paid for it

**Damage type moved from the stat onto the skill.** A skill declares physical or magical, reads
the single `atk`, and is reduced by `def` less the matching pierce and then by the matching
resist. Four stats became two.

**The two axes survive on `physicalResist` and `magicResist`.** A Golem is still a wall against
swords and a liability against spells; it says so with a resist instead of with a second defence
stat. That is the substance of what `pdef`/`mdef` were for, and it is why the collapse is not a
simplification of the design.

**Three statuses went with it.** `CURSE`, `WARD` and `FOCUS` were the magical halves of `SUNDER`,
`GUARD` and `RALLY`. With one `atk` and one `def` they were the same status under a second name.
`ModifiableStat` is now `atk | def | haste`.

**The back-row bonus needed replacing, not dropping.** Milestone 4's "+5% to whichever offensive
stat is already higher" had nothing left to choose between. The replacement makes each rank
sharpen the role it already has:

| Rank  | Gets                                    |
| ----- | --------------------------------------- |
| Front | `def × 1.05`, `critDamageResist + 0.05` |
| Back  | `atk × 1.05`, `critDamageAmp + 0.05`    |

The crit halves are **points, not multipliers** — a crit is `1 + max(amp − resist, 0)`, so a
percentage would pay nothing at all to the majority of the roster, which sits at zero on both.

**Shields and regeneration had to be re-priced.** They scale off the applier's `atk`, and the
characters authored to cast them are tanks and healers — the lowest attack stats in the game. At
the old power a Dwarf's barrier absorbed under four percent of a health bar. `BARRIER` went 1.1 →
1.5 and `AEGIS` 1.8 → 2.3, and [`data/skills.spec.ts`](../src/data/skills.spec.ts) now measures
restoration against a typical health bar rather than measuring one attack stat against the other.

---

## `haste` and `attackSpeed`, the one mapping with no precedent

In a real-time game, casting frequency and attack animation speed are genuinely different things.
In an ATB system `gauge += haste` makes both just gauge fill, so the separation has to be
manufactured. It is manufactured like this: **haste is gauge for everything; attack speed is extra
gauge that accrues only when the combatant's _last_ action was a basic attack.** A
high-attack-speed character machine-guns basics between its skill windows, and a cast drops it
back to plain haste for one turn.

**Reading the last action rather than predicting the next one is the load-bearing choice**, and
two rejected alternatives are why:

- **Predicting it means running `chooseSkill`**, which walks the kit resolving targets for each
  candidate. The scheduling loop asks for gauge fill on every living combatant twice per
  iteration; doing that there is exactly what `effectiveSpeed` exists to avoid.
- **Approximating it as "nothing in the kit is off cooldown" is cheap and wrong**, in a way that
  bites precisely the content the stat was authored for. A skill gated on a condition that is not
  currently met never goes on cooldown, so it suppresses the bonus for the entire fight.
  Aelrindel's Volley wants three living enemies; on that reading the largest attack speed in the
  game would pay out only on wide waves.

The chosen rule also needs no scheduling boundary of its own. The flag can only move **inside an
action**, which is a tick boundary already, so gauge fill is constant across a jump for free —
where both alternatives would need the simulation to jump to the moment the bonus switched off.

Elves are the only faction authored with it, which is what the stat was separated out to express.

---

## What survives a rescale, and what quietly does not

- **Multiplicative edges survive at any magnitude.** The faction matrix's 5–10% is 5–10% whether
  the numbers are 10² or 10¹². That design needs no rework.
- **Anything additive or threshold-shaped does not.** A flat bonus, or any authored constant
  compared against a scaling quantity, silently becomes a no-op. `recovery` is the worked example
  of catching one before it shipped; audit for the rest rather than waiting to notice.
- **The tier fall-off is the thing to preserve on purpose.** Common tier is meant to be a genuine
  early answer that becomes a joke at cap. Steepening every tier by the same factor preserves that
  ratio; steepening them unevenly is a retune of a central promise and should be somebody's
  decision rather than a side effect of picking three numbers.
