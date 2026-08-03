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
Milestone 8 rewrites much of this page; what is here describes what ships today.

---

## The loop

Turn order is an **ATB gauge**, not fixed rounds. Each combatant gains `spd` gauge per tick and
acts at `ATB_THRESHOLD`. SPD therefore buys _turns_, not just going first.

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

**A turn is upkeep first, action second.** Statuses tick, then the combatant acts.

⚠️ **A stunned combatant still consumes its turn.** A stun costs its victim turns rather than
removing it from the schedule, which is what bounds a stun lock — the fight cannot deadlock behind
one.

⚠️ **`spd` is clamped to `[1, ATB_THRESHOLD]`**, authored or modified. Below 1 and a combatant
never acts; above the threshold and it banks two actions in a tick. A haste or a slow is
re-clamped for exactly this reason.

### Outcomes

`victory`, `defeat`, `stalemate`. Stalemate means the tick cap arrived first — out of patience
rather than out of combatants, and in practice sustain out-racing damage.

---

## Damage

```
base        = atk² / (atk + def × (1 - pen))
final       = base × skill power × faction matchup × crit
```

**Why `atk² / (atk + def)` and not `atk - def`.** ⚠️ Subtractive mitigation reaches zero and then
goes negative once DEF catches ATK, which turns an unfavourable matchup into an unwinnable one and
leaves the simulation grinding to the tick cap. This form is strictly positive whenever ATK is, so
a battle always ends. It also behaves correctly at both extremes: `def = 0` lands full ATK,
`def = atk` halves it, and each further point of DEF is worth less than the last.

**Two axes, two defences.** A hit declares its `DamageType` and is measured against the matching
defence. That is the whole reason a wall is not automatically a wall against everything — a
Golem's enormous `pdef` is worth nothing against a spell.

**Penetration multiplies, it does not subtract.** `def × (1 - pen)`, capped at
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

- Front row: **+5% to both defences.**
- Back row: **+5% to whichever offensive stat is already higher, and only that one.**

Every basic attack in the game is physical, so a caster in the back gets all of it on `matk` —
which nothing but its skills read — and none of it on the swing it spends most turns making. A
caster that has run out of MP quietly stops benefiting from where it stands.

**Placement is free.** Any character can stand in either rank. Role-locking was rejected because
it would let an unlucky roster reach a state where no legal party exists, and in a game with no
way to buy characters that is a run with nowhere to go. A bad front row is a far better failure
than no front row.

The basic attack is **physical, single-target, into the front rank** — all three load-bearing.
Every bypass is authored on an individual skill, so reaching a back line is a decision about who
to field rather than a number to accumulate.

Eleven targeting modes: `enemy-front`, `enemy-back`, `enemy-lowest`, `enemy-highest`,
`enemy-row-front`, `enemy-row-back`, `enemy-all`, `ally-lowest`, `ally-afflicted`, `ally-all`,
`self`.

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
against a heal that never stops. Milestone 8 replaces MP with energy — which refills from acting
and therefore never runs dry — so that guarantee transfers entirely onto the `MAX_BATTLE_TICKS`
stalemate. That is a real trade, and it is recorded in milestone 8 rather than discovered later.

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

Application is `effectHit` vs the target's `tenacity`, one draw per clause.

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
four `Decimal` multiplications it immediately throws away. Doing that made a sweep of the whole
ladder take twenty seconds; `effectiveSpeed` makes it a rounding error.
