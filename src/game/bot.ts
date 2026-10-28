import { getCardDefinition } from './cards';
import { playCard } from './engine';
import type { ActionResult, GameState } from './types';

export function chooseBotCard(hand: GameState['players']['bot']['hand']): string | null {
  const selected = [...hand].sort((left, right) => {
    const valueDifference = getCardDefinition(right.definitionId).value - getCardDefinition(left.definitionId).value;
    return valueDifference || left.instanceId.localeCompare(right.instanceId);
  })[0];
  return selected?.instanceId ?? null;
}

export function playBotTurn(state: GameState): ActionResult | null {
  if (state.status !== 'active' || state.currentPlayerId !== 'bot') return null;
  const instanceId = chooseBotCard(state.players.bot.hand);
  return instanceId ? playCard(state, 'bot', instanceId) : null;
}
