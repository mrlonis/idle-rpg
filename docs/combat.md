# Combat

How a battle resolves, and which parts of it are load-bearing.

`simulateBattle(party, stage, seed, rules) => BattleResult` runs **instantly and headlessly**
into an event log; the UI animates the log afterwards. Combat is never driven by the render tick.
That single decision is what makes 1x/2x/4x, skip, and offline resolution free — the speed control
is one multiplication in the animator, not a second combat path.

**Several rules here are termination arguments rather than balance opinions.** They are marked
⚠️ and they are not tuning knobs: relaxing one does not make the game easier, it makes
`simulateBattle` capable of not returning.

See [attributes](attributes.md) for the stat block and [glossary](glossary.md) for vocabulary.
Milestone 8a rewrote the damage and scheduling halves of this page. Milestone 8b still owes the
energy rework, the skill-count gating and the faction lineup bonuses — the MP sections below are
what ships until then.

---

## The loop

Turn order is an **ATB gauge**, not fixed rounds. Each combatant gains `haste` gauge per tick and
acts at `ATB_THRESHOLD`. Haste therefore buys _turns_, not just going first.

**`attackSpeed` is extra gauge that accrues only when the combatant's last action was a basic
attack** — so a high-attack-speed combatant machine-guns basics between its skill windows, and a
cast drops it back to plain haste for one turn. The two are summed and clamped together, never
separately.

| Constant           | Value  | Meaning                                      |
| ------------------ | ------ | -------------------------------------------- |
| `ATB_THRESHOLD`    | 1000   | Gauge required to act.                       |
| `BATTLE_TICK_MS`   | 100    | Simulated milliseconds per tick.             |
| `MAX_BATTLE_TICKS` | 18,000 | Half an hour of game time, then `stalemate`. |

**The simulation jumps straight to the tick of the next action** rather than stepping tick by
tick — `ticksUntilReady()` in [`clock.ts`](../src/core/battle/clock.ts) computes the jump, and
[`clock.spec.ts`](../src/core/battle/clock.spec.ts) pins it against a brute-force per-tick count.
That is the same shape as the offline closed form being pinned against stepwise accrual, for the
same reason.

"The next thing" is the sooner of an action and a status expiring — the two things that can move
a gauge rate mid-window. Attack speed deliberately needs no third entry: it keys off the _last_
action taken, which can only change inside an action, and an action is a tick boundary already.
That is half the reason it is defined that way; the other half is in [attributes](attributes.md).

**A turn is upkeep first, action second.** MP regenerates, `recovery × (1 + healthRegen)` is
healed, statuses tick, and then the combatant acts. Natural recovery emits an ordinary `heal`
event with the actor as its own source, so the log stays complete without a fifteenth event kind.

⚠️ **A stunned combatant still consumes its turn.** A stun costs its victim turns rather than
removing it from the schedule, which is what bounds a stun lock — the fight cannot deadlock behind
one.

⚠️ **`haste` is clamped to `[1, ATB_THRESHOLD]`**, authored or modified, and `attackSpeed` is
added _before_ that clamp rather than bounded on its own. Below 1 and a combatant never acts;
above the threshold and it banks two actions in a tick. A haste buff or a slow is re-clamped for
exactly this reason, and so is the pair.

### Outcomes

`victory`, `defeat`, `stalemate`. Stalemate means the tick cap arrived first — out of patience
rather than out of combatants, and in practice sustain out-racing damage.

---

## Damage

```
base        = atk² / (atk + def × (1 - pierce))
final       = base × skill power × faction matchup × (1 - resist) × crit
crit        = 1 + max(critDamageAmp - critDamageResist, 0)
crits when  = draw < max(critChance - critBlock, 0)
```

**Why `atk² / (atk + def)` and not `atk - def`.** ⚠️ Subtractive mitigation reaches zero and then
goes negative once DEF catches ATK, which turns an unfavourable matchup into an unwinnable one and
leaves the simulation grinding to the tick cap. This form is strictly positive whenever ATK is, so
a battle always ends. It also behaves correctly at both extremes: `def = 0` lands full ATK,
`def = atk` halves it, and each further point of DEF is worth less than the last.

**One attack, one defence, two axes anyway.** Milestone 8a collapsed `patk`/`matk` and
`pdef`/`mdef` into one of each, so a hit's `DamageType` no longer selects _which stat is read_ —
it selects which **pierce** the attacker brings and which **resist** the defender answers with.
The axis survives the collapse: a Golem is still worth nothing against a spell, it just says so
with `physicalResist` instead of with a second defence stat.

⚠️ **Resist is capped below 1** (`MAX_RESIST`, 0.9), and this is a different argument from the
penetration cap even though the number matches. `def` diminishes a hit and can never reach zero;
resist multiplies the result and can. A combatant at resist 1 cannot be damaged by that type at
all, which is the unwinnable fight arriving by a third route.

**The crit is two opposed pairs, not one multiplier.** Whether a hit crits is
`critChance - critBlock`; what a crit is worth is `1 + max(critDamageAmp - critDamageResist, 0)`,
floored at 1 so a well-defended target turns a crit into an ordinary hit rather than a worse one.
Both follow the shape `accuracy`/`dodge` already had.

**Penetration multiplies, it does not subtract.** `def × (1 - pierce)`, capped at
`MAX_PENETRATION` (0.9). Flat penetration would delete a defensive stat outright; a fraction stays
a discount on the same diminishing curve, so a shredder makes a wall feel like a body rather than
like an empty square.

**Ordering is fixed, and the reason is subtle.** Skill power multiplies the **result**, not the
attack stat feeding it. The formula is quadratic in ATK, so scaling the input would make a 2×
skill hit for roughly 4× and turn every authored multiplier into a balance trap.

### Hitting

`accuracy - dodge`, floored at `MIN_HIT_CHANCE` (0.1).

⚠️ The floor is a termination guard first and a balance number second: a dodge pool that could
reach certainty would turn every fight against it into a stalemate. Ten percent also keeps an
evasion build annoying rather than unbeatable, which is the right amount of annoying for a stat
whose only counter-play is accuracy.

### The faction matchup

A multiplier on damage from **attacker faction vs defender faction** — a statement about the fight
in front of you, not about your own line-up.

- `human → dwarf → elf → undead → human`, ×1.05 each. A **closed cycle**, so no mortal faction is
  anybody's strict answer.
- **Monsters** hit everything for ×1.05 and take ×1.05 back from the four other mortal factions —
  a wildcard with a bill attached. Monster-on-monster is ×1.10, so the answer to an all-Monster
  wave is Monsters of your own.
- **Celestials** deal ×1.10 to every mortal with nothing coming back. The one asymmetry, paid for
  by the luck-only ascension ladder. Angel↔Demon is ×1.05 both ways.

Edges are small on purpose: five percent does not decide a fight, it decides a fight that was
already close. The counterweight to the celestial advantage is **enemy design, not arithmetic**.

---

## Targeting and the formation

Five slots in two ranks: **two front, three back**. The asymmetry is deliberate — the front row is
a _gate_ ordinary attacks must work through, so making it the smaller rank keeps it a real cost.

- Front row: **`def × 1.05` and `critDamageResist + 0.05`.**
- Back row: **`atk × 1.05` and `critDamageAmp + 0.05`.**

Each rank sharpens the role it already has: the front is the gate, so it gets defence and the
answer to a crit build; the back is where damage is fielded, so it gets attack and the
amplification to go with it. Neither is a tax on the other — the cost of the front row is that it
is the rank getting hit, which is a fact about the formation rather than a number in `data/`.

The crit halves are **points, not multipliers**. A crit is `1 + max(amp - resist, 0)`, so a
percentage would pay nothing at all to the majority of the roster, which sits at zero on both.

This replaced milestone 4's "+5% to whichever offensive stat is already higher", which had nothing
left to choose between once `patk` and `matk` collapsed.

**Placement is free.** Any character can stand in either rank. Role-locking was rejected because
it would let an unlucky roster reach a state where no legal party exists, and in a game with no
way to buy characters that is a run with nowhere to go. A bad front row is a far better failure
than no front row.

The basic attack is **physical, single-target, into the front rank** — all three load-bearing.
Physical is the type every `physicalResist` wall is authored against, so a magical kit is what
gets past one. Every bypass is authored on an individual skill, so reaching a back line is a
decision about who to field rather than a number to accumulate.

Eleven targeting modes: `enemy-front`, `enemy-back`, `enemy-lowest`, `enemy-highest`,
`enemy-row-front`, `enemy-row-back`, `enemy-all`, `ally-lowest`, `ally-afflicted`, `ally-all`,
`self`.

**All eleven are now used, and four of them only became content in milestone 7.**
`enemy-row-back`, `enemy-lowest`, `enemy-highest` and the `self-hurt` condition were all
authorable from milestone 4 and all sat idle — four questions the roster already had answers to
that nothing was asking. Turning each into an enemy is what the second half of the ladder is made
of, and it is worth checking this list against `data/skills.ts` before authoring a new mechanic:
the vocabulary is usually already there.

| Vocabulary       | The enemy that uses it | The question                            |
| ---------------- | ---------------------- | --------------------------------------- |
| `enemy-row-back` | Sky-Shrike             | what if your whole back rank is hit?    |
| `enemy-lowest`   | Gallows Headsman       | can you keep your weakest member alive? |
| `enemy-highest`  | Bonefall Tyrant        | what if your wall dies first?           |
| `self-hurt`      | Wrathborn              | what if chipping it turns it on?        |

---

## Skills

Selection walks the kit by **descending priority** and takes the first skill whose condition
holds, whose cooldown has elapsed, that it can pay for, and that has somebody to hit. The basic
attack sits at priority 0 — the floor, so it is what happens when nothing better is available
rather than something selection has to consider.

**Nothing in selection or targeting draws RNG.** The whole of a fight's randomness is "did it hit,
did it crit, did it stick".

### Three ways to meter a skill

| Cost   | Behaviour                                                                                                 |
| ------ | --------------------------------------------------------------------------------------------------------- |
| `none` | Metered by cooldown alone, so each such skill has to be individually weaker.                              |
| `mp`   | A finite pool regenerating per turn. Front-loads, then runs dry.                                          |
| `hp`   | Paid in the caster's own life, **never lethally**. The Undead's bargain: huge HP pools, almost no armour. |

⚠️ **The MP pool is what guarantees a fight against a healer resolves** rather than grinding
against a heal that never stops. Milestone 8**b** replaces MP with energy — which refills from
acting and therefore never runs dry — so that guarantee transfers entirely onto the
`MAX_BATTLE_TICKS` stalemate. That is a real trade, and it is recorded in milestone 8 rather than
discovered later. It has not happened yet: 8a deliberately left MP alone, because a healer with
neither meter is a healer with no meter at all.

Conditions are what stop a healer spending its pool on a party at full health. Without them a
priority list would have to say "always cast the biggest thing", and a support kit would be
indexed on how often its cooldown came up rather than on whether it was needed.

---

## Statuses

Buffs, debuffs, damage-over-time, regeneration, shields, drains and stuns.

**Quantities are snapshotted at application.** A poison does not stop hurting when its caster
dies — otherwise "kill the debuffer" would be the answer to every debuff, which is the same lock
twice.

**Statuses refresh rather than stack.** Two casters of the same 0.72 defence debuff would
otherwise land 0.52, and a wide enough wave would delete a defensive stat by arithmetic nobody
authored.

**A `stat-mod` may move `atk`, `def` or `haste`, and nothing else.** It was five stats before 8a;
`CURSE`, `WARD` and `FOCUS` were the magical halves of `SUNDER`, `GUARD` and `RALLY` and became
the same status twice, so they were deleted rather than kept as duplicates. Probabilities and
percentage amplifiers stay off the list deliberately: a multiplier on a probability is far harder
to read than one on a quantity, and a stacking crit buff is the fastest route to a fight decided
by one lucky opening turn.

Application is `insight` vs the target's `tenacity`, one draw per clause.

Quantities on a `dot`, a `regen` and a `shield` all price against the applier's `atk`, and two of
them are then settled against the **recipient** as the status lands — at application, because that
is when the quantity is fixed anyway:

- a `dot` is multiplied by the target's matching **resist**. That is what `damageType` on a status
  is for now that it no longer chooses an attack stat; without it a wall could shrug off swords
  and not bleeds, which would be a hole in the axis 8a moved onto the resists;
- a `regen` is healing from somebody else, so the recipient's `receivedHealing` applies.

---

## Determinism

The property: **replaying a battle reproduces it exactly, and never shifts the gacha sequence.**

- Combat draws from a **sub-stream**, derived with
  `deriveSeed(state.rng.seed, \`battle:${stageId}:${battleCount}\`)`. Pulls advance
`state.rng.calls`; **combat never does.**
- **The number of draws an action spends never depends on how those draws came out.** Exactly two
  per damage instance, always hit-then-crit, **both taken unconditionally** — the crit draw
  happens even on a miss, and a status clause spends its draw even against a target the preceding
  clause just killed. A conditional draw would make consumption depend on an outcome rather than
  on the line-up, and two otherwise identical replays would diverge.
- The same discipline governs pulls: **a pull spends exactly three draws whatever it produces**,
  including the elite-upgrade roll on results that can never be upgraded. If consumption varied,
  `rng.calls` would stop describing where a run sits in its sequence and O(1) resume would break.

`battleCount` advances on a loss as well as a win, so a retry is a new fight rather than a
bit-for-bit replay of the same defeat.

Never call `Math.random()`. Use [`core/rng.ts`](../src/core/rng.ts): `resumeStream(state.rng)` for
the main stream (commit it back so `calls` advances), `derivedStream(seed, label)` for an
independent one.

---

## The event log

Fourteen event kinds: `turn`, `attack`, `cast`, `miss`, `heal`, `status`, `status-resisted`,
`status-expired`, `cleanse`, `stunned`, `tick-damage`, `tick-heal`, `defeat`, `end`.

**The log's promise is that replaying it reproduces the final standings.** That is why turn starts
and status expiries are events at all, and why **a cleanse names the ids it removed rather than
how many** — an animator holding two debuffs and told "one was removed" has to guess, and
disagrees with the simulation from then on.

---

## Performance note worth not rediscovering

**Reading a combatant's current speed does not build a stat block.** The scheduling loop asks
every living combatant for its speed twice per iteration, and a full effective stat block costs
`Decimal` multiplications it immediately throws away. Doing that made a sweep of the whole ladder
take twenty seconds; `effectiveSpeed` makes it a rounding error.

The same budget is why `attackSpeed` keys off the action already taken rather than the one about
to be chosen: predicting it means running `chooseSkill`, which walks the kit doing target
resolution on every candidate.
