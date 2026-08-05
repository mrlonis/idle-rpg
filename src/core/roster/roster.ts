import { canAfford, debit } from '../currency';
import { emptyLoadout } from '../gear/types';
import {
  formationMembers,
  formationSize,
  type GameState,
  type PartyFormation,
  rowCapacity,
} from '../state';
import {
  clampLevel,
  type LevelCurveData,
  levelCapFor,
  levelCost,
  maxAffordableLevel,
} from './level';
import { clampRarityIndex, startRarityIndex } from './rarity';
import { effectiveLevel, maxAffordableResonance, resonanceFloor, resonancePlan } from './resonance';
import { MAX_RARITY_INDEX, type CharacterData, type OwnedCharacter } from './types';

/**
 * Owning, levelling and fielding characters.
 *
 * Content reaches these functions as a `ReadonlyMap` of definitions rather than by import:
 * `core/` cannot see `data/`, and handing the lookup in is also what lets a balance sweep
 * drive the roster from fixtures.
 *
 * ## Every operation reports why it failed
 *
 * These return a {@link RosterResult} rather than throwing or silently returning the state
 * unchanged. A no-op that looks identical to success is the kind of thing that reaches a
 * player as "the button does nothing", and the UI needs the reason to say something better
 * than "that didn't work".
 */

/** Definitions, keyed by character id. Built by `ui/` from `data/`. */
export type CharacterLookup = ReadonlyMap<string, CharacterData>;

/** Why an operation could not be performed. */
export type RosterFailure =
  | 'unknown-character'
  | 'not-owned'
  | 'already-owned'
  | 'max-rarity'
  | 'insufficient-copies'
  | 'insufficient-fodder'
  | 'wrong-faction'
  | 'fodder-is-self'
  | 'level-capped'
  | 'insufficient-currency'
  | 'row-full'
  | 'duplicate-party-member';

export type RosterResult =
  | { readonly ok: true; readonly state: GameState }
  | { readonly ok: false; readonly reason: RosterFailure };

const fail = (reason: RosterFailure): RosterResult => ({ ok: false, reason });

/** The player's entry for a character, or `undefined` if they do not own it. */
export function findOwned(state: GameState, defId: string): OwnedCharacter | undefined {
  return state.roster.find((owned) => owned.defId === defId);
}

/** Replaces one roster entry, leaving order untouched. */
function replaceOwned(state: GameState, next: OwnedCharacter): GameState {
  return {
    ...state,
    roster: state.roster.map((owned) => (owned.defId === next.defId ? next : owned)),
  };
}

/**
 * Grants copies of a character.
 *
 * A character the player does not own is created at its tier's starting rarity, level 1, with
 * any remaining copies banked as spares — so a ten-pull that lands three of the same new
 * character produces one character and two spares rather than three entries.
 *
 * Copies of a character already at `ascended-5` are **not** banked: there is nothing left to
 * ascend, so the caller converts them to spark instead. `overflow` reports how many landed
 * that way, and the caller — {@link import('../gacha/pull').pull} — is what mints the spark,
 * because the conversion rate is banner content and `core/roster/` has no business knowing it.
 */
export function grantCopies(
  state: GameState,
  character: CharacterData,
  count: number,
  rarityOverride?: number,
): { readonly state: GameState; readonly overflow: number; readonly isNew: boolean } {
  // `Math.max(NaN, 0)` is `NaN`, not 0, so a non-finite count has to be screened out before the
  // clamp rather than by it — otherwise a damaged count creates a roster entry with `NaN` spares.
  const copies = Number.isFinite(count) ? Math.max(Math.floor(count), 0) : 0;
  if (copies === 0) {
    return { state, overflow: 0, isNew: false };
  }

  const existing = findOwned(state, character.id);
  if (existing === undefined) {
    const start = startRarityIndex(character.tier);
    const entry: OwnedCharacter = {
      defId: character.id,
      // Never below the tier's own starting rung: an override exists to let a lucky pull
      // arrive higher up the ladder, never to place a character somewhere it could not
      // legally be and whose ascension costs would then be computed from the wrong floor.
      rarity:
        rarityOverride === undefined ? start : Math.max(clampRarityIndex(rarityOverride), start),
      level: 1,
      copies: copies - 1,
      gear: emptyLoadout(),
    };
    return {
      state: { ...state, roster: [...state.roster, entry] },
      overflow: 0,
      isNew: true,
    };
  }

  if (existing.rarity >= MAX_RARITY_INDEX) {
    return { state, overflow: copies, isNew: false };
  }
  return {
    state: replaceOwned(state, { ...existing, copies: existing.copies + copies }),
    overflow: 0,
    isNew: false,
  };
}

/**
 * Seeds a run with its starting characters and forms them up.
 *
 * Called by `ui/` on load rather than by `newGame`, because the starters are content and
 * `core/` cannot read `data/`. It is idempotent, which is what lets it double as repair: a
 * save that arrives with an empty roster — damaged, or written before characters existed —
 * gets a working party back instead of a game with nobody in it.
 *
 * The starting **formation** is content too, and for the same reason: `core/` has no way to
 * know that the Dwarf is the one who belongs in front. Taking a formation rather than a flat
 * list of ids also keeps one source of truth — who a run starts with is exactly who is
 * standing somewhere in it.
 */
export function grantStarters(
  state: GameState,
  starters: PartyFormation,
  characters: CharacterLookup,
): GameState {
  let next = state;
  for (const id of formationMembers(starters)) {
    const character = characters.get(id);
    if (character === undefined || findOwned(next, id) !== undefined) {
      continue;
    }
    next = grantCopies(next, character, 1).state;
  }

  if (formationSize(next.formation) === 0) {
    const owned = (id: string): boolean => findOwned(next, id) !== undefined;
    next = {
      ...next,
      formation: {
        front: starters.front.filter(owned).slice(0, rowCapacity('front')),
        back: starters.back.filter(owned).slice(0, rowCapacity('back')),
      },
    };
  }
  return next;
}

/**
 * Sets the whole formation, rank by rank.
 *
 * Order within a rank is load-bearing — it breaks ties in ATB turn order and in targeting —
 * so this preserves the order given rather than sorting. An empty formation is allowed: a
 * player mid-reshuffle has not done anything wrong, and `simulateBattle` treats a party of
 * nobody as an immediate defeat rather than as an error.
 */
export function setFormation(
  state: GameState,
  formation: PartyFormation,
  characters: CharacterLookup,
): RosterResult {
  if (
    formation.front.length > rowCapacity('front') ||
    formation.back.length > rowCapacity('back')
  ) {
    return fail('row-full');
  }

  const members = formationMembers(formation);
  if (new Set(members).size !== members.length) {
    return fail('duplicate-party-member');
  }
  for (const id of members) {
    if (characters.get(id) === undefined) {
      return fail('unknown-character');
    }
    if (findOwned(state, id) === undefined) {
      return fail('not-owned');
    }
  }

  return {
    ok: true,
    state: { ...state, formation: { front: [...formation.front], back: [...formation.back] } },
  };
}

/** The formation with `defId` removed from whichever rank it was standing in. */
export function withoutMember(formation: PartyFormation, defId: string): PartyFormation {
  return {
    front: formation.front.filter((id) => id !== defId),
    back: formation.back.filter((id) => id !== defId),
  };
}

/**
 * Puts a character into a rank, taking it out of the other one first.
 *
 * Moving between ranks is therefore the same operation as joining, which is what stops a
 * character from ever standing in both — the state that would let one fighter act twice.
 */
export function placeInRow(
  state: GameState,
  defId: string,
  row: 'front' | 'back',
  characters: CharacterLookup,
): RosterResult {
  const base = withoutMember(state.formation, defId);
  const rank = [...base[row], defId];
  return setFormation(
    state,
    row === 'front' ? { front: rank, back: base.back } : { front: base.front, back: rank },
    characters,
  );
}

/** Takes a character out of the formation. Benching somebody who is not fielded is a no-op. */
export function benchMember(
  state: GameState,
  defId: string,
  characters: CharacterLookup,
): RosterResult {
  return setFormation(state, withoutMember(state.formation, defId), characters);
}

/**
 * Levels a character up to `targetLevel`, spending gold, XP and essence.
 *
 * Charged level by level rather than by a closed form, because essence is only charged every
 * tenth level — there is no formula to invert. The loop is bounded by the level cap, which is
 * content, not by anything the player can inflate.
 *
 * Levelling past the rarity's cap is refused rather than clamped. Silently stopping early
 * would spend the player's currency on fewer levels than they asked for, which is worse than
 * telling them to ascend first.
 *
 * **Charged from the character's effective level, not its invested one.** Resonance is what
 * carries a bench character to the floor, and charging from the invested level would sell those
 * levels back: a level-1 character under a floor of 200 would cost the full climb to reach 201,
 * and — far worse — the first two hundred of those levels would buy nothing visible at all.
 * Starting the meter at the effective level is what makes "levels are free below the floor" true
 * of the price as well as of the display. It cannot let a character *lose* a level either, since
 * the target is always above where the charging started.
 */
export function levelUp(
  state: GameState,
  defId: string,
  targetLevel: number,
  curve: LevelCurveData,
): RosterResult {
  const owned = findOwned(state, defId);
  if (owned === undefined) {
    return fail('not-owned');
  }

  const from = effectiveLevel(curve, owned, resonanceFloor(state.roster));
  const target = Math.floor(targetLevel);
  if (target <= from) {
    return { ok: true, state };
  }
  if (target > levelCapFor(curve, owned.rarity)) {
    return fail('level-capped');
  }

  let wallet = state.wallet;
  for (let level = from; level < target; level++) {
    const cost = levelCost(curve, level);
    if (!canAfford(wallet, cost)) {
      return fail('insufficient-currency');
    }
    wallet = debit(wallet, cost);
  }

  return {
    ok: true,
    state: replaceOwned({ ...state, wallet }, { ...owned, level: target }),
  };
}

/** Levels a character as far as the wallet and its rarity allow, in one call. */
export function levelUpToAffordable(
  state: GameState,
  defId: string,
  curve: LevelCurveData,
): RosterResult {
  const owned = findOwned(state, defId);
  if (owned === undefined) {
    return fail('not-owned');
  }
  const from = effectiveLevel(curve, owned, resonanceFloor(state.roster));
  const target = maxAffordableLevel(curve, state.wallet, from, owned.rarity);
  if (target <= from) {
    return fail(
      from >= levelCapFor(curve, owned.rarity) ? 'level-capped' : 'insufficient-currency',
    );
  }
  return levelUp(state, defId, target, curve);
}

/**
 * Raises the resonance floor to `target`, levelling everyone it takes in one transaction.
 *
 * **Atomic on purpose.** `maxAffordableLevel` makes a partial application easy to write and it
 * is the wrong behaviour: levelling three of five because the fourth is unaffordable drifts the
 * anchors apart and quietly breaks the model the whole feature teaches, which is that the top
 * five share a level and that level is the floor. The plan is priced in full before anything is
 * spent — breakthrough levels are lumpy enough that discovering the shortfall partway through is
 * a real outcome rather than a hypothetical one.
 *
 * A target at or below the current floor is a no-op success. `level-capped` means no five
 * characters can stand on `target` at all, which is a call to ascend somebody rather than to
 * earn more.
 */
export function raiseResonance(
  state: GameState,
  target: number,
  curve: LevelCurveData,
): RosterResult {
  if (state.roster.length === 0) {
    return fail('not-owned');
  }
  if (Math.floor(target) <= resonanceFloor(state.roster)) {
    return { ok: true, state };
  }

  const plan = resonancePlan(state.roster, curve, target);
  if (plan === null) {
    return fail('level-capped');
  }
  if (!canAfford(state.wallet, plan.cost)) {
    return fail('insufficient-currency');
  }

  const reached = new Map(plan.raises.map((raise) => [raise.defId, raise.to]));
  return {
    ok: true,
    state: {
      ...state,
      wallet: debit(state.wallet, plan.cost),
      roster: state.roster.map((owned) => {
        const to = reached.get(owned.defId);
        // `max` rather than assignment: an anchor already above the target is in the plan's set
        // and must not be dragged back down to it. Invested levels only ever rise.
        return to === undefined ? owned : { ...owned, level: Math.max(owned.level, to) };
      }),
    },
  };
}

/** Raises the floor as far as the wallet allows, in one call. */
export function raiseResonanceToAffordable(state: GameState, curve: LevelCurveData): RosterResult {
  if (state.roster.length === 0) {
    return fail('not-owned');
  }
  const floor = resonanceFloor(state.roster);
  const target = maxAffordableResonance(state.roster, state.wallet, curve);
  if (target <= floor) {
    return fail(
      resonancePlan(state.roster, curve, floor + 1) === null
        ? 'level-capped'
        : 'insufficient-currency',
    );
  }
  return raiseResonance(state, target, curve);
}

/**
 * Repairs one roster entry against the content this build actually ships.
 *
 * Rarity is clamped into the ladder and never below the tier's starting rung — an
 * `ascended`-tier character at `rare` would be a character that cannot legally exist and
 * whose ascension costs would be computed from the wrong starting point. Level is clamped to
 * the rarity's cap for the same reason.
 */
export function repairOwned(
  owned: OwnedCharacter,
  character: CharacterData,
  curve: LevelCurveData,
): OwnedCharacter {
  const floor = startRarityIndex(character.tier);
  const rarity = Math.max(clampRarityIndex(owned.rarity), floor);
  return {
    defId: owned.defId,
    rarity,
    level: clampLevel(curve, owned.level, rarity),
    copies: Number.isFinite(owned.copies) ? Math.max(Math.floor(owned.copies), 0) : 0,
    // Carried through rather than checked. A loadout is a set of ids into `GameState.gear`, and
    // this function is handed one character — it cannot see the inventory, so it cannot know
    // whether an id resolves, whether the piece is in the right slot, or whether two characters
    // claim the same one. `repairLoadouts` in `core/gear/inventory.ts` is the pass that can, and
    // it runs on every load beside `reconcileClearedStages`.
    gear: owned.gear,
  };
}
