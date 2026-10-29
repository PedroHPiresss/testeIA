import { FIELD_POSITION_COUNT } from './field';
import type { DuelState, Player } from './types';

export function createDuelState(firstPlayer: Player, secondPlayer: Player): DuelState {
  if (firstPlayer.id === secondPlayer.id) throw new TypeError('Os jogadores precisam ter identificadores distintos.');

  const positionedCardIds = new Set<string>();
  for (const player of [firstPlayer, secondPlayer]) {
    if (player.field.ownerId !== player.id || player.leader.ownerId !== player.id) {
      throw new TypeError('Campo e Líder devem pertencer ao jogador correspondente.');
    }
    if (!Array.isArray(player.field.cells) || player.field.cells.length !== FIELD_POSITION_COUNT) {
      throw new TypeError(`O campo deve conter exatamente ${FIELD_POSITION_COUNT} posições.`);
    }

    if (!Number.isFinite(player.resources) || player.resources < 0) {
      throw new TypeError('Os recursos do jogador devem ser finitos e não negativos.');
    }
    for (const card of [...player.field.cells, ...player.hand, ...player.deck]) {
      if (card === null) continue;
      if (typeof card !== 'object' || typeof card.instanceId !== 'string' || card.instanceId.trim().length === 0) {
        throw new TypeError('Toda carta posicionada deve ter um identificador de instância válido.');
      }
      if (card.ownerId !== player.id) throw new TypeError('A carta deve pertencer ao proprietário do campo.');
      if (positionedCardIds.has(card.instanceId)) {
        throw new TypeError('Uma instância de carta não pode ocupar mais de uma posição.');
      }
      positionedCardIds.add(card.instanceId);
    }
  }

  return Object.freeze({
    players: Object.freeze([firstPlayer, secondPlayer]) as readonly [Player, Player],
    outcome: null,
    round: 1,
    phase: 'planning',
    activePlayerId: firstPlayer.id,
    initiativePlayerId: firstPlayer.id,
    actedPlayerIds: Object.freeze([]),
    preparedPlayerIds: Object.freeze([]),
  });
}
