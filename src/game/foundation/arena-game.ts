import { createSeededRandom } from '../random';
import { resolveCombat } from './combat';
import { createCardDefinition, createCardInstance, createLeaderDefinition, createLeaderInstance } from './cards';
import { FIELD_COLUMNS, FIELD_ROWS, fieldIndex } from './field';
import { placeCard } from './operations';
import { createPlayer } from './players';
import { createDuelState } from './state';
import type { CardDefinition, CardInstance, DuelState, FieldPosition, Player, PlayerId } from './types';

export const INITIAL_HAND_SIZE = 3;
export const INITIAL_RESOURCES = 3;
export const RESOURCES_PER_ROUND = 1;
export const MAX_RESOURCES = 8;
export const MAX_PLACEMENTS_PER_ROUND = 1;

export const ARENA_CARD_DEFINITIONS: readonly CardDefinition[] = Object.freeze([
  createCardDefinition({ definitionId: 'arena-scout', name: 'Batedor', baseClass: 'troop', attack: 3, defense: 2, cost: 2 }),
  createCardDefinition({ definitionId: 'arena-vanguard', name: 'Vanguarda', baseClass: 'troop', attack: 2, defense: 5, cost: 2 }),
  createCardDefinition({ definitionId: 'arena-guard', name: 'Guardião', baseClass: 'troop', attack: 1, defense: 7, cost: 2 }),
  createCardDefinition({ definitionId: 'arena-lancer', name: 'Lanceiro', baseClass: 'troop', attack: 4, defense: 3, cost: 3 }),
  createCardDefinition({ definitionId: 'arena-light-shield', name: 'Escudo leve', baseClass: 'shield', attack: 0, defense: 4, cost: 1 }),
  createCardDefinition({ definitionId: 'arena-heavy-shield', name: 'Escudo pesado', baseClass: 'shield', attack: 0, defense: 7, cost: 2 }),
]);

export type ArenaActionError =
  | 'game-finished'
  | 'wrong-phase'
  | 'wrong-turn'
  | 'already-prepared'
  | 'card-not-in-hand'
  | 'unsupported-card'
  | 'invalid-card-data'
  | 'insufficient-resources'
  | 'invalid-coordinate'
  | 'position-occupied';

export type ArenaActionResult =
  | { readonly ok: true; readonly state: DuelState; readonly card: CardInstance; readonly position: FieldPosition }
  | { readonly ok: false; readonly state: DuelState; readonly error: ArenaActionError };

export type ArenaAdvanceResult =
  | {
      readonly ok: true;
      readonly state: DuelState;
      readonly combatEvents: ReturnType<typeof resolveCombat>['events'];
      readonly combatResolved: boolean;
      readonly roundAdvanced: boolean;
    }
  | { readonly ok: false; readonly state: DuelState; readonly error: ArenaActionError | 'invalid-state' };

export interface ArenaMove {
  readonly cardId: string;
  readonly position: FieldPosition;
}

export interface BotTurnResult {
  readonly transition: ArenaAdvanceResult;
  readonly move: ArenaMove | null;
  /** State after the bot's legal action and before the combat transition. */
  readonly combatInputState: DuelState;
}

const CARD_COPIES_PER_PLAYER = 2;

function shuffled<T>(items: readonly T[], seed: number): T[] {
  const result = [...items];
  const random = createSeededRandom(seed);
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function playerCards(playerId: PlayerId, seed: number): readonly CardInstance[] {
  const cards = ARENA_CARD_DEFINITIONS.flatMap((definition) =>
    Array.from({ length: CARD_COPIES_PER_PLAYER }, (_, copy) =>
      createCardInstance(`${playerId}-${definition.definitionId}-${copy + 1}`, definition, playerId)));
  return Object.freeze(shuffled(cards, seed));
}

function dealInitialHand(deck: readonly CardInstance[]): { readonly hand: readonly CardInstance[]; readonly deck: readonly CardInstance[] } {
  const hand = [...deck.slice(0, INITIAL_HAND_SIZE)];
  const remaining = [...deck.slice(INITIAL_HAND_SIZE)];
  if (!hand.some((card) => card.definition.baseClass === 'troop')) {
    const troopIndex = remaining.findIndex((card) => card.definition.baseClass === 'troop');
    if (troopIndex >= 0 && hand.length > 0) {
      [hand[0], remaining[troopIndex]] = [remaining[troopIndex], hand[0]];
    }
  }
  return { hand: Object.freeze(hand), deck: Object.freeze(remaining) };
}

function withPlayer(state: DuelState, playerIndex: number, updated: Player): DuelState {
  const players = [...state.players] as [Player, Player];
  players[playerIndex] = Object.freeze(updated);
  return Object.freeze({ ...state, players: Object.freeze(players) });
}

function playerIndexFor(state: DuelState, playerId: PlayerId): number {
  return state.players.findIndex((player) => player.id === playerId);
}

/** Creates two equivalent private decks and deals three cards to each side. */
export function createArenaGame(seed = 1): DuelState {
  const playerOneId = 'human';
  const playerTwoId = 'bot';
  const makeEmptyPlayer = (id: PlayerId, name: string) => createPlayer(
    id,
    createLeaderInstance(`leader-${id}`, createLeaderDefinition(`leader-definition-${id}`, name), id, 20),
  );
  const oneCards = playerCards(playerOneId, seed);
  const twoCards = playerCards(playerTwoId, seed ^ 0x9e3779b9);
  const oneDeal = dealInitialHand(oneCards);
  const twoDeal = dealInitialHand(twoCards);
  const one = Object.freeze({
    ...makeEmptyPlayer(playerOneId, 'Líder do jogador'),
    hand: oneDeal.hand,
    deck: oneDeal.deck,
    resources: INITIAL_RESOURCES,
  });
  const two = Object.freeze({
    ...makeEmptyPlayer(playerTwoId, 'Líder do bot'),
    hand: twoDeal.hand,
    deck: twoDeal.deck,
    resources: INITIAL_RESOURCES,
  });
  const initial = createDuelState(one, two);
  return Object.freeze({ ...initial, activePlayerId: playerOneId, initiativePlayerId: playerOneId });
}

/** Shared legal placement operation used by the human and bot. */
export function playArenaCard(
  state: DuelState,
  playerId: PlayerId,
  cardId: string,
  position: FieldPosition,
): ArenaActionResult {
  const fail = (error: ArenaActionError): ArenaActionResult => ({ ok: false, state, error });
  if (state.phase === 'finished' || state.outcome !== null) return fail('game-finished');
  if (state.phase !== 'planning') return fail('wrong-phase');
  if (state.activePlayerId !== playerId) return fail('wrong-turn');
  const placementsThisRound = state.actedPlayerIds.filter((actorId) => actorId === playerId).length;
  if (placementsThisRound >= MAX_PLACEMENTS_PER_ROUND) return fail('already-prepared');
  if (state.preparedPlayerIds.includes(playerId)) return fail('already-prepared');
  const playerIndex = playerIndexFor(state, playerId);
  if (playerIndex < 0) return fail('wrong-turn');
  const player = state.players[playerIndex];
  const cardIndex = player.hand.findIndex((card) => card.instanceId === cardId);
  if (cardIndex < 0) return fail('card-not-in-hand');
  const card = player.hand[cardIndex];
  if (card.definition.isElite || (card.definition.baseClass !== 'troop' && card.definition.baseClass !== 'shield')) {
    return fail('unsupported-card');
  }
  if (!Number.isFinite(card.definition.cost) || card.definition.cost < 0
    || !Number.isFinite(card.definition.attack) || card.definition.attack < 0
    || !Number.isFinite(card.definition.defense) || card.definition.defense <= 0) return fail('invalid-card-data');
  if (card.definition.cost > player.resources) return fail('insufficient-resources');
  const cellIndex = fieldIndex(position);
  if (cellIndex === null) return fail('invalid-coordinate');
  if (player.field.cells[cellIndex] !== null) return fail('position-occupied');

  const placed = placeCard(state, playerId, card, position);
  if (!placed.ok) return fail(placed.error === 'position-occupied' ? 'position-occupied' : 'invalid-coordinate');
  const updatedPlayer = {
    ...placed.state.players[playerIndex],
    hand: Object.freeze(player.hand.filter((candidate) => candidate.instanceId !== cardId)),
    resources: player.resources - card.definition.cost,
  };
  const placedState = withPlayer(placed.state, playerIndex, updatedPlayer);
  return {
    ok: true,
    state: Object.freeze({ ...placedState, actedPlayerIds: Object.freeze([...state.actedPlayerIds, playerId]) }),
    card,
    position,
  };
}

export function listLegalArenaMoves(state: DuelState, playerId: PlayerId): readonly ArenaMove[] {
  const player = state.players.find((candidate) => candidate.id === playerId);
  if (!player || state.activePlayerId !== playerId || state.phase !== 'planning'
    || state.preparedPlayerIds.includes(playerId) || state.outcome !== null) return Object.freeze([]);
  if (state.actedPlayerIds.includes(playerId)) return Object.freeze([]);
  const moves: ArenaMove[] = [];
  for (const card of player.hand) {
    for (let row = 0; row < FIELD_ROWS; row += 1) {
      for (let column = 0; column < FIELD_COLUMNS; column += 1) {
        const position = { row, column };
        if (playArenaCard(state, playerId, card.instanceId, position).ok) {
          moves.push(Object.freeze({ cardId: card.instanceId, position: Object.freeze(position) }));
        }
      }
    }
  }
  return Object.freeze(moves);
}

function drawAtRoundStart(player: Player): Player {
  const [card, ...deck] = player.deck;
  return Object.freeze({
    ...player,
    hand: card ? Object.freeze([...player.hand, card]) : player.hand,
    deck: Object.freeze(deck),
    resources: Math.min(MAX_RESOURCES, player.resources + RESOURCES_PER_ROUND),
  });
}

/** Ends a participant's one placement opportunity, then resolves combat once both are prepared. */
export function finishArenaPlanning(state: DuelState, playerId: PlayerId): ArenaAdvanceResult {
  const fail = (error: ArenaActionError | 'invalid-state'): ArenaAdvanceResult => ({ ok: false, state, error });
  if (state.phase === 'finished' || state.outcome !== null) return fail('game-finished');
  if (state.phase !== 'planning') return fail('wrong-phase');
  if (state.activePlayerId !== playerId) return fail('wrong-turn');
  if (state.preparedPlayerIds.includes(playerId)) return fail('already-prepared');

  const preparedPlayerIds = Object.freeze([...state.preparedPlayerIds, playerId]);
  const otherPlayer = state.players.find((player) => player.id !== playerId);
  if (!otherPlayer) return fail('invalid-state');
  if (preparedPlayerIds.length === 1) {
    return {
      ok: true,
      state: Object.freeze({ ...state, preparedPlayerIds, activePlayerId: otherPlayer.id }),
      combatEvents: Object.freeze([]),
      combatResolved: false,
      roundAdvanced: false,
    };
  }

  const ready = Object.freeze({ ...state, preparedPlayerIds });
  const resolution = resolveCombat(ready);
  if (!resolution.result.ok) return fail('invalid-state');
  if (resolution.result.outcome !== null) {
    return {
      ok: true,
      state: Object.freeze({ ...resolution.result.state, phase: 'finished' }),
      combatEvents: resolution.events,
      combatResolved: true,
      roundAdvanced: false,
    };
  }

  const nextInitiative = state.players.find((player) => player.id !== state.initiativePlayerId)?.id;
  if (!nextInitiative) return fail('invalid-state');
  const players = resolution.result.state.players.map(drawAtRoundStart) as [Player, Player];
  const nextState: DuelState = Object.freeze({
    ...resolution.result.state,
    players: Object.freeze(players),
    round: state.round + 1,
    phase: 'planning',
    activePlayerId: nextInitiative,
    initiativePlayerId: nextInitiative,
    actedPlayerIds: Object.freeze([]),
    preparedPlayerIds: Object.freeze([]),
  });
  return { ok: true, state: nextState, combatEvents: resolution.events, combatResolved: true, roundAdvanced: true };
}

/** Bot policy sees only its own hand, its resources and the public battlefield. */
export interface BotDecisionView {
  readonly ownPlayer: Player;
  readonly opponentPublic: Omit<Player, 'hand' | 'deck'>;
  readonly round: number;
  readonly phase: DuelState['phase'];
  readonly activePlayerId: PlayerId;
  readonly initiativePlayerId: PlayerId;
  readonly actedPlayerIds: readonly PlayerId[];
  readonly preparedPlayerIds: readonly PlayerId[];
  readonly outcome: DuelState['outcome'];
}

export function createBotDecisionView(state: DuelState): BotDecisionView | null {
  const bot = state.players.find((candidate) => candidate.id === 'bot');
  const opponent = state.players.find((candidate) => candidate.id !== 'bot');
  if (!bot || !opponent) return null;
  return Object.freeze({
    ownPlayer: bot,
    opponentPublic: Object.freeze({
      id: opponent.id,
      field: opponent.field,
      leader: opponent.leader,
      resources: opponent.resources,
    }),
    round: state.round,
    phase: state.phase,
    activePlayerId: state.activePlayerId,
    initiativePlayerId: state.initiativePlayerId,
    actedPlayerIds: state.actedPlayerIds,
    preparedPlayerIds: state.preparedPlayerIds,
    outcome: state.outcome,
  });
}

/** Deliberately contains no reference to the opponent's private hand or deck. */
export function chooseBotMove(view: BotDecisionView): ArenaMove | null {
  if (view.ownPlayer.id !== 'bot') return null;
  const opponent = Object.freeze({
    id: view.opponentPublic.id,
    field: view.opponentPublic.field,
    leader: view.opponentPublic.leader,
    hand: Object.freeze([]),
    deck: Object.freeze([]),
    resources: view.opponentPublic.resources,
  });
  if (view.ownPlayer.id === view.opponentPublic.id || view.opponentPublic.id === 'bot') return null;
  const players = [opponent, view.ownPlayer];
  const redactedState = Object.freeze({
    players: Object.freeze(players) as unknown as DuelState['players'],
    round: view.round,
    phase: view.phase,
    activePlayerId: view.activePlayerId,
    initiativePlayerId: view.initiativePlayerId,
    actedPlayerIds: view.actedPlayerIds,
    preparedPlayerIds: view.preparedPlayerIds,
    outcome: view.outcome,
  });
  const legalMoves = listLegalArenaMoves(redactedState, 'bot');
  const move = [...legalMoves].sort((left, right) => {
    const leftCard = view.ownPlayer.hand.find((card) => card.instanceId === left.cardId)!;
    const rightCard = view.ownPlayer.hand.find((card) => card.instanceId === right.cardId)!;
    return rightCard.definition.attack - leftCard.definition.attack
      || rightCard.currentDefense - leftCard.currentDefense
      || leftCard.definition.cost - rightCard.definition.cost
      || left.cardId.localeCompare(right.cardId)
      || left.position.row - right.position.row
      || left.position.column - right.position.column;
  })[0] ?? null;

  return move;
}

export function runBotPlanning(state: DuelState): BotTurnResult {
  const view = createBotDecisionView(state);
  const move = view ? chooseBotMove(view) : null;

  let current = state;
  if (move) {
    const placement = playArenaCard(state, 'bot', move.cardId, move.position);
    if (placement.ok) current = placement.state;
  }
  return { transition: finishArenaPlanning(current, 'bot'), move, combatInputState: current };
}
