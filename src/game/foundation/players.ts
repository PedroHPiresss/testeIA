import { createBattlefield } from './field';
import type { LeaderInstance, Player, PlayerId } from './types';

export function createPlayer(id: PlayerId, leader: LeaderInstance): Player {
  if (typeof id !== 'string' || id.trim().length === 0) {
    throw new TypeError('id do jogador deve ser uma string não vazia.');
  }
  if (leader.ownerId !== id) throw new TypeError('O Líder deve pertencer ao jogador.');

  return Object.freeze({
    id,
    field: createBattlefield(id),
    leader,
    hand: Object.freeze([]),
    deck: Object.freeze([]),
    resources: 0,
  });
}
