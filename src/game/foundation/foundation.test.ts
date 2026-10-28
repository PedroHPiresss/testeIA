import { describe, expect, it } from 'vitest';
import {
  createCardDefinition,
  createCardInstance,
  createLeaderDefinition,
  createLeaderInstance,
} from './cards';
import {
  FIELD_COLUMNS,
  FIELD_POSITION_COUNT,
  FIELD_ROWS,
  createBattlefield,
  fieldIndex,
  getFieldPosition,
  withCardAt,
} from './field';
import { createPlayer } from './players';
import { createDuelState } from './state';
import { placeCard, removeCard } from './operations';
import type { BaseCardClass, Battlefield, CardInstance, DuelState, PlayerId } from './types';

function makeDefinition(overrides: Partial<Parameters<typeof createCardDefinition>[0]> = {}) {
  return createCardDefinition({
    definitionId: 'definition-test',
    name: 'Carta de teste',
    baseClass: 'troop',
    attack: 3,
    defense: 4,
    cost: 2,
    ...overrides,
  });
}

function makePlayer(id: PlayerId) {
  const leaderDefinition = createLeaderDefinition(`leader-${id}`, `Líder ${id}`, {
    'atributo-de-teste': 1,
  });
  const leader = createLeaderInstance(`leader-instance-${id}`, leaderDefinition, id);
  return createPlayer(id, leader);
}

function makeDuel(): DuelState {
  return createDuelState(makePlayer('player-1'), makePlayer('player-2'));
}

function makeInstance(instanceId: string, ownerId: PlayerId, defense = 4): CardInstance {
  return createCardInstance(instanceId, makeDefinition({ defense }), ownerId);
}

describe('definições e instâncias de carta', () => {
  it('preserva os dados fornecidos e representa separadamente as quatro classes-base', () => {
    const classes: readonly BaseCardClass[] = ['troop', 'shield', 'flank', 'effect'];
    const definitions = classes.map((baseClass, index) => makeDefinition({
      definitionId: `class-${index}`,
      baseClass,
    }));

    expect(definitions.map((definition) => definition.baseClass)).toEqual(classes);
    expect(definitions[0]).toMatchObject({
      definitionId: 'class-0', name: 'Carta de teste', attack: 3, defense: 4, cost: 2,
    });
    expect(definitions[0].isElite).toBe(false);
    expect(Object.isFrozen(definitions[0])).toBe(true);
  });

  it('permite Elite como característica independente da classe-base', () => {
    const definition = makeDefinition({ baseClass: 'troop', isElite: true });
    expect(definition.baseClass).toBe('troop');
    expect(definition.isElite).toBe(true);
  });

  it('permite Defesa zero sem transformar isso em regra de eliminação', () => {
    const definition = makeDefinition({ baseClass: 'flank', defense: 0 });
    const instance = createCardInstance('flank-instance', definition, 'player-1');
    expect(instance.currentDefense).toBe(0);
    expect(instance.definition.defense).toBe(0);
  });

  it('rejeita identificadores vazios, classes inválidas e atributos numéricos negativos ou não finitos', () => {
    expect(() => makeDefinition({ definitionId: '  ' })).toThrow(TypeError);
    expect(() => makeDefinition({ name: '' })).toThrow(TypeError);
    expect(() => makeDefinition({ baseClass: 'leader' as unknown as BaseCardClass })).toThrow(TypeError);
    expect(() => makeDefinition({ attack: -1 })).toThrow(RangeError);
    expect(() => makeDefinition({ defense: -1 })).toThrow(RangeError);
    expect(() => makeDefinition({ cost: -1 })).toThrow(RangeError);
    expect(() => makeDefinition({ attack: Number.NaN })).toThrow(RangeError);
    expect(() => makeDefinition({ cost: Number.POSITIVE_INFINITY })).toThrow(RangeError);
  });

  it('cria instâncias únicas que referenciam a definição e isolam a Defesa atual', () => {
    const definition = makeDefinition();
    const first = createCardInstance('instance-1', definition, 'player-1');
    const second = createCardInstance('instance-2', definition, 'player-1');

    expect(first.instanceId).not.toBe(second.instanceId);
    expect(first.definition).toBe(definition);
    expect(second.definition).toBe(definition);
    expect(first.ownerId).toBe('player-1');
    expect(first.currentDefense).toBe(definition.defense);
    expect(second.currentDefense).toBe(definition.defense);
    expect(first).not.toBe(second);
    expect(Object.isFrozen(first)).toBe(true);
  });
});

describe('jogadores, Líderes e campos', () => {
  it('cria dois jogadores independentes com Líder separado do campo', () => {
    const duel = makeDuel();
    const [first, second] = duel.players;

    expect(first.id).not.toBe(second.id);
    expect(first.field.ownerId).toBe(first.id);
    expect(second.field.ownerId).toBe(second.id);
    expect(first.leader.ownerId).toBe(first.id);
    expect(second.leader.ownerId).toBe(second.id);
    expect(first.leader).not.toBe(second.leader);
    expect(first.field).not.toBe(second.field);
    expect(first.field.cells).not.toBe(second.field.cells);
    expect(first.field.cells).toHaveLength(FIELD_POSITION_COUNT);
    expect(first.field.cells.every((cell) => cell === null)).toBe(true);
    expect(second.field.cells.every((cell) => cell === null)).toBe(true);
    expect(first.leader.definition.attributes).toEqual({ 'atributo-de-teste': 1 });
  });

  it('representa exatamente 4 colunas por 3 fileiras sem semântica de frente/fundo', () => {
    const field = createBattlefield('player-1');
    expect(FIELD_COLUMNS).toBe(4);
    expect(FIELD_ROWS).toBe(3);
    expect(field.cells).toHaveLength(12);
    for (let row = 0; row < FIELD_ROWS; row += 1) {
      for (let column = 0; column < FIELD_COLUMNS; column += 1) {
        expect(fieldIndex({ row, column })).toBe(row * FIELD_COLUMNS + column);
        expect(getFieldPosition(field, { row, column })).toEqual({ ok: true, card: null });
      }
    }
  });

  it('rejeita coordenadas fora dos limites, fracionárias ou não finitas', () => {
    const field = createBattlefield('player-1');
    for (const position of [
      { row: -1, column: 0 }, { row: 3, column: 0 }, { row: 0, column: -1 },
      { row: 0, column: 4 }, { row: 0.5, column: 1 }, { row: 1, column: Number.NaN },
    ]) {
      expect(fieldIndex(position)).toBeNull();
      expect(getFieldPosition(field, position)).toEqual({ ok: false, error: 'invalid-coordinate' });
    }
  });

  it('exige que o Líder pertença ao jogador e que os dois IDs sejam distintos', () => {
    const leader = createLeaderInstance(
      'leader-instance',
      createLeaderDefinition('leader', 'Líder'),
      'player-2',
    );
    expect(() => createPlayer('player-1', leader)).toThrow(TypeError);
    const player = makePlayer('player-1');
    expect(() => createDuelState(player, player)).toThrow(TypeError);
  });

  it('rejeita campo com quantidade de posições inválida sem alterar o campo recebido', () => {
    const player = makePlayer('player-1');
    const secondPlayer = makePlayer('player-2');
    const malformedField: Battlefield = Object.freeze({
      ...player.field,
      cells: Object.freeze([null]),
    });
    const malformedPlayer = { ...player, field: malformedField };

    expect(() => createDuelState(malformedPlayer, secondPlayer)).toThrow(TypeError);
    expect(malformedPlayer.field).toBe(malformedField);
    expect(malformedField.cells).toEqual([null]);
  });

  it('rejeita campo cujo ownerId diverge do jogador', () => {
    const player = makePlayer('player-1');
    const malformedPlayer = { ...player, field: createBattlefield('player-2') };

    expect(() => createDuelState(malformedPlayer, makePlayer('player-2'))).toThrow(TypeError);
    expect(malformedPlayer.field.ownerId).toBe('player-2');
    expect(malformedPlayer.field.cells.every((cell) => cell === null)).toBe(true);
  });

  it('rejeita Líder cujo ownerId diverge do jogador', () => {
    const player = makePlayer('player-1');
    const mismatchedLeader = createLeaderInstance(
      'mismatched-leader',
      createLeaderDefinition('mismatched-leader-definition', 'Líder de teste'),
      'player-2',
    );
    const malformedPlayer = { ...player, leader: mismatchedLeader };

    expect(() => createDuelState(malformedPlayer, makePlayer('player-2'))).toThrow(TypeError);
    expect(malformedPlayer.leader).toBe(mismatchedLeader);
    expect(malformedPlayer.field).toBe(player.field);
  });

  it('rejeita carta cuja propriedade diverge do campo sem alterar as posições', () => {
    const player = makePlayer('player-1');
    const secondPlayer = makePlayer('player-2');
    const foreignCard = makeInstance('foreign-instance', 'player-2');
    const malformedField = withCardAt(player.field, { row: 0, column: 0 }, foreignCard)!;
    const malformedPlayer = { ...player, field: malformedField };

    expect(() => createDuelState(malformedPlayer, secondPlayer)).toThrow(TypeError);
    expect(malformedPlayer.field.cells[0]).toBe(foreignCard);
    expect(malformedPlayer.field.cells).toHaveLength(FIELD_POSITION_COUNT);
  });

  it('rejeita instanceIds repetidos entre os dois campos sem alterar nenhum deles', () => {
    const firstPlayer = makePlayer('player-1');
    const secondPlayer = makePlayer('player-2');
    const firstCard = makeInstance('duplicate-id', 'player-1');
    const secondCard = makeInstance('duplicate-id', 'player-2');
    const firstField = withCardAt(firstPlayer.field, { row: 0, column: 0 }, firstCard)!;
    const secondField = withCardAt(secondPlayer.field, { row: 2, column: 3 }, secondCard)!;
    const first = { ...firstPlayer, field: firstField };
    const second = { ...secondPlayer, field: secondField };

    expect(() => createDuelState(first, second)).toThrow(TypeError);
    expect(first.field.cells[0]).toBe(firstCard);
    expect(second.field.cells[FIELD_POSITION_COUNT - 1]).toBe(secondCard);
  });
});

describe('posicionamento e retirada estrutural', () => {
  it('posiciona a carta na coordenada solicitada e deixa o campo adversário intacto', () => {
    const state = makeDuel();
    const card = makeInstance('instance-1', 'player-1');
    const result = placeCard(state, 'player-1', card, { row: 2, column: 3 });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(getFieldPosition(result.state.players[0].field, { row: 2, column: 3 })).toEqual({ ok: true, card });
    expect(result.state.players[1].field).toBe(state.players[1].field);
    expect(state.players[0].field.cells.every((cell) => cell === null)).toBe(true);
  });

  it('rejeita posição ocupada sem substituir a carta existente nem alterar o estado', () => {
    const state = makeDuel();
    const first = makeInstance('instance-1', 'player-1');
    const second = makeInstance('instance-2', 'player-1');
    const placed = placeCard(state, 'player-1', first, { row: 0, column: 0 });
    expect(placed.ok).toBe(true);
    if (!placed.ok) return;

    const rejected = placeCard(placed.state, 'player-1', second, { row: 0, column: 0 });
    expect(rejected).toEqual({ ok: false, state: placed.state, error: 'position-occupied' });
    expect(getFieldPosition(placed.state.players[0].field, { row: 0, column: 0 })).toEqual({ ok: true, card: first });
  });

  it('rejeita carta de proprietário incorreto e coordenada inválida sem mutação', () => {
    const state = makeDuel();
    const foreignCard = makeInstance('foreign-instance', 'player-2');
    expect(placeCard(state, 'player-1', foreignCard, { row: 0, column: 0 })).toEqual({
      ok: false, state, error: 'wrong-owner',
    });
    expect(placeCard(state, 'player-1', makeInstance('valid-instance', 'player-1'), { row: 3, column: 0 })).toEqual({
      ok: false, state, error: 'invalid-coordinate',
    });
  });

  it('impede que a mesma instância ocupe duas posições ao mesmo tempo', () => {
    const state = makeDuel();
    const card = makeInstance('instance-1', 'player-1');
    const firstPlacement = placeCard(state, 'player-1', card, { row: 0, column: 0 });
    expect(firstPlacement.ok).toBe(true);
    if (!firstPlacement.ok) return;

    const duplicateReference = createCardInstance('instance-1', card.definition, 'player-1');
    const duplicatePlacement = placeCard(firstPlacement.state, 'player-1', duplicateReference, { row: 0, column: 1 });
    expect(duplicatePlacement).toEqual({
      ok: false, state: firstPlacement.state, error: 'card-already-positioned',
    });
  });

  it('retira a carta, libera a posição e permite posicioná-la novamente', () => {
    const state = makeDuel();
    const card = makeInstance('instance-1', 'player-1');
    const placed = placeCard(state, 'player-1', card, { row: 1, column: 2 });
    expect(placed.ok).toBe(true);
    if (!placed.ok) return;

    const removed = removeCard(placed.state, 'player-1', { row: 1, column: 2 });
    expect(removed.ok).toBe(true);
    if (!removed.ok) return;
    expect(removed.card).toBe(card);
    expect(getFieldPosition(removed.state.players[0].field, { row: 1, column: 2 })).toEqual({ ok: true, card: null });
    expect(placeCard(removed.state, 'player-1', card, { row: 1, column: 2 }).ok).toBe(true);
  });

  it('rejeita retirada de posição vazia ou inválida sem alteração parcial', () => {
    const state = makeDuel();
    expect(removeCard(state, 'player-1', { row: 0, column: 0 })).toEqual({
      ok: false, state, error: 'position-empty',
    });
    expect(removeCard(state, 'player-1', { row: -1, column: 0 })).toEqual({
      ok: false, state, error: 'invalid-coordinate',
    });
  });

  it('preserva consistência após ocupar e retirar sucessivamente várias posições', () => {
    let state = makeDuel();
    const cards = Array.from({ length: FIELD_POSITION_COUNT }, (_, index) =>
      makeInstance(`instance-${index}`, 'player-1'));

    for (let index = 0; index < FIELD_POSITION_COUNT; index += 1) {
      const result = placeCard(state, 'player-1', cards[index], {
        row: Math.floor(index / FIELD_COLUMNS),
        column: index % FIELD_COLUMNS,
      });
      expect(result.ok).toBe(true);
      if (result.ok) state = result.state;
    }

    expect(state.players[0].field.cells).toHaveLength(FIELD_POSITION_COUNT);
    expect(state.players[0].field.cells.filter((cell) => cell !== null)).toHaveLength(FIELD_POSITION_COUNT);
    expect(state.players[1].field.cells.every((cell) => cell === null)).toBe(true);

    for (let index = FIELD_POSITION_COUNT - 1; index >= 0; index -= 1) {
      const result = removeCard(state, 'player-1', {
        row: Math.floor(index / FIELD_COLUMNS),
        column: index % FIELD_COLUMNS,
      });
      expect(result.ok).toBe(true);
      if (result.ok) state = result.state;
    }

    expect(state.players[0].field.cells.every((cell) => cell === null)).toBe(true);
  });
});
