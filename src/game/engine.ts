import { getCardDefinition } from './cards';
import { drawCard } from './decks';
import type { ActionResult, GameEvent, GameState, PlayerId, PlayerState } from './types';

const WINNING_SCORE = 10;

function allCardsExhausted(players: Readonly<Record<PlayerId, PlayerState>>): boolean {
  return (['human', 'bot'] as const).every((id) => players[id].deck.length === 0 && players[id].hand.length === 0);
}

export function playCard(state: GameState, playerId: PlayerId, instanceId: string): ActionResult {
  if (state.status === 'finished') return { ok: false, state, error: 'game-finished' };
  if (state.currentPlayerId !== playerId) return { ok: false, state, error: 'wrong-turn' };

  const player = state.players[playerId];
  const cardIndex = player.hand.findIndex((card) => card.instanceId === instanceId);
  if (cardIndex < 0) return { ok: false, state, error: 'card-not-in-hand' };

  const card = player.hand[cardIndex];
  const definition = getCardDefinition(card.definitionId);
  const hand = player.hand.filter((candidate) => candidate.instanceId !== instanceId);
  const updatedPlayer: PlayerState = {
    ...player,
    hand,
    discard: [...player.discard, card],
    score: player.score + definition.value,
  };
  const playersAfterPlay = { ...state.players, [playerId]: updatedPlayer };
  const playEvent: GameEvent = {
    id: state.history.length + 1,
    playerId,
    message: `${player.name} jogou ${definition.name} (+${definition.value} ponto${definition.value === 1 ? '' : 's'}).`,
    cardName: definition.name,
    cardValue: definition.value,
  };
  const history = [...state.history, playEvent];

  if (updatedPlayer.score >= WINNING_SCORE) {
    return {
      ok: true,
      state: { ...state, players: playersAfterPlay, history, status: 'finished', winnerId: playerId },
    };
  }

  const draw = drawCard(updatedPlayer.deck);
  const afterDraw: PlayerState = {
    ...updatedPlayer,
    deck: draw.remaining,
    hand: draw.card ? [...updatedPlayer.hand, draw.card] : updatedPlayer.hand,
  };
  const players = { ...playersAfterPlay, [playerId]: afterDraw };
  const nextPlayerId: PlayerId = playerId === 'human' ? 'bot' : 'human';
  const updatedHistory = draw.card
    ? [...history, {
        id: history.length + 1,
        playerId,
        message: `${afterDraw.name} comprou uma carta.`,
      } satisfies GameEvent]
    : history;

  if (allCardsExhausted(players)) {
    const humanScore = players.human.score;
    const botScore = players.bot.score;
    const winnerId = humanScore === botScore ? 'draw' : humanScore > botScore ? 'human' : 'bot';
    return {
      ok: true,
      state: { ...state, players, history: updatedHistory, status: 'finished', winnerId },
    };
  }

  return { ok: true, state: { ...state, players, history: updatedHistory, currentPlayerId: nextPlayerId } };
}
