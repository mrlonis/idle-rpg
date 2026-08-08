import { computed, inject, Service } from '@angular/core';
import {
  ascend,
  ascendAll,
  type CharacterData,
  type CurrencyAmounts,
  effectiveLevel,
  findOwned,
  levelCapFor,
  levelCost,
  levelUp,
  levelUpToAffordable,
  MAX_RARITY_INDEX,
  maxAffordableLevel,
  maxAffordableResonance,
  nextAscension,
  type OwnedCharacter,
  raiseResonance,
  raiseResonanceToAffordable,
  type RarityFamily,
  rarityFamily,
  rarityLabel,
  resonanceAnchors,
  resonanceCeiling,
  resonanceFloor,
  resonancePlan,
  type RosterResult,
} from '../core';
import {
  ASCENSION,
  CHARACTERS_BY_ID,
  factionName,
  FACTIONS_BY_ID,
  FACTIONS_IN_ORDER,
  LEVELS,
} from './content';
import { GameLoopService } from './game-loop.service';
import { compareEntries, factionRanker, groupByFaction, type RosterGroup } from './roster-order';

/**
 * One roster row, with everything the UI needs already resolved.
 *
 * Assembled here rather than in a template so the views stay declarative: joining an owned
 * entry to its definition, its level cap, its next cost and its ascension price is four lookups
 * across three modules, and doing that in a binding would run it on every change-detection pass.
 */
export interface RosterEntryView {
  readonly defId: string;
  readonly name: string;
  readonly faction: string;
  readonly factionName: string;
  readonly tier: CharacterData['tier'];
  readonly role: CharacterData['role'];
  readonly rarity: number;
  readonly rarityLabel: string;
  /** Which of the five colour families this rung belongs to. */
  readonly rarityFamily: RarityFamily;
  /**
   * The **effective** level — what this character fights at, resonance included.
   *
   * One number, not two. Showing "levelled to 6" beside "carried to 200" would be defending
   * against a state that cannot occur: the floor is monotonically non-decreasing, so a carried
   * level never falls back to the invested one. {@link resonated} is the whole of what the
   * second number would have said.
   */
  readonly level: number;
  /** `true` when the roster's floor is holding this character above what was paid for. */
  readonly resonated: boolean;
  readonly levelCap: number;
  readonly atLevelCap: boolean;
  readonly isMaxRarity: boolean;
  /** Spare base copies held as ascension material. */
  readonly copies: number;
  /**
   * The activities this character is standing for, in the order they are authored.
   *
   * ⚠️ **A list rather than the `inParty` boolean this was until milestone 15a.** With eight crews
   * "is this character in the party" has no answer — a Dwarf can be in the campaign five and the
   * Dwarf tower five at once, which is one sensible decision made twice rather than damage. Which
   * *rank* they stand in is a property of a crew rather than of a character, so it lives on
   * `CrewView` in `FormationService` and is deliberately absent here.
   */
  readonly crews: readonly string[];
  /** Whether this character is standing for anything at all. */
  readonly crewed: boolean;
  /** Cost of the next single level, or `null` at the cap. */
  readonly nextLevelCost: CurrencyAmounts | null;
  readonly canLevel: boolean;
  /** The highest level the wallet could reach right now. */
  readonly affordableLevel: number;
  /** Spare copies the next rung costs, or `null` at the top of the ladder. */
  readonly ascensionCost: number | null;
  readonly canAscend: boolean;
}

/**
 * What the roster's shared level is, and what the next step of it costs.
 *
 * Assembled here for the same reason a {@link RosterEntryView} is: the floor, who is holding it
 * up, what one more level of it costs and how far the wallet reaches are four calls into `core/`,
 * and a template binding would run all four on every change-detection pass.
 */
export interface ResonanceView {
  /** The level every owned character is carried to, capped by its own rarity. */
  readonly floor: number;
  /** The characters holding the floor up, highest first. */
  readonly anchors: readonly RosterEntryView[];
  /** How many characters are standing above their invested level right now. */
  readonly carried: number;
  /** What one more level of floor costs, or `null` when nothing can raise it. */
  readonly stepCost: CurrencyAmounts | null;
  /** The highest floor the wallet could pay for right now. Equal to {@link floor} when none. */
  readonly affordable: number;
  /** The highest floor this roster could ever reach without an ascension. */
  readonly ceiling: number;
  /**
   * `true` when only an ascension can move the floor further.
   *
   * **Narrower than "the plan came back empty", deliberately.** `resonancePlan` also returns
   * `null` for a roster with nobody in it, and a flag that conflated the two would put "your
   * fifth-highest character is at its cap" on a screen with no characters on it.
   */
  readonly capped: boolean;
}

/**
 * What one press of Ascend All actually did.
 *
 * Three counts rather than the {@link AscensionStep} list `core/` returns, because that is the
 * whole of what the screen says afterwards: naming twenty characters in a status line is not a
 * sentence anybody reads, and the rows themselves have already redrawn to show their new rungs.
 */
export interface AscensionRunView {
  /** How many characters climbed at least one rung. Zero when nothing could. */
  readonly characters: number;
  /** Rungs climbed across all of them. Never fewer than {@link characters}. */
  readonly rungs: number;
  /** Spare copies consumed. */
  readonly copies: number;
}

/**
 * The roster, and everything the player can do to it.
 *
 * Every mutation goes through `GameLoopService.apply`, which owns the single authoritative
 * state reference. Two owners of the same run is how a battle's rewards get silently discarded
 * by the next autosave, so nothing here keeps a copy of its own.
 *
 * Each action returns the `RosterResult` from `core/` unchanged, so a view can say *why* an
 * action failed rather than leaving a button that appears to do nothing.
 */
@Service()
export class RosterService {
  private readonly game = inject(GameLoopService);

  /** Every owned character, joined to its definition and sorted for display. */
  readonly entries = computed<readonly RosterEntryView[]>(() => {
    const state = this.game.snapshot();
    if (state === null) {
      return [];
    }
    // Once per snapshot rather than once per row: the floor is a property of the whole roster,
    // and deriving it inside `toView` would re-sort the roster for every character in it.
    const floor = resonanceFloor(state.roster);
    return state.roster
      .map((owned) => this.toView(owned, floor))
      .filter((entry): entry is RosterEntryView => entry !== null)
      .sort((a, b) => compareEntries(a, b, FACTION_RANK));
  });

  /**
   * The shared level, and what moving it costs.
   *
   * The anchors are looked up in {@link entries} rather than rebuilt, so the resonance panel and
   * the roster list below it can never disagree about what level somebody is.
   */
  readonly resonance = computed<ResonanceView>(() => {
    const state = this.game.snapshot();
    const rows = this.entries();
    if (state === null) {
      return EMPTY_RESONANCE;
    }

    const floor = resonanceFloor(state.roster);
    const byId = new Map(rows.map((entry) => [entry.defId, entry]));
    const anchors = resonanceAnchors(state.roster)
      .map((owned) => byId.get(owned.defId))
      .filter((entry): entry is RosterEntryView => entry !== undefined);
    const step = resonancePlan(state.roster, LEVELS, floor + 1);

    return {
      floor,
      anchors,
      carried: rows.filter((entry) => entry.resonated).length,
      stepCost: step?.cost ?? null,
      affordable: maxAffordableResonance(state.roster, state.wallet, LEVELS),
      ceiling: resonanceCeiling(state.roster, LEVELS),
      // A roster with nobody in it has no plan either, and it is not cap-stalled — it has
      // nothing to stall. See the note on the field.
      capped: step === null && state.roster.length > 0,
    };
  });

  /**
   * The whole roster, split into one group per faction.
   *
   * A partition of {@link entries} rather than a second sort: the order is decided once, in one
   * comparator, so the roster list and anything else reading `entries` can never disagree about
   * who comes first.
   *
   * ⚠️ **Every owned character, crewed ones included, since milestone 15a.** It used to exclude
   * whoever was standing in the formation, because the roster screen pinned them in a section of
   * their own above the factions. With eight crews that section would hold most of the roster and
   * say nothing — a character standing somewhere is the normal case now, not the notable one.
   */
  readonly factionGroups = computed<readonly RosterGroup[]>(() =>
    groupByFaction(this.entries(), FACTIONS_IN_ORDER),
  );

  /**
   * How many characters are standing for at least one activity.
   *
   * A count of *characters*, not of slots: somebody in three crews is one busy character, and the
   * question the roster screen asks with this is "how much of my bench is doing something".
   */
  readonly crewedCount = computed(() => this.entries().filter((entry) => entry.crewed).length);

  /**
   * How many characters could climb a rung right now.
   *
   * Read by Town's Altar card, which is the same argument the spark shop's balance makes there:
   * the number that decides whether the trip is worth taking should be readable before taking it.
   * A count rather than a wallet figure, because copies are held per character and there is no
   * single balance to show.
   */
  readonly readyToAscend = computed(() => this.entries().filter((entry) => entry.canAscend).length);

  /** One row by id, for the character sheet. */
  entry(defId: string): RosterEntryView | null {
    return this.entries().find((row) => row.defId === defId) ?? null;
  }

  /**
   * Raises a character by one level.
   *
   * One above the **effective** level, so the button always buys a level the player can see. A
   * character sitting on the resonance floor would otherwise spend gold moving its invested level
   * from 6 to 7 while the screen kept saying 200.
   */
  levelUpOnce(defId: string): RosterResult {
    return this.mutate((state) => {
      const owned = findOwned(state, defId);
      return owned === undefined
        ? { ok: false, reason: 'not-owned' }
        : levelUp(
            state,
            defId,
            effectiveLevel(LEVELS, owned, resonanceFloor(state.roster)) + 1,
            LEVELS,
          );
    });
  }

  /** Raises a character as far as the wallet and its rarity allow. */
  levelUpMax(defId: string): RosterResult {
    return this.mutate((state) => levelUpToAffordable(state, defId, LEVELS));
  }

  /** Raises the whole roster's shared level by one, levelling every anchor it takes. */
  resonateOnce(): RosterResult {
    return this.mutate((state) => raiseResonance(state, resonanceFloor(state.roster) + 1, LEVELS));
  }

  /** Raises the shared level as far as the wallet allows, in one atomic step. */
  resonateMax(): RosterResult {
    return this.mutate((state) => raiseResonanceToAffordable(state, LEVELS));
  }

  /**
   * Ascends a character one rung, spending that many of its own spare copies.
   *
   * No plan argument, and there is nothing for the player to choose. A rung names one price in
   * one resource; the only question is whether the copies are there.
   */
  ascendOnce(defId: string): RosterResult {
    return this.mutate((state) =>
      ascend(state, defId, ASCENSION, CHARACTERS_BY_ID, FACTIONS_BY_ID),
    );
  }

  /**
   * Ascends the whole roster as far as its copies reach, in one commit.
   *
   * Not routed through {@link mutate}, and the difference is the return type rather than the
   * mechanics: a batch has no single reason to refuse, so there is no `RosterResult` to hand back
   * — "nobody could ascend" is an outcome the screen reports, not an error. One `apply` for the
   * whole pass, so twenty ascensions publish one snapshot instead of twenty.
   */
  ascendAll(): AscensionRunView {
    const state = this.game.current;
    if (state === null) {
      return NOTHING_ASCENDED;
    }
    const { state: next, steps } = ascendAll(state, ASCENSION, CHARACTERS_BY_ID, FACTIONS_BY_ID);
    if (steps.length === 0) {
      return NOTHING_ASCENDED;
    }
    this.game.apply(() => next);
    return {
      characters: steps.length,
      rungs: steps.reduce((total, step) => total + (step.to - step.from), 0),
      copies: steps.reduce((total, step) => total + step.copies, 0),
    };
  }

  /**
   * Runs a pure `core/` operation against the run and commits it only on success.
   *
   * The failure case deliberately does not touch the state at all, so a rejected action cannot
   * republish the snapshot and cause a pointless re-render of every screen watching it.
   */
  private mutate(operation: (state: GameStateLike) => RosterResult): RosterResult {
    const state = this.game.current;
    if (state === null) {
      return { ok: false, reason: 'not-owned' };
    }
    const result = operation(state);
    if (result.ok) {
      this.game.apply(() => result.state);
    }
    return result;
  }

  private toView(owned: OwnedCharacter, floor: number): RosterEntryView | null {
    const state = this.game.snapshot();
    const character = CHARACTERS_BY_ID.get(owned.defId);
    if (state === null || character === undefined) {
      return null;
    }

    // Every level this row reports — what it is at, what the next one costs, how far the wallet
    // reaches — is measured from the effective level, because that is the level the player is
    // buying up from. See `levelUp` in `core/roster/roster.ts` for why the price agrees.
    const level = effectiveLevel(LEVELS, owned, floor);
    const levelCap = levelCapFor(LEVELS, owned.rarity);
    const atLevelCap = level >= levelCap;
    const cost = atLevelCap ? null : levelCost(LEVELS, level);
    const affordableLevel = maxAffordableLevel(LEVELS, state.wallet, level, owned.rarity);

    const ascensionCost =
      nextAscension(state, owned.defId, ASCENSION, CHARACTERS_BY_ID, FACTIONS_BY_ID) ?? null;
    // Every activity this character stands for. The book is at most eight short entries, so this
    // is a scan rather than an index — an index would have to be rebuilt on every placement, which
    // is the same work spread over more code.
    const crews: string[] = [];
    for (const [activity, formation] of Object.entries(state.formations)) {
      if (formation.front.includes(owned.defId) || formation.back.includes(owned.defId)) {
        crews.push(activity);
      }
    }

    return {
      defId: owned.defId,
      name: character.name,
      faction: character.faction,
      factionName: factionName(character.faction),
      tier: character.tier,
      role: character.role,
      rarity: owned.rarity,
      rarityLabel: rarityLabel(owned.rarity),
      rarityFamily: rarityFamily(owned.rarity),
      level,
      resonated: level > owned.level,
      levelCap,
      atLevelCap,
      isMaxRarity: owned.rarity >= MAX_RARITY_INDEX,
      copies: owned.copies,
      crews,
      crewed: crews.length > 0,
      nextLevelCost: cost,
      canLevel: affordableLevel > level,
      affordableLevel,
      ascensionCost,
      canAscend: ascensionCost !== null && owned.copies >= ascensionCost,
    };
  }
}

/** A pass that moved nothing: no run loaded, or nobody holding the copies for their next rung. */
const NOTHING_ASCENDED: AscensionRunView = { characters: 0, rungs: 0, copies: 0 };

/** Structural stand-in so `mutate` does not have to import the state type by name twice. */
type GameStateLike = Parameters<typeof levelUpToAffordable>[0];

/**
 * What the resonance panel shows before a save has loaded: a run with nobody in it.
 *
 * `capped` is **false** here for the same reason it is narrowed above — nothing about a run that
 * has not loaded is waiting on an ascension. Both buttons are still disabled without it: there is
 * no `stepCost` to spend and `affordable` does not exceed `floor`.
 */
const EMPTY_RESONANCE: ResonanceView = {
  floor: 1,
  anchors: [],
  carried: 0,
  stepCost: null,
  affordable: 1,
  ceiling: 1,
  capped: false,
};

/** Built once: the authored faction order is static content, and the sort runs per snapshot. */
const FACTION_RANK = factionRanker(FACTIONS_IN_ORDER);
