import type { CardDefinition, CardDefinitionId, CardInstance, PlayerId } from './types';

export const CARD_LIBRARY: Readonly<Record<CardDefinitionId, CardDefinition>> = {
  'value-1': { definitionId: 'value-1', name: 'Carta de Valor 1', value: 1, description: 'Concede 1 ponto.' },
  'value-2': { definitionId: 'value-2', name: 'Carta de Valor 2', value: 2, description: 'Concede 2 pontos.' },
  'value-3': { definitionId: 'value-3', name: 'Carta de Valor 3', value: 3, description: 'Concede 3 pontos.' },
};

export function getCardDefinition(definitionId: CardDefinitionId): CardDefinition {
  return CARD_LIBRARY[definitionId];
}

export function createCardInstance(
  ownerId: PlayerId,
  definitionId: CardDefinitionId,
  copyNumber: number,
): CardInstance {
  return { instanceId: `${ownerId}-${definitionId}-${copyNumber}`, definitionId, ownerId };
}
