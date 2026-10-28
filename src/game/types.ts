export type PlayerId = 'human' | 'bot';
export type PlayerKind = 'human' | 'computer';
export type CardDefinitionId = 'value-1' | 'value-2' | 'value-3';

export interface CardDefinition {
  readonly definitionId: CardDefinitionId;
  readonly name: string;
  readonly value: 1 | 2 | 3;
  readonly description: string;
}

export interface CardInstance {
  readonly instanceId: string;
  readonly definitionId: CardDefinitionId;
  readonly ownerId: PlayerId;
}

export interface PlayerState {
  readonly id: PlayerId;
  readonly name: string;
  readonly kind: PlayerKind;
  readonly deck: readonly CardInstance[];
  readonly hand: readonly CardInstance[];
  readonly discard: readonly CardInstance[];
  readonly score: number;
}

export interface GameEvent {
  readonly id: number;
  readonly playerId: PlayerId;
  readonly message: string;
  readonly cardName?: string;
  readonly cardValue?: number;
}

export interface GameState {
  readonly players: Readonly<Record<PlayerId, PlayerState>>;
  readonly currentPlayerId: PlayerId;
  readonly status: 'active' | 'finished';
  readonly winnerId: PlayerId | 'draw' | null;
  readonly history: readonly GameEvent[];
}

export type GameError = 'game-finished' | 'wrong-turn' | 'card-not-in-hand';

export type ActionResult =
  | { readonly ok: true; readonly state: GameState }
  | { readonly ok: false; readonly state: GameState; readonly error: GameError };
