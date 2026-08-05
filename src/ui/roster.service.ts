import { computed, inject, Service } from '@angular/core';
import {
  ascend,
  type AscensionPlan,
  autoFodderPlan,
  benchMember,
  type CharacterData,
  type CombatantData,
  type CopyCost,
  type CurrencyAmounts,
  effectiveLevel,
  findOwned,
  fodderPool,
  type FodderOption,
  type FormationData,
  formationSize,
  levelCapFor,
  levelCost,
  levelUp,
  levelUpToAffordable,
  lineupBonus,
  type LineupSummary,
  MAX_RARITY_INDEX,
  maxAffordableLevel,
  maxAffordableResonance,
  nextAscension,
  type OwnedCharacter,
  type PartyFormation,
  placeInRow,
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
  type Row,
  rowCapacity,
  setFormation,
  toBattleCombatant,
} from '../core';
import {
  ASCENSION,
  CHARACTERS_BY_ID,
  COMBAT,
  factionName,
  FACTIONS_BY_ID,
  FACTIONS_IN_ORDER,
  GROWTH_RULES,
  KIT,
  LEVELS,
} from './content';
import { GameLoopService } from './game-loop.service';
import { compareEntries, factionRanker, groupBench, type RosterGroup } from './roster-order';

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
  readonly inParty: boolean;
  /** Which rank this character is standing in, or `null` when benched. */
  readonly row: Row | null;
  /** Position within its rank, 1-based, or `null` when benched. */
  readonly rowSlot: number | null;
  /** Cost of the next single level, or `null` at the cap. */
  readonly nextLevelCost: CurrencyAmounts | null;
  readonly canLevel: boolean;
  /** The highest level the wallet could reach right now. */
  readonly affordableLevel: number;
  /** What the next rung costs, or `null` at the top of the ladder. */
  readonly ascensionCost: CopyCost | null;
  /** Fodder value available from faction-mates' spares. */
  readonly fodderAvailable: number;
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

  /** The front rank, in slot order, as roster rows. Missing members are simply absent. */
  readonly frontRow = computed<readonly RosterEntryView[]>(() =>
    this.rank(this.game.formation().front),
  );

  /** The back rank, in slot order. */
  readonly backRow = computed<readonly RosterEntryView[]>(() =>
    this.rank(this.game.formation().back),
  );

  /** Everyone fielded, front rank then back — the same order the battle board draws. */
  readonly fielded = computed<readonly RosterEntryView[]>(() => [
    ...this.frontRow(),
    ...this.backRow(),
  ]);

  /**
   * The bench, split into one group per faction.
   *
   * A partition of {@link entries} rather than a second sort: the order is decided once, in one
   * comparator, so the roster list and anything else reading `entries` can never disagree about
   * who comes first.
   */
  readonly benchGroups = computed<readonly RosterGroup[]>(() =>
    groupBench(this.entries(), FACTIONS_IN_ORDER),
  );

  /** Empty slots left in each rank, which is what the formation editor shows as gaps. */
  readonly openSlots = computed<Readonly<Record<Row, number>>>(() => {
    const formation = this.game.formation();
    return {
      front: Math.max(rowCapacity('front') - formation.front.length, 0),
      back: Math.max(rowCapacity('back') - formation.back.length, 0),
    };
  });

  /** How many characters are currently fielded, across both ranks. */
  readonly fieldedCount = computed(() => formationSize(this.game.formation()));

  /**
   * What the fielded party's faction composition is worth, resolved through `core/`.
   *
   * The **same function the simulation calls**, rather than a second reading of the same table.
   * A formation screen promising +25% and a battle awarding something else is the worst possible
   * failure for a mechanic whose entire job is to make the player rebuild their party, and two
   * implementations of one ladder is how that happens.
   *
   * Derived from {@link fielded} so it follows the formation the screen is showing, and returns
   * the whole summary rather than the numbers alone — a bonus a player cannot attribute to a
   * faction is one they cannot chase.
   */
  readonly lineup = computed<LineupSummary>(() =>
    lineupBonus(
      this.fielded().map((entry) => entry.faction),
      COMBAT.lineup,
    ),
  );

  /**
   * The party as a formation of combatants, with stats already scaled for level and rarity.
   *
   * This is what `BattleService` fights with. An empty formation is handed through empty rather
   * than substituted for the starters: `simulateBattle` reads it as an immediate defeat, which
   * is the honest outcome of sending nobody.
   */
  readonly battleFormation = computed<FormationData>(() => {
    const state = this.game.snapshot();
    if (state === null) {
      return { front: [], back: [] };
    }
    // Resolved here rather than left to `toBattleCombatant`, which is handed the answer: the
    // party fights at its effective level, and the floor is a fact about the roster the party
    // was drawn from rather than about any one member of it.
    const floor = resonanceFloor(state.roster);
    const resolve = (ids: readonly string[]): CombatantData[] => {
      const combatants: CombatantData[] = [];
      for (const defId of ids) {
        const character = CHARACTERS_BY_ID.get(defId);
        const owned = findOwned(state, defId);
        if (character !== undefined && owned !== undefined) {
          combatants.push(
            toBattleCombatant(
              character,
              owned,
              GROWTH_RULES,
              KIT,
              effectiveLevel(LEVELS, owned, floor),
            ),
          );
        }
      }
      return combatants;
    };
    return { front: resolve(state.formation.front), back: resolve(state.formation.back) };
  });

  /** One row by id, for the character sheet. */
  entry(defId: string): RosterEntryView | null {
    return this.entries().find((row) => row.defId === defId) ?? null;
  }

  /** Faction-mates whose spares could pay for an ascension. */
  fodderFor(defId: string): readonly FodderOption[] {
    const state = this.game.snapshot();
    return state === null ? [] : fodderPool(state, defId, ASCENSION, CHARACTERS_BY_ID);
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
   * Ascends a character one rung.
   *
   * A plan may be supplied when the player picked their own fodder; otherwise the cheapest
   * plan is built for them, which spends 1-value spares before 9-value ones so an absent-minded
   * tap cannot feed an ascended-tier duplicate to a rung a handful of commons would cover.
   */
  ascendOnce(defId: string, plan?: AscensionPlan): RosterResult {
    return this.mutate((state) => {
      const chosen =
        plan ?? autoFodderPlan(state, defId, ASCENSION, CHARACTERS_BY_ID, FACTIONS_BY_ID);
      if (chosen === undefined) {
        return { ok: false, reason: 'insufficient-fodder' };
      }
      return ascend(state, defId, chosen, ASCENSION, CHARACTERS_BY_ID, FACTIONS_BY_ID);
    });
  }

  /** Puts a character into a rank, taking it out of the other one first. */
  placeIn(defId: string, row: Row): RosterResult {
    return this.mutate((state) => placeInRow(state, defId, row, CHARACTERS_BY_ID));
  }

  /** Takes a character out of the formation entirely. */
  bench(defId: string): RosterResult {
    return this.mutate((state) => benchMember(state, defId, CHARACTERS_BY_ID));
  }

  /**
   * Cycles a character through front, back and benched.
   *
   * One control rather than three, because the formation editor is a list and a row of three
   * buttons per character would be forty-odd controls on a screen that already has a table. The
   * cycle skips a full rank rather than refusing, so a tap always does something.
   */
  cyclePlacement(defId: string): RosterResult {
    const formation = this.game.formation();
    if (formation.front.includes(defId)) {
      return formation.back.length < rowCapacity('back')
        ? this.placeIn(defId, 'back')
        : this.bench(defId);
    }
    if (formation.back.includes(defId)) {
      return this.bench(defId);
    }
    if (formation.front.length < rowCapacity('front')) {
      return this.placeIn(defId, 'front');
    }
    if (formation.back.length < rowCapacity('back')) {
      return this.placeIn(defId, 'back');
    }
    return { ok: false, reason: 'row-full' };
  }

  /** Sets the whole formation at once, rank by rank. */
  setFormation(formation: PartyFormation): RosterResult {
    return this.mutate((state) => setFormation(state, formation, CHARACTERS_BY_ID));
  }

  /** Joins one rank's ids to the roster rows they name, dropping anything unresolvable. */
  private rank(ids: readonly string[]): readonly RosterEntryView[] {
    const byId = new Map(this.entries().map((entry) => [entry.defId, entry]));
    return ids
      .map((defId) => byId.get(defId))
      .filter((entry): entry is RosterEntryView => entry !== undefined);
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
    const fodderAvailable = fodderPool(state, owned.defId, ASCENSION, CHARACTERS_BY_ID).reduce(
      (total, option) => total + option.available * option.valuePerCopy,
      0,
    );

    const front = state.formation.front.indexOf(owned.defId);
    const back = state.formation.back.indexOf(owned.defId);
    const row: Row | null = front >= 0 ? 'front' : back >= 0 ? 'back' : null;
    const rowSlot = front >= 0 ? front + 1 : back >= 0 ? back + 1 : null;

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
      inParty: row !== null,
      row,
      rowSlot,
      nextLevelCost: cost,
      canLevel: affordableLevel > level,
      affordableLevel,
      ascensionCost,
      fodderAvailable,
      canAscend:
        ascensionCost !== null &&
        owned.copies >= ascensionCost.self &&
        fodderAvailable >= ascensionCost.faction,
    };
  }
}

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
