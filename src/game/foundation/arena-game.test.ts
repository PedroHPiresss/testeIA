import { describe, expect, it } from 'vitest';
import {
  INITIAL_HAND_SIZE,
  INITIAL_RESOURCES,
  createBotDecisionView,
  createArenaGame,
  finishArenaPlanning,
  listLegalArenaMoves,
  playArenaCard,
  runBotPlanning,
} from './arena-game';
import { createDuelState } from './state';
import type { DuelState, Player } from './types';

function player(state: DuelState, id: string): Player {
  return state.players.find((candidate) => candidate.id === id)!;
}

describe('partida jogável da Arena', () => {
  it('distribui mãos e baralhos próprios, recursos iguais e IDs únicos de forma reprodutível', () => {
    const state = createArenaGame(45);
    expect(createArenaGame(45)).toEqual(state);
    expect(state.round).toBe(1);
    expect(state.activePlayerId).toBe('human');
    expect(state.phase).toBe('planning');
    for (const participant of state.players) {
      expect(participant.hand).toHaveLength(INITIAL_HAND_SIZE);
      expect(participant.deck).toHaveLength(9);
      expect(participant.resources).toBe(INITIAL_RESOURCES);
    }
    const cardIds = state.players.flatMap((participant) => [...participant.hand, ...participant.deck].map((card) => card.instanceId));
    expect(new Set(cardIds).size).toBe(cardIds.length);
    expect(player(state, 'human').hand.every((card) => card.ownerId === 'human')).toBe(true);
    expect(player(state, 'bot').hand.every((card) => card.ownerId === 'bot')).toBe(true);
  });

  it.each(['human', 'bot'])('%s e bot usam a mesma operação de posicionamento, pagamento e limite', (actor) => {
    let state = createArenaGame(8);
    if (actor === 'bot') state = Object.freeze({ ...state, activePlayerId: 'bot' });
    const participant = player(state, actor);
    const card = participant.hand.find((item) => item.definition.cost <= participant.resources)!;
    const placed = playArenaCard(state, actor, card.instanceId, { row: 0, column: 1 });
    expect(placed.ok).toBe(true);
    if (!placed.ok) return;
    const updated = player(placed.state, actor);
    expect(updated.hand.some((item) => item.instanceId === card.instanceId)).toBe(false);
    expect(updated.field.cells[1]?.instanceId).toBe(card.instanceId);
    expect(updated.resources).toBe(participant.resources - card.definition.cost);
    expect(placed.state.actedPlayerIds).toContain(actor);
    expect(playArenaCard(placed.state, actor, updated.hand[0].instanceId, { row: 0, column: 2 })).toMatchObject({
      ok: false, error: 'already-prepared', state: placed.state,
    });
  });

  it('rejeita carta fora da mão, custo insuficiente, espaço inválido e turno incorreto sem alterar estado', () => {
    const state = createArenaGame(2);
    expect(playArenaCard(state, 'human', 'missing', { row: 0, column: 0 })).toMatchObject({ ok: false, error: 'card-not-in-hand', state });
    expect(playArenaCard(state, 'bot', player(state, 'bot').hand[0].instanceId, { row: 0, column: 0 })).toMatchObject({
      ok: false, error: 'wrong-turn', state,
    });
    const poor = Object.freeze({
      ...state,
      players: Object.freeze(state.players.map((participant) => participant.id === 'human'
        ? Object.freeze({ ...participant, resources: 0 }) : participant)) as unknown as DuelState['players'],
    });
    const expensive = player(poor, 'human').hand.find((card) => card.definition.cost > 0)!;
    expect(playArenaCard(poor, 'human', expensive.instanceId, { row: 0, column: 0 })).toMatchObject({
      ok: false, error: 'insufficient-resources', state: poor,
    });
    expect(playArenaCard(state, 'human', player(state, 'human').hand[0].instanceId, { row: 9, column: 0 })).toMatchObject({
      ok: false, error: 'invalid-coordinate', state,
    });
  });

  it('a validação do duelo detecta uma instância duplicada entre mão e baralho', () => {
    const state = createArenaGame(4);
    const human = player(state, 'human');
    const duplicated = Object.freeze({ ...human, deck: Object.freeze([...human.deck.slice(1), human.hand[0]]) });
    expect(() => createDuelState(duplicated, player(state, 'bot'))).toThrow(TypeError);
  });

  it('mantém a renda simétrica, aplica o teto de recursos e encerra cada combate uma vez', () => {
    let state = createArenaGame(5);
    for (let round = 0; round < 8; round += 1) {
      const firstPlayer = state.activePlayerId;
      const first = finishArenaPlanning(state, firstPlayer);
      expect(first.ok).toBe(true);
      if (!first.ok) return;
      expect(first.combatResolved).toBe(false);
      const secondPlayer = first.state.activePlayerId;
      const second = finishArenaPlanning(first.state, secondPlayer);
      expect(second.ok).toBe(true);
      if (!second.ok) return;
      expect(second.combatResolved).toBe(true);
      expect(second.roundAdvanced).toBe(true);
      state = second.state;
    }
    expect(state.players.map((participant) => participant.resources)).toEqual([8, 8]);
    expect(state.round).toBe(9);
  });

  it('o bot passa sem alterar cartas ou recursos quando não existe jogada legal', () => {
    let state = createArenaGame(12);
    state = Object.freeze({
      ...state,
      activePlayerId: 'bot',
      players: Object.freeze(state.players.map((participant) => participant.id === 'bot'
        ? Object.freeze({ ...participant, resources: 0 }) : participant)) as DuelState['players'],
    });
    const before = player(state, 'bot');
    expect(listLegalArenaMoves(state, 'bot')).toEqual([]);
    const result = runBotPlanning(state);
    expect(result.move).toBeNull();
    expect(result.transition.ok).toBe(true);
    if (result.transition.ok) {
      expect(player(result.transition.state, 'bot').hand).toEqual(before.hand);
      expect(player(result.transition.state, 'bot').resources).toBe(0);
      expect(result.transition.state.activePlayerId).toBe('human');
    }
  });

  it('fornece ao seletor do bot apenas o campo, Líder e recursos públicos do oponente', () => {
    const view = createBotDecisionView(createArenaGame(17));
    expect(view).not.toBeNull();
    if (!view) return;
    expect(view.ownPlayer.id).toBe('bot');
    expect(view.opponentPublic.id).toBe('human');
    expect(Object.hasOwn(view.opponentPublic, 'hand')).toBe(false);
    expect(Object.hasOwn(view.opponentPublic, 'deck')).toBe(false);
  });

  it('resolve combate ao fim da segunda preparação e bloqueia a partida terminal', () => {
    let state = createArenaGame(29);
    state = Object.freeze({
      ...state,
      players: Object.freeze(state.players.map((participant) => Object.freeze({
        ...participant,
        leader: Object.freeze({ ...participant.leader, currentHealth: 1 }),
      }))) as DuelState['players'],
    });
    const bot = player(state, 'bot');
    if (!bot.hand.some((card) => card.definition.baseClass === 'troop')) {
      const botTroop = bot.deck.find((card) => card.definition.baseClass === 'troop')!;
      const replaced = bot.hand[0];
      const updatedBot = Object.freeze({
        ...bot,
        hand: Object.freeze([botTroop, ...bot.hand.slice(1)]),
        deck: Object.freeze([...bot.deck.filter((card) => card.instanceId !== botTroop.instanceId), replaced]),
      });
      state = Object.freeze({
        ...state,
        players: Object.freeze(state.players.map((participant) => participant.id === 'bot' ? updatedBot : participant)) as DuelState['players'],
      });
    }
    const firstPrepared = finishArenaPlanning(state, 'human');
    expect(firstPrepared.ok).toBe(true);
    if (!firstPrepared.ok) return;

    const botTurn = runBotPlanning(firstPrepared.state);
    expect(botTurn.move).not.toBeNull();
    expect(botTurn.transition.ok).toBe(true);
    if (!botTurn.transition.ok) return;
    expect(botTurn.transition.combatResolved).toBe(true);
    expect(botTurn.transition.state.players.map((participant) => participant.leader.currentHealth)).toEqual([0, 1]);
    expect(botTurn.transition.state.phase).toBe('finished');
    expect(botTurn.transition.state.outcome).toBe('bot');
    expect(finishArenaPlanning(botTurn.transition.state, 'human')).toMatchObject({ ok: false, error: 'game-finished' });
  });

  it('dá uma oportunidade simétrica, executa uma vez o bot pela operação comum e avança recursos/compra/iniciativa', () => {
    const initial = createArenaGame(11);
    const humanCard = player(initial, 'human').hand[0];
    const placement = playArenaCard(initial, 'human', humanCard.instanceId, { row: 0, column: 0 });
    expect(placement.ok).toBe(true);
    if (!placement.ok) return;

    const humanReady = finishArenaPlanning(placement.state, 'human');
    expect(humanReady.ok).toBe(true);
    if (!humanReady.ok) return;
    expect(humanReady.combatResolved).toBe(false);
    expect(humanReady.state.activePlayerId).toBe('bot');

    const botOriginalHand = player(humanReady.state, 'bot').hand;
    const botTurn = runBotPlanning(humanReady.state);
    expect(botTurn.move).not.toBeNull();
    expect(botTurn.move && botOriginalHand.some((card) => card.instanceId === botTurn.move!.cardId)).toBe(true);
    expect(botTurn.transition.ok).toBe(true);
    if (!botTurn.transition.ok) return;
    expect(botTurn.transition.combatResolved).toBe(true);
    expect(botTurn.transition.roundAdvanced).toBe(true);
    expect(botTurn.transition.combatEvents.length).toBeGreaterThan(0);
    expect(botTurn.transition.state.round).toBe(2);
    expect(botTurn.transition.state.activePlayerId).toBe('bot');
    expect(botTurn.transition.state.initiativePlayerId).toBe('bot');
    expect(botTurn.transition.state.preparedPlayerIds).toEqual([]);
    expect(botTurn.transition.state.players.every((participant) => participant.hand.length === INITIAL_HAND_SIZE)).toBe(true);
    expect(botTurn.transition.state.players.every((participant) => participant.resources >= 1)).toBe(true);
  });

  it('impede preparação ou jogadas após a partida terminar', () => {
    let state = createArenaGame(15);
    state = Object.freeze({ ...state, outcome: 'human', phase: 'finished' });
    expect(finishArenaPlanning(state, 'human')).toMatchObject({ ok: false, error: 'game-finished', state });
    expect(playArenaCard(state, 'human', player(state, 'human').hand[0].instanceId, { row: 0, column: 0 })).toMatchObject({
      ok: false, error: 'game-finished', state,
    });
    expect(listLegalArenaMoves(state, 'bot')).toEqual([]);
  });
});
