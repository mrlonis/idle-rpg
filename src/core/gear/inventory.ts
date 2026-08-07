import { canAfford, credit, debit, type CurrencyAmounts } from '../currency';
import { num, ZERO } from '../numeric';
import { type CharacterData, type OwnedCharacter } from '../roster/types';
import { type GameState } from '../state';
import { clampGearLevel, gearScale, gradeAt, maxGearLevel } from './stats';
import {
  emptyLoadout,
  GEAR_SLOTS,
  type GearItem,
  type GearLoadout,
  type GearRulesData,
  type GearSlot,
} from './types';

/**
 * The bag: minting, equipping, salvaging, enhancing, and the repair pass that runs on load.
 *
 * Every entry point returns a {@link GearResult} rather than throwing or silently returning the
 * state unchanged, for the reason `roster/roster.ts` gives: a no-op that looks like success reaches
 * a player as "the button does nothing", and the UI needs a reason so it can say something better.
 *
 * ## Two rules that are not conveniences
 *
 * ⚠️ **Equipped gear can never be consumed.** Not by salvage, not as enhancement material, not
 * indirectly through the inventory cap. This is the gear spelling of milestone 3's settled law —
 * *only spare copies are ever consumed, never a character you have levelled* — and it exists for
 * the same reason: it removes the entire category of "I destroyed a week of investment by tapping
 * the wrong row", and with it the confirmation dance that category demands.
 *
 * ⚠️ **Nothing a fight drops is ever thrown away.** The bag is bounded, so something has to give
 * when it fills, and what gives is the *object* rather than the *value*: the worst piece salvages
 * into alloy worth exactly what it would have been worth as material. A pull can never produce
 * nothing, and neither can a stage clear.
 */

/** Why a gear operation could not be performed. */
export type GearFailure =
  | 'unknown-item'
  | 'unknown-character'
  | 'not-owned'
  | 'wrong-archetype'
  | 'item-equipped'
  | 'slot-empty'
  | 'max-level'
  | 'material-is-target'
  | 'insufficient-currency';

export type GearResult =
  | { readonly ok: true; readonly state: GameState }
  | { readonly ok: false; readonly reason: GearFailure };

const fail = (reason: GearFailure): GearResult => ({ ok: false, reason });

/** The piece with this id, or `undefined` if the run does not hold it. */
export function findGear(state: GameState, itemId: string): GearItem | undefined {
  return state.gear.find((item) => item.id === itemId);
}

/**
 * Every item id currently worn by somebody, and by whom.
 *
 * Built from the roster rather than stored, because a stored copy is a second source of truth for
 * "is this equipped" and the two would eventually disagree. The roster is small — one entry per
 * character rather than per copy — so this is cheap enough to build per call.
 */
export function equippedBy(state: GameState): ReadonlyMap<string, string> {
  const worn = new Map<string, string>();
  for (const owned of state.roster) {
    for (const slot of GEAR_SLOTS) {
      const id = owned.gear[slot];
      if (id !== undefined && !worn.has(id)) {
        worn.set(id, owned.defId);
      }
    }
  }
  return worn;
}

/** Every piece nobody is wearing: what the bag screen lists and what enhancement may eat. */
export function unequippedGear(state: GameState): readonly GearItem[] {
  const worn = equippedBy(state);
  return state.gear.filter((item) => !worn.has(item.id));
}

/** The id the next minted piece will carry. Deterministic, and never reissued. */
export function gearId(minted: number): string {
  const count = Number.isFinite(minted) ? Math.max(Math.floor(minted), 0) : 0;
  return `g${count + 1}`;
}

/** A piece as it arrives: level 1, nothing invested. */
export interface GearSpec {
  readonly slot: GearSlot;
  readonly archetype: GearItem['archetype'];
  readonly grade: number;
  readonly alignment: string | undefined;
}

/**
 * Mints pieces into the bag, salvaging the worst of whatever overflows the limit.
 *
 * The overflow sweep runs over the incoming pieces **and** the unequipped ones already held, and
 * keeps the best of the union. Salvaging the arrival simply because the bag was full would throw
 * away a relic to protect a bag of worn junk, which is the version of this a player would notice
 * and be right to be annoyed by.
 *
 * Returns what was salvaged as well as the new state, so the UI can say "two pieces became 340
 * alloy" rather than leaving a drop to vanish silently.
 */
export function addGear(
  state: GameState,
  specs: readonly GearSpec[],
  rules: GearRulesData,
): { readonly state: GameState; readonly minted: readonly GearItem[]; readonly salvaged: number } {
  if (specs.length === 0) {
    return { state, minted: [], salvaged: 0 };
  }

  let minted = state.gearMinted;
  const arrivals: GearItem[] = [];
  for (const spec of specs) {
    arrivals.push({
      id: gearId(minted),
      slot: spec.slot,
      archetype: spec.archetype,
      grade: Math.max(Math.min(Math.floor(spec.grade), rules.grades.length - 1), 0),
      alignment: spec.alignment,
      level: 1,
    });
    minted += 1;
  }

  const worn = equippedBy(state);
  const kept = state.gear.filter((item) => worn.has(item.id));
  const loose = [...state.gear.filter((item) => !worn.has(item.id)), ...arrivals];

  const limit = Number.isFinite(rules.inventoryLimit)
    ? Math.max(Math.floor(rules.inventoryLimit), 0)
    : 0;

  let alloy = ZERO;
  let survivors = loose;
  if (loose.length > limit) {
    // Sorted by what each piece is worth as material, best first, so the bag always holds the top
    // `limit` pieces regardless of what arrived when. A stable tiebreak on id keeps this
    // deterministic: two identical pieces have to salvage in a defined order or a replayed run
    // diverges.
    const ranked = [...loose].sort((a, b) => {
      const gap = salvageValue(rules, b) - salvageValue(rules, a);
      return gap !== 0 ? gap : a.id.localeCompare(b.id);
    });
    survivors = ranked.slice(0, limit);
    for (const item of ranked.slice(limit)) {
      alloy = alloy.add(salvageValue(rules, item));
    }
  }

  const survivorIds = new Set(survivors.map((item) => item.id));
  return {
    state: {
      ...state,
      gear: [...kept, ...survivors],
      gearMinted: minted,
      wallet: alloy.gt(ZERO) ? credit(state.wallet, { alloy }) : state.wallet,
    },
    minted: arrivals.filter((item) => survivorIds.has(item.id)),
    salvaged: loose.length - survivors.length,
  };
}

/**
 * What a piece is worth as enhancement material: its grade's base value plus everything ever
 * invested in it.
 *
 * **The invested half is returned in full, and that is deliberate generosity rather than an
 * oversight.** The alternative — a salvage tax — exists in other games to punish "wasting"
 * investment on the wrong piece, and the punishment lands entirely on players who did not yet know
 * which piece was the right one. Returning everything means a player can always undo an
 * enhancement decision by feeding the piece into a better one, which is the same promise
 * `ascend` makes by never consuming a character somebody levelled.
 */
export function salvageValue(rules: GearRulesData, item: GearItem): number {
  const rung = gradeAt(rules, item.grade);
  const base = rung === undefined || !Number.isFinite(rung.salvage) ? 0 : Math.max(rung.salvage, 0);
  return base + investedAlloy(rules, item);
}

/** Every point of alloy ever spent taking this piece to where it is. */
export function investedAlloy(rules: GearRulesData, item: GearItem): number {
  const level = clampGearLevel(rules, item.grade, item.level);
  let total = 0;
  for (let step = 1; step < level; step++) {
    total += alloyStep(rules, step);
  }
  return total;
}

/** Alloy to go from `level` to `level + 1`. */
export function alloyStep(rules: GearRulesData, level: number): number {
  return curveStep(rules.enhance.alloy, level);
}

/** Gold to go from `level` to `level + 1`. */
export function goldStep(rules: GearRulesData, level: number): number {
  return curveStep(rules.enhance.gold, level);
}

function curveStep(
  term: { readonly coefficient: number; readonly exponent: number },
  level: number,
): number {
  const at = Number.isFinite(level) ? Math.max(Math.floor(level), 1) : 1;
  const coefficient = Number.isFinite(term.coefficient) ? Math.max(term.coefficient, 0) : 0;
  const exponent = Number.isFinite(term.exponent) ? term.exponent : 1;
  return Math.max(Math.round(coefficient * Math.pow(at, exponent)), 1);
}

/** What taking this piece up one level costs right now. */
export function enhanceCost(rules: GearRulesData, item: GearItem): CurrencyAmounts {
  const level = clampGearLevel(rules, item.grade, item.level);
  return { alloy: num(alloyStep(rules, level)), gold: num(goldStep(rules, level)) };
}

/** `true` when this piece has further to climb. */
export function canEnhance(rules: GearRulesData, item: GearItem): boolean {
  return clampGearLevel(rules, item.grade, item.level) < maxGearLevel(rules, item.grade);
}

/**
 * Takes one piece up one level, charging alloy and gold.
 *
 * One level per call rather than a target level, and the asymmetry with `levelUp` is intentional:
 * a character's levels are bought dozens at a time against a curve the player is reading, while a
 * gear level is a step whose cost the sheet is showing right now. `enhanceToAffordable` is the
 * bulk form, and it is built on this rather than beside it.
 *
 * Alloy is charged from the wallet rather than from a per-item progress bar. A level is either
 * bought or it is not, and material that does not reach the next step stays where the player can
 * spend it on something else instead of being stranded on an object they have moved on from.
 */
export function enhance(state: GameState, itemId: string, rules: GearRulesData): GearResult {
  const item = findGear(state, itemId);
  if (item === undefined) {
    return fail('unknown-item');
  }
  if (!canEnhance(rules, item)) {
    return fail('max-level');
  }

  const cost = enhanceCost(rules, item);
  if (!canAfford(state.wallet, cost)) {
    return fail('insufficient-currency');
  }

  const next: GearItem = { ...item, level: clampGearLevel(rules, item.grade, item.level) + 1 };
  return {
    ok: true,
    state: {
      ...state,
      wallet: debit(state.wallet, cost),
      gear: state.gear.map((held) => (held.id === itemId ? next : held)),
    },
  };
}

/**
 * Feeds pieces into another one: salvages the material and spends it, in a single action.
 *
 * **This is the shape milestone 12 asked for — "gear is enhanced by using other gear and gold" —
 * built on top of the two operations rather than instead of them.** The salvage step is not hidden:
 * whatever the material was worth beyond the levels it bought stays in the wallet as alloy, so
 * feeding a relic into a piece that was one level off its cap does not evaporate the difference.
 *
 * Refuses if the target is among the material. Feeding a piece into itself is a request with no
 * sensible reading, and the arithmetic that would result — salvage it, then enhance the thing that
 * no longer exists — is exactly the kind that produces a plausible wrong answer.
 */
export function useAsMaterial(
  state: GameState,
  targetId: string,
  materialIds: readonly string[],
  rules: GearRulesData,
): GearResult {
  const target = findGear(state, targetId);
  if (target === undefined) {
    return fail('unknown-item');
  }
  if (materialIds.includes(targetId)) {
    return fail('material-is-target');
  }
  if (!canEnhance(rules, target)) {
    return fail('max-level');
  }

  const melted = salvage(state, materialIds, rules);
  if (!melted.ok) {
    return melted;
  }
  const raised = enhanceToAffordable(melted.state, targetId, rules);
  // Material that does not add up to a whole level is **not** a failed action. The pieces are gone
  // and their alloy is in the wallet, which is the honest outcome and the one a player can act on;
  // reporting failure here would discard the salvage and leave them exactly where they started
  // minus the gear they chose to melt.
  return raised.ok ? raised : { ok: true, state: melted.state };
}

/** Takes one piece as far up as the wallet reaches, or to its grade's cap. */
export function enhanceToAffordable(
  state: GameState,
  itemId: string,
  rules: GearRulesData,
): GearResult {
  let current = state;
  let raised = false;
  for (;;) {
    const step = enhance(current, itemId, rules);
    if (!step.ok) {
      // The first step failing is a genuine failure the UI should report; a later one is simply
      // where the wallet ran out, which is the expected end of a bulk raise rather than an error.
      return raised ? { ok: true, state: current } : step;
    }
    current = step.state;
    raised = true;
  }
}

/**
 * Salvages pieces into alloy.
 *
 * Refuses if **any** named piece is equipped, rather than salvaging the rest and reporting a
 * partial success. A partial result is the shape that makes a multi-select destructive action
 * dangerous: the player sees "done", and which pieces actually went is something they have to
 * reconstruct.
 */
export function salvage(
  state: GameState,
  itemIds: readonly string[],
  rules: GearRulesData,
): GearResult {
  if (itemIds.length === 0) {
    return { ok: true, state };
  }
  const worn = equippedBy(state);
  const targets: GearItem[] = [];
  for (const id of new Set(itemIds)) {
    const item = findGear(state, id);
    if (item === undefined) {
      return fail('unknown-item');
    }
    if (worn.has(id)) {
      return fail('item-equipped');
    }
    targets.push(item);
  }

  let alloy = ZERO;
  for (const item of targets) {
    alloy = alloy.add(salvageValue(rules, item));
  }
  const removed = new Set(targets.map((item) => item.id));
  return {
    ok: true,
    state: {
      ...state,
      gear: state.gear.filter((item) => !removed.has(item.id)),
      wallet: credit(state.wallet, { alloy }),
    },
  };
}

/**
 * Equips a piece, moving whatever was in that slot back to the bag.
 *
 * ⚠️ **Archetype is the gate and it is checked here, not at the display layer.** A piece forged for
 * a tank does nothing on a mage, and a UI that merely hides the option would let a stale snapshot
 * or a deep link produce a loadout the simulation would then happily pay out on.
 *
 * Taking the piece off whoever else was wearing it is deliberate rather than a refusal. One object
 * has one wearer, and "unequip it from Rin first" is a step that exists only to make the player
 * navigate somewhere else and come back.
 */
export function equip(
  state: GameState,
  defId: string,
  itemId: string,
  characters: ReadonlyMap<string, CharacterData>,
): GearResult {
  const character = characters.get(defId);
  if (character === undefined) {
    return fail('unknown-character');
  }
  const owned = state.roster.find((entry) => entry.defId === defId);
  if (owned === undefined) {
    return fail('not-owned');
  }
  const item = findGear(state, itemId);
  if (item === undefined) {
    return fail('unknown-item');
  }
  if (item.archetype !== character.role) {
    return fail('wrong-archetype');
  }

  return {
    ok: true,
    state: {
      ...state,
      roster: state.roster.map((entry) => {
        if (entry.defId === defId) {
          return { ...entry, gear: { ...entry.gear, [item.slot]: itemId } };
        }
        // Whoever else held this piece loses it. Scanning every entry rather than only the known
        // holder keeps this correct against a save where two characters somehow claim the same id.
        return withoutItem(entry, itemId);
      }),
    },
  };
}

/**
 * The outcome of an {@link autoEquip}, which reports how much it moved as well as the new state.
 *
 * Same shape and same reason as {@link GearShopResult}: a run of this can legitimately change
 * nothing — a character already wearing the best the bag holds is the common case once the button
 * has been pressed once — and `ok` alone cannot tell that apart from a change the screen should
 * announce. A button that says "equipped" after doing nothing is the failure this field prevents.
 */
export type AutoEquipResult =
  | { readonly ok: true; readonly state: GameState; readonly equipped: number }
  | { readonly ok: false; readonly reason: GearFailure };

/**
 * Fills every slot with the best **spare** piece the bag holds for this character.
 *
 * ⚠️ **It draws only from unequipped gear, and never takes a piece off somebody else.** That is the
 * one place this deliberately does less than {@link equip}, which does steal — and the asymmetry is
 * the point. A manual equip is a player naming one piece and one wearer, so moving it is what they
 * asked for. Auto-equip is a bulk action with no such statement in it, and a bulk action that
 * silently stripped four other characters would make the button something to be afraid of. The cost
 * is real and worth stating: the best piece in the game for this character can sit on a benched
 * character and this will not fetch it. The picker still lists it, and equipping by hand still works.
 *
 * **Comparison is one scalar, and that is a property of the archetype gate rather than luck.** Every
 * candidate for a slot has already been filtered to this character's archetype *and* that slot, so
 * they all share an authored profile — which makes {@link gearScale} a total order over them and
 * "the best piece" a well-defined thing rather than a weighting somebody has to choose. Nothing here
 * needs the grade ladder to be strictly ordered by grade; a level-20 worn piece beating a level-1
 * sturdy one is simply a bigger number.
 *
 * A slot only changes when a candidate is **strictly** better than what is worn. Equal scale leaves
 * the piece alone, so pressing the button twice is a no-op rather than a shuffle between two
 * identical pieces — and a player who deliberately equipped one of two identical pieces keeps theirs.
 */
export function autoEquip(
  state: GameState,
  defId: string,
  rules: GearRulesData,
  characters: ReadonlyMap<string, CharacterData>,
): AutoEquipResult {
  const character = characters.get(defId);
  if (character === undefined) {
    return { ok: false, reason: 'unknown-character' };
  }
  const owned = state.roster.find((entry) => entry.defId === defId);
  if (owned === undefined) {
    return { ok: false, reason: 'not-owned' };
  }

  const held = new Map(state.gear.map((item) => [item.id, item]));
  const spare = unequippedGear(state).filter((item) => item.archetype === character.role);

  const gear: Partial<Record<GearSlot, string>> = { ...owned.gear };
  let equipped = 0;

  for (const slot of GEAR_SLOTS) {
    const wornId = owned.gear[slot];
    const worn = wornId === undefined ? undefined : held.get(wornId);
    let bestScale = worn === undefined ? 0 : gearScale(rules, worn, character.faction);
    let best: GearItem | undefined;

    for (const item of spare) {
      if (item.slot !== slot) {
        continue;
      }
      const scale = gearScale(rules, item, character.faction);
      // Strictly better to displace what is worn; the id breaks a tie between two equally good
      // spares so the same bag always produces the same loadout. Determinism here is not cosmetic —
      // a save replayed through the repair pass has to land on the same answer twice.
      if (scale > bestScale || (best !== undefined && scale === bestScale && item.id < best.id)) {
        bestScale = scale;
        best = item;
      }
    }

    if (best !== undefined) {
      gear[slot] = best.id;
      equipped++;
    }
  }

  if (equipped === 0) {
    return { ok: true, state, equipped: 0 };
  }

  return {
    ok: true,
    state: {
      ...state,
      roster: state.roster.map((entry) => (entry.defId === defId ? { ...entry, gear } : entry)),
    },
    equipped,
  };
}

/** Takes a piece off, leaving it in the bag. */
export function unequip(state: GameState, defId: string, slot: GearSlot): GearResult {
  const owned = state.roster.find((entry) => entry.defId === defId);
  if (owned === undefined) {
    return fail('not-owned');
  }
  if (owned.gear[slot] === undefined) {
    return fail('slot-empty');
  }
  const gear = { ...owned.gear };
  delete gear[slot];
  return {
    ok: true,
    state: {
      ...state,
      roster: state.roster.map((entry) => (entry.defId === defId ? { ...entry, gear } : entry)),
    },
  };
}

/** A roster entry with one item id removed from whichever slot held it. */
function withoutItem(owned: OwnedCharacter, itemId: string): OwnedCharacter {
  let gear: Record<string, string> | undefined;
  for (const slot of GEAR_SLOTS) {
    if (owned.gear[slot] === itemId) {
      gear ??= { ...owned.gear };
      delete gear[slot];
    }
  }
  return gear === undefined ? owned : { ...owned, gear };
}

/**
 * Repairs the bag and every loadout against the content this build ships.
 *
 * Runs on **every load**, beside `reconcileClearedStages` and `grantStarters`, rather than behind a
 * version gate — it only ever removes things that cannot be rendered or resolved, so a healthy save
 * comes back untouched and the identity of the returned object is what tells the caller so.
 *
 * Five kinds of damage, and they mean different things:
 *
 * - A piece naming a slot, archetype or grade this build does not ship is **dropped**. There is
 *   nothing to clamp it to that would not be inventing content.
 * - A piece with a damaged level is **kept and clamped**, because the object is still real and only
 *   its progress is wrong. Same distinction `readRoster` draws about a character.
 * - A loadout reference to a piece that is not in the bag is **dropped**. So is one whose piece
 *   sits in the wrong slot, or whose archetype no longer matches its wearer — the latter is
 *   reachable without any corruption at all, by a build that re-authors a character's role.
 * - A piece claimed by two characters is left with the **first** claimant in roster order, which is
 *   arbitrary but has to be decided: leaving both is the one shape that pays a bonus twice.
 * - Unequipped pieces past the limit are **salvaged**, worst first, exactly as a drop overflowing
 *   the bag would be.
 */
export function repairLoadouts(
  state: GameState,
  characters: ReadonlyMap<string, CharacterData>,
  rules: GearRulesData,
): GameState {
  const grades = rules.grades.length;
  let changed = false;

  const gear: GearItem[] = [];
  const seen = new Set<string>();
  for (const item of state.gear) {
    const known =
      typeof item.id === 'string' &&
      !seen.has(item.id) &&
      GEAR_SLOTS.includes(item.slot) &&
      rules.profiles[item.archetype] !== undefined &&
      Number.isInteger(item.grade) &&
      item.grade >= 0 &&
      item.grade < grades;
    if (!known) {
      changed = true;
      continue;
    }
    seen.add(item.id);
    const level = clampGearLevel(rules, item.grade, item.level);
    if (level !== item.level) {
      changed = true;
      gear.push({ ...item, level });
    } else {
      gear.push(item);
    }
  }

  const held = new Map(gear.map((item) => [item.id, item]));
  const claimed = new Set<string>();
  const roster = state.roster.map((owned) => {
    const role = characters.get(owned.defId)?.role;
    let loadout: Record<string, string> | undefined;
    for (const slot of GEAR_SLOTS) {
      const id = owned.gear[slot];
      if (id === undefined) {
        continue;
      }
      const item = held.get(id);
      // All three clauses matter and none is redundant: the piece has to exist, it has to be in
      // the slot it claims, and its archetype has to still match its wearer — the last of which a
      // build that re-authors a character's role reaches with no corruption involved at all.
      const legal = item?.slot === slot && role !== undefined && item.archetype === role;
      if (!legal || claimed.has(id)) {
        loadout ??= { ...owned.gear };
        delete loadout[slot];
        changed = true;
        continue;
      }
      claimed.add(id);
    }
    return loadout === undefined ? owned : { ...owned, gear: loadout };
  });

  const repaired: GameState = changed ? { ...state, gear, roster } : state;

  const limit = Math.max(Math.floor(rules.inventoryLimit), 0);
  const loose = repaired.gear.reduce(
    (count, item) => (claimed.has(item.id) ? count : count + 1),
    0,
  );
  return loose <= limit ? repaired : overflowInto(repaired, rules, claimed);
}

/** Salvages the worst unequipped pieces until the bag is inside its limit. */
function overflowInto(
  state: GameState,
  rules: GearRulesData,
  equippedIds: ReadonlySet<string>,
): GameState {
  const limit = Math.max(Math.floor(rules.inventoryLimit), 0);
  const kept = state.gear.filter((item) => equippedIds.has(item.id));
  const ranked = state.gear
    .filter((item) => !equippedIds.has(item.id))
    .sort((a, b) => {
      const gap = salvageValue(rules, b) - salvageValue(rules, a);
      return gap !== 0 ? gap : a.id.localeCompare(b.id);
    });

  let alloy = ZERO;
  for (const item of ranked.slice(limit)) {
    alloy = alloy.add(salvageValue(rules, item));
  }
  return {
    ...state,
    gear: [...kept, ...ranked.slice(0, limit)],
    wallet: alloy.gt(ZERO) ? credit(state.wallet, { alloy }) : state.wallet,
  };
}

/** An empty loadout, re-exported so callers building a roster entry need one import. */
export { emptyLoadout };

/** The loadout a character is wearing, or an empty one when they own nothing. */
export function loadoutOf(state: GameState, defId: string): GearLoadout {
  return state.roster.find((owned) => owned.defId === defId)?.gear ?? emptyLoadout();
}
