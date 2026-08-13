# Glossary

The vocabulary, and specifically the words that mean more than one thing.

Several terms collide because the genre's vocabulary collides. The types keep them apart — a
`CharacterTier` is not assignable to a `RarityId` — so the ambiguity can only bite in prose. This
file is what prose should point at.

Companion references: [attributes](attributes.md) for the stat block, [ascension](ascension.md)
for the rung ladders, [level resonance](level-resonance.md) for the level the roster shares,
[gear](gear.md) for the third progression axis, [milestones](milestones.md) for the roadmap and the
reasoning behind each decision.

---

## The collisions, first

| Word        | As a **tier**       | As a **rarity rung** | As a **rarity family** |
| ----------- | ------------------- | -------------------- | ---------------------- |
| `common`    | ✅ the starter tier | ✅ index 0           | ✅                     |
| `rare`      | —                   | ✅ index 2           | ✅                     |
| `elite`     | —                   | ✅ index 4           | ✅                     |
| `legendary` | ✅ the middle tier  | ✅ index 6           | ✅                     |
| `mythic`    | —                   | ✅ index 8           | ✅                     |
| `ascended`  | ✅ the top tier     | ✅ index 10 (of 16)  | ✅                     |

**A gear grade is deliberately none of these.** Milestone 12 needed a fifth ladder and named it
`worn`, `sturdy`, `fine`, `masterwork`, `relic` precisely so the table above stays three columns
wide. `data/gear.spec.ts` asserts no grade id is one of the words in it. If a sixth ladder ever
arrives, do the same thing.

So **"a legendary character" is ambiguous and should never be written.** Say "a legendary-tier
character" (how it was pulled) or "a character at legendary rarity" (how far it has been
ascended). The two are unrelated: a common-tier character can reach `ascended-5`, and an
ascended-tier character starts at `elite` and has to climb the same rungs as everyone else.

**All three tier words now collide, and `common` is the worst of them.** It was the one tier word
that was only ever a tier until the copies-only rewrite gave the ladder a bottom; now "a common-tier character
starts at common rarity" is a true sentence that reads like a tautology. The rule that survives it
is the same one, applied without exception: **never write either word bare.** Not "a common" —
"a common-tier character", or "a character at common rarity".

**"Floor" is the fourth collision, and it now has five meanings.** It is a _place_ in two different
systems, a _lower bound_ in three, and no reading suggests any of the others:

| Written                 | Means                                                                             |
| ----------------------- | --------------------------------------------------------------------------------- |
| **a tower floor**       | One of a tower's two hundred fights. `Floor 37`, climbed once, at a derived level |
| **a Descent floor**     | A group of three fights inside one run, gone when the run is. `Floor 2`           |
| **the growth floor**    | The rung a stat multiplier counts from — `rare` for every tier                    |
| **the resonance floor** | The fifth-highest invested level, which the whole roster is carried to            |
| **the pity floor**      | The bad-luck bound under a pull's tier roll                                       |

⚠️ **The two _places_ are the pair most likely to be confused, and they are opposites.** A tower
floor is a permanent rung of a permanent climb, cleared once and never re-fought; a Descent floor is
a third of one day's run and does not exist tomorrow. "Floor 2" means one of three things depending
on which screen a reader has in mind, so **name the content**: "the Dwarf Tower's floor 37", "the
Descent's second floor".

The rule for the bounds is the same shape as the one above: **they are never written bare.** "The
growth floor" and "the resonance floor" are spelled out, which is what the code already does
(`growthFloor`, `resonanceFloor`, and `floorLevel` for the place).

---

## Tier vs rarity

These are the two axes, and mixing them up is the single most common way to misread this game.

**Tier** — how a character was pulled. `common`, `legendary`, `ascended`. **It never changes.**
It decides two things: which rung the character starts on — `common` tier at `common`, `legendary`
tier at `rare`, `ascended` tier at `elite`, all three different since the copies-only rewrite — and how
steeply it grows per level. Tier is a **slope, not a head start**: base stat budgets are close
across tiers, and the gap opens over hundreds of levels.

**What a tier is worth in copies is exactly the rungs it skips**, because every rung charges every
character the same. That is 20 copies for `legendary` tier and 28 for `ascended`, and those four
rungs at the bottom of the ladder are the only thing carrying the gap — see
[ascension](ascension.md).

**Enemies have a tier too, since milestone 10, and it means only the second of those two things.**
Fodder is `common`, a lock is `legendary`, a gate is `ascended` — the slope, and nothing about
rungs, because there are none on that side. The word is shared because the mechanism is; see
[`core/growth.ts`](../src/core/growth.ts), which is where both sides read it from.

⚠️ **A bounty tier is a fourth meaning and shares nothing with the other three.** It is a **band of
bounty mission** — errand, patrol, expedition, campaign — and its values are those four words rather
than `common`/`legendary`/`ascended`, which is the only reason the collision is survivable.
`BountyData.tier` is purely an **authoring group**: it fixes the duration, crew, payout and unlock
its variants share, and says nothing about power, growth, rungs, or how many may run at once. Write
"the patrol tier", never a bare "tier", in anything that also talks about characters. See
[`core/bounties.ts`](../src/core/bounties.ts).

**Rarity** — how far a character has been ascended. Sixteen rungs, `common` → `ascended-5`, bought
with duplicate copies of that same character. **This is the vertical power axis**, and every
character of every tier can reach the top of it.

⚠️ **The two `common` rungs are the exception to that: they buy level cap and no stat multiplier.**
`growthFloor` anchors the ×`perAscension` ladder at `rare` for every tier, so a common-tier
character at `rare` is worth exactly what a freshly pulled one was worth before those rungs
existed. They were added to make common-tier characters _cost_ more, not to make them stronger.

An index into `RARITIES` **is** a rarity — comparisons, clamping and cost arithmetic all happen on
the index, and the string exists for display and authoring.
See [`core/roster/types.ts`](../src/core/roster/types.ts).

**Rarity family** groups the sixteen rungs into six (`common`, `rare`, `elite`, `legendary`,
`mythic`, `ascended`) for anything that treats `rare` and `rare-plus` as the same kind of thing. A
`-plus` suffix or a star is a step _within_ a family, not a new one.

---

## Archetype is a role, and role became load-bearing in milestone 12

**`CharacterRole` and `GearArchetype` are the same five values and the same idea**: `tank`,
`brawler`, `mage`, `ranger`, `support`. A piece of gear names the archetype it was forged for, and
only a character of that role may wear it.

There used to be eight roles — `bruiser`, `assassin`, `sniper` and `healer` were the four that went.
Each of the three that folded away was a statement about a **kit** rather than about a character,
and the kit says it more precisely. `healer` folding into `support` is the one with a visible cost:
the roster screen no longer says "healer" about the characters that heal.

⚠️ **Role used to be inert and is not any more, and the old comment about that is about a different
question.** "Keeping it inert is the point" was about **placement** — a role that gates which rank a
character may stand in lets an unlucky roster reach a state with no legal party, which is why
milestone 4 rejected role-locked ranks. Gear gating is safe because **a piece the party cannot wear
is fodder, not a dead end**. Nothing about placement changed. See [gear](gear.md).

The vocabulary lives in `core/gear/types.ts` and `roster/types.ts` re-exports it, for the reason
`CHARACTER_TIERS` lives in `core/growth.ts`: `OwnedCharacter` carries a loadout, so `roster/` already
depends on `gear/`, and shared vocabulary goes in the lower module to keep the graph a tree.

---

## Faction is one word doing three jobs

Seven factions: Humans, Dwarves, Elves, Undead, Monsters, Angels, Demons. The word appears in
three unrelated mechanics, and conflating them is the second most common confusion.

1. **Ascension path.** Faction decides whether a character walks the **mortal** ladder or the
   **celestial** one. Both pay only in copies of the character itself; they are identical below
   `elite` and celestial is roughly double above it. Angels and Demons are celestial; everyone
   else is mortal. **The two used to be expensive in different resources** — mortal spent
   same-faction fodder — and that distinction went with fodder in the copies-only rewrite. See
   [ascension](ascension.md).
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

**Numbers 2 and 3 were milestone 8d's unfinished business, and 8e finished it.** They answer
different questions and are not in competition: the lineup bonus cancels between two mono-faction
teams — all seven reach the same rung — so it decides _whether_ to build one, and the matchup
decides _which_ to bring. The edges stayed at 5–10% because measuring them against the seven
mono-faction fives showed they already decide fights that are genuinely close, which is the whole
of their job. Comparing "+25%" against "5%" as though they were rival levers is the reading that
made this look unfinished; they are never both on the table at once.

---

## Level means two things, and has since milestone 9

- **Invested level** — what the player actually paid to raise. Stored in the save as
  `OwnedCharacter.level`, and the **only** one of the two that is stored.
- **Effective level** — what the character actually fights at, and the one every screen shows:
  `min(levelCapFor(rarity), max(investedLevel, resonanceFloor))`.

The **resonance floor** is the level of the fifth-highest-levelled character in the roster.
Everyone is carried to at least that level, capped by their own rarity. Levelling is charged from
the effective level, so nobody ever pays for the climb resonance already gave them.
See [level resonance](level-resonance.md).

**"Level" unqualified now means the effective one** — it is what the roster row, the character
sheet and the battle all read. Say "invested level" when you mean the paid one; there is no other
word for it, and `OwnedCharacter.level` is the thing being named.

Level caps are per rarity rung, from 40 at `rare` to 1000 at `ascended-5`.

**A third thing carries the word, and it belongs to the other side of the board.** A **stage
level** (`StageData.level`) is what every enemy in that encounter fights at, and since milestone 10
it is the whole of what makes one stage harder than another — archetypes are authored once at level
1 and fielded at it. Read it as roughly the level of the party the stage was tuned for, running a
little above because the enemy side has no ascension rungs and the player's have to be absorbed
somewhere. It is not a character's level and nothing derives one from the other.

---

## Everything else

| Term                 | Means                                                                                                                                                                                                                                                                                                                                                                                                               |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ATB**              | The turn system. `gauge += haste` each tick, plus `attackSpeed` while the combatant's **last** action was a basic attack; act at `ATB_THRESHOLD` (1000). Haste buys _turns_, not just going first.                                                                                                                                                                                                                  |
| **Tick**             | Two unrelated clocks. The **sim tick** is the ~10Hz idle loop. The **battle tick** is `BATTLE_TICK_MS` (100ms) of simulated combat time, capped at `MAX_BATTLE_TICKS` (900 — the ninety-second battle timer).                                                                                                                                                                                                       |
| **Battle timer**     | Ninety seconds (`MAX_BATTLE_TICKS`, 900 ticks) to win a fight. Running it out is a **defeat** — there is no draw. Was 18,000 ticks and a third `stalemate` outcome, which bounded nothing and left unwinnable fights running half an hour.                                                                                                                                                                          |
| **Timed out**        | `BattleResult.timedOut`: the clock ended the fight rather than a death. ⚠️ Invisible to the player by design, and the **only** signal the balance sweep has for an over-tuned sustain kit — it is what replaced the zero-stalemates assertion.                                                                                                                                                                      |
| **Stage**            | One battle on the ladder. Clearing one permanently raises all four idle rates; that is the real reward, not the one-off gold. Since milestone 11 a stage authors only its line-up and its level — what it pays is a function of where it sits.                                                                                                                                                                      |
| **Auto-battle**      | The unlockable repeat, earned by finishing chapter 1 (ten clears since the six-chapter re-cut): it re-enters stages until the party loses. **Foreground-only** — it switches itself off when the app is hidden, which is a correctness rule (see [combat](combat.md) and milestone 5), not a courtesy. Not to be confused with **ambient sparring**, the still-deferred idle-screen decoration that awards nothing. |
| **Lock**             | An encounter built around a question the roster has an answer to — a healer you must reach, a wall your debuffs bounce off — rather than a bigger stat block. The unit of stage design.                                                                                                                                                                                                                             |
| **Chapter**          | A group of stages, and where a run is: a save stores a **chapter and a stage within it**, never a linear index, so re-cutting a chapter cannot relocate a player. A chapter is ten stages longer than the one before it up to a permanent cap of **fifty**, so the long ladder is more chapters rather than longer ones. **Ten ship** — 10, 20, 30, 40, and then six of fifty — for 400 stages.                     |
| **Stage index**      | A stage's 1-based position on the **whole** ladder, derived by `stageIndex` and stored nowhere. The clear count, the crystal rate and the reward curve are all functions of this. ⚠️ Reading `state.stage` where this belongs is the milestone 11 bug shape: chapter 2 stage 3 and chapter 1 stage 3 are the same number.                                                                                           |
| **Stage kind**       | `normal`, `mini-boss` or `boss` — a rule, not an authored field. Every tenth stage of a chapter is a mini-boss and the last one is a boss, so the rhythm is the same in a fifty-stage chapter and a two-hundred stage one. It pays out in first-clear crystals (×2 and ×5) and nowhere else.                                                                                                                        |
| **Formation**        | One party: two front slots, three back. `PARTY_SIZE` is 5. Placement is free — any character in either row. ⚠️ **There is no longer "the" formation.** Since milestone 15a a run holds a `FormationBook` — one formation per activity — and `state.formation` does not exist. "The formation" in older prose means the campaign's.                                                                                  |
| **Crew**             | A formation, said the way the screens say it. The word exists because "formation" reads as a singular and there are eight of them; `CrewView` is the resolved read model, and `/formations` lists one row per crew. ⚠️ **Standing in a crew reserves nobody** — one character may stand in several, and being away on a bounty stops the crew fighting rather than stopping the placement.                          |
| **Activity**         | A thing a run can send a crew at, and the key its crew is filed under: the campaign, plus one per tower. Authored as five short fields in [`data/activities.ts`](../src/data/activities.ts). ⚠️ An `id` is a save key twice over — the crew _and_ the tower's progress hang off it — so it is permanent once shipped.                                                                                               |
| **Tower**            | A second thing to climb: a hundred **floors** locked to one faction, whose enemies lean toward the faction that counters it. All seven ship, one per faction. A tower is a demand on the **roster** rather than on investment, is always skippable, and ⚠️ **never touches `clearedStages`, the ladder position or an idle rate.** See [milestones](milestones.md).                                                 |
| **Floor**            | One fight in a tower — the tower's answer to a **stage**, with three differences: it is climbed **once**, its level is derived rather than authored, and what it pays is read off the campaign at the **matched enemy level**. ⚠️ Not the same word as the growth, resonance or pity **floor**; see the collisions above.                                                                                           |
| **Row / rank**       | Front or back. Front gets +5% `def` and +0.05 crit damage resistance; back gets +5% `atk` and +0.05 crit damage amplification. Each rank sharpens the role it already has. Ordinary attacks go through the front rank first.                                                                                                                                                                                        |
| **Lineup bonus**     | What the party's own faction composition is worth — see the three jobs of "faction" above. Applied to the **party only**, never to an enemy formation. Not the same as a **row bonus**, which is about where one character stands rather than about who else you brought.                                                                                                                                           |
| **Wildcard**         | Angels, on the composition ladder only. Three Humans and two Angels reads as five Humans. Deliberately not a wildcard for the Monster or Demon tracks, where it would make one faction strictly the best thing to own.                                                                                                                                                                                              |
| **Role**             | `tank`, `bruiser`, `assassin`, `ranger`, `sniper`, `mage`, `healer`, `support`. **Nothing in the simulation reads it** — it exists so the roster screen can say "healer" instead of implying it.                                                                                                                                                                                                                    |
| **Copies**           | Spare duplicates of a character, counted rather than tracked individually. The ascension currency. Only spares are ever consumed — never a character you have levelled.                                                                                                                                                                                                                                             |
| **Fodder**           | **Removed when ascension became copies-only**, and listed only because the word is still in older prose: copies of a _different_ character of the same faction, spent on four rungs of the mortal ladder. Ascension now costs copies of the character being ascended and nothing else. The word survives in `gear.md`, where it means something unrelated — a piece the party cannot wear.                          |
| **Base copies**      | Copies at the rarity a pull produces. Every price is quoted in these, and since the copies-only rewrite authored in them directly — a rung is a flat number in [`data/ascension.ts`](../src/data/ascension.ts) rather than a requirement resolved recursively.                                                                                                                                                      |
| **Growth floor**     | The rung a character's stat multiplier counts _from_, which is `rare` for every tier. Not the same as where a tier **starts** — the two `common` rungs are below it, so they raise a level cap and pay no multiplier. See [ascension](ascension.md).                                                                                                                                                                |
| **Pity**             | The bad-luck floor on pulls. **Two curves, both global rather than per-banner**, both always visible. Ascended: soft pity from pull 20 at +15%/pull, guaranteed by 30. Legendary or better: soft pity from pull 6 at +25%/pull, guaranteed by 10. The shorter one is a **floor under the same roll**, not a second draw — see [economy](economy.md).                                                                |
| **Spark**            | What a copy becomes when the character is already at `ascended-5`. Late-game overflow, and one of two currencies with no idle rate. **Pity is the escape valve for bad luck, not the shop.**                                                                                                                                                                                                                        |
| **Summons**          | The pull currency, called crystals in the UI. Accrues idly from the first minute of a run — the only rate that does not wait for a stage clear, and the unusual part of this game's economy.                                                                                                                                                                                                                        |
| **Essence**          | Charged only at breakthrough levels (every tenth) and the stingiest currency. Cheapest before level 60, most expensive by 200.                                                                                                                                                                                                                                                                                      |
| **Breakthrough**     | Every tenth level, where essence is charged. Rarity caps are all multiples of ten so an ascension always lands in front of one rather than stranded between two.                                                                                                                                                                                                                                                    |
| **Resonance floor**  | The fifth-highest **invested** level in the roster. Everyone is carried to it, capped by their own rarity. Derived on read and never stored, and monotonically non-decreasing. See [level resonance](level-resonance.md).                                                                                                                                                                                           |
| **Anchor**           | One of the `PARTY_SIZE` highest-levelled characters, whose levels are what set the floor. Not the same as the **formation** — an anchor need not be fielded, and a fielded character need not be an anchor.                                                                                                                                                                                                         |
| **Ultimate**         | The one skill in a kit metered by a full energy bar instead of a cooldown. Exactly one per character, and it spends the whole bar. Enemies have none. **Never gated by 8c's skill ceiling.**                                                                                                                                                                                                                        |
| **Kit**              | Every skill a character authors, basic attack excluded. Not the same as what it fights with — see **ceiling**.                                                                                                                                                                                                                                                                                                      |
| **Ceiling**          | How many skills a **tier** may ever field, ultimate included: 2 common, 3 legendary, 4 ascended. An authoring constraint as much as a runtime one — every kit is authored at exactly its ceiling.                                                                                                                                                                                                                   |
| **Unlock**           | The rung that hands over the next ordinary skill: `elite`, then `legendary`, then `ascended`. **Absolute rarity**, not counted from a character's own start — which is why `ascended` tier arrives already holding its second skill.                                                                                                                                                                                |
| **Energy**           | A 0–100 bar filling from `energyRegen` plus what fighting pays, spent only on ultimates. **Opens a fight empty**, so an ultimate is a payoff rather than an opener. Replaced `mp` in 8b.                                                                                                                                                                                                                            |
| **Sub-stream**       | An RNG stream derived via `deriveSeed(seed, label)`. Combat draws from one so replaying a battle never shifts the pull sequence.                                                                                                                                                                                                                                                                                    |
| **Resume / offline** | `resume(state, nowMs)` settles time away in closed form. **There is no offline cap** — a year away pays a year.                                                                                                                                                                                                                                                                                                     |
| **Alloy**            | What a piece of gear becomes when it is salvaged. Spark's opposite number: the other rateless currency, and what enhancement spends alongside gold. Returns everything ever invested, so an enhancement decision is always reversible.                                                                                                                                                                              |
| **Grade**            | A gear piece's rung: `worn` → `relic`. Sets both its multiplier and how far it can be enhanced, and is **fixed at drop** — you find better gear rather than upgrading into it. Deliberately shares no word with tier or rarity.                                                                                                                                                                                     |
| **Archetype**        | Which kind of character a piece was forged for, and the same five values as `CharacterRole`. The one gate on equipping. A piece the party cannot wear is **fodder, not a dead end**.                                                                                                                                                                                                                                |
| **Alignment**        | The faction a gear piece pays 1.3× on. A **bonus, never a restriction** — anyone may wear anything. Does not favour mono-faction parties: matching one character is one chance in eight either way.                                                                                                                                                                                                                 |
| **Repair**           | Load-time fixing that clamps and defaults rather than throwing. Runs on every load, not behind a version gate. A thrown error costs a player their whole run.                                                                                                                                                                                                                                                       |
| **Bounty tier**      | A band of bounty mission — `errand`, `patrol`, `expedition`, `campaign`. ⚠️ **A fourth meaning of "tier"** sharing nothing with character, enemy or rarity tiers; survivable only because its values are different words. Purely an **authoring group**: it fixes what its variants share, and is **not** a limit on how many may run at once.                                                                      |
| **Variant**          | One authored mission within a bounty tier. All variants of a tier are worth **exactly the same** and differ only in flavour and faction requirement, so rotation changes what is asked for rather than what the day is worth.                                                                                                                                                                                       |
| **Pool vs board**    | The **pool** is every mission the build ships; the **board** is the `BOUNTY_BOARD.missions` of them standing today, derived from the seed and the day index and stored nowhere. ⚠️ Anything honouring a _running_ mission takes the pool — a dispatch outlives the board it was sent from — and running missions count against the board size.                                                                      |
| **Dispatch**         | A crew away on a mission, and the one thing the bounty board stores. Disjoint from the formation in **both** directions: a character cannot be both fighting and away.                                                                                                                                                                                                                                              |
| **Signature item**   | The fourth progression axis: one per **ascended-tier** character, unlocked at the `mythic` rung, thirty levels bought with emblems. ⚠️ **Not an item** — it is one integer on `OwnedCharacter` and can never move, stack or be salvaged; the sheet draws it as a slot. Zero means locked. See [signature items](signature-items.md).                                                                                |
| **Emblem**           | What a signature level costs, and the only thing it buys. One universal currency rather than one per faction: a per-faction split would hand each faction's **two** ascended-tier characters a private pool nothing outside it could spend. See [economy](economy.md), where milestone 20's second rank is recorded as narrowing that argument without settling it differently.                                     |
| **Signature tier**   | One of four rungs of a signature ability, reached at levels 1, 10, 20 and 30. ⚠️ **A fifth meaning of "tier"**, and the one most likely to be misread — it shares nothing with character tier, enemy tier, rarity or bounty tier. ⚠️ A rung **replaces** the one below it rather than stacking, so each restates everything the earlier rungs did.                                                                  |
| **Skill override**   | How a signature ability changes a kit: a partial rewrite of an authored skill, merged once when the combatant is built. An absent field keeps what the skill said; ⚠️ `effects` **replaces** rather than appends, so "the same hit, harder" has to restate every clause.                                                                                                                                            |
| **Opening status**   | A `StatusData` a signature rung puts on its **wearer** at tick 0 — the passive half of the vocabulary, reusing the status language whole. Permanent means a duration longer than `MAX_BATTLE_TICKS`. ⚠️ Never a `regen`: closing pressure does not amplify healing, so permanent sustain stalls a fight into a timeout, and a timeout is a defeat.                                                                  |
| **Descent**          | The roguelite run, once a day: three **floors** of three fights, health and energy carrying between them, and one **card** of three taken after every win. ⚠️ **Its "floor" is not a tower's** — a Descent floor is a group of three fights inside one run and is gone when the run is, where a tower floor is a permanent rung of a permanent climb. See [descent](descent.md).                                    |
| **Run**              | One day's attempt at the Descent, and the only thing the mode stores. A run holds its own copy of the crew, its members' health as **fractions**, the cards taken, and how many attempts are left. ⚠️ **It carries the day it belongs to, and that is the whole daily reset** — a run dated to yesterday is simply not today's, so nothing continues it and nothing blocks on it.                                   |
| **Card**             | One rung of a Descent **family**, drawn three at a time and taken one at a time. Stored as `${familyId}:${rank}`. ⚠️ Not a relic and not an item: it lives only inside the run that took it, and nothing about it survives the day.                                                                                                                                                                                 |
| **Family**           | A track of four cards, lowest to highest, of which a run may hold several rungs. A family already taken comes back **only higher**, which is why a family is a list rather than four unrelated cards. Fourteen ship: seven universal and one per faction.                                                                                                                                                           |
| **Rank**             | A card's rung — `Lesser`, `Greater`, `Grand`, `Sovereign`. ⚠️ **A sixth meaning of "tier" wearing a different word on purpose**, and it shares nothing with character tier, enemy tier, rarity, bounty tier or signature tier. Its weight is interpolated across a run's own eight choices, so the tilt saturates rather than climbing without bound.                                                               |
| **Anchor level**     | The enemy level of the hardest campaign stage a run has ever cleared, which is what a Descent fight is measured **offsets from** — never a share of. ⚠️ Not the resonance **anchor**, which is a character. Enemy power is exponential in level, so a share is a different difficulty at every depth and a fixed number of levels is the same one everywhere.                                                       |
| **Daily lock**       | The three factions a Descent admits today, drawn from the run's seed against the day index. ⚠️ **A pure function of the day, never of what the run owns** — a roster-dependent lock could move under a player mid-run. A lock the roster cannot fill is a weaker crew, never a locked door.                                                                                                                         |

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
