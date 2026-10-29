import { fieldIndex, withCardAt } from './field';
import type {
  CardInstance,
  DuelState,
  FieldPosition,
  FoundationResult,
  PlayerId,
  RemoveCardResult,
} from './types';

export function placeCard(
  state: DuelState,
  playerId: PlayerId,
  card: CardInstance,
  position: FieldPosition,
): FoundationResult {
  const playerIndex = state.players.findIndex((player) => player.id === playerId);
  if (playerIndex < 0) return { ok: false, state, error: 'player-not-found' };
  const targetPlayer = state.players[playerIndex];
  const cellIndex = fieldIndex(position);
  if (cellIndex === null) return { ok: false, state, error: 'invalid-coordinate' };
  if (card.ownerId !== targetPlayer.id) return { ok: false, state, error: 'wrong-owner' };
  if (state.players.some((player) => player.field.cells.some((candidate) => candidate?.instanceId === card.instanceId))) {
    return { ok: false, state, error: 'card-already-positioned' };
  }
  if (targetPlayer.field.cells[cellIndex] !== null) return { ok: false, state, error: 'position-occupied' };

  const field = withCardAt(targetPlayer.field, position, card);
  if (!field) return { ok: false, state, error: 'invalid-coordinate' };
  const updatedPlayer = Object.freeze({ ...targetPlayer, field });
  const players = [...state.players] as [typeof targetPlayer, typeof targetPlayer];
  players[playerIndex] = updatedPlayer;
  return { ok: true, state: Object.freeze({ ...state, players: Object.freeze(players) }) };
}

export function removeCard(state: DuelState, playerId: PlayerId, position: FieldPosition): RemoveCardResult {
  const playerIndex = state.players.findIndex((player) => player.id === playerId);
  if (playerIndex < 0) return { ok: false, state, error: 'player-not-found' };
  const targetPlayer = state.players[playerIndex];
  const cellIndex = fieldIndex(position);
  if (cellIndex === null) return { ok: false, state, error: 'invalid-coordinate' };
  const card = targetPlayer.field.cells[cellIndex];
  if (card === null) return { ok: false, state, error: 'position-empty' };

  const field = withCardAt(targetPlayer.field, position, null);
  if (!field) return { ok: false, state, error: 'invalid-coordinate' };
  const updatedPlayer = Object.freeze({ ...targetPlayer, field });
  const players = [...state.players] as [typeof targetPlayer, typeof targetPlayer];
  players[playerIndex] = updatedPlayer;
  return { ok: true, state: Object.freeze({ ...state, players: Object.freeze(players) }), card };
}
