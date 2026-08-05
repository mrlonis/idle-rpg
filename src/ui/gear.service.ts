import { computed, inject, signal, Service } from '@angular/core';
import {
  buyGear,
  canEnhance,
  type CurrencyAmounts,
  enhance,
  enhanceCost,
  equip,
  equippedBy,
  GEAR_SLOTS,
  GEAR_STATS,
  gearScale,
  gearShopOffers,
  gearShopSlot,
  gradeAt,
  type GearBonus,
  type GearItem,
  type GearResult,
  type GearShopResult,
  type GearSlot,
  type GearStat,
  type GameState,
  isAligned,
  itemBonus,
  msUntilRestock,
  type Numeric,
  salvage,
  salvageValue,
  unequip,
  useAsMaterial,
} from '../core';
import { CHARACTERS_BY_ID, factionName, GEAR, GEAR_ALIGNMENTS } from './content';
import { GameLoopService } from './game-loop.service';

/**
 * The gear seam: what the screens read, and the four things a player can do to a piece.
 *
 * Same shape as `RosterService`. Everything a template needs is resolved here rather than in a
 * binding — a piece's grade, its bonuses, what enhancing it costs and whether the wallet covers
 * that is five calls into `core/`, and a binding would run all five on every change-detection
 * pass.
 *
 * ## The shop needs a clock, and this is where one exists
 *
 * `core/gear/shop.ts` takes a **refresh index** rather than a time, because `core/` has no clock —
 * the same arrangement `resume(state, nowMs)` has. This service is what divides `Date.now()` by
 * the authored period and hands the quotient in.
 *
 * That clock is sampled into a signal rather than read inside a `computed`. A `computed` that
 * called `Date.now()` would be a function of something Angular cannot track: it would memoise the
 * first hour it saw and keep serving it, and the shop would visibly stop restocking until
 * something unrelated invalidated it. The signal is what makes the dependency real.
 */
@Service()
export class GearService {
  private readonly game = inject(GameLoopService);

  /**
   * Wall-clock time, sampled rather than read.
   *
   * Ticked by {@link refreshClock}, which the gear screen calls on open and on an interval. Kept
   * coarse deliberately: nothing here is worth a per-frame signal, and the only thing that
   * changes with it is a countdown measured in minutes.
   */
  private readonly nowMs = signal(Date.now());

  /** Every piece the run owns, resolved for display, newest first. */
  readonly items = computed<readonly GearItemView[]>(() => {
    const state = this.game.snapshot();
    if (state === null) {
      return [];
    }
    const worn = equippedBy(state);
    return state.gear
      .map((item) => this.view(item, worn.get(item.id)))
      .sort(byPowerThenId)
      .reverse();
  });

  /** The pieces nobody is wearing: what the bag lists and what enhancement may eat. */
  readonly loose = computed(() => this.items().filter((item) => item.wornBy === null));

  /** How much enhancement material the run is holding. */
  readonly alloy = computed(() => this.game.wallet().alloy);

  /** The five slots for one character, with what is in each and what could be. */
  slots(defId: string): readonly GearSlotView[] {
    const state = this.game.snapshot();
    const character = CHARACTERS_BY_ID.get(defId);
    if (state === null || character === undefined) {
      return [];
    }
    const owned = state.roster.find((entry) => entry.defId === defId);
    const held = this.items();

    return GEAR_SLOTS.map((slot) => {
      const equippedId = owned?.gear[slot];
      return {
        slot,
        label: SLOT_LABELS[slot],
        item: held.find((item) => item.id === equippedId) ?? null,
        // Eligible rather than "everything": a piece has to be forged for this archetype and made
        // for this slot. Pieces worn by *somebody else* stay in the list — equipping simply takes
        // them off that character, and hiding them would turn a one-tap move into a hunt.
        options: held.filter(
          (item) =>
            item.slot === slot &&
            item.archetype === character.role &&
            item.id !== equippedId &&
            (item.wornBy === null || item.wornBy !== defId),
        ),
      };
    });
  }

  /** What one character's gear is worth right now, per stat, as percentages. */
  bonusFor(defId: string): readonly GearBonusView[] {
    const state = this.game.snapshot();
    const character = CHARACTERS_BY_ID.get(defId);
    if (state === null || character === undefined) {
      return [];
    }
    const owned = state.roster.find((entry) => entry.defId === defId);
    if (owned === undefined) {
      return [];
    }
    const held = new Map(state.gear.map((item) => [item.id, item]));
    const total: Partial<Record<GearStat, number>> = {};
    for (const slot of GEAR_SLOTS) {
      const item = held.get(owned.gear[slot] ?? '');
      if (item === undefined) {
        continue;
      }
      const bonus = itemBonus(GEAR, item, character.faction);
      for (const stat of GEAR_STATS) {
        const share = bonus[stat];
        if (share !== undefined) {
          total[stat] = (total[stat] ?? 0) + share;
        }
      }
    }
    return toBonusViews(total);
  }

  /** The shop as it stands this hour, priced against this run's income. */
  readonly offers = computed<readonly GearOfferView[]>(() => {
    const state = this.game.snapshot();
    if (state === null) {
      return [];
    }
    const slot = gearShopSlot(GEAR, this.nowMs());
    return gearShopOffers(state, GEAR, GEAR_ALIGNMENTS, slot).map((offer) => ({
      index: offer.index,
      item: this.view(offer.item, undefined),
      price: offer.price,
      purchased: offer.purchased,
      affordable: state.wallet.gold.gte(offer.price),
    }));
  });

  /** Milliseconds until the shop restocks, for the countdown. */
  readonly msUntilRestock = computed(() => msUntilRestock(GEAR, this.nowMs()));

  /**
   * Re-samples the clock.
   *
   * Called by the gear screen when it opens and on a slow interval while it is on screen. The
   * screen owns the interval rather than this service, because a service-owned timer would keep
   * running for the life of the app to update something nobody is looking at — the same reason
   * the battle animator's timer only runs while there is a fight to narrate.
   */
  refreshClock(): void {
    this.nowMs.set(Date.now());
  }

  /** Puts a piece on. Fails loudly on a wrong-archetype piece rather than doing nothing. */
  equip(defId: string, itemId: string): GearResult {
    return this.mutate((state) => equip(state, defId, itemId, CHARACTERS_BY_ID));
  }

  /** Takes a piece off, leaving it in the bag. */
  unequip(defId: string, slot: GearSlot): GearResult {
    return this.mutate((state) => unequip(state, defId, slot));
  }

  /** Raises one piece by one level, charging alloy and gold. */
  enhance(itemId: string): GearResult {
    return this.mutate((state) => enhance(state, itemId, GEAR));
  }

  /** Melts pieces into alloy. Refuses outright if any of them is worn. */
  salvage(itemIds: readonly string[]): GearResult {
    return this.mutate((state) => salvage(state, itemIds, GEAR));
  }

  /** Feeds pieces into another one and spends what they were worth, in one action. */
  useAsMaterial(targetId: string, materialIds: readonly string[]): GearResult {
    return this.mutate((state) => useAsMaterial(state, targetId, materialIds, GEAR));
  }

  /** Buys one shop offer with gold. */
  buy(offerIndex: number): GearShopResult {
    const state = this.game.current;
    if (state === null) {
      return { ok: false, reason: 'unknown-offer' };
    }
    const slot = gearShopSlot(GEAR, this.nowMs());
    const result = buyGear(state, GEAR, GEAR_ALIGNMENTS, slot, offerIndex);
    if (result.ok) {
      this.game.apply(() => result.state);
      void this.game.persist();
    }
    return result;
  }

  /**
   * Applies a `core/` transform and persists it if it took.
   *
   * Persisting on every successful change rather than waiting for the autosave, for the reason
   * `BattleService` persists per battle: these are discrete, deliberate actions, and losing one
   * to a hard suspend is the kind of loss a player notices and cannot reconstruct.
   */
  private mutate(update: (state: GameState) => GearResult): GearResult {
    const state = this.game.current;
    if (state === null) {
      return { ok: false, reason: 'unknown-item' };
    }
    const result = update(state);
    if (result.ok) {
      this.game.apply(() => result.state);
      void this.game.persist();
    }
    return result;
  }

  /** One piece, with everything a template needs already resolved. */
  private view(item: GearItem, wornBy: string | undefined): GearItemView {
    const grade = gradeAt(GEAR, item.grade);
    const wearer = wornBy === undefined ? undefined : CHARACTERS_BY_ID.get(wornBy);
    const faction = wearer?.faction;
    const cost = canEnhance(GEAR, item) ? enhanceCost(GEAR, item) : null;
    const wallet = this.game.wallet();

    return {
      id: item.id,
      slot: item.slot,
      slotLabel: SLOT_LABELS[item.slot],
      archetype: item.archetype,
      archetypeLabel: ARCHETYPE_LABELS[item.archetype],
      gradeIndex: item.grade,
      gradeName: grade?.name ?? 'Unknown',
      gradeId: grade?.id ?? 'unknown',
      alignment: item.alignment ?? null,
      alignmentLabel: item.alignment === undefined ? null : factionName(item.alignment),
      // Whether the *current wearer* is getting the alignment bonus, which is the question the
      // sheet is actually asking. A piece in the bag has no wearer, so this is false there — the
      // label still says what faction it is for.
      alignmentActive: isAligned(item, faction),
      level: item.level,
      maxLevel: grade?.maxLevel ?? item.level,
      atMaxLevel: !canEnhance(GEAR, item),
      bonuses: toBonusViews(itemBonus(GEAR, item, faction)),
      salvageValue: salvageValue(GEAR, item),
      power: gearScale(GEAR, item, faction),
      wornBy: wornBy ?? null,
      wornByName: wearer?.name ?? null,
      enhanceCost: cost,
      canAffordEnhance:
        cost !== null &&
        (cost.alloy === undefined || wallet.alloy.gte(cost.alloy)) &&
        (cost.gold === undefined || wallet.gold.gte(cost.gold)),
    };
  }
}

/** One stat a piece or a loadout moves, as the sheet shows it. */
export interface GearBonusView {
  readonly stat: GearStat;
  readonly label: string;
  /** Whole percentage points, which is the only resolution worth showing. */
  readonly percent: number;
}

/** One piece, resolved for display. */
export interface GearItemView {
  readonly id: string;
  readonly slot: GearSlot;
  readonly slotLabel: string;
  readonly archetype: string;
  readonly archetypeLabel: string;
  readonly gradeIndex: number;
  readonly gradeName: string;
  /** The grade's id, used as a modifier class so a grade reads as a colour as well as a word. */
  readonly gradeId: string;
  readonly alignment: string | null;
  readonly alignmentLabel: string | null;
  /** `true` when whoever is wearing this is getting the matching-faction bonus. */
  readonly alignmentActive: boolean;
  readonly level: number;
  readonly maxLevel: number;
  readonly atMaxLevel: boolean;
  readonly bonuses: readonly GearBonusView[];
  readonly salvageValue: number;
  /** The scale factor behind the bonuses. Used for sorting; never shown. */
  readonly power: number;
  /** The character wearing this, or `null` when it is in the bag. */
  readonly wornBy: string | null;
  readonly wornByName: string | null;
  readonly enhanceCost: CurrencyAmounts | null;
  readonly canAffordEnhance: boolean;
}

/** One of a character's five slots, with what is in it and what could be. */
export interface GearSlotView {
  readonly slot: GearSlot;
  readonly label: string;
  readonly item: GearItemView | null;
  readonly options: readonly GearItemView[];
}

/** One shop offer, priced against this run. */
export interface GearOfferView {
  readonly index: number;
  readonly item: GearItemView;
  readonly price: Numeric;
  readonly purchased: boolean;
  readonly affordable: boolean;
}

/**
 * What each slot is called on screen.
 *
 * Here rather than in `data/`, for the reason `CURRENCY_LABELS` is here: an id names the purpose
 * and a label names the object, and only the second one is language.
 */
const SLOT_LABELS: Readonly<Record<GearSlot, string>> = {
  head: 'Head',
  arms: 'Arms',
  chest: 'Chest',
  legs: 'Legs',
  boots: 'Boots',
};

/** What each archetype is called on screen. Matches the roster's own role labels. */
const ARCHETYPE_LABELS: Readonly<Record<string, string>> = {
  tank: 'Tank',
  brawler: 'Brawler',
  mage: 'Mage',
  ranger: 'Ranger',
  support: 'Support',
};

/** What each stat is called on a gear sheet. */
const STAT_LABELS: Readonly<Record<GearStat, string>> = {
  hp: 'Health',
  atk: 'Attack',
  def: 'Defence',
  haste: 'Haste',
};

/**
 * Bonuses as whole percentage points, in a fixed order, dropping anything that rounds to nothing.
 *
 * A fixed order rather than sorted by size, because a list whose rows move around between two
 * pieces is a list a player has to re-read instead of compare. Dropping a zero row is the same
 * decision `stagePayout` makes about essence: "+0% defence" reads as a bug.
 */
function toBonusViews(bonus: GearBonus): readonly GearBonusView[] {
  const views: GearBonusView[] = [];
  for (const stat of GEAR_STATS) {
    const percent = Math.round((bonus[stat] ?? 0) * 100);
    if (percent > 0) {
      views.push({ stat, label: STAT_LABELS[stat], percent });
    }
  }
  return views;
}

/**
 * Sorts weakest first, breaking ties on id.
 *
 * The tiebreak is what keeps the list stable: two identical pieces have to have a defined order
 * or they swap places every time the signal recomputes, which reads as the list flickering.
 */
function byPowerThenId(a: GearItemView, b: GearItemView): number {
  return a.power !== b.power ? a.power - b.power : a.id.localeCompare(b.id);
}
