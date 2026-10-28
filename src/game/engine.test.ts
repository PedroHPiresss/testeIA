import { describe, expect, it } from 'vitest';
import { chooseBotCard, playBotTurn } from './bot';
import { getCardDefinition } from './cards';
import { createDeck, drawCard, shuffleDeck } from './decks';
import { playCard } from './engine';
import { createSeededRandom } from './random';
import { createInitialState } from './state';
import type { GameState, PlayerId, PlayerState } from './types';

function totalCards(player: PlayerState): number {
  return player.deck.length + player.hand.length + player.discard.length;
}

describe('baralhos e estado inicial', () => {
  it('cria 12 instâncias únicas com quatro cartas de cada valor', () => {
    const deck = createDeck('human');
    expect(deck).toHaveLength(12);
    expect(new Set(deck.map((card) => card.instanceId)).size).toBe(12);
    expect(deck.map((card) => getCardDefinition(card.definitionId).value).sort()).toEqual([
      1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3,
    ]);
  });

  it('distribui três cartas por jogador e mantém instâncias globais distintas', () => {
    const state = createInitialState(42);
    expect(state.players.human.hand).toHaveLength(3);
    expect(state.players.bot.hand).toHaveLength(3);
    expect(state.players.human.deck).toHaveLength(9);
    expect(state.players.bot.deck).toHaveLength(9);
    expect(new Set(['human', 'bot'].flatMap((id) => {
      const player = state.players[id as PlayerId];
      return [...player.deck, ...player.hand].map((card) => card.instanceId);
    })).size).toBe(24);
    expect(createInitialState(42)).toEqual(state);
  });

  it('embaralha de forma reproduzível e compra sem duplicar ou perder cartas', () => {
    const deck = createDeck('human');
    const first = shuffleDeck(deck, createSeededRandom(7));
    expect(shuffleDeck(deck, createSeededRandom(7))).toEqual(first);
    expect(first.map((card) => card.instanceId).sort()).toEqual(deck.map((card) => card.instanceId).sort());
    const draw = drawCard(first);
    expect(draw.card).toBe(first[0]);
    expect(draw.remaining).toHaveLength(11);
    expect(drawCard([])).toEqual({ card: null, remaining: [] });
  });
});

describe('motor de regras', () => {
  it('valida turno e posse sem modificar o estado em ações inválidas', () => {
    const state = createInitialState(8);
    expect(playCard(state, 'bot', state.players.bot.hand[0].instanceId)).toEqual({
      ok: false, state, error: 'wrong-turn',
    });
    expect(playCard(state, 'human', 'carta-inexistente')).toEqual({
      ok: false, state, error: 'card-not-in-hand',
    });
  });

  it('joga, pontua, compra para repor e passa o turno mantendo as 12 cartas', () => {
    const state = createInitialState(12);
    const card = state.players.human.hand[0];
    const value = getCardDefinition(card.definitionId).value;
    const result = playCard(state, 'human', card.instanceId);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.state.players.human.score).toBe(value);
    expect(result.state.players.human.hand).toHaveLength(3);
    expect(result.state.players.human.discard).toContainEqual(card);
    expect(result.state.players.human.deck).toHaveLength(8);
    expect(totalCards(result.state.players.human)).toBe(12);
    expect(result.state.currentPlayerId).toBe('bot');
    expect(result.state.history[0].cardName).toBeDefined();
    expect(result.state.history[1].message).toContain('comprou');
  });

  it('encerra imediatamente ao alcançar 10 pontos, antes da compra', () => {
    const initial = createInitialState(5);
    const card = initial.players.human.hand.find((item) => getCardDefinition(item.definitionId).value === 3);
    expect(card).toBeDefined();
    const human = { ...initial.players.human, score: 7 };
    const state: GameState = {
      ...initial,
      players: { ...initial.players, human },
    };
    const deckCount = human.deck.length;
    const result = playCard(state, 'human', card!.instanceId);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.state.status).toBe('finished');
    expect(result.state.winnerId).toBe('human');
    expect(result.state.players.human.score).toBe(10);
    expect(result.state.players.human.deck).toHaveLength(deckCount);
    const afterFinish = playCard(result.state, 'human', initial.players.human.hand[0].instanceId);
    expect(afterFinish.ok).toBe(false);
    if (!afterFinish.ok) expect(afterFinish.error).toBe('game-finished');
  });

  it('encerra com empate quando todas as mãos e baralhos acabam empatados', () => {
    const initial = createInitialState(17);
    const humanCard = createDeck('human').find((card) => card.definitionId === 'value-2')!;
    const botCard = createDeck('bot').find((card) => card.definitionId === 'value-2')!;
    const human = { ...initial.players.human, deck: [], hand: [humanCard], score: 0 };
    const bot = { ...initial.players.bot, deck: [], hand: [botCard], score: 0 };
    const state: GameState = { ...initial, players: { human, bot } };
    const humanMove = playCard(state, 'human', humanCard.instanceId);
    expect(humanMove.ok).toBe(true);
    if (!humanMove.ok) return;
    const botMove = playCard(humanMove.state, 'bot', botCard.instanceId);
    expect(botMove.ok).toBe(true);
    if (!botMove.ok) return;
    expect(botMove.state.status).toBe('finished');
    expect(botMove.state.winnerId).toBe('draw');
  });
});

describe('adversário controlado por lógica', () => {
  it('escolhe o maior valor e usa o menor identificador como desempate', () => {
    const initial = createInitialState(21);
    const botCards = [...initial.players.bot.hand, ...initial.players.bot.deck];
    const highCards = botCards.filter((card) => card.definitionId === 'value-3').slice(0, 2);
    const highCardIds = new Set(highCards.map((card) => card.instanceId));
    const bot = {
      ...initial.players.bot,
      hand: highCards,
      deck: botCards.filter((card) => !highCardIds.has(card.instanceId)),
    };
    const state: GameState = { ...initial, players: { ...initial.players, bot }, currentPlayerId: 'bot' };
    const expected = [...bot.hand].sort((left, right) => left.instanceId.localeCompare(right.instanceId))[0];
    expect(chooseBotCard(bot.hand)).toBe(expected.instanceId);
    const result = playBotTurn(state);
    expect(result?.ok).toBe(true);
    if (!result?.ok) return;
    expect(result.state.players.bot.score).toBe(3);
    expect(result.state.history[0].playerId).toBe('bot');
    expect(result.state.players.human.hand).toEqual(initial.players.human.hand);
  });
});
