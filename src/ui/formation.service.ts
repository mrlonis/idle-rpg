import { computed, inject, Service } from '@angular/core';
import {
  type ActivityData,
  awayMembers,
  benchMember,
  type CombatantData,
  crewFor,
  effectiveLevel,
  factionMeetsLock,
  findOwned,
  type FormationData,
  formationSize,
  gearLookup,
  lineupBonus,
  type LineupSummary,
  loadoutBonus,
  type PartyFormation,
  partyMeetsLock,
  placeInRow,
  resonanceFloor,
  type RosterResult,
  type Row,
  rowCapacity,
  setFormation,
  toBattleCombatant,
} from '../core';
import {
  ACTIVITIES_BY_ID,
  ACTIVITY_LIST,
  CHARACTERS_BY_ID,
  COMBAT,
  FACTIONS_IN_ORDER,
  GEAR,
  GROWTH_RULES,
  KIT,
  LEVELS,
} from './content';
import { GameLoopService } from './game-loop.service';
import { groupByFaction, type RosterGroup } from './roster-order';
import { type RosterEntryView, RosterService } from './roster.service';

/**
 * One activity's crew, with everything the editor and the pre-battle screen need resolved.
 *
 * Assembled here rather than in a template for the reason a {@link RosterEntryView} is: joining a
 * crew to its rows, its lineup bonus, its eligible bench and its faction lock is several passes
 * over the roster, and a binding would run all of them on every change-detection pass.
 */
export interface CrewView {
  readonly activity: ActivityData;
  /** The front rank, in slot order. Missing members are simply absent. */
  readonly front: readonly RosterEntryView[];
  readonly back: readonly RosterEntryView[];
  /** How many are standing, across both ranks. */
  readonly size: number;
  /** Empty slots left in each rank, which is what the editor draws as gaps. */
  readonly open: Readonly<Record<Row, number>>;
  /** What this crew's faction composition is worth, resolved through `core/`. */
  readonly lineup: LineupSummary;
  /**
   * Who may still be added, grouped by faction and already filtered by the lock.
   *
   * ⚠️ **Filtered rather than merely marked**, which is the opposite of how a full rank is
   * handled. A rank that is full is a state the player can fix by removing somebody, so the rows
   * stay visible; a character the lock forbids can never enter this activity at all, and listing
   * forty-two of them above the seven that can is a screen that hides its own answer.
   */
  readonly eligible: readonly RosterGroup[];
  /** The faction this activity locks its crew to, or `null` for the campaign. */
  readonly lockFaction: string | null;
  /**
   * Crew members currently away on a bounty.
   *
   * Should be empty — `setFormation` refuses to field anybody away and `repairDispatches` restores
   * the invariant on load — so this is a **report**, not a mechanism. It exists because the one
   * path that could produce it is a hand-edited save, and a crew silently one short is worse than
   * a crew that says why.
   */
  readonly away: readonly string[];
  /** Whether this crew can start a fight: somebody is standing, and the lock is satisfied. */
  readonly ready: boolean;
}

/**
 * Every crew, and everything the player can do to one.
 *
 * ## Why this is not part of `RosterService`
 *
 * It was, when there was one formation. Milestone 15a made that eight, and the two things stopped
 * being one responsibility: the roster is **who you own and what they are worth**, and a crew is
 * **who stands where, for what**. The roster screen reads the first and no longer edits the
 * second — which is the whole reason the formation editor exists as its own screen.
 *
 * It still leans on {@link RosterService.entries} for the rows rather than joining its own, so a
 * character's level, rung and copies can never read differently on the two screens.
 *
 * ## The faction lock is checked here and enforced in `core/`
 *
 * `partyMeetsLock` is the simulation's own function, called from here so a screen cannot promise a
 * legal crew that the fight then refuses. The same argument the lineup bonus makes for calling
 * `lineupBonus` rather than re-reading the table.
 */
@Service()
export class FormationService {
  private readonly game = inject(GameLoopService);
  private readonly roster = inject(RosterService);

  /** Everything a crew can be sent at, in the order the screens list them. */
  readonly activities = ACTIVITY_LIST;

  /** One activity by id, or `null` for a stale link or a hand-typed URL. */
  activity(activityId: string): ActivityData | null {
    return ACTIVITIES_BY_ID.get(activityId) ?? null;
  }

  /**
   * A summary of every activity's crew, for the index screen.
   *
   * One pass rather than a `crew()` call per row: each of those walks the roster, and the index
   * draws all of them at once.
   */
  readonly summaries = computed<readonly CrewView[]>(() =>
    this.activities.map((activity) => this.viewOf(activity)),
  );

  /**
   * One activity's crew.
   *
   * Not a `computed` because it is keyed by an argument, and a memo per activity would be a cache
   * that has to be invalidated. The work is a handful of passes over at most forty-nine rows and
   * the screens each read one activity, so recomputing is cheaper than remembering.
   */
  crew(activityId: string): CrewView | null {
    const activity = this.activity(activityId);
    return activity === null ? null : this.viewOf(activity);
  }

  /**
   * The crew as combatants, with stats already scaled for level, rung and gear.
   *
   * This is what `BattleService` fights with. An empty crew is handed through empty rather than
   * substituted for anything: `simulateBattle` reads a party of nobody as an immediate defeat,
   * which is the honest outcome of sending nobody.
   */
  battleFormation(activityId: string): FormationData {
    const state = this.game.snapshot();
    if (state === null) {
      return { front: [], back: [] };
    }
    // Resolved once for the whole crew rather than per member: the floor is a fact about the
    // roster the crew was drawn from, and the bag is the run's single list of pieces.
    const floor = resonanceFloor(state.roster);
    const gear = gearLookup(state.gear);
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
              loadoutBonus(GEAR, owned.gear, gear, character.faction),
            ),
          );
        }
      }
      return combatants;
    };
    const formation = this.formationOf(activityId);
    return { front: resolve(formation.front), back: resolve(formation.back) };
  }

  /** Puts a character into a rank of one activity's crew, taking it out of the other rank first. */
  placeIn(activityId: string, defId: string, row: Row): RosterResult {
    if (!this.allows(activityId, defId)) {
      return { ok: false, reason: 'wrong-faction' };
    }
    return this.mutate((state) => placeInRow(state, activityId, defId, row, CHARACTERS_BY_ID));
  }

  /** Takes a character out of one activity's crew. */
  bench(activityId: string, defId: string): RosterResult {
    return this.mutate((state) => benchMember(state, activityId, defId, CHARACTERS_BY_ID));
  }

  /** Empties one activity's crew, leaving every other crew alone. */
  clear(activityId: string): RosterResult {
    return this.mutate((state) =>
      setFormation(state, activityId, { front: [], back: [] }, CHARACTERS_BY_ID),
    );
  }

  /**
   * Cycles a character through front, back and out of this activity's crew.
   *
   * One control rather than three, for the reason it always was: the editor is a list, and a row
   * of three buttons per character would be forty-odd controls on a screen that already has a
   * table. The cycle skips a full rank rather than refusing, so a tap always does something.
   */
  cyclePlacement(activityId: string, defId: string): RosterResult {
    const formation = this.formationOf(activityId);
    if (formation.front.includes(defId)) {
      return formation.back.length < rowCapacity('back')
        ? this.placeIn(activityId, defId, 'back')
        : this.bench(activityId, defId);
    }
    if (formation.back.includes(defId)) {
      return this.bench(activityId, defId);
    }
    if (formation.front.length < rowCapacity('front')) {
      return this.placeIn(activityId, defId, 'front');
    }
    if (formation.back.length < rowCapacity('back')) {
      return this.placeIn(activityId, defId, 'back');
    }
    return { ok: false, reason: 'row-full' };
  }

  /** Where `defId` is standing in this activity's crew, or `null` when it is not. */
  placementOf(activityId: string, defId: string): { row: Row; slot: number } | null {
    const formation = this.formationOf(activityId);
    const front = formation.front.indexOf(defId);
    if (front >= 0) {
      return { row: 'front', slot: front + 1 };
    }
    const back = formation.back.indexOf(defId);
    return back >= 0 ? { row: 'back', slot: back + 1 } : null;
  }

  private formationOf(activityId: string): PartyFormation {
    return this.game.formationFor(activityId);
  }

  /** Whether the activity's lock admits this character. Unknown ids are refused, not assumed. */
  private allows(activityId: string, defId: string): boolean {
    const activity = this.activity(activityId);
    const faction = CHARACTERS_BY_ID.get(defId)?.faction;
    return activity !== null && faction !== undefined && factionMeetsLock(activity, faction);
  }

  private viewOf(activity: ActivityData): CrewView {
    const state = this.game.snapshot();
    const formation = crewFor(this.game.formations(), activity);
    const rows = this.roster.entries();
    const byId = new Map(rows.map((entry) => [entry.defId, entry]));
    const rank = (ids: readonly string[]): readonly RosterEntryView[] =>
      ids
        .map((defId) => byId.get(defId))
        .filter((entry): entry is RosterEntryView => entry !== undefined);

    const front = rank(formation.front);
    const back = rank(formation.back);
    const standing = new Set([...formation.front, ...formation.back]);
    const away = state === null ? new Set<string>() : awayMembers(state);

    // The predicate rather than a pre-filtered list, so each group still counts every character
    // of its faction the run owns. That is what lets a heading say "all three are already
    // standing" instead of "none owned" — see `groupByFaction`.
    const eligible = groupByFaction(
      rows,
      FACTIONS_IN_ORDER,
      (entry) => !standing.has(entry.defId) && factionMeetsLock(activity, entry.faction),
    );

    const legal = partyMeetsLock(
      activity,
      formation,
      (defId) => CHARACTERS_BY_ID.get(defId)?.faction,
    );

    return {
      activity,
      front,
      back,
      size: formationSize(formation),
      open: {
        front: Math.max(rowCapacity('front') - formation.front.length, 0),
        back: Math.max(rowCapacity('back') - formation.back.length, 0),
      },
      // The **same function the simulation calls**. A screen promising +25% and a battle awarding
      // something else is the worst possible failure for a mechanic whose whole job is to make the
      // player rebuild their party, and two readings of one table is how that happens.
      lineup: lineupBonus(
        [...front, ...back].map((entry) => entry.faction),
        COMBAT.lineup,
      ),
      eligible,
      lockFaction: activity.faction ?? null,
      away: [...standing].filter((defId) => away.has(defId)),
      ready: formationSize(formation) > 0 && legal,
    };
  }

  /**
   * Runs a pure `core/` operation against the run and commits it only on success.
   *
   * The failure case deliberately does not touch the state, so a rejected action cannot republish
   * the snapshot and re-render every screen watching it. The same shape `RosterService.mutate`
   * uses, and duplicated rather than shared because sharing it would mean one service reaching
   * into the other's private commit path.
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
}

/** Structural stand-in so the commit helper need not name the state type twice. */
type GameStateLike = Parameters<typeof setFormation>[0];
