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
}

export interface FieldPosition {
  /** Índices técnicos de 0 a 2; nenhuma fileira tem semântica de frente/fundo aqui. */
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
}

export interface DuelState {
  readonly players: readonly [Player, Player];
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
