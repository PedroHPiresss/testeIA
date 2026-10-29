import { describe, expect, it } from 'vitest';
import { resolveCombat } from './combat';
import { createCardDefinition, createCardInstance, createLeaderDefinition, createLeaderInstance } from './cards';
import { createPlayer } from './players';
import { createDuelState } from './state';
import { placeCard } from './operations';
import type { DuelState, PlayerId } from './types';

function emptyDuel(health = 20): DuelState {
  const player = (id: PlayerId) => createPlayer(id, createLeaderInstance(
    `leader-${id}`, createLeaderDefinition(`leader-def-${id}`, 'Líder'), id, health,
  ));
  return createDuelState(player('p1'), player('p2'));
}

function card(id: string, owner: PlayerId, baseClass: 'troop' | 'shield' | 'flank' | 'effect' = 'troop', attack = 3, defense = 5, isElite = false) {
  const definition = createCardDefinition({ definitionId: `${id}-def`, name: id, baseClass, attack, defense, cost: 1, isElite });
  return createCardInstance(id, definition, owner);
}

function put(state: DuelState, owner: PlayerId, unit: ReturnType<typeof card>, row: number, column: number): DuelState {
  const result = placeCard(state, owner, unit, { row, column });
  if (!result.ok) throw new Error(result.error);
  return result.state;
}

function at(state: DuelState, playerId: PlayerId, row: number, column: number) {
  return state.players.find((player) => player.id === playerId)!.field.cells[row * 4 + column];
}

describe('resolução provisória do combate', () => {
  it('mira a carta mais à frente na mesma coluna, independentemente do lado, sem atingir as de trás ou colunas vizinhas', () => {
    let state = emptyDuel();
    state = put(state, 'p1', card('p1-attacker', 'p1', 'troop', 2), 0, 1);
    state = put(state, 'p2', card('front', 'p2', 'troop', 0, 7), 0, 1);
    state = put(state, 'p2', card('behind', 'p2'), 1, 1);
    state = put(state, 'p2', card('neighbor', 'p2'), 0, 2);
    const resolution = resolveCombat(state);
    expect(resolution.result.ok).toBe(true);
    if (!resolution.result.ok) return;
    expect(at(resolution.result.state, 'p2', 0, 1)?.currentDefense).toBe(5);
    expect(at(resolution.result.state, 'p2', 1, 1)?.currentDefense).toBe(5);
    expect(at(resolution.result.state, 'p2', 0, 2)?.currentDefense).toBe(5);
    expect(at(resolution.result.state, 'p1', 0, 1)?.currentDefense).toBe(2);
  });

  it('acumula ataques simultâneos, mantém o ataque da unidade eliminada e não redireciona após a morte do bloqueador', () => {
    let state = emptyDuel();
    state = put(state, 'p1', card('a1', 'p1', 'troop', 3), 0, 0);
    state = put(state, 'p1', card('a2', 'p1', 'troop', 3), 1, 0);
    state = put(state, 'p2', card('blocker', 'p2', 'troop', 4, 5), 0, 0);
    state = put(state, 'p2', card('behind', 'p2'), 1, 0);
    const resolution = resolveCombat(state);
    expect(resolution.result.ok).toBe(true);
    if (!resolution.result.ok) return;
    expect(at(resolution.result.state, 'p2', 0, 0)).toBeNull();
    expect(at(resolution.result.state, 'p2', 1, 0)?.currentDefense).toBe(5);
    expect(at(resolution.result.state, 'p1', 0, 0)).toBeNull();
    expect(resolution.events.filter((event) => event.targetId === 'blocker')).toHaveLength(2);
  });

  it('preserva definições e entrada, limita excesso de dano a zero e remove eliminadas', () => {
    let state = emptyDuel();
    const source = card('overkill', 'p1', 'troop', 9);
    const target = card('target', 'p2', 'shield', 0, 4);
    state = put(state, 'p1', source, 0, 3);
    state = put(state, 'p2', target, 0, 3);
    const snapshot = structuredClone(state);
    const resolution = resolveCombat(state);
    expect(resolution.result.ok).toBe(true);
    if (!resolution.result.ok) return;
    expect(at(resolution.result.state, 'p2', 0, 3)).toBeNull();
    expect(state).toEqual(snapshot);
    expect(source.definition.attack).toBe(9);
    expect(target.definition.defense).toBe(4);
  });

  it('remove uma unidade quando o dano é exatamente igual à Defesa atual', () => {
    let state = emptyDuel();
    state = put(state, 'p1', card('exact', 'p1', 'troop', 4), 0, 0);
    state = put(state, 'p2', card('exact-target', 'p2', 'shield', 0, 4), 0, 0);
    const result = resolveCombat(state).result;
    expect(result.ok).toBe(true);
    if (result.ok) expect(at(result.state, 'p2', 0, 0)).toBeNull();
  });

  it('permite dano direto em coluna vazia, limita a vida a zero e registra empate por derrota simultânea', () => {
    let state = emptyDuel(3);
    state = put(state, 'p1', card('p1-lethal', 'p1', 'troop', 4), 2, 0);
    state = put(state, 'p2', card('p2-lethal', 'p2', 'troop', 4), 1, 3);
    const resolution = resolveCombat(state);
    expect(resolution.result.ok).toBe(true);
    if (!resolution.result.ok) return;
    expect(resolution.result.outcome).toBe('draw');
    expect(resolution.result.state.players.map((player) => player.leader.currentHealth)).toEqual([0, 0]);
    expect(resolveCombat(resolution.result.state).result).toMatchObject({ ok: false, error: 'combat-finished' });
  });

  it('trata ataque zero como dano zero, escudos não atacam e rejeita classes fora do escopo', () => {
    let state = emptyDuel();
    state = put(state, 'p1', card('zero', 'p1', 'troop', 0), 0, 2);
    state = put(state, 'p1', card('shield', 'p1', 'shield', 99), 0, 1);
    state = put(state, 'p2', card('unsupported', 'p2', 'flank'), 0, 2);
    expect(resolveCombat(state).result).toMatchObject({ ok: false, error: 'unsupported-card' });
    const onlySupported = put(emptyDuel(), 'p1', card('shield-only', 'p1', 'shield', 99), 0, 1);
    expect(resolveCombat(onlySupported).events).toHaveLength(0);
  });

  it('rejeita entrada malformada ou ataque não finito sem alterar o estado', () => {
    const state = emptyDuel();
    expect(resolveCombat(null as unknown as DuelState).result).toMatchObject({ ok: false, error: 'invalid-state' });
    const invalidCard = {
      ...card('nan', 'p1'),
      definition: { ...card('nan-definition', 'p1').definition, attack: Number.NaN },
    };
    const invalidState = put(state, 'p1', invalidCard as ReturnType<typeof card>, 0, 0);
    const result = resolveCombat(invalidState).result;
    expect(result).toMatchObject({ ok: false, error: 'invalid-state', state: invalidState });
    expect(at(invalidState, 'p1', 0, 0)?.definition.attack).toBe(Number.NaN);
  });

  it('aplica dano acumulado igualmente mesmo quando a ordem dos jogadores é invertida', () => {
    let state = emptyDuel();
    state = put(state, 'p1', card('first', 'p1', 'troop', 2), 0, 2);
    state = put(state, 'p1', card('second', 'p1', 'troop', 2), 2, 2);
    state = put(state, 'p2', card('target', 'p2', 'troop', 0, 7), 1, 2);
    const result = resolveCombat(state).result;
    expect(result.ok).toBe(true);
    if (result.ok) expect(at(result.state, 'p2', 1, 2)?.currentDefense).toBe(3);
    const reversed = createDuelState(state.players[1], state.players[0]);
    const reversedResult = resolveCombat(reversed).result;
    expect(reversedResult.ok).toBe(true);
    if (reversedResult.ok) {
      expect(at(reversedResult.state, 'p2', 1, 2)?.currentDefense).toBe(3);
      expect(at(reversedResult.state, 'p1', 0, 2)?.currentDefense).toBe(5);
    }
  });
});
