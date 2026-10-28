import { createCardInstance } from './cards';
import type { CardDefinitionId, CardInstance, PlayerId } from './types';
import type { RandomSource } from './random';

const CARD_COPIES: readonly CardDefinitionId[] = [
  'value-1', 'value-1', 'value-1', 'value-1',
  'value-2', 'value-2', 'value-2', 'value-2',
  'value-3', 'value-3', 'value-3', 'value-3',
];

export function createDeck(ownerId: PlayerId): CardInstance[] {
  return CARD_COPIES.map((definitionId, index) => createCardInstance(ownerId, definitionId, index + 1));
}

export function shuffleDeck(cards: readonly CardInstance[], random: RandomSource = Math.random): CardInstance[] {
  const shuffled = [...cards];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[target]] = [shuffled[target], shuffled[index]];
  }
  return shuffled;
}

export function drawCard(deck: readonly CardInstance[]): {
  readonly card: CardInstance | null;
  readonly remaining: readonly CardInstance[];
} {
  const [card, ...remaining] = deck;
  return { card: card ?? null, remaining };
}
