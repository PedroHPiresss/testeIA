import type {
  BaseCardClass,
  CardDefinition,
  CardInstance,
  LeaderDefinition,
  LeaderInstance,
  PlayerId,
} from './types';

export interface CreateCardDefinitionInput {
  readonly definitionId: string;
  readonly name: string;
  readonly baseClass: BaseCardClass;
  readonly attack: number;
  readonly defense: number;
  readonly cost: number;
  readonly isElite?: boolean;
}

export function createCardDefinition(input: CreateCardDefinitionInput): CardDefinition {
  assertIdentifier(input.definitionId, 'definitionId');
  assertIdentifier(input.name, 'name');
  if (!isBaseCardClass(input.baseClass)) throw new TypeError('baseClass inválida.');
  assertNonNegativeNumber(input.attack, 'attack');
  assertNonNegativeNumber(input.defense, 'defense');
  assertNonNegativeNumber(input.cost, 'cost');
  if (input.isElite !== undefined && typeof input.isElite !== 'boolean') {
    throw new TypeError('isElite deve ser booleano quando informado.');
  }

  return Object.freeze({
    definitionId: input.definitionId,
    name: input.name,
    baseClass: input.baseClass,
    attack: input.attack,
    defense: input.defense,
    cost: input.cost,
    isElite: input.isElite ?? false,
  });
}

export function createCardInstance(
  instanceId: string,
  definition: CardDefinition,
  ownerId: PlayerId,
): CardInstance {
  assertIdentifier(instanceId, 'instanceId');
  assertIdentifier(ownerId, 'ownerId');
  return Object.freeze({
    instanceId,
    definition,
    ownerId,
    currentDefense: definition.defense,
  });
}

/** Este modelo é deliberadamente neutro quanto aos atributos de gameplay do Líder. */
export function createLeaderDefinition(
  definitionId: string,
  name: string,
  attributes: Readonly<Record<string, number>> = {},
): LeaderDefinition {
  assertIdentifier(definitionId, 'definitionId');
  assertIdentifier(name, 'name');
  return Object.freeze({ definitionId, name, attributes: Object.freeze({ ...attributes }) });
}

export function createLeaderInstance(
  instanceId: string,
  definition: LeaderDefinition,
  ownerId: PlayerId,
  currentHealth = DEFAULT_LEADER_HEALTH,
): LeaderInstance {
  assertIdentifier(instanceId, 'instanceId');
  assertIdentifier(ownerId, 'ownerId');
  assertNonNegativeNumber(currentHealth, 'currentHealth');
  return Object.freeze({ instanceId, definition, ownerId, currentHealth });
}

/** Valor apenas provisório para instâncias criadas sem configuração explícita. */
export const DEFAULT_LEADER_HEALTH = 20;

function assertIdentifier(value: string, fieldName: string): void {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new TypeError(`${fieldName} deve ser uma string não vazia.`);
  }
}

function assertNonNegativeNumber(value: number, fieldName: string): void {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    throw new RangeError(`${fieldName} deve ser um número finito não negativo.`);
  }
}

function isBaseCardClass(value: string): value is BaseCardClass {
  return value === 'troop' || value === 'shield' || value === 'flank' || value === 'effect';
}
