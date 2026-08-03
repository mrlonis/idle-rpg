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
3. **The lineup bonus** — _planned, milestone 8, not built._ A bonus for how many of one faction
   are in **your own party**. This is the opposite shape from the matchup and it was explicitly
   ruled out until milestone 8 overrode it; the reasoning for the override is recorded there.

When someone says "faction bonus", ask which of 2 and 3 they mean.

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

| Term                 | Means                                                                                                                                                                                            |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **ATB**              | The turn system. `gauge += spd` each tick; act at `ATB_THRESHOLD` (1000). SPD buys _turns_, not just going first.                                                                                |
| **Tick**             | Two unrelated clocks. The **sim tick** is the ~10Hz idle loop. The **battle tick** is `BATTLE_TICK_MS` (100ms) of simulated combat time, capped at `MAX_BATTLE_TICKS` (18,000).                  |
| **Stalemate**        | A battle outcome. Neither side died before the tick cap — usually sustain out-racing damage.                                                                                                     |
| **Stage**            | One battle on the ladder. Clearing one permanently raises all four idle rates; that is the real reward, not the one-off gold.                                                                    |
| **Chapter**          | A group of stages. _Planned, milestone 11._ Chapters 1–10 hold 50 stages each, stepping +10 every ten chapters, capped at 200.                                                                   |
| **Formation**        | The party: two front slots, three back. `PARTY_SIZE` is 5. Placement is free — any character in either row.                                                                                      |
| **Row / rank**       | Front or back. Front gets +5% to both defences; back gets +5% to whichever offensive stat is already higher. Ordinary attacks go through the front rank first.                                   |
| **Role**             | `tank`, `bruiser`, `assassin`, `ranger`, `sniper`, `mage`, `healer`, `support`. **Nothing in the simulation reads it** — it exists so the roster screen can say "healer" instead of implying it. |
| **Copies**           | Spare duplicates of a character, counted rather than tracked individually. The ascension currency. Only spares are ever consumed — never a character you have levelled.                          |
| **Fodder**           | Copies of a _different_ character of the same faction, spent on the mortal ladder.                                                                                                               |
| **Base copies**      | Copies at the rarity a pull produces. Every rung's price is resolved recursively down into these, which is why ascension costs are code rather than a lookup table.                              |
| **Pity**             | The bad-luck floor on pulls. **Global, not per-banner**, and always visible. Soft pity from pull 30 at +6%/pull; hard pity at 50.                                                                |
| **Spark**            | What a copy becomes when the character is already at `ascended-5`. Late-game overflow, and the only currency with no idle rate. **Pity is the escape valve for bad luck, not the shop.**         |
| **Summons**          | The pull currency, called crystals in the UI. Accrues idly — which is the unusual part of this game's economy.                                                                                   |
| **Essence**          | Charged only at breakthrough levels (every tenth) and the stingiest currency. Cheapest before level 60, most expensive by 200.                                                                   |
| **Breakthrough**     | Every tenth level, where essence is charged. Rarity caps are all multiples of ten so an ascension always lands in front of one rather than stranded between two.                                 |
| **Ultimate**         | Every character's first skill, metered by energy. _Planned, milestone 8._                                                                                                                        |
| **Energy**           | A 0–100 pool filling from acting, spent only on ultimates. Replaces `mp` entirely. _Planned, milestone 8._                                                                                       |
| **Sub-stream**       | An RNG stream derived via `deriveSeed(seed, label)`. Combat draws from one so replaying a battle never shifts the pull sequence.                                                                 |
| **Resume / offline** | `resume(state, nowMs)` settles time away in closed form. **There is no offline cap** — a year away pays a year.                                                                                  |
| **Repair**           | Load-time fixing that clamps and defaults rather than throwing. Runs on every load, not behind a version gate. A thrown error costs a player their whole run.                                    |

---

## Two traps worth naming

**`mp` is about to mean the opposite of what it means today.** Right now `mp` is a skill-point
pool. Milestone 8 deletes it and the incoming attribute set has **Magic Pierce**, conventionally
abbreviated MP. Spell out "magic pierce" and never abbreviate it in this codebase.

**`atk` does not exist yet.** Today there are two attack stats, `patk` and `matk`, and two
defences, `pdef` and `mdef`. Milestone 8 collapses each pair into one, moving damage type onto the
skill. Code written today reads the split; code written against the plan reads the collapsed set.
See [attributes](attributes.md).
