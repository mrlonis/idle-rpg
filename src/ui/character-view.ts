import { Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  growthMultiplier,
  MAX_ENERGY,
  num,
  type RosterFailure,
  scaleStats,
  type SkillData,
  type SkillTarget,
  ticksToMs,
} from '../core';
import { characterById, GROWTH_RULES } from './content';
import { formatAmounts, formatNumeric } from './format-numeric';
import { GameLoopService } from './game-loop.service';
import { backTo } from './navigation';
import { RosterService } from './roster.service';

/** Why an action was refused, in words a player can act on. */
const FAILURE_MESSAGES: Partial<Record<RosterFailure, string>> = {
  'insufficient-currency': 'Not enough gold, XP or essence for that level.',
  'level-capped': 'Already at the level cap for this rarity. Ascend to raise it.',
  'insufficient-copies': 'Not enough copies of this character.',
  'insufficient-fodder': 'Not enough same-faction copies to pay for this ascension.',
  'max-rarity': 'Already fully ascended.',
  'not-owned': 'You do not own this character.',
  'wrong-faction': 'Fodder has to share this character’s faction.',
  'fodder-is-self': 'A character cannot be fed to itself.',
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
 * One character's sheet: what it is, what it costs to improve, and the two ways to do it.
 *
 * ## Ascension shows its price in the copies a player actually holds
 *
 * The authored ladder quotes rungs in ascended copies — "2 copies of any same-faction character
 * at Elite+". Nobody holds those; they hold base copies. So this screen shows the resolved
 * price, both halves separately, next to what the player has: the `self` half can only ever be
 * paid by this character, and the `faction` half by anyone sharing its faction, and confusing
 * the two is what makes a gacha ascension screen unreadable.
 */
@Component({
  selector: 'app-character-view',
  imports: [RouterLink],
  templateUrl: './character-view.html',
  styleUrl: './character-view.scss',
})
export class CharacterView {
  private readonly roster = inject(RosterService);
  private readonly game = inject(GameLoopService);

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
   * The sheet hangs off `/roster/:defId`, but it is not only reached from the roster — tapping a
   * name in the party on the home screen lands here too, and sending that player to a screen
   * they were never on is the confusion this resolves.
   */
  protected readonly back = computed(() => backTo(this.from()));

  /** The last refusal, cleared as soon as anything succeeds. */
  protected readonly message = signal<string | null>(null);

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
   * The character's kit, basic attack excluded.
   *
   * Read off the definition rather than the roster entry because a kit is what a character
   * *is* — levelling and ascending change the numbers behind it and never the list.
   */
  protected readonly skills = computed(() =>
    (this.definition()?.skills ?? []).map((skill) => ({
      id: skill.id,
      name: skill.name,
      cost: skillMeter(skill),
      target: TARGET_LABELS[skill.target],
    })),
  );

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

  /** Faction-mates whose spares could pay the fodder half of the next rung. */
  protected readonly fodder = computed(() => this.roster.fodderFor(this.defId()));

  protected readonly walletSummary = computed(() => {
    const wallet = this.game.wallet();
    return `${formatNumeric(wallet.gold)} gold · ${formatNumeric(wallet.xp)} XP · ${formatNumeric(wallet.essence)} essence`;
  });

  protected levelOnce(): void {
    this.report(this.roster.levelUpOnce(this.defId()));
  }

  protected levelMax(): void {
    this.report(this.roster.levelUpMax(this.defId()));
  }

  protected ascend(): void {
    this.report(this.roster.ascendOnce(this.defId()));
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
