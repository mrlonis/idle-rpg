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

## Routing

Routing shipped with milestone 3, on the trigger the roadmap named: **a screen that survives a
reload.** Home, summon, roster and shop all describe saved state, so `/roster/rin` is somewhere a
player can come back to.

- **The battle screen is a signal-swapped _mode_, not a route.** Its contents live only in memory,
  and the tab bar hides during a fight — a battle has no exit until it ends, and navigation that
  refused to work would be worse than none.
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
