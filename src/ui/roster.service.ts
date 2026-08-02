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
  findOwned,
  fodderPool,
  type FodderOption,
  type FormationData,
  formationSize,
  levelCapFor,
  levelCost,
  levelUp,
  levelUpToAffordable,
  MAX_RARITY_INDEX,
  maxAffordableLevel,
  nextAscension,
  type OwnedCharacter,
  type PartyFormation,
  placeInRow,
  type RarityFamily,
  rarityFamily,
  rarityLabel,
  type RosterResult,
  type Row,
  rowCapacity,
  setFormation,
  toBattleCombatant,
} from '../core';
import {
  ASCENSION,
  CHARACTERS_BY_ID,
  factionName,
  FACTIONS_BY_ID,
  FACTIONS_IN_ORDER,
  GROWTH_RULES,
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
  readonly level: number;
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
    return state.roster
      .map((owned) => this.toView(owned))
      .filter((entry): entry is RosterEntryView => entry !== null)
      .sort((a, b) => compareEntries(a, b, FACTION_RANK));
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
    const resolve = (ids: readonly string[]): CombatantData[] => {
      const combatants: CombatantData[] = [];
      for (const defId of ids) {
        const character = CHARACTERS_BY_ID.get(defId);
        const owned = findOwned(state, defId);
        if (character !== undefined && owned !== undefined) {
          combatants.push(toBattleCombatant(character, owned, GROWTH_RULES));
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

  /** Raises a character by one level. */
  levelUpOnce(defId: string): RosterResult {
    return this.mutate((state) => {
      const owned = findOwned(state, defId);
      return owned === undefined
        ? { ok: false, reason: 'not-owned' }
        : levelUp(state, defId, owned.level + 1, LEVELS);
    });
  }

  /** Raises a character as far as the wallet and its rarity allow. */
  levelUpMax(defId: string): RosterResult {
    return this.mutate((state) => levelUpToAffordable(state, defId, LEVELS));
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

  private toView(owned: OwnedCharacter): RosterEntryView | null {
    const state = this.game.snapshot();
    const character = CHARACTERS_BY_ID.get(owned.defId);
    if (state === null || character === undefined) {
      return null;
    }

    const levelCap = levelCapFor(LEVELS, owned.rarity);
    const atLevelCap = owned.level >= levelCap;
    const cost = atLevelCap ? null : levelCost(LEVELS, owned.level);
    const affordableLevel = maxAffordableLevel(LEVELS, state.wallet, owned.level, owned.rarity);

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
      level: owned.level,
      levelCap,
      atLevelCap,
      isMaxRarity: owned.rarity >= MAX_RARITY_INDEX,
      copies: owned.copies,
      inParty: row !== null,
      row,
      rowSlot,
      nextLevelCost: cost,
      canLevel: affordableLevel > owned.level,
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

/** Built once: the authored faction order is static content, and the sort runs per snapshot. */
const FACTION_RANK = factionRanker(FACTIONS_IN_ORDER);
