# Glossary

The vocabulary, and specifically the words that mean more than one thing.

Several terms collide because the genre's vocabulary collides. The types keep them apart — a
`CharacterTier` is not assignable to a `RarityId` — so the ambiguity can only bite in prose. This
file is what prose should point at.

Companion references: [attributes](attributes.md) for the stat block, [ascension](ascension.md)
for the rung ladders, [milestones](milestones.md) for the roadmap and the reasoning behind each
decision.

---

## The collisions, first

| Word        | As a **tier**       | As a **rarity rung** | As a **rarity family** |
| ----------- | ------------------- | -------------------- | ---------------------- |
| `common`    | ✅ the starter tier | —                    | —                      |
| `rare`      | —                   | ✅ index 0           | ✅                     |
| `elite`     | —                   | ✅ index 2           | ✅                     |
| `legendary` | ✅ the middle tier  | ✅ index 4           | ✅                     |
| `mythic`    | —                   | ✅ index 6           | ✅                     |
| `ascended`  | ✅ the top tier     | ✅ index 8 (of 14)   | ✅                     |

So **"a legendary character" is ambiguous and should never be written.** Say "a legendary-tier
character" (how it was pulled) or "a character at legendary rarity" (how far it has been
ascended). The two are unrelated: a common-tier character can reach `ascended-5`, and an
ascended-tier character starts at `elite` and has to climb the same rungs as everyone else.

`common` is the one tier word that is _only_ a tier. There is no `common` rarity.

---

## Tier vs rarity

These are the two axes, and mixing them up is the single most common way to misread this game.

**Tier** — how a character was pulled. `common`, `legendary`, `ascended`. **It never changes.**
It decides two things: which rung the character starts on (`ascended`-tier starts at `elite`,
skipping the two cheapest rungs) and how steeply it grows per level. Tier is a **slope, not a head
start** — base stat budgets are close across tiers, and the gap opens over hundreds of levels.

**Rarity** — how far a character has been ascended. Fourteen rungs, `rare` → `ascended-5`, bought
with duplicate copies. **This is the vertical power axis**, and every character of every tier can
reach the top of it.

An index into `RARITIES` **is** a rarity — comparisons, clamping and cost arithmetic all happen on
the index, and the string exists for display and authoring.
See [`core/roster/types.ts`](../src/core/roster/types.ts).

**Rarity family** groups the fourteen rungs into five (`rare`, `elite`, `legendary`, `mythic`,
`ascended`) for anything that treats `rare` and `rare-plus` as the same kind of thing. A `-plus`
suffix or a star is a step _within_ a family, not a new one.

---

## Faction is one word doing three jobs

Seven factions: Humans, Dwarves, Elves, Undead, Monsters, Angels, Demons. The word appears in
three unrelated mechanics, and conflating them is the second most common confusion.

1. **Ascension path.** Faction decides whether a character walks the **mortal** ladder (pays in
   same-faction fodder) or the **celestial** one (pays only in copies of itself). Angels and
   Demons are celestial; everyone else is mortal. See [ascension](ascension.md).
2. **The matchup matrix.** A multiplier on damage based on attacker faction vs _defender_
   faction — Humans hit Dwarves for ×1.05, and so on round a closed cycle. **This is a statement
   about the fight in front of you**, which is why it is sanctioned where flat synergy bonuses are
   not. See [`data/combat.ts`](../src/data/combat.ts).
3. **The lineup bonus** — shipped in milestone 8d. A bonus for how many of one faction are in
   **your own party**: three of a faction pays +10% attack and health, five pays +25%. This is the
   opposite shape from the matchup and it was explicitly ruled out until milestone 8d overrode the
   rule knowingly — a mono-faction bonus creates seven optimal teams rather than one, and the
   matchup decides which to bring. Three tracks stack: the composition ladder, **Monsters** paying
   every ally a flat share per member, and **Demons** climbing a cumulative track of their own.
   **Angels are the wildcard**, counting as any faction on the composition ladder and on neither of
   the other two. It applies to the **party only** — an enemy formation never gets one.
   See [`data/combat.ts`](../src/data/combat.ts).

When someone says "faction bonus", ask which of 2 and 3 they mean.

**Numbers 2 and 3 are also the two halves of milestone 8d's unfinished business.** The lineup bonus
is worth up to +25% and a matchup edge is worth 5–10%, so today a player keeps whatever composition
they can reach and the matchup decides nothing. Resizing the edges waits for milestone 8e, because
two mono-faction teams both carry the same lineup bonus — it cancels — and there is no second
mono-faction team to compare against until the roster is five deep.

---

## Level means two things once resonance ships

- **Invested level** — what the player actually paid to raise. Stored in the save as
  `OwnedCharacter.level`.
- **Effective level** — what the character actually fights at:
  `min(levelCapFor(rarity), max(investedLevel, resonanceFloor))`.

The **resonance floor** is the level of the fifth-highest-levelled character in the roster.
Everyone is carried to at least that level, capped by their own rarity. _Planned, milestone 9._
Until then the two are the same number.

Level caps are per rarity rung, from 40 at `rare` to 1000 at `ascended-5`.

---

## Everything else

| Term                 | Means                                                                                                                                                                                                                                                                                                                                                               |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ATB**              | The turn system. `gauge += haste` each tick, plus `attackSpeed` while the combatant's **last** action was a basic attack; act at `ATB_THRESHOLD` (1000). Haste buys _turns_, not just going first.                                                                                                                                                                  |
| **Tick**             | Two unrelated clocks. The **sim tick** is the ~10Hz idle loop. The **battle tick** is `BATTLE_TICK_MS` (100ms) of simulated combat time, capped at `MAX_BATTLE_TICKS` (900 — the ninety-second battle timer).                                                                                                                                                       |
| **Battle timer**     | Ninety seconds (`MAX_BATTLE_TICKS`, 900 ticks) to win a fight. Running it out is a **defeat** — there is no draw. Was 18,000 ticks and a third `stalemate` outcome, which bounded nothing and left unwinnable fights running half an hour.                                                                                                                          |
| **Timed out**        | `BattleResult.timedOut`: the clock ended the fight rather than a death. ⚠️ Invisible to the player by design, and the **only** signal the balance sweep has for an over-tuned sustain kit — it is what replaced the zero-stalemates assertion.                                                                                                                      |
| **Stage**            | One battle on the ladder. Clearing one permanently raises all four idle rates; that is the real reward, not the one-off gold.                                                                                                                                                                                                                                       |
| **Auto-battle**      | The unlockable repeat, earned at twelve clears: it re-enters stages until the party loses. **Foreground-only** — it switches itself off when the app is hidden, which is a correctness rule (see [combat](combat.md) and milestone 5), not a courtesy. Not to be confused with **ambient sparring**, the still-deferred idle-screen decoration that awards nothing. |
| **Lock**             | An encounter built around a question the roster has an answer to — a healer you must reach, a wall your debuffs bounce off — rather than a bigger stat block. The unit of stage design.                                                                                                                                                                             |
| **Chapter**          | A group of stages. _Planned, milestone 11._ Chapters 1–10 hold 50 stages each, stepping +10 every ten chapters, capped at 200.                                                                                                                                                                                                                                      |
| **Formation**        | The party: two front slots, three back. `PARTY_SIZE` is 5. Placement is free — any character in either row.                                                                                                                                                                                                                                                         |
| **Row / rank**       | Front or back. Front gets +5% `def` and +0.05 crit damage resistance; back gets +5% `atk` and +0.05 crit damage amplification. Each rank sharpens the role it already has. Ordinary attacks go through the front rank first.                                                                                                                                        |
| **Lineup bonus**     | What the party's own faction composition is worth — see the three jobs of "faction" above. Applied to the **party only**, never to an enemy formation. Not the same as a **row bonus**, which is about where one character stands rather than about who else you brought.                                                                                           |
| **Wildcard**         | Angels, on the composition ladder only. Three Humans and two Angels reads as five Humans. Deliberately not a wildcard for the Monster or Demon tracks, where it would make one faction strictly the best thing to own.                                                                                                                                              |
| **Role**             | `tank`, `bruiser`, `assassin`, `ranger`, `sniper`, `mage`, `healer`, `support`. **Nothing in the simulation reads it** — it exists so the roster screen can say "healer" instead of implying it.                                                                                                                                                                    |
| **Copies**           | Spare duplicates of a character, counted rather than tracked individually. The ascension currency. Only spares are ever consumed — never a character you have levelled.                                                                                                                                                                                             |
| **Fodder**           | Copies of a _different_ character of the same faction, spent on the mortal ladder.                                                                                                                                                                                                                                                                                  |
| **Base copies**      | Copies at the rarity a pull produces. Every rung's price is resolved recursively down into these, which is why ascension costs are code rather than a lookup table.                                                                                                                                                                                                 |
| **Pity**             | The bad-luck floor on pulls. **Global, not per-banner**, and always visible. Soft pity from pull 30 at +6%/pull; hard pity at 50.                                                                                                                                                                                                                                   |
| **Spark**            | What a copy becomes when the character is already at `ascended-5`. Late-game overflow, and the only currency with no idle rate. **Pity is the escape valve for bad luck, not the shop.**                                                                                                                                                                            |
| **Summons**          | The pull currency, called crystals in the UI. Accrues idly — which is the unusual part of this game's economy.                                                                                                                                                                                                                                                      |
| **Essence**          | Charged only at breakthrough levels (every tenth) and the stingiest currency. Cheapest before level 60, most expensive by 200.                                                                                                                                                                                                                                      |
| **Breakthrough**     | Every tenth level, where essence is charged. Rarity caps are all multiples of ten so an ascension always lands in front of one rather than stranded between two.                                                                                                                                                                                                    |
| **Ultimate**         | The one skill in a kit metered by a full energy bar instead of a cooldown. Exactly one per character, and it spends the whole bar. Enemies have none. **Never gated by 8c's skill ceiling.**                                                                                                                                                                        |
| **Kit**              | Every skill a character authors, basic attack excluded. Not the same as what it fights with — see **ceiling**.                                                                                                                                                                                                                                                      |
| **Ceiling**          | How many skills a **tier** may ever field, ultimate included: 2 common, 3 legendary, 4 ascended. An authoring constraint as much as a runtime one — every kit is authored at exactly its ceiling.                                                                                                                                                                   |
| **Unlock**           | The rung that hands over the next ordinary skill: `elite`, then `legendary`, then `ascended`. **Absolute rarity**, not counted from a character's own start — which is why `ascended` tier arrives already holding its second skill.                                                                                                                                |
| **Energy**           | A 0–100 bar filling from `energyRegen` plus what fighting pays, spent only on ultimates. **Opens a fight empty**, so an ultimate is a payoff rather than an opener. Replaced `mp` in 8b.                                                                                                                                                                            |
| **Sub-stream**       | An RNG stream derived via `deriveSeed(seed, label)`. Combat draws from one so replaying a battle never shifts the pull sequence.                                                                                                                                                                                                                                    |
| **Resume / offline** | `resume(state, nowMs)` settles time away in closed form. **There is no offline cap** — a year away pays a year.                                                                                                                                                                                                                                                     |
| **Repair**           | Load-time fixing that clamps and defaults rather than throwing. Runs on every load, not behind a version gate. A thrown error costs a player their whole run.                                                                                                                                                                                                       |

---

## Two traps worth naming

**`mp` means nothing at all now, and that is the trap.** The skill-point pool was deleted in 8b;
`magicPierce` shipped in 8a and is conventionally abbreviated MP everywhere outside this repo.
The collision resolved by one side disappearing, which makes the abbreviation _available_ rather
than safe — anyone writing "MP" now is either quoting history or means magic pierce, and a reader
cannot tell which. Spell out "magic pierce", and say "energy" for the meter.

**`atk` exists now, and half the prose about it is older than it is.** Milestone 8a collapsed
`patk`/`matk` into one `atk` and `pdef`/`mdef` into one `def`. Damage type moved onto the skill,
where it selects the attacker's **pierce** and the defender's **resist** rather than which stat
is read. Anything still saying "measured against `mdef`" predates that.
See [attributes](attributes.md).
