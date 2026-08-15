# Expeditions

Milestone 23. Three hand-authored puzzle maps, solved once each: a grid of camps and chests, a
stamina budget that cannot pay for every fight, and an exit sealed behind a boss. Peaks of Time is
the reference the roadmap named; what shipped is that idea with the puzzle moved from fog and
teleporters to **routing under a budget**, because a routing puzzle is honest on a fully visible
map and a hand-written-component app can draw one as a CSS grid of buttons.

`core/expedition/` evaluates everything; `data/expedition.ts` carries the rules and
`data/expedition-maps.ts` the three maps. Read this before touching either.

## What the mode is, in one paragraph

A map is a grid: walls, paths, a start, an exit, camps (letters) and chests (digits). Movement is
free and the whole map is visible from the first tile. Fighting a camp costs its stamina — **spent
on victory only** — and the budget affords a route to the exit but never the whole map, so the mode
is the question "which fights do I not take?". Health and energy carry between fights and the
fallen stay down, exactly as in the Descent; a card of three is offered after every win, from the
Descent's own families. Chests open themselves the moment a path reaches them. The exit opens when
the map's one boss falls, and walking out completes the map — which is what opens the next one.

## There is no avatar, and that is a finding rather than a cut

The first design had a position and tap-to-move. It dissolved under its own rules: movement is
free and the map fully visible, so walking was never a decision — the only decisions are which
camps to fight. Everything a position would say is derived from which camps have fallen: the
**reachable region** grows out of the start tile through open ground, a camp adjacent to the
region may be fought, a chest inside it is collected, an exit inside it may be walked. One BFS
(`core/expedition/map.ts`) answers every question the screens and the rules ask, and the attempt
stores a list of cleared camps instead of a coordinate.

⚠️ **Do not add a position back for flavour.** It would be a second statement of a derivable fact,
and the save field it wants is the one kind of state this mode was built not to need.

## One-time, and why that is the entire economy argument

Every reward pays **once, ever**: a camp's lump, crystals and gear on its first-ever clear; a
chest's contents the first time it is reached; the completion bonus the first time the exit is
walked. The per-map ledger (`GameState.expeditions`) is what remembers, and it survives abandons,
restarts and completions alike.

- **A finite pool needs no rate guard.** The shape is the campaign's first-clear crystals — the
  one shape of crystal payout this economy already has an answer to. The whole three-map pool is
  ~10,650 crystals and ~210 emblems, about one chapter's Chapter Conqueror award and two chapters
  of its emblem track, spread over the mode's life. `expedition.spec.ts` bounds both sums, so a
  fourth map is a deliberate decision made with the pool in front of it.
- **Free restarts are safe in both directions.** Nothing pays twice, so retrying is never
  exploitable; nothing is lost, so it is never punishing. A defeat writes nothing but
  `battleCount` (the Descent's rule, so a retry is a fresh draw), there are no lives, and
  abandoning costs nothing that was not already banked.
- ⚠️ **A repeat attempt re-fights camps that still block and still cost stamina, and is paid
  nothing for them.** That asymmetry is deliberate: the puzzle resets fully, only the rewards are
  once-ever. Gear drops follow the same gate, on a stream keyed
  `gear:expedition:<mapId>:<cell>` — a pure function of the content, drawn at most once, so there
  is nothing a force-quit can reroll.

⚠️ **A rotating or daily expedition is the shape this argument does not cover.** Repeatable
crystal chests would be a faucet needing its own guards, and a derived maze cannot promise an
interesting budget puzzle — the roadmap named "no way to know it is solvable except by solving it"
as this milestone's whole risk. A future rotating variant argues its own case from zero.

## Solvability is proven mechanically, every test pass

The roadmap's argument against this milestone was that a hand-authored map has "no way to know it
is solvable except by solving it". The answer shipped as a solver: `cheapestStaminaTo` in
`core/expedition/map.ts` runs a Dijkstra over the grid where entering a camp costs its stamina,
and `expedition.spec.ts` holds, for every shipped map:

- some route to the exit fits the budget, with at least two stamina of slack;
- the budget does **not** afford every camp — otherwise the map is a corridor pretending to be a
  maze;
- every chest is affordable on its own — a reward nobody can ever take is the failure "nothing
  empty ships" forbids;
- the exit is unreachable while the boss stands, even with every other camp cleared — the "every
  chapter ends on a boss" rule, restated for a map;
- the grid is rectangular, start and exit are unique, and every lettered cell has a data row and
  vice versa.

The camp and chest letters are **save keys** — the ledger stores them — so once a map ships, a
cell keeps its letter forever. Reword names freely; never move a letter to a different camp.

## Difficulty: the Descent's anchor, and what tuning it took

Enemy levels are **offsets off the anchor** — the hardest campaign stage ever cleared — for the
reason `docs/descent.md` records at length: enemy power is exponential in level, so only a fixed
number of steps along the curve is the same difficulty at every depth. Offsets are authored per
camp, so a map's gate runs cold and its summit hot; the shipped bands are −12..−6 (Ford), −8..0
(Causeway) and −6..+4 (Spine).

Three findings from `expedition.balance.ts`, all bought by measurement:

- ⚠️ **Board weight binds before level does, and offsets cannot fix a weight problem.** The
  Spine's first draft ran its east route through four guardian-weight boards in a row and measured
  a 0.00 finish rate at two depths; softening the offsets by two to four levels barely moved it.
  The fix was rebuilding the mid-route boards to a one-to-three-anchor ramp — the same "fix a step
  with weight rather than level" rule the chapter authoring discipline already carries.
- ⚠️ **No route may field two ascended-anchor fights.** The draft had the Summit Toll and the boss
  both carrying one; no Descent day fields more than one, and the pair was most of the wall. The
  spec now allows an ascended anchor only on the last map, at offsets of +4 and above, at most one
  per board.
- **The shipped shape**: Ford and Causeway finish at 1.00 at every depth from the unlock up
  (survivors 4.1–5.0); the Spine reads 0.50 at the unlock — the same figure the Descent ships
  there — then 0.80 / 1.00 / 1.00. Zero timeouts anywhere; longest fight 25.5s against the 81s
  bar. The sweep's route policy is deliberately the honest floor: cheapest route, greedy card,
  three retries per camp, no gear, no signature items.

### ⚠️ Chapter 16 broke the deepest depth, and the cause is the Descent's exactly

The Spoilfield took the ladder to 700 stages, and `expedition.balance.ts` now reads **0.00 finished**
for the Causeway and the Spine at the deepest depth against a bar of 0.90. ⚠️ **Nothing about the maps
changed and no camp is mis-authored.** A camp's level is a fixed `levelOffset` off the run's anchor —
the hardest campaign stage cleared — and that anchor's level climbs 25 a chapter, while the party each
depth implies is bisected against the campaign stage there and has **stopped climbing**: 234.7 at
depth 600, 243.7 at 650 and **240.0 at 700**.

⚠️ **That is the campaign's rarity cap arriving here.** Since chapter 14 the ladder runs above
`legendary-plus`'s cap of 260, so each chapter final is authored lighter than the last to stay
clearable — The Doorstone 1480/88, The Unnumbered 680/40, The Inheritor 250/24 — and a lighter final
bisects lower. [descent](descent.md) carries the full measurement, including the sweep proving the
Descent's own `anchorSlope` has no setting that works at both ends.

⚠️ **This mode has no dial at all**, so there was nothing to sweep: the repair is the same re-anchoring
the Descent needs, keyed off `min(campaign level, the cap of the rung that content asks for)` rather
than the raw anchor, with every camp's `levelOffset` re-derived alongside it. **Two modes, one cause,
one fix.** Chapter 16 recorded it rather than taking it; see [authoring](authoring.md).

⚠️ **The sweep carries the two permanent controls the Descent's milestone mandated**: a
much-harder setting (+18 levels) must measure harder — it takes the Spine's unlock finish rate
from 0.50 to 0.00 — and cards must measure as worth taking (survivors 4.80 against 4.10 at the
top). A sweep that cannot move is worse than no sweep, and this one proves it can on every run.

## The cards are the Descent's, shared rather than copied

Same families, same rank ladder, same "a repeat comes back only higher" rule, same leech clamp —
shared by reference (`EXPEDITION_RULES.ranks` **is** `DESCENT_RULES.ranks`) so a retune lands in
both modes at once, and asserted shared in `expedition.spec.ts`. `cardOffer` in
`core/descent/cards.ts` is the one draw both modes call; `CardLadderRules` is the slice of rules
it reads. Two inputs differ:

- **The tilt progresses on stamina spent over the budget** rather than on a fixed choice count.
  Both saturate at 1 by construction — the property the two-ends authoring exists for — and tying
  rank to budget consumed means the deep cards arrive as the commitment does.
- ⚠️ **The offer is filtered by the crew's own factions, not by a lock.** This mode has no faction
  lock at all (`lockOf` reads the absent field as "anybody may stand"), so the dead-card leak the
  Descent plugged with its daily lock is plugged from the other side: a faction family nobody
  standing can wear is never offered. The filter reads the attempt's **current** party, so it
  shrinks as members fall — a Wyrdsong offered to a run whose last Elf is down would be a dead
  card again.
- ⚠️ **The draw's label carries the attempt number** (`expedition:cards:<mapId>:<attempt>:<n>`),
  stored on the run and taken from the ledger's attempt counter at start. A force-quit hands back
  the identical three cards — rerolling impossible, not merely detectable — while a genuine
  restart redraws, which is part of what a restart is for.
- **A card is owed after every win, but only while a fight remains possible.** After the last
  affordable camp falls the offer would be a choice with nothing to spend it on — the Descent's
  "one fewer than the fights", arrived at by rule because an attempt's fight count is the player's
  route rather than a constant.

## The attempt, the save, and the seams

Two save fields, like the Descent — the attempt in flight (`expedition`) and the permanent ledger
(`expeditions`) — and the fifth extension of the v0 baseline, on the same licence as the fourth
(see [saves](saves.md); the fourth called itself the last, and what actually closes that door is a
player loading a save, not a roadmap position). The attempt stores the map id, the attempt number,
the copied crew, health **as fractions**, energy, the cards taken and the camps cleared — stamina
spent is derived from the camp list, so the two cannot disagree. There is one attempt slot across
all maps; starting elsewhere replaces it, which the screen surfaces before it happens.

- **Boss camps and the exit are authored apart on purpose.** The boss is a camp like any other —
  it costs stamina, drops loot, offers a card — and completion is a separate, free act of walking
  the open exit. Folding them together would pay completion to a player who then wanted to spend
  remaining stamina on unfought camps.
- **`BattleService` grew a fourth payout path**, keyed off the result's stage id
  (`expedition:<mapId>:<cell>`), separate from `applyBattleResult` for the reason the tower and
  Descent paths are: an Expedition fight may not touch `clearedStages`, the ladder position or an
  idle rate, and a separate function makes that true by construction. Auto-battle is refused for
  the same reason it is in the Descent, one step earlier: an Expedition's next fight cannot even
  be _named_ without the player picking a camp.
- **The Fight control lives on the map screen**, the Descent's one licensed departure from "every
  battle passes through the crew editor", inherited with its reasoning: an attempt has state
  between fights that the editor has no business showing. Tapping a camp only _inspects_ it — the
  Fight control in the detail panel is what commits, because a stray tap must never start a fight
  that can spend stamina.
- ⚠️ **The map screen's per-screen state is two `linkedSignal`s keyed on the route parameter**
  (the selected camp, the armed abandon confirm), per the standing rule: the router reuses the
  component instance between `/expeditions/a` and `/expeditions/b`.

## No quest, no achievement track, and why

`expeditionsCompleted` is derived (completed entries in the ledger) and caps at three. As a
**quest** counter it fails the real test — "can a player always make it move today" — the moment
the third map falls, exactly the failure `clearedStages` is banned for; `expedition.spec.ts`
asserts no quest reads it. As an **achievement** counter it would be legal (an achievement that
stops moving is one the player finished) but redundant: the completion bonus is already the
mode's own award, and a track paying 3×N crystals on top is the same money wearing a second
mechanism. If the mode ever grows enough maps to make a track worth reading, that decision starts
from the pool bound in `expedition.spec.ts`.

## What the screens draw

Home carries an Expeditions card beside the Descent's, same shape and the same two states: a link
once the first map is open, and an inert grey row naming the chapters still owed until then. That is
the locked tower row's treatment, and it is a reversal — the card was a link in both states. Before
the first map opens all three index rows are inert too, so the screen behind the card is the card's
own line plus three names nothing can be done with. The index
(`/expeditions`) is three rows — open, underway, completed, or locked with the key named. The map
screen (`/expeditions/:mapId`) is a CSS grid of tiles: camps are buttons wearing their grid letter
and stamina cost (the letter is also the battle heading's big line — the one cross-reference the
two screens share), chests and the exit are labelled glyphs, and the whole grid scrolls sideways
inside its own container on narrow phones rather than shrinking below a touch target. The stamina
bar and the party's health bars are real `progressbar`s, for the reason the Descent's are: the
budget and the carried damage are the mode, and a coloured div is invisible to a screen reader.
