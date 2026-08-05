import { canAfford, debit } from '../currency';
import { num, type Numeric } from '../numeric';
import { derivedStream } from '../rng';
import { type GameState } from '../state';
import { addGear, type GearFailure, type GearResult, type GearSpec, gearId } from './inventory';
import { gradeWeights, rollGear, weightedIndex } from './roll';
import { gradeAt } from './stats';
import { type GearOffer, type GearRulesData } from './types';

/**
 * The gear shop, which restocks on a clock and is generated rather than stored.
 *
 * ## Nothing about the stock is saved, and that is the whole design
 *
 * A shop that persisted its stock would need the stock written into the save, migrated when the
 * grade ladder changed, and repaired when it named content a build no longer ships. Deriving it
 * instead means the save holds two numbers — which refresh the run is looking at, and which offers
 * it has already taken — and the six items are recomputed identically every time from the run's own
 * seed.
 *
 * ⚠️ **That is also what makes rerolling impossible rather than merely detectable.** Force-quitting
 * to reroll a shop is the reflex any generated stock invites, and the usual answer is to persist
 * the roll so it cannot be re-taken. Deriving from `deriveSeed(seed, \`gear-shop:${slot}\`)` is the
 * stronger version of the same guarantee: there is nothing to re-take, because the answer is a
 * function of the seed and the hour. This project has **no anti-cheat by design**, so an approach
 * that removes the incentive structurally is worth far more than one that would have to police it.
 *
 * ## Core still has no clock
 *
 * The refresh index is a **number the caller supplies**, exactly as `resume(state, nowMs)` takes
 * the time. `ui/` divides `Date.now()` by the authored refresh period and hands the quotient in;
 * nothing in here reads a clock, and the balance sweep can sit the shop at any hour it likes.
 *
 * ## Prices are seconds of income, not amounts
 *
 * The same trick `rewardSeconds` plays on the stage lump. A gold price authored as a flat number is
 * a number that is unaffordable in chapter 1 and pocket change in chapter 4, so it would have to be
 * authored per band — one more table to keep aligned with a ladder that runs to thousands of
 * stages. Priced in seconds of the run's own gold income, one number means the same thing forever.
 *
 * The rate is floored on the way in rather than the price being floored on the way out: a brand-new
 * run earns nothing per second, and a price computed from zero is a free relic.
 */

/** Which stocking of the shop `nowMs` falls in. The caller's clock, arithmetic done here. */
export function gearShopSlot(rules: GearRulesData, nowMs: number): number {
  const period = Number.isFinite(rules.shop.refreshMs) ? Math.max(rules.shop.refreshMs, 1) : 1;
  const at = Number.isFinite(nowMs) ? Math.max(nowMs, 0) : 0;
  return Math.floor(at / period);
}

/** Milliseconds until the shop restocks, for the countdown on the screen. */
export function msUntilRestock(rules: GearRulesData, nowMs: number): number {
  const period = Number.isFinite(rules.shop.refreshMs) ? Math.max(rules.shop.refreshMs, 1) : 1;
  const at = Number.isFinite(nowMs) ? Math.max(nowMs, 0) : 0;
  return period - (at % period);
}

/** What one piece of this grade costs, in gold, at this run's income. */
export function offerPrice(rules: GearRulesData, grade: number, goldPerSecond: Numeric): Numeric {
  const rung = gradeAt(rules, grade);
  const seconds = rung === undefined || !Number.isFinite(rung.priceSeconds) ? 0 : rung.priceSeconds;
  const floor = Number.isFinite(rules.shop.minGoldPerSecond)
    ? Math.max(rules.shop.minGoldPerSecond, 0)
    : 0;
  const rate = goldPerSecond.gt(floor) ? goldPerSecond : num(floor);
  return rate.mul(Math.max(seconds, 0)).ceil();
}

/**
 * The stocking for one refresh slot, priced against this run.
 *
 * The offer's `item` carries the id it **would** be minted with, so the screen can key a list on
 * something stable without the purchase having happened yet. That id is recomputed at purchase
 * time from the live counter rather than trusted from here — two purchases inside one refresh must
 * not both claim `g41`, and the offer was built before the first of them moved the counter.
 */
export function gearShopOffers(
  state: GameState,
  rules: GearRulesData,
  factions: readonly string[],
  slot: number,
): readonly GearOffer[] {
  const count = Number.isFinite(rules.shop.offers) ? Math.max(Math.floor(rules.shop.offers), 0) : 0;
  if (count === 0) {
    return [];
  }

  const draw = derivedStream(state.rng.seed, `gear-shop:${Math.max(Math.floor(slot), 0)}`);
  // Stock quality tracks the clear count rather than the party's current position, so a player
  // parked on a wall keeps the shop they earned instead of watching it regress with them. It is
  // the same field the crystal rate reads, and for the same reason: a quantity earned means the
  // same thing however the ladder is cut.
  const weights = gradeWeights(rules, state.clearedStages + 1);
  const taken = new Set(state.gearShop.slot === slot ? state.gearShop.purchased : []);

  const offers: GearOffer[] = [];
  for (let index = 0; index < count; index++) {
    const spec = rollGear(rules, factions, draw);
    const grade = weightedIndex(weights, draw);
    offers.push({
      index,
      item: {
        id: gearId(state.gearMinted + index),
        slot: spec.slot,
        archetype: spec.archetype,
        grade,
        alignment: spec.alignment,
        level: 1,
      },
      price: offerPrice(rules, grade, state.rates.gold),
      purchased: taken.has(index),
    });
  }
  return offers;
}

/** Why a shop purchase could not be made. */
export type GearShopFailure = GearFailure | 'unknown-offer' | 'already-purchased';

export type GearShopResult =
  | { readonly ok: true; readonly state: GameState }
  | { readonly ok: false; readonly reason: GearShopFailure };

/**
 * Buys one offer.
 *
 * The refresh slot is an argument rather than read from a clock, and it is also what resets the
 * purchase ledger: a purchase against a slot the state has not seen before wipes the previous
 * slot's list rather than appending to it. That is what makes "the shop refreshes hourly" true
 * without anything having to run on the hour — the reset happens the first time somebody looks
 * after it, which is the only moment it can be observed.
 *
 * **A run that was away for five hours gets one shop, not five.** Missed stockings are simply not
 * offered, which is the same posture the offline solver takes toward everything except income:
 * time away pays the rates it always paid and does not accumulate discrete events. A backlog of
 * shops would be a reason to log in on a schedule, which is the pattern this project rejects.
 */
export function buyGear(
  state: GameState,
  rules: GearRulesData,
  factions: readonly string[],
  slot: number,
  offerIndex: number,
): GearShopResult {
  const offers = gearShopOffers(state, rules, factions, slot);
  const offer = offers[offerIndex];
  if (offer === undefined) {
    return { ok: false, reason: 'unknown-offer' };
  }
  if (offer.purchased) {
    return { ok: false, reason: 'already-purchased' };
  }

  const cost = { gold: offer.price };
  if (!canAfford(state.wallet, cost)) {
    return { ok: false, reason: 'insufficient-currency' };
  }

  const current = Math.max(Math.floor(slot), 0);
  const purchased =
    state.gearShop.slot === current
      ? [...state.gearShop.purchased, offerIndex].sort((a, b) => a - b)
      : [offerIndex];

  const spec: GearSpec = {
    slot: offer.item.slot,
    archetype: offer.item.archetype,
    grade: offer.item.grade,
    alignment: offer.item.alignment,
  };
  const paid: GameState = {
    ...state,
    wallet: debit(state.wallet, cost),
    gearShop: { slot: current, purchased },
  };
  const granted: GearResult = { ok: true, state: addGear(paid, [spec], rules).state };
  return granted;
}
