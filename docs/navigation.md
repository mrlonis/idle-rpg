# Navigation: the tab bar, Town, and where a new screen goes

Where each screen lives and, more usefully, **how to decide where the next one goes**. The rule this
file exists to state: the tab bar has a hard ceiling and Town does not, so anything a player goes to
_do_ with what they have earned is a card in Town rather than a tab.

`AGENTS.md` states that as a rule. This is the reasoning, and the two moves that produced it.

---

## The bar is five, and the spare slot is not for spending

**Home · Town · Roster · Bag · Settings.**

⚠️ **Six is the ceiling, and it is measured rather than guessed.** Six tabs is what fits across a
375pt phone at a legible label size — the widest label is 52px inside a 63px tab, and at 320pt it is
tight but still one line per label. A seventh entry would have to shrink the text past reading or
drop it, **and a row of unlabelled glyphs is a puzzle rather than navigation.**

The bar sits at five with one slot free, and **the free slot is deliberately not for spending.** It
is headroom, not inventory. A screen that wants it has to fail the Town test below first.

**The bar is a flex item, not `position: fixed`** — see [platform](platform.md) for why that is
structural rather than cosmetic.

---

## Town, and why a hub beat the alternatives

Milestone 13 ended with the bar at capacity and three named ways out, deferred to whichever milestone
needed a seventh screen. **The hub was built early instead**, because the two screens that most
obviously belonged behind one were already on the bar: Summon and the spark shop.

- **A "more" tab spends a slot to say "there is more"** — a tab that is never the destination.
- **Moving Settings off the bar frees one slot and then leaves the next screen in the same position
  one screen later**, because a bar with a ceiling is a queue whatever order it is filled in.
- **A hub has no ceiling at all.** The seventh sink is a card in Town, and so is the eighth.

⚠️ **Seven cards is not a tab-bar problem and must not become one.** The bar's ceiling is what makes
a hub necessary; the hub has none.

### The test for what belongs in Town

**"Somewhere you go deliberately, with something you have earned."**

Note what the test is _not_: "a currency sink". The Altar spends no wallet currency and quotes a
count of characters rather than a quantity of anything, and it is still a Town card — as are quests,
bounties and achievements, which quote a count of things waiting. Four of Town's seven cards answer
_"what is here for me"_ rather than _"what can I afford"_.

**The argument is about how often a screen is _visited_, not how important it is.** A player goes to
Summon or a shop having decided to spend something; the roster and the bag are read _while_ deciding.
**A deliberate trip survives one extra tap; an idle glance does not.**

### Two rules the cards keep

- **Each card carries its currency's balance** — the same argument the summon screen makes for
  putting pity on screen before the pull: the number that decides whether the trip is worth taking
  should be readable without taking it. Spark in particular is zero for most of a run.
- **The icons are the ones the tabs wore** — 🔮 and ✨ — because a player who learned to find
  summoning by its crystal ball should find the same crystal ball on the card rather than learning
  the screen twice. Town takes 🏘, distinct from Home's 🏕 at tab size.

---

## The Bag, and the half that pays forward

The gear shop was the first thing to test the hub's promise, and it was not a new sink — it was
already on the bar, as the top half of the Gear tab above the loose pieces. The forge moved to
`/town/gear-shop` and the tab that was left became the **Bag** at `/bag`.

**Splitting the two sections cost something real.** They were one screen on a good argument: the shop
is where a specific piece is _chosen_ and the bag is where the random ones pile up, so a player
weighing a Fine chest piece could see what they already held without leaving the offer. **That
argument was about gear, and it held while the tab was gear.** It stops holding once the tab is an
inventory — a shop is somewhere a player _goes_, and a bag is something they _carry_. Two of the
three currency sinks were already in Town; leaving the third on the bar was the inconsistency.

What blunts the cost is the hub's own rule: the card names the gold the shop spends, so the trip is
judged before it is taken, and **the stock is fixed for the hour**, so the offer is still there on
the way back. Neither would be true of a shop that rerolled. See [gear](gear.md).

⚠️ **Renaming the tab is the half that pays forward.** "Gear" was a tab named after a progression
_system_, so the second item type the game mints would have had nowhere to land but a sixth tab.
"Bag" is a **container**: a new item type is a section on a screen that already exists. Nothing empty
ships for it, though — the bag is one section, headed Gear, and the second heading arrives with the
second kind of item.

---

## Home is the battle hub, and crews have a screen of their own

Milestone 15a added two screens and moved one job, and neither screen touched the tab bar.

**Home is where a fight is chosen.** It carried one control — a Fight button into the campaign —
and faction towers make that eight destinations. That choice is not a thing to bury behind a tab, so
Home holds the campaign as its first card and a row per tower below it. It was one card until 15b,
on the same argument the Bag rename made; the first tower's row arrived with its hundred floors, and
the other six arrived in 15c.

**Three sections, headed Campaign, The Descent and Towers.** They were one section headed "Battle",
which named neither of the two kinds of thing a player was choosing between — and with the towers
unheaded the campaign card read as the section and the rows under it as an unlabelled tail. Each is
a real `<section>` with `aria-labelledby`, so each is a landmark rather than a line of loose text.
The **Towers section is withheld entirely until the run has loaded** rather than drawing its heading
over nothing: an empty heading is exactly the shape "nothing empty ships for the towers" forbids,
and the rule is spent on the locked row below instead.

**The Descent sits between them**, and the order is the argument. The campaign is the spine and goes
first; everything below it is optional content gated behind it. Of the two optional things, the
Descent is the one that **resets daily** — a player opening this screen once a day should meet it
before seven ladders that will still be there next week.

⚠️ **Its card is a link in five of its six states and inert in the sixth, exactly like a tower row —
and that is a reversal.** It used to be a link in all six, on the argument that the Descent screen
was worth reading even while locked: it names today's three factions, the nine boards it drew and
their levels, and what is still owed before the way opens. The first three of those are the parts a
locked run cannot see, so what a locked player actually reaches is a screen restating the card's own
line with nothing on it to do — a tap into a dead end, which is the thing the locked tower row was
written to avoid. **Expeditions' card carries the same two states for the same reason.** Every state
still names the next thing to do, which is the locked tower row's rule generalised rather than a
second one, and a locked card is the tower row's inert grey rather than the accent.

⚠️ **The Fight control for a Descent lives on the Descent screen rather than on the crew editor**,
which is the one place the game departs from "every battle passes through the crew editor". A run in
progress has to come back to the map between fights to take its card, and routing it through the
editor every time would ask the player to re-confirm a crew that is locked for the rest of the run
and cannot be changed. The crew is still edited by the one editor, at `/formations/descent`, which
the Descent screen links to.

The campaign's **hint line lives inside its section**, directly under the Fight control. It is
written about the campaign crew and says "tap above"; at the foot of the screen it would be pointing
past seven tower rows at a control the player can no longer see.

**A tower row has three states and only one of them is a link.** A tower being climbed goes to
`/prepare/:id` exactly as the campaign card does. A tower already **topped** is an inert row — a
floor is climbed once, so there is genuinely nothing left to fight, and a link to a Fight control
that then refused would be worse than no link. A **locked** tower is also inert, and it names the
clears remaining and the faction it wants.

⚠️ **A climbing tower wears the Fight control's accent, and that is a reversal of an earlier rule.**
The rows drew in the card's own grey whatever their state, on the argument that a tower is optional
content and a row shouting as loudly as the Fight control would make the spine of the game look like
one of eight equal choices. The argument is still right and the colour was the wrong way to make it:
the grey read as _unavailable_, and it said so about the one row on the screen that was not. The
hierarchy is carried by **size and section** now — a tower row is 2.75rem to the campaign card's
3.5rem, 15px to its 17px, and a heading further down — which leaves the palette free to mean
"there is something here to fight" and nothing else. Locked and topped rows keep the grey, because
on those there is not.

⚠️ **That locked row is where "nothing empty ships for the towers" is deliberately spent, and it is
the one place.** The rule was written against a card for content that did not exist; a locked row
points at content that does, a cleared chapter 1 away. A tower is a destination a player builds a roster
toward, so a row that names its own key is the thing doing the work — where a hidden row would mean
the whole system is invisible until it opens.

**`/formations` is reached from the Roster, not from the bar and not from Town.** It fails the Town
test on purpose — Town is "somewhere you go deliberately, with something you have earned", and a
crew is not earned, it is arranged about the roster you already have. The Roster is where a player
is standing when they think about who is worth fielding, so that is where the link lives.

**The roster screen stopped being a formation editor**, and the reason is not that eight crews would
not fit. The screen would then answer two unrelated questions at once: _who is worth levelling_ and
_who is going to which fight_. Placement moved out whole; the roster kept the shared level, the
faction groups, and a link.

⚠️ **The pre-battle step is a route rather than a modal.** "Pop up the formation before every
battle" is the requirement and a CDK dialog is the obvious build — see [platform](platform.md) for
why CDK is the sanctioned answer when a modal _is_ right. A route wins here on three counts: a crew
editor is more than a phone-sized overlay holds without scrolling inside a scroll container; a route
survives a reload, which is this file's own stated trigger for routing at all; and a dialog would
have to trap focus around forty-odd controls. The transition reads the same to the player — tap
Fight, arrange, tap Fight again.

`/formations/:activityId` and `/prepare/:activityId` are **one component**. A picker that could do
less than the editor would send the player to the editor and back, which is the admin-not-depth
failure the whole change exists to remove. ⚠️ The difference between them is **route data**, never a
query parameter: a forgeable `?fight=1` would be a second, undocumented entry into the battle path.

---

## There is no "the formation" — there are eight crews, keyed by activity

Since milestone 15a. Read [`core/activity.ts`](../src/core/activity.ts) and `FormationBook` in
[`core/state.ts`](../src/core/state.ts) before writing anything that reads who is fighting.

Seven towers plus the campaign is eight line-ups, and the game had exactly one — not as a screen but
as a **field**. **Eight live formations, not one live formation and seven templates**: a template
model keeps one thing that fights and makes the rest inert copies loaded into it, which is cheaper
and spends a step of the player's attention on bookkeeping the game could do. **A crew that has to
be _loaded_ before it is real is a crew the player has to remember to load.**

- ⚠️ **`GameState.formations` is a record, and `state.formation` no longer exists.** Every write goes
  through `setFormation(state, activity, …)` with the activity **required rather than defaulted** —
  for the reason `toBattleCombatant` takes a level rather than reading one: a caller that forgot
  which crew it was editing would silently rewrite the campaign's, and every screen would keep
  showing the right thing until the player started a fight with the wrong five.
- **An unknown activity key is kept on load, not dropped** — the same call `parseAchievements` makes.
  A crew for a tower this build has not shipped costs two short arrays; dropping it costs a player
  their line-up every time they move between builds.
- ⚠️ **One character may stand in several crews at once, and that is not damage.** Only one activity
  is fought at a time. What stays forbidden is standing twice _within_ one crew, which is the state
  that would let a fighter act twice — so the decoder's dedupe set is scoped **per formation** and
  must stay that way.
- **A faction lock is content, so `core/` does not enforce it** — `partyMeetsLock` does, and both the
  editor and the battle path call it. Two implementations of one rule is how a screen ends up
  promising a legal crew that the fight then refuses. The lock **filters the pool** rather than
  refusing a tap: a character it forbids can never enter, so listing them above the ones who can is a
  screen hiding its own answer.
  - A lock is a `FactionLock` — `readonly string[] | null` — resolved by `FormationService.lockFor`
    for both kinds: a tower's is authored and constant, the Descent's is drawn daily. ⚠️ **`null` and
    `[]` are different answers**: `null` is "anybody may stand here" and `[]` is "nobody may", which
    is what stops a missing lock from silently reading as an empty crew.
- ⚠️ **Standing in a crew reserves nobody.** A fielded character may be dispatched, and a crew
  holding somebody away cannot fight — see [bounties](bounties.md). Neither `setFormation` nor
  anything else in the formation path may refuse on the grounds that a character is busy elsewhere.
- **Adding an activity is a row in [`data/activities.ts`](../src/data/activities.ts) and nothing
  else.** ⚠️ **An `id` is a save key and is permanent once shipped** — renaming one silently disbands
  the crew standing in it. Change the `name` freely; never the `id`.

**The roster screen stopped being a formation editor**, not because eight crews would not fit in the
markup but because the screen would then answer two unrelated questions at once: _who is worth
levelling_ and _who is going to which fight_. Placement moved out whole to `/formations`, and the
roster kept the shared level, the faction groups and a link.

---

## Routing

Routing shipped with milestone 3, on the trigger the roadmap named: **a screen that survives a
reload.** Home, summon, roster and shop all describe saved state, so `/roster/rin` is somewhere a
player can come back to.

- **The battle screen is a signal-swapped _mode_, not a route.** Its contents live only in memory,
  and the tab bar hides during a fight — a battle has no exit until it ends, and navigation that
  refused to work would be worse than none.
- ⚠️ **A Descent run is the opposite case and `/descent` is a route because of it.** A run in flight
  is entirely saved state — the floor map, the carried damage, the hand of cards and the pending
  choice all survive a reload — so it passes this file's own trigger for routing exactly as the
  roster does. The mode's _fights_ still go through the battle screen; what is a route is the map
  between them.
- ⚠️ **The nesting under `/town` is load-bearing, not tidiness.** `routerLinkActive` marks the tab
  non-exactly, so `/town/summon` keeps the Town tab lit and `aria-current="page"` on it. Left flat at
  `/summon`, the tab would go dark the instant the player arrived where it sent them — which reads as
  having navigated _out_ of the app's structure rather than into it. `tests/app.spec.ts` asserts it.
- **A deep link into the Altar carries `?focus=<defId>`** and moves focus to that character's row on
  arrival. Focus rather than a scroll, because focus scrolls anyway _and_ tells a screen reader where
  the player now is.

⚠️ **No compatibility redirects exist for `/summon`, `/shop` or `/gear`, and that licence expires.**
The game is pre-release, so no bookmark, deep link or reload carrying a moved path exists — the same
argument that licensed the save-chain re-bases, and it ends the same way. **The moment anyone outside
development has a URL, a moved route needs a redirect.**

Android's hardware back button needs a handler that pops modals and navigates up, exiting only from
the root. Routing is what gives it somewhere to go; the handler itself waits on `@capacitor/app` —
see [platform](platform.md).
