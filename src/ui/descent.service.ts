import { computed, inject, Service } from '@angular/core';
import {
  applyDescentResult,
  canStartDescent,
  chaptersCleared,
  type CombatantOpening,
  dailyDescentFactions,
  type DescentBattleOutcome,
  descentBoards,
  type DescentBonus,
  descentBonus,
  type DescentCard,
  descentCards,
  descentChoices,
  descentFightAt,
  descentFights,
  descentFightSummons,
  descentLevel,
  descentLump,
  descentOffer,
  type DescentRun,
  descentRunFor,
  descentStatus,
  type DescentStatus,
  type GameState,
  isDescentUnlocked,
  matchedStageIndex,
  nextDescentFight,
  type PartyFormation,
  type PartyOpening,
  periodIndex,
  resolveDescentFight,
  type StageData,
  type StageKind,
  stagePayout,
  startDescent,
  takeDescentCard,
} from '../core';
import {
  CAMPAIGN_LEVELS,
  DESCENT,
  DESCENT_CARDS,
  DESCENT_POOL,
  FACTIONS_IN_ORDER,
  GEAR,
  GEAR_ALIGNMENTS,
  LADDER,
  QUEST_WINDOW_RULES,
  STAGE_REWARD_CURVE,
} from './content';
import { GameLoopService } from './game-loop.service';

/**
 * The Descent's read model and its two actions.
 *
 * ## Where the clock enters, and why it is the quests' clock
 *
 * `core/` has no clock, so which day it is arrives as an argument. It is resolved through
 * `periodIndex(QUEST_WINDOW_RULES, 'daily', …)` — ⚠️ **the same 04:00 UTC boundary the quest windows
 * and the bounty board already roll on**, and deliberately not a second constant. Two daily clocks
 * would mean two "tomorrows" in one game, which is the trap `core/bounties.ts` records when it
 * asserts its own boundary equal to `QUEST_RULES` rather than restating it.
 *
 * Reading the clock inside a `computed` is safe here for the reason it is safe in
 * `BountiesService` and unsafe in `QuestsService`: **nothing rolls.** A run carries the day it
 * belongs to, so "is this today's run" is a comparison rather than a write, and yesterday's run
 * needs no pass to expire it.
 *
 * ## Almost none of this is stored
 *
 * The day's nine boards, the day's three factions, the three cards on offer, every enemy level and
 * every payout are pure functions of the run's seed, the day, and what the run has already taken.
 * ⚠️ **That is what makes rerolling impossible rather than merely detectable** — force-quitting and
 * relaunching hands back the identical nine boards and the identical three cards, because there was
 * never a draw written down to re-take.
 */

/** One fight of today's run, as the screens draw it. */
export interface DescentFightView {
  /** 1-based over the whole run. */
  readonly index: number;
  readonly floor: number;
  /** 1-based position within its floor. */
  readonly step: number;
  readonly kind: StageKind;
  /** The board's own name, which is different every day. */
  readonly name: string;
  readonly level: number;
  /** Crystals this fight pays. */
  readonly summons: number;
  readonly cleared: boolean;
  /** Whether this is the fight the run would enter next. */
  readonly current: boolean;
}

/** One card, resolved for display. */
export interface DescentCardView {
  readonly id: string;
  /** `Grand Wyrdsong` — the rank's own name in front of the family's. */
  readonly name: string;
  readonly description: string;
  readonly rank: number;
  readonly rankName: string;
  /** The faction it pays, or `null` when it pays everybody. */
  readonly faction: string | null;
  /** What it does, one line per stat: `+20% attack`. */
  readonly effects: readonly string[];
}

/**
 * Where a run stands, as one word the screen can switch on.
 *
 * Six rather than {@link DescentStatus}'s four, because two states exist before a run does: the
 * campaign has not opened the mode yet, and today's run has not been started. Both are things the
 * screen has to say and neither is a state a run can be in.
 */
export type DescentPhase = 'locked' | 'available' | DescentStatus;

/** How a stat reads on a card. */
const STAT_LABELS: Readonly<Record<string, string>> = {
  hp: 'health',
  atk: 'attack',
  def: 'defence',
  haste: 'haste',
  critChance: 'crit chance',
  critDamageAmp: 'crit damage',
  lifeLeech: 'life steal',
};

/** A bonus as percentage points, which is how every one of these reads on screen. */
function percent(value: number): string {
  const points = value * 100;
  return `${points >= 10 ? Math.round(points) : Math.round(points * 10) / 10}%`;
}

@Service()
export class DescentService {
  private readonly game = inject(GameLoopService);

  /** How many fights a whole run is. */
  readonly fights = descentFights(DESCENT);

  /** How many card choices a whole run hands out — one fewer than the fights. */
  readonly choices = descentChoices(DESCENT);

  /** Attempts a fresh run starts with. */
  readonly lives = DESCENT.lives;

  /**
   * Which day it is, on the quests' own boundary.
   *
   * Read inside a `computed` because nothing rolls — see the note at the top of this file. The
   * snapshot resamples at ~6Hz, so a run that crosses 04:00 while the screen is open drops back to
   * `available` on its own.
   */
  readonly day = computed(() => periodIndex(QUEST_WINDOW_RULES, 'daily', Date.now()));

  /** Whole campaign chapters this run has finished, which is what opens the mode. */
  private readonly chapters = computed(
    () => chaptersCleared(LADDER, this.game.snapshot()?.clearedStages ?? 0).total,
  );

  /** Whether the campaign has come far enough to open the Descent at all. */
  readonly isUnlocked = computed(() => isDescentUnlocked(DESCENT, this.chapters()));

  /** Chapters still to finish before it opens. Zero once open. */
  readonly chaptersNeeded = computed(() => Math.max(DESCENT.unlockChapters - this.chapters(), 0));

  /**
   * The factions today admits.
   *
   * ⚠️ **A pure function of the seed and the day**, never of what the run owns. A roster-dependent
   * lock could move under a player mid-run — legal at breakfast and illegal at lunch — for reasons
   * nothing on screen could explain.
   */
  readonly lock = computed<readonly string[]>(() => {
    const state = this.game.snapshot();
    return state === null
      ? []
      : dailyDescentFactions(
          DESCENT,
          FACTIONS_IN_ORDER.map((faction) => faction.id),
          state.rng.seed,
          this.day(),
        );
  });

  /** Today's run, or `null` when there is none yet or the stored one belongs to a past day. */
  readonly run = computed<DescentRun | null>(() => {
    const state = this.game.snapshot();
    return state === null ? null : descentRunFor(state, this.day());
  });

  /** Runs finished end to end over the life of this save. */
  readonly runsFinished = computed(() => this.game.snapshot()?.descentRuns ?? 0);

  /** Where the run stands, in one word. */
  readonly phase = computed<DescentPhase>(() => {
    if (!this.isUnlocked()) {
      return 'locked';
    }
    const run = this.run();
    return run === null ? 'available' : descentStatus(DESCENT, run);
  });

  /** Attempts left in today's run, or a fresh run's full allowance before one has started. */
  readonly livesLeft = computed(() => this.run()?.lives ?? DESCENT.lives);

  /**
   * The enemy level today's run is measured against: the hardest campaign stage ever cleared.
   *
   * ⚠️ **`clearedStages` rather than the ladder position**, because the position stops climbing at
   * the top of the authored ladder and would then answer for a run that has beaten everything with
   * whatever stage it is farming. The clear count is the honest reading of "the hardest thing this
   * party has ever beaten", which is what the whole difficulty derivation rests on.
   */
  readonly anchorLevel = computed(() => anchorFor(this.game.snapshot()));

  /** Today's nine fights, in order. */
  readonly fightRows = computed<readonly DescentFightView[]>(() => {
    const state = this.game.snapshot();
    if (state === null) {
      return [];
    }
    const run = this.run();
    const cleared = run?.cleared ?? 0;
    const next = run === null ? 1 : nextDescentFight(DESCENT, run);
    const anchor = this.anchorLevel();
    return descentBoards(DESCENT, DESCENT_POOL, state.rng.seed, this.day()).map((board, offset) => {
      const at = descentFightAt(DESCENT, offset + 1);
      return {
        ...at,
        name: board.name,
        level: descentLevel(DESCENT, anchor, at.index),
        summons: descentFightSummons(DESCENT, at.index),
        cleared: at.index <= cleared,
        current: at.index === next,
      };
    });
  });

  /** The cards today's run holds, in the order they were taken. */
  readonly held = computed<readonly DescentCardView[]>(() =>
    this.heldCards().map((card) => cardView(card)),
  );

  /**
   * The three cards on offer, or empty when none is owed.
   *
   * ⚠️ **Derived from what the run has already taken**, which is what makes "a repeat comes back
   * only higher" a rule the draw cannot break rather than a convention the content has to honour.
   *
   * ⚠️ **The day's lock is an input**, because a faction family the lock excludes is a card that can
   * pay nobody in any legal crew — four of fourteen families, and better than a quarter of every
   * offer, until the screen showed one.
   */
  readonly offer = computed<readonly DescentCardView[]>(() => {
    const state = this.game.snapshot();
    const run = this.run();
    if (state === null || run === null || descentStatus(DESCENT, run) !== 'choosing') {
      return [];
    }
    return descentOffer(
      DESCENT,
      DESCENT_CARDS,
      this.lock(),
      state.rng.seed,
      run.day,
      this.choices,
      run.cards.length,
      this.heldCards(),
    ).map((card) => cardView(card));
  });

  /**
   * What the run's cards are worth to one faction, for the screen's summary.
   *
   * The **same function the battle path calls**, for the reason `FormationService` calls
   * `lineupBonus` rather than re-reading the table: a screen promising +30% attack and a fight
   * awarding something else is the worst failure a mechanic like this can have.
   */
  bonusFor(faction: string): DescentBonus {
    return descentBonus(DESCENT, this.heldCards(), faction);
  }

  /**
   * What the run carries into its next fight.
   *
   * ⚠️ Only for characters **still standing** — a fallen member is out of `run.party` as well as out
   * of this table, so there is nothing here to key against them.
   */
  readonly opening = computed<PartyOpening>(() => {
    const run = this.run();
    const carried = new Map<string, CombatantOpening>();
    if (run === null) {
      return carried;
    }
    for (const defId of [...run.party.front, ...run.party.back]) {
      carried.set(defId, {
        health: run.health[defId] ?? 1,
        energy: run.energy[defId] ?? 0,
      });
    }
    return carried;
  });

  /** The crew standing in today's run, which is fixed for its whole length. */
  readonly party = computed<PartyFormation | null>(() => this.run()?.party ?? null);

  /**
   * The fight the Descent would enter next, resolved against the **authoritative** run.
   *
   * Takes a state rather than reading the snapshot, for the reason `BattleService.targetFor` does:
   * this is the call that decides which fight a run is paid for, and a stale read is a run banking
   * the same fight twice.
   *
   * `null` whenever there is nothing to fight — the mode is locked, no run has been started, a card
   * is owed, the run is finished, or its lives ran out.
   */
  target(state: GameState): { readonly fight: number; readonly stage: StageData } | null {
    const day = this.day();
    const run = descentRunFor(state, day);
    if (run === null) {
      return null;
    }
    const fight = nextDescentFight(DESCENT, run);
    if (fight === null) {
      return null;
    }
    const board = descentBoards(DESCENT, DESCENT_POOL, state.rng.seed, day)[fight - 1];
    if (board === undefined) {
      return null;
    }
    const anchor = anchorFor(state);
    const level = descentLevel(DESCENT, anchor, fight);
    const matched = matchedStageIndex(CAMPAIGN_LEVELS, level);
    const lump = descentLump(DESCENT, stagePayout(STAGE_REWARD_CURVE, matched).reward);
    return { fight, stage: resolveDescentFight(DESCENT, board, fight, anchor, lump) };
  }

  /**
   * Folds a finished Descent fight back into the run.
   *
   * Called by `BattleService.settle` rather than by a screen, because a result is banked when the
   * *animation* ends — see the note there. The gear bundle is always supplied here; it is optional
   * on `applyDescentResult` only so the balance sweep need not construct content it has no use for.
   */
  settle(state: GameState, fight: number, result: DescentBattleOutcome): GameState {
    const level = descentLevel(DESCENT, anchorFor(state), fight);
    return applyDescentResult(state, DESCENT, this.day(), fight, result, {
      rules: GEAR,
      factions: GEAR_ALIGNMENTS,
      // The **campaign** index this fight's level matched, so a Descent fight drops the grades the
      // campaign drops where the fight is the same size — the same rule a tower floor follows.
      stageIndex: matchedStageIndex(CAMPAIGN_LEVELS, level),
    });
  }

  /**
   * Starts today's run with `party` standing in it.
   *
   * Refused when the mode is locked or today's run has already been started — including one that is
   * finished or out of lives, which is what makes the daily cap a cap rather than a suggestion.
   */
  start(party: PartyFormation): boolean {
    const state = this.game.current;
    const day = this.day();
    if (state === null || !canStartDescent(state, DESCENT, this.chapters(), day)) {
      return false;
    }
    this.game.apply((current) => startDescent(current, DESCENT, day, party));
    void this.game.persist();
    return true;
  }

  /**
   * Takes one of the three cards on offer.
   *
   * Persists immediately rather than waiting for the autosave, for the reason `BattleService.settle`
   * does: a card is an irreversible choice, and losing the app between taking one and the next
   * autosave would hand the player the choice back with the run already past it.
   */
  take(cardId: string): void {
    const state = this.game.current;
    if (state === null) {
      return;
    }
    const day = this.day();
    // The offer is re-derived against the authoritative run rather than trusting the id off the
    // screen. A card that is not on today's offer is not a card this run may take — the only way to
    // reach that is a stale render, and the honest answer to a stale render is nothing at all.
    const run = descentRunFor(state, day);
    if (run === null) {
      return;
    }
    const offered = descentOffer(
      DESCENT,
      DESCENT_CARDS,
      this.lock(),
      state.rng.seed,
      run.day,
      this.choices,
      run.cards.length,
      descentCards(DESCENT_CARDS, DESCENT, run.cards),
    );
    if (!offered.some((card) => card.id === cardId)) {
      return;
    }
    this.game.apply((current) => takeDescentCard(current, DESCENT, day, cardId));
    void this.game.persist();
  }

  private heldCards(): readonly DescentCard[] {
    const run = this.run();
    return run === null ? [] : descentCards(DESCENT_CARDS, DESCENT, run.cards);
  }
}

/**
 * The level a run is measured against: the hardest campaign stage it has ever cleared.
 *
 * A free function so both the reactive read and {@link DescentService.target}'s authoritative one go
 * through the same arithmetic. A run that has cleared nothing anchors on the first stage, which the
 * unlock makes unreachable but which still has to answer rather than divide by nothing.
 */
function anchorFor(state: GameState | null): number {
  if (state === null || CAMPAIGN_LEVELS.length === 0) {
    return 1;
  }
  const cleared = Math.max(Math.floor(state.clearedStages), 0);
  const index = Math.min(Math.max(cleared, 1), CAMPAIGN_LEVELS.length);
  return CAMPAIGN_LEVELS[index - 1];
}

/** One card, resolved for display: its rank-qualified name and a line per stat. */
function cardView(card: DescentCard): DescentCardView {
  const rank = DESCENT.ranks[card.rank];
  const rankName = rank?.name ?? '';
  const rung = card.family.rungs[card.rank] ?? {};
  const effects: string[] = [];
  for (const [stat, value] of Object.entries(rung)) {
    if (typeof value === 'number' && value > 0) {
      effects.push(`+${percent(value)} ${STAT_LABELS[stat] ?? stat}`);
    }
  }
  return {
    id: card.id,
    // The rank supplies the prefix rather than the family carrying fifty-six names, which is the
    // same derive-rather-than-retype rule `data/` specs are held to.
    name: rankName === '' ? card.family.name : `${rankName} ${card.family.name}`,
    description: card.family.description,
    rank: card.rank,
    rankName,
    faction: card.family.faction ?? null,
    effects,
  };
}
