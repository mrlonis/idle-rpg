import { LowerCasePipe } from '@angular/common';
import { Component, computed, inject, input, linkedSignal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  type GearFailure,
  type GearSlot,
  growthMultiplier,
  kitSlots,
  MAX_ENERGY,
  nextSkillUnlock,
  num,
  PARTY_SIZE,
  rarityLabel,
  type RosterFailure,
  scaleStats,
  skillCeiling,
  type SkillData,
  type SkillTarget,
  ticksToMs,
} from '../core';
import { characterById, GROWTH_RULES, KIT } from './content';
import { formatAmounts, formatNumeric } from './format-numeric';
import { GameLoopService } from './game-loop.service';
import { type GearItemView, type GearSlotView, GearService } from './gear.service';
import { backTo } from './navigation';
import { RosterService } from './roster.service';
import { SIGNATURE_FAILURES, SignatureService } from './signature.service';

/**
 * Why a gear action was refused.
 *
 * Exhaustive over `GearFailure` rather than partial, unlike {@link FAILURE_MESSAGES} below. A
 * reason with no message surfaces as a button that silently does nothing, which is what returning
 * reasons at all was meant to prevent — and gear has only nine of them, so covering them all costs
 * nothing and makes a new one a compile error.
 */
const GEAR_FAILURES: Readonly<Record<GearFailure, string>> = {
  'unknown-item': 'That piece is no longer in your bag.',
  'unknown-character': 'That character is not in this build.',
  'not-owned': 'You do not own this character.',
  'wrong-archetype': 'That piece was forged for a different archetype.',
  'item-equipped': 'That piece is being worn.',
  'slot-empty': 'Nothing is in that slot.',
  'max-level': 'Already at this grade’s maximum level.',
  'material-is-target': 'A piece cannot be its own material.',
  'insufficient-currency': 'Not enough alloy or gold.',
};

/**
 * Why a levelling action was refused, in words a player can act on.
 *
 * Levelling is the only thing this sheet spends on since ascension moved to the Altar, so the
 * ascension reasons are gone from here rather than kept "just in case" — a message for an outcome
 * nothing on the screen can produce is a claim about the sheet that stopped being true.
 */
const FAILURE_MESSAGES: Partial<Record<RosterFailure, string>> = {
  'insufficient-currency': 'Not enough gold, XP or essence for that level.',
  'level-capped': 'Already at the level cap for this rarity. Ascend to raise it.',
  'not-owned': 'You do not own this character.',
};

/**
 * What each targeting rule means, in words rather than in jargon.
 *
 * The three single-target enemy rules are the ones worth spelling out, because they are the
 * whole mechanical content of the formation: whether a skill goes through the front rank or
 * around it is the difference between a character that can answer a protected healer and one
 * that cannot.
 */
const TARGET_LABELS: Readonly<Record<SkillTarget, string>> = {
  'enemy-front': 'Front row',
  'enemy-back': 'Back row',
  'enemy-lowest': 'Weakest foe',
  'enemy-highest': 'Strongest foe',
  'enemy-row-front': 'All front row',
  'enemy-row-back': 'All back row',
  'enemy-all': 'All foes',
  'ally-lowest': 'Hurt ally',
  'ally-afflicted': 'Afflicted ally',
  'ally-all': 'All allies',
  self: 'Self',
};

/**
 * How a skill is metered, phrased the way it is felt rather than as a raw number.
 *
 * Two answers since 8b, because there are two meters. A cooldown is quoted in seconds rather than
 * in the battle ticks it is authored in — ticks are a unit of the simulation and nothing the
 * player has ever been shown.
 */
function skillMeter(skill: SkillData): string {
  if (skill.ultimate === true) {
    return `Ultimate — ${MAX_ENERGY} energy`;
  }
  const cooldown = skill.cooldown ?? 0;
  return cooldown > 0 ? `${(ticksToMs(cooldown) / 1000).toFixed(1)}s cooldown` : 'No cooldown';
}

/**
 * One character's sheet: what it is, what it costs to improve, and where each of those happens.
 *
 * ## Ascension is explained here and performed at the Altar
 *
 * The panel stayed and its button left. What the panel is good at is the half of a rung that is
 * *about this character* — the price in its own copies, and which skill the next rung unlocks —
 * and none of that fits on a list of twenty-three rows. What the button was bad at is being the
 * only way to ascend: a player holding duplicates of nine characters had nine sheets to open, each
 * to make a decision with no alternative in it. See `altar-view.ts`.
 *
 * A rung costs spare copies of this character and nothing else, so the price is shown as held
 * against needed and there is nothing to choose.
 *
 * It used to be two prices — copies of this character *and* a quantity of same-faction fodder,
 * each quoted in ascended copies nobody holds and resolved here into the base copies they do —
 * over a list of which faction-mates could pay the second half. Keeping those two straight is
 * what makes a gacha ascension screen unreadable, and the fix in the end was upstream of the
 * screen rather than in it.
 */
@Component({
  selector: 'app-character-view',
  imports: [LowerCasePipe, RouterLink],
  templateUrl: './character-view.html',
  styleUrl: './character-view.scss',
})
export class CharacterView {
  private readonly roster = inject(RosterService);
  private readonly game = inject(GameLoopService);
  private readonly gear = inject(GearService);
  private readonly signatures = inject(SignatureService);

  /** How many characters set the shared level, for the resonance note under the level. */
  protected readonly partySize = PARTY_SIZE;

  /** From `/roster/:defId`, bound by the router rather than read off an `ActivatedRoute`. */
  readonly defId = input.required<string>();

  /**
   * Which screen sent the player here, from the `from` query parameter.
   *
   * Bound the same way `defId` is — `withComponentInputBinding` supplies query parameters as
   * inputs just as it supplies path parameters — so this sheet still never touches
   * `ActivatedRoute`. Optional by design: a bookmarked or hand-typed URL carries no origin, and
   * {@link backTo} answers for that case rather than leaving the player with no way out.
   */
  readonly from = input<string>();

  /**
   * Where the back link goes and what it calls itself.
   *
   * The sheet hangs off `/roster/:defId`, but the route is not the same claim as the origin: a
   * sheet opened from somewhere other than the roster would otherwise send the player to a
   * screen they were never on, which is the confusion this resolves. See {@link backTo}.
   */
  protected readonly back = computed(() => backTo(this.from()));

  /**
   * The last refusal, cleared as soon as anything succeeds — **and whenever the sheet changes
   * character**.
   *
   * ⚠️ **A `linkedSignal` keyed on {@link defId}, not a plain `signal`, and every piece of
   * per-sheet state on this component is one for the same reason.** Angular's default reuse
   * strategy keeps the *same component instance* when only a route parameter changes, so
   * navigating `/roster/rin` → `/roster/wren` updates the input and leaves every local signal
   * exactly as it was. A refusal earned on one character is a statement about that character, and
   * carrying it onto the next sheet tells the player something untrue about a screen they have
   * only just opened.
   *
   * `linkedSignal` rather than an `effect` that resets these: it is declarative, it needs no
   * scheduling, and it cannot be reached before the first read — an effect runs *after* the change
   * that triggered it, so there is a frame in which the stale message is still rendered.
   */
  protected readonly message = linkedSignal<string, string | null>({
    source: this.defId,
    computation: () => null,
  });

  protected readonly entry = computed(() => this.roster.entry(this.defId()));
  protected readonly definition = computed(() => characterById(this.defId()) ?? null);

  /** Stats at the character's current level and rarity, which is what it actually fights with. */
  protected readonly stats = computed(() => {
    const character = this.definition();
    const entry = this.entry();
    if (character === null || entry === null) {
      return null;
    }
    const scaled = scaleStats(
      character.stats,
      GROWTH_RULES,
      character.tier,
      entry.level,
      entry.rarity,
    );
    const percent = (value: number | undefined): string => `${Math.round((value ?? 0) * 100)}%`;

    // The four quantities first, because those are the ones that grow; then the scheduling
    // weight and the probabilities, which do not. Anything sitting at its default is omitted
    // rather than shown as a zero — a sheet listing "Physical pierce 0%" for eighteen of
    // twenty-three characters is a sheet nobody reads.
    const rows = [
      // `scaleStats` returns a JSON-safe stat block, so quantities arrive as exponential
      // strings — the same shape `data/` authors and the same shape combat parses.
      { label: 'HP', value: formatNumeric(num(scaled.hp)) },
      { label: 'ATK', value: formatNumeric(num(scaled.atk)) },
      { label: 'DEF', value: formatNumeric(num(scaled.def)) },
      // Unscaled by design — haste is a scheduling weight against a fixed ATB threshold,
      // `energyRegen` is a budget measured against a fixed 100-point bar, and the rest are
      // probabilities or percentage amplifiers. See `core/roster/stats.ts`.
      { label: 'Haste', value: String(scaled.haste) },
      { label: 'Crit', value: `${percent(scaled.critChance)} +${percent(scaled.critDamageAmp)}` },
    ];

    // Recovery is the fourth quantity and the only one a character can be authored without, so
    // it sits with the scaling stats but is shown only when there is something to show.
    if (scaled.recovery !== undefined) {
      rows.splice(3, 0, { label: 'Recovery', value: formatNumeric(num(scaled.recovery)) });
    }

    const optional: readonly (readonly [string, number | undefined])[] = [
      ['Attack speed', scaled.attackSpeed],
      ['Crit block', scaled.critBlock],
      ['Crit dmg resist', scaled.critDamageResist],
      ['Life leech', scaled.lifeLeech],
      ['Physical pierce', scaled.physicalPierce],
      ['Magic pierce', scaled.magicPierce],
      ['Physical resist', scaled.physicalResist],
      ['Magic resist', scaled.magicResist],
      ['Health regen', scaled.healthRegen],
      ['Received healing', scaled.receivedHealing],
      ['Dodge', scaled.dodge],
      ['Tenacity', scaled.tenacity],
      ['Insight', scaled.insight],
    ];
    for (const [label, value] of optional) {
      if (value !== undefined && value > 0) {
        // Attack speed is gauge per tick like haste, not a percentage, so it is the one entry
        // here that would read as nonsense multiplied by a hundred.
        rows.push({ label, value: label === 'Attack speed' ? String(value) : percent(value) });
      }
    }
    // Accuracy defaults to certainty rather than to nothing, so it is worth showing only when
    // a character was authored above or below it.
    if (scaled.accuracy !== undefined && scaled.accuracy !== 1) {
      rows.push({ label: 'Accuracy', value: percent(scaled.accuracy) });
    }
    // The bar is 100 for everybody, so what is worth showing is the rate this character fills it
    // at on its own — the rest of the fill is what fighting pays and is the same for the roster.
    if (scaled.energyRegen !== undefined && scaled.energyRegen > 0) {
      rows.push({ label: 'Energy regen', value: `${scaled.energyRegen}/turn` });
    }
    return rows;
  });

  /**
   * The character's kit, basic attack excluded — the **whole** kit, locked entries included.
   *
   * The list is what a character *is* and never changes; how much of it this character has
   * unlocked does, and that is the half the player is being asked to invest in. Showing only the
   * unlocked part would make a rung's reward invisible until after it was paid for, and would make
   * a two-skill common-tier character indistinguishable from a four-skill ascended-tier one on the
   * screen where that difference is the point.
   */
  protected readonly skills = computed(() => {
    const character = this.definition();
    const entry = this.entry();
    if (character === null || entry === null) {
      return [];
    }
    return kitSlots(character.skills ?? [], KIT, character.tier, entry.rarity).map((slot) => ({
      id: slot.skill.id,
      name: slot.skill.name,
      cost: skillMeter(slot.skill),
      target: TARGET_LABELS[slot.skill.target],
      unlocked: slot.unlocked,
      // Absent only for a skill no rung can reach, which content is asserted never to author —
      // so the template's fallback is a safety net rather than a case a player meets.
      unlocksAt: slot.unlocksAt === undefined ? null : rarityLabel(slot.unlocksAt),
    }));
  });

  /** How many skills this character's tier allows in total, for the footnote under the list. */
  protected readonly ceiling = computed(() => {
    const character = this.definition();
    return character === null ? null : skillCeiling(KIT, character.tier);
  });

  /**
   * The next skill an ascension buys, named on the ascension card.
   *
   * A rung's price is already shown in copies; this is the other half of the trade. Without it,
   * the one ascension that unlocks a skill looks exactly like the four that do not.
   *
   * **`imminent` is the difference between a promise and a receipt.** The card sits directly above
   * "next rung costs", so an unlock two rungs away phrased as though it were the next one is a
   * player paying for a skill they do not get. Only the rung immediately above the character's
   * current one is described as what ascending buys now.
   */
  protected readonly nextUnlock = computed(() => {
    const character = this.definition();
    const entry = this.entry();
    if (character === null || entry === null) {
      return null;
    }
    const slot = nextSkillUnlock(character.skills ?? [], KIT, character.tier, entry.rarity);
    if (slot?.unlocksAt === undefined) {
      return null;
    }
    return {
      name: slot.skill.name,
      at: rarityLabel(slot.unlocksAt),
      imminent: slot.unlocksAt === entry.rarity + 1,
    };
  });

  /** The compounded multiplier on this character's quantities, as the sheet reports it. */
  protected readonly multiplier = computed(() => {
    const character = this.definition();
    const entry = this.entry();
    if (character === null || entry === null) {
      return null;
    }
    return formatNumeric(
      growthMultiplier(GROWTH_RULES, character.tier, entry.level, entry.rarity),
      2,
    );
  });

  protected readonly nextLevelCost = computed(() => {
    const cost = this.entry()?.nextLevelCost;
    return cost === null || cost === undefined ? null : formatAmounts(cost);
  });

  /**
   * The five gear slots, and what this character's gear is currently worth.
   *
   * `slots()` and `bonusFor()` are plain methods on the service rather than signals, because they
   * are parameterised by a character id and a `computed` cannot take an argument. Wrapping them
   * here is what makes them reactive: both read the run's snapshot signal internally, and that
   * read happens inside this `computed`, so equipping a piece redraws the slot and the totals
   * together without either being cached.
   */
  protected readonly gearSlots = computed<readonly GearSlotView[]>(() =>
    this.gear.slots(this.defId()),
  );

  protected readonly gearBonus = computed(() => this.gear.bonusFor(this.defId()));

  /**
   * Which slot's picker is open, or `null`. One at a time.
   *
   * Keyed on {@link defId} for the reason {@link message} is: an open picker is a list of *this*
   * character's spare pieces, and carrying it to the next sheet leaves the player looking at a
   * picker they did not open, filled from a roster row that is no longer on screen.
   */
  protected readonly openSlot = linkedSignal<string, GearSlot | null>({
    source: this.defId,
    computation: () => null,
  });

  /**
   * What the last auto-equip did, or `null` before one has been pressed.
   *
   * Announced through `role="status"` rather than left to the slot rows to imply, because the
   * outcome a player most needs told about is the one where **nothing** moved: the button is
   * enabled either way, and a press that changes no row is otherwise indistinguishable from a
   * button that does not work.
   */
  protected readonly autoEquipNote = linkedSignal<string, string | null>({
    source: this.defId,
    computation: () => null,
  });

  protected toggleSlot(slot: GearSlot): void {
    this.openSlot.update((open) => (open === slot ? null : slot));
    this.message.set(null);
    this.autoEquipNote.set(null);
  }

  /**
   * Fills every slot with the best spare piece in the bag.
   *
   * The wording names the constraint rather than hiding it — pieces worn by other characters are
   * left alone, so a player who expected the best piece in the game to arrive here is told why it
   * did not, on the screen where they would otherwise go looking.
   */
  protected autoEquip(): void {
    const result = this.gear.autoEquip(this.defId());
    if (!result.ok) {
      this.message.set(GEAR_FAILURES[result.reason]);
      return;
    }
    this.message.set(null);
    this.openSlot.set(null);
    this.autoEquipNote.set(
      result.equipped === 0
        ? 'Already wearing the best spare gear in your bag. Pieces worn by other characters are left where they are.'
        : `Equipped ${result.equipped} ${result.equipped === 1 ? 'piece' : 'pieces'} from your bag.`,
    );
  }

  protected equip(slot: GearSlot, item: GearItemView): void {
    const result = this.gear.equip(this.defId(), item.id);
    if (result.ok) {
      this.openSlot.set(null);
      this.message.set(null);
      return;
    }
    this.message.set(GEAR_FAILURES[result.reason]);
  }

  protected unequip(slot: GearSlot): void {
    const result = this.gear.unequip(this.defId(), slot);
    if (result.ok) {
      this.openSlot.set(null);
      this.message.set(null);
      return;
    }
    this.message.set(GEAR_FAILURES[result.reason]);
  }

  protected readonly walletSummary = computed(() => {
    const wallet = this.game.wallet();
    return `${formatNumeric(wallet.gold)} gold · ${formatNumeric(wallet.xp)} XP · ${formatNumeric(wallet.essence)} essence`;
  });

  /**
   * The signature item panel, or `null` when this character has none.
   *
   * `null` is the common case — forty-two of the forty-nine characters — and the template draws
   * nothing at all for it. A permanently empty section reads as content that is missing rather
   * than as a rule the player has understood.
   */
  protected readonly signature = computed(() => {
    // Read through the snapshot signal so the panel recomputes when emblems are spent; the service
    // reads the same snapshot, and calling it without touching one here would leave the price and
    // the wallet line stale until something else moved.
    this.game.snapshot();
    return this.signatures.view(this.defId());
  });

  /** Emblems the run holds, formatted. */
  protected readonly emblemsHeld = computed(() => formatNumeric(this.signatures.held(), 0));

  /**
   * What refused the last signature purchase, or `null`. Kept apart from {@link message}.
   *
   * Keyed on {@link defId}, like every other piece of per-sheet state here — see {@link message}
   * for why a plain `signal` is wrong on a component the router reuses across parameters.
   */
  protected readonly signatureMessage = linkedSignal<string, string | null>({
    source: this.defId,
    computation: () => null,
  });

  protected levelSignatureOnce(): void {
    const result = this.signatures.levelUp(this.defId());
    this.signatureMessage.set(result.ok ? null : SIGNATURE_FAILURES[result.reason]);
  }

  protected levelOnce(): void {
    this.report(this.roster.levelUpOnce(this.defId()));
  }

  protected levelMax(): void {
    this.report(this.roster.levelUpMax(this.defId()));
  }

  private report(result: { ok: boolean; reason?: RosterFailure }): void {
    if (result.ok) {
      this.message.set(null);
      return;
    }
    this.message.set(
      (result.reason !== undefined ? FAILURE_MESSAGES[result.reason] : undefined) ??
        'That did not work.',
    );
  }
}
