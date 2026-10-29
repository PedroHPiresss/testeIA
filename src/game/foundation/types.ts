/** Classes-base declaradas pelo criador. Elite é uma característica, não outra classe-base. */
export type BaseCardClass = 'troop' | 'shield' | 'flank' | 'effect';

export type PlayerId = string;

export interface CardDefinition {
  readonly definitionId: string;
  readonly name: string;
  readonly baseClass: BaseCardClass;
  readonly attack: number;
  readonly defense: number;
  readonly cost: number;
  readonly isElite: boolean;
}

export interface CardInstance {
  readonly instanceId: string;
  readonly definition: CardDefinition;
  readonly ownerId: PlayerId;
  readonly currentDefense: number;
}

/** Os atributos do Líder são configuráveis; este modelo não pressupõe quais existem. */
export interface LeaderDefinition {
  readonly definitionId: string;
  readonly name: string;
  readonly attributes: Readonly<Record<string, number>>;
}

export interface LeaderInstance {
  readonly instanceId: string;
  readonly definition: LeaderDefinition;
  readonly ownerId: PlayerId;
  readonly currentHealth: number;
}

export interface FieldPosition {
  /** Índice técnico de 0 a 2; a semântica de frente/fundo é definida pelo sistema consumidor. */
  readonly row: number;
  /** Índices técnicos de 0 a 3. */
  readonly column: number;
}

export interface Battlefield {
  readonly ownerId: PlayerId;
  /** Ordem row-major: índice = row * FIELD_COLUMNS + column. */
  readonly cells: readonly (CardInstance | null)[];
}

export interface Player {
  readonly id: PlayerId;
  readonly field: Battlefield;
  readonly leader: LeaderInstance;
  readonly hand: readonly CardInstance[];
  readonly deck: readonly CardInstance[];
  readonly resources: number;
}

export type DuelPhase = 'planning' | 'finished';

export interface DuelState {
  readonly players: readonly [Player, Player];
  /** Resultado terminal do combate, quando houver. */
  readonly outcome: PlayerId | 'draw' | null;
  readonly round: number;
  readonly phase: DuelPhase;
  readonly activePlayerId: PlayerId;
  readonly initiativePlayerId: PlayerId;
  readonly actedPlayerIds: readonly PlayerId[];
  readonly preparedPlayerIds: readonly PlayerId[];
}

export type FoundationError =
  | 'player-not-found'
  | 'invalid-coordinate'
  | 'wrong-owner'
  | 'position-occupied'
  | 'card-already-positioned'
  | 'position-empty';

export type FoundationResult =
  | { readonly ok: true; readonly state: DuelState }
  | { readonly ok: false; readonly state: DuelState; readonly error: FoundationError };

export type RemoveCardResult =
  | { readonly ok: true; readonly state: DuelState; readonly card: CardInstance }
  | { readonly ok: false; readonly state: DuelState; readonly error: FoundationError };

export type PositionQueryResult =
  | { readonly ok: true; readonly card: CardInstance | null }
  | { readonly ok: false; readonly error: 'invalid-coordinate' };
