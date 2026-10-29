import { createDuelState } from './state';
import { FIELD_COLUMNS, FIELD_ROWS } from './field';
import type { CardInstance, DuelState, PlayerId } from './types';

export type CombatResult =
  | { readonly ok: true; readonly state: DuelState; readonly outcome: PlayerId | 'draw' | null }
  | { readonly ok: false; readonly state: DuelState; readonly error: 'invalid-state' | 'unsupported-card' | 'combat-finished' };

export interface CombatDamageEvent {
  readonly attackerId: string;
  readonly targetId: string;
  readonly damage: number;
  readonly targetType: 'card' | 'leader';
}

export interface CombatResolution {
  readonly result: CombatResult;
  readonly events: readonly CombatDamageEvent[];
}

/** Interpretação semântica local: row 0 é a frente para ambos os proprietários. */
export function frontToBackRows(): readonly number[] {
  return Object.freeze(Array.from({ length: FIELD_ROWS }, (_, row) => row));
}

/** Resolve um combate completo usando a fileira 0 como frente local de cada campo. */
export function resolveCombat(state: DuelState): CombatResolution {
  const failed = (error: 'invalid-state' | 'unsupported-card' | 'combat-finished'): CombatResolution => ({
    result: { ok: false, state, error }, events: Object.freeze([]),
  });

  try {
    if (!state || !Array.isArray(state.players) || state.players.length !== 2) return failed('invalid-state');
    if (state.outcome !== null && state.outcome !== undefined) {
      return failed('combat-finished');
    }
    if (state.outcome !== null) {
      return failed('invalid-state');
    }
    createDuelState(state.players[0], state.players[1]);
  } catch {
    return failed('invalid-state');
  }

  for (const player of state.players) {
    if (!Number.isFinite(player.leader.currentHealth) || player.leader.currentHealth <= 0) return failed('invalid-state');
    for (const card of player.field.cells) {
      if (card === null) continue;
      if (!Number.isFinite(card.currentDefense) || card.currentDefense <= 0
        || !Number.isFinite(card.definition.attack) || card.definition.attack < 0) return failed('invalid-state');
      if (card.definition.isElite || (card.definition.baseClass !== 'troop' && card.definition.baseClass !== 'shield')) {
        return failed('unsupported-card');
      }
      if (!Number.isFinite(card.definition.defense) || card.definition.defense < 0) return failed('invalid-state');
    }
  }

  const cardDamage = new Map<string, number>();
  const leaderDamage = new Map<PlayerId, number>();
  const events: CombatDamageEvent[] = [];
  const targetFor = (cards: readonly (CardInstance | null)[], column: number): CardInstance | null => {
    for (const row of frontToBackRows()) {
      const card = cards[row * FIELD_COLUMNS + column];
      if (card !== null) return card;
    }
    return null;
  };

  // Fotografia inicial: a aplicação só começa depois que todos os ataques foram computados.
  for (const attackerPlayer of state.players) {
    const defender = state.players.find((player) => player.id !== attackerPlayer.id)!;
    for (let index = 0; index < attackerPlayer.field.cells.length; index += 1) {
      const attacker = attackerPlayer.field.cells[index];
      if (attacker === null || attacker.definition.baseClass !== 'troop') continue;
      const column = index % FIELD_COLUMNS;
      const target = targetFor(defender.field.cells, column);
      const damage = attacker.definition.attack;
      if (target) {
        cardDamage.set(target.instanceId, (cardDamage.get(target.instanceId) ?? 0) + damage);
        events.push(Object.freeze({ attackerId: attacker.instanceId, targetId: target.instanceId, damage, targetType: 'card' }));
      } else {
        leaderDamage.set(defender.id, (leaderDamage.get(defender.id) ?? 0) + damage);
        events.push(Object.freeze({ attackerId: attacker.instanceId, targetId: defender.leader.instanceId, damage, targetType: 'leader' }));
      }
    }
  }

  const players = state.players.map((player) => {
    const cells = player.field.cells.map((card) => {
      if (card === null) return null;
      const damage = cardDamage.get(card.instanceId) ?? 0;
      if (damage === 0) return card;
      const currentDefense = Math.max(0, card.currentDefense - damage);
      return currentDefense === 0 ? null : Object.freeze({ ...card, currentDefense });
    });
    const health = Math.max(0, player.leader.currentHealth - (leaderDamage.get(player.id) ?? 0));
    const leader = health === player.leader.currentHealth
      ? player.leader
      : Object.freeze({ ...player.leader, currentHealth: health });
    return Object.freeze({ ...player, field: Object.freeze({ ...player.field, cells: Object.freeze(cells) }), leader });
  }) as [typeof state.players[number], typeof state.players[number]];

  const firstDead = players[0].leader.currentHealth === 0;
  const secondDead = players[1].leader.currentHealth === 0;
  const outcome: PlayerId | 'draw' | null = firstDead && secondDead
    ? 'draw'
    : firstDead ? players[1].id : secondDead ? players[0].id : null;
  const nextState: DuelState = Object.freeze({
    ...state,
    players: Object.freeze(players),
    outcome,
    phase: outcome === null ? state.phase : 'finished',
  });
  return { result: { ok: true, state: nextState, outcome }, events: Object.freeze(events) };
}
