import { computed, inject, Service } from '@angular/core';
import {
  ascend,
  type AscensionPlan,
  autoFodderPlan,
  type CharacterData,
  type CombatantData,
  type CopyCost,
  type CurrencyAmounts,
  findOwned,
  fodderPool,
  type FodderOption,
  levelCapFor,
  levelCost,
  levelUp,
  levelUpToAffordable,
  MAX_RARITY_INDEX,
  maxAffordableLevel,
  nextAscension,
  type OwnedCharacter,
  rarityLabel,
  type RosterResult,
  setParty,
  toBattleCombatant,
} from '../core';
import { PARTY_SIZE } from '../core';
import {
  ASCENSION,
  CHARACTERS_BY_ID,
  factionName,
  FACTIONS_BY_ID,
  GROWTH_RULES,
  LEVELS,
} from './content';
import { GameLoopService } from './game-loop.service';

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
  readonly rarity: number;
  readonly rarityLabel: string;
  readonly level: number;
  readonly levelCap: number;
  readonly atLevelCap: boolean;
  readonly isMaxRarity: boolean;
  /** Spare base copies held as ascension material. */
  readonly copies: number;
  readonly inParty: boolean;
  readonly partySlot: number | null;
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
      .sort(compareEntries);
  });

  /** The party, in slot order, as roster rows. Missing members are simply absent. */
  readonly party = computed<readonly RosterEntryView[]>(() => {
    const byId = new Map(this.entries().map((entry) => [entry.defId, entry]));
    return this.game
      .activeParty()
      .map((defId) => byId.get(defId))
      .filter((entry): entry is RosterEntryView => entry !== undefined);
  });

  /** Empty party slots remaining. */
  readonly openSlots = computed(() => Math.max(PARTY_SIZE - this.game.activeParty().length, 0));

  /**
   * The party as combatants, with stats already scaled for level and rarity.
   *
   * This is what `BattleService` fights with. An empty party is handed through as an empty
   * array rather than substituted for the starters: `simulateBattle` reads it as an immediate
   * defeat, which is the honest outcome of sending nobody.
   */
  readonly battleParty = computed<readonly CombatantData[]>(() => {
    const state = this.game.snapshot();
    if (state === null) {
      return [];
    }
    const combatants: CombatantData[] = [];
    for (const defId of state.activeParty) {
      const character = CHARACTERS_BY_ID.get(defId);
      const owned = findOwned(state, defId);
      if (character !== undefined && owned !== undefined) {
        combatants.push(toBattleCombatant(character, owned, GROWTH_RULES));
      }
    }
    return combatants;
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

  /** Adds or removes a character from the party, preserving slot order. */
  toggleParty(defId: string): RosterResult {
    return this.mutate((state) => {
      const current = state.activeParty;
      const next = current.includes(defId)
        ? current.filter((id) => id !== defId)
        : [...current, defId];
      if (next.length > PARTY_SIZE) {
        return { ok: false, reason: 'party-full' };
      }
      return setParty(state, next, CHARACTERS_BY_ID);
    });
  }

  /** Sets the whole party at once, in slot order. */
  setParty(defIds: readonly string[]): RosterResult {
    return this.mutate((state) => setParty(state, defIds, CHARACTERS_BY_ID));
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

    const slot = state.activeParty.indexOf(owned.defId);
    return {
      defId: owned.defId,
      name: character.name,
      faction: character.faction,
      factionName: factionName(character.faction),
      tier: character.tier,
      rarity: owned.rarity,
      rarityLabel: rarityLabel(owned.rarity),
      level: owned.level,
      levelCap,
      atLevelCap,
      isMaxRarity: owned.rarity >= MAX_RARITY_INDEX,
      copies: owned.copies,
      inParty: slot >= 0,
      partySlot: slot >= 0 ? slot + 1 : null,
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

/**
 * Party first in slot order, then everyone else by rarity, then level, then name.
 *
 * Party members pinned to the top because the roster's most common use is checking on who is
 * actually fighting; below that, the characters a player has invested in are the ones they are
 * looking for.
 */
function compareEntries(a: RosterEntryView, b: RosterEntryView): number {
  if (a.inParty !== b.inParty) {
    return a.inParty ? -1 : 1;
  }
  if (a.inParty && b.inParty) {
    return (a.partySlot ?? 0) - (b.partySlot ?? 0);
  }
  return b.rarity - a.rarity || b.level - a.level || a.name.localeCompare(b.name);
}
