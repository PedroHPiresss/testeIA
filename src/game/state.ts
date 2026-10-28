import { createDeck, drawCard, shuffleDeck } from './decks';
import { createSeededRandom } from './random';
import type { GameState, PlayerId, PlayerState } from './types';

const INITIAL_HAND_SIZE = 3;

export function createInitialState(seed = Date.now()): GameState {
  const random = createSeededRandom(seed);
  const players: Record<PlayerId, PlayerState> = {
    human: {
      id: 'human', name: 'Você', kind: 'human', deck: shuffleDeck(createDeck('human'), random),
      hand: [], discard: [], score: 0,
    },
    bot: {
      id: 'bot', name: 'Adversário', kind: 'computer', deck: shuffleDeck(createDeck('bot'), random),
      hand: [], discard: [], score: 0,
    },
  };

  for (const id of ['human', 'bot'] as const) {
    let player = players[id];
    for (let count = 0; count < INITIAL_HAND_SIZE; count += 1) {
      const draw = drawCard(player.deck);
      player = {
        ...player,
        deck: draw.remaining,
        hand: draw.card ? [...player.hand, draw.card] : player.hand,
      };
    }
    players[id] = player;
  }

  return { players, currentPlayerId: 'human', status: 'active', winnerId: null, history: [] };
}
