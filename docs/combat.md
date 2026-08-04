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
Milestone 8a rewrote the damage and scheduling halves of this page, 8b replaced MP with energy, and
8c gated skills behind ascension rungs. Milestone 8**d** still owes the faction lineup bonuses.

---

## The loop

Turn order is an **ATB gauge**, not fixed rounds. Each combatant gains `haste` gauge per tick and
acts at `ATB_THRESHOLD`. Haste therefore buys _turns_, not just going first.

**`attackSpeed` is extra gauge that accrues only when the combatant's last action was a basic
attack** — so a high-attack-speed combatant machine-guns basics between its skill windows, and a
cast drops it back to plain haste for one turn. The two are summed and clamped together, never
separately.

| Constant           | Value | Meaning                                             |
| ------------------ | ----- | --------------------------------------------------- |
| `ATB_THRESHOLD`    | 1000  | Gauge required to act.                              |
| `BATTLE_TICK_MS`   | 100   | Simulated milliseconds per tick.                    |
| `MAX_BATTLE_TICKS` | 900   | ⚠️ The battle timer: ninety seconds, then a defeat. |

**The simulation jumps straight to the tick of the next action** rather than stepping tick by
tick — `ticksUntilReady()` in [`clock.ts`](../src/core/battle/clock.ts) computes the jump, and
[`clock.spec.ts`](../src/core/battle/clock.spec.ts) pins it against a brute-force per-tick count.
That is the same shape as the offline closed form being pinned against stepwise accrual, for the
same reason.

"The next thing" is the sooner of an action and a status expiring — the two things that can move
a gauge rate mid-window. Attack speed deliberately needs no third entry: it keys off the _last_
action taken, which can only change inside an action, and an action is a tick boundary already.
That is half the reason it is defined that way; the other half is in [attributes](attributes.md).

**A turn is upkeep first, action second.** Energy regenerates, `recovery × (1 + healthRegen)` is
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

**`victory` or `defeat`. There is no third answer.**

You have ninety seconds to win. Running the clock out is losing — the same defeat as being wiped,
paying the same nothing, and stopping auto-battle the same way.

There used to be a `stalemate` for "the tick cap arrived first", against a cap of 18,000 ticks —
half an hour. It was a true statement about the simulation and a useless one to the player, and the
cap it described bounded nothing: the longest fight any reference party has is 48.5 seconds, so the
old ceiling was 37× a number nothing approached. What it actually produced was a party that could
not out-damage a healer generating half an hour of battle log on a screen with no exit.

⚠️ **The distinction moved to `BattleResult.timedOut` rather than disappearing.** A timeout and a
wipe are the same thing to a player and very different things to a balance sweep — an over-tuned
sustain kit is invisible unless something records which one happened. Nothing in `ui/` reads the
flag; the sweep reads nothing else.

**The headroom is now 1.9×, and that is a constraint on content rather than slack.** A stage tuned
to take longer than ninety seconds against the party it is meant for is a stage nobody can clear,
which is why `stages.balance.ts` asserts the margin directly and should fail before the win-rate
assertions do.

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
reach certainty would leave every fight against it to the timer. Ten percent also keeps an
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

### Two ways to meter a skill

| Kind       | Behaviour                                                                                 |
| ---------- | ----------------------------------------------------------------------------------------- |
| Ordinary   | Free, metered by its cooldown alone, so each such skill has to be individually weaker.    |
| `ultimate` | Metered by a **full energy bar** and nothing else. No cooldown — the bar is the cooldown. |

**Every playable character declares exactly one ultimate**, asserted in
[`characters.spec.ts`](../src/data/characters.spec.ts). Two would be worse than none and silently
so: they share one bar, and the lower-priority of them could never fire. `toSkill` discards a
cooldown authored on an ultimate, so a kit cannot pick up a second gate by accident.

**No enemy has one.** Energy is a character system — a bar the player watches, and what 8c hung its
skill ceiling on. An encounter is read as a rhythm instead, so its pacing is authored directly in
cooldowns where a designer can set it exactly. It also keeps skills shareable between enemies, which
several are.

It was three before 8b: `mp` was a pool that started full and ran dry, and `hp` was the Undead
paying for tempo in their own life. Both went with the `mp` stat.

### How much of a kit a character actually has

Since milestone 8c a character does not fight with everything its kit authors. **Tier sets a
ceiling** — how many skills it may ever field, ultimate included — and **ascension rungs unlock up
to it**:

| Tier      | Ceiling          | Unlocks at                                 |
| --------- | ---------------- | ------------------------------------------ |
| common    | 2 — ultimate + 1 | ultimate, then `elite`                     |
| legendary | 3 — ultimate + 2 | ultimate, `elite`, `legendary`             |
| ascended  | 4 — ultimate + 3 | ultimate, `elite`, `legendary`, `ascended` |

Three things about the rule matter to anyone reading a fight:

- **The thresholds are absolute rarity**, read against the ladder rather than against each
  character's own starting rung. `ascended`-tier characters start at `elite`, so they arrive
  holding their second skill already — a deliberate head start, argued in
  [milestones](milestones.md).
- **The ultimate is never gated.** It is the one skill the energy bar meters, so gating it would
  produce a combatant whose bar fills and can never be spent.
- **Which ordinary skill unlocks first is the kit's authored order**, and combat never sees it:
  `toCombatant` sorts by `priority`, so authored order decides when a skill is _earned_ and
  `priority` decides when it is _used_.

**The gate is applied in `toBattleCombatant`, not here.** `simulateBattle` receives a kit that has
already been narrowed, exactly as it receives stats that have already been scaled — nothing in
`core/battle/` knows what a tier or a rung is, which is what keeps a fixture-driven battle spec
free of roster concepts.

### Energy

A bar of `MAX_ENERGY` (100) for everybody, filled from the combatant's own `energyRegen` per turn
plus what the fight pays:

| Source   | Paid                                       | Shipped value |
| -------- | ------------------------------------------ | ------------- |
| `onHit`  | Once per action that landed a damaging hit | 20            |
| `onHurt` | **Per damaging hit taken**                 | 10            |
| `onHeal` | Once per action that healed somebody else  | 15            |

The asymmetry is deliberate and was tuned rather than guessed. `onHurt` is per hit because being
focused should charge a bar fastest — that is the Undead's whole meter, and it is what makes a wide
enemy wave charge a party all at once. `onHit` is per action so a row nuke does not charge its own
caster five times over. At ten each the back rank then charged half as fast as the front one, which
put the slowest meter in the game on the rank where damage is fielded; doubling `onHit` restores the
symmetry without giving up what the per-hit rule buys.

**An ultimate opens a fight unavailable, and that is the whole change.** MP started full, so a
caster front-loaded and ran dry and a long fight was one it had already lost the interesting half
of. Energy starts at zero, so an ultimate is a payoff and a long fight is one where more of them
land. The pacing difference between a short fight and a long one survived; it changed sign.

⚠️ **What did not survive is a termination argument.** The MP pool was what guaranteed a fight
against a healer resolves rather than grinding against a heal that never stops. A bar that only
refills cannot run out, so that guarantee now rests **entirely** on the `MAX_BATTLE_TICKS` timer.
This was recorded in milestone 8 before the work rather than discovered after it, and the thing
standing where the pool used to is one assertion: the ladder sweep requires that **no reference
party ever runs the clock out**, winning or losing, read off `timedOut` rather than off the
outcome.

It showed up immediately and exactly where predicted. The Ashen Hierophant at stage 24 was the one
enemy in the game its pool genuinely metered — two skills against 6 regen a turn — and losing it
handed the enemy an unmetered heal every second turn, turning the last stage into a 102-second
attrition war the reference party lost more often than it won. The fix was enemy design, as the
milestone said it would have to be: its own longer-cooldown heal, so the stage-7 Acolyte that shares
none of that history keeps its cadence.

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

**Energy rides on the events that move it rather than on a fifteenth event kind.** `turn` carries
it after regeneration, `cast` after the bar is spent, `heal` carries the healer's, and `attack`
carries **both** sides' — one hit moves two meters, the attacker's for landing it and the target's
for taking it. A separate energy event would have made the animator correlate it with the hit that
caused it, which is re-deriving state the simulation already knew.

Statuses deliberately pay no energy: a poison tick is not an action, and crediting one would make a
damage-over-time an energy engine.

---

## Performance note worth not rediscovering

**Reading a combatant's current speed does not build a stat block.** The scheduling loop asks
every living combatant for its speed twice per iteration, and a full effective stat block costs
`Decimal` multiplications it immediately throws away. Doing that made a sweep of the whole ladder
take twenty seconds; `effectiveSpeed` makes it a rounding error.

The same budget is why `attackSpeed` keys off the action already taken rather than the one about
to be chosen: predicting it means running `chooseSkill`, which walks the kit doing target
resolution on every candidate.
