import type { Battlefield, CardInstance, FieldPosition, PlayerId, PositionQueryResult } from './types';

export const FIELD_COLUMNS = 4;
export const FIELD_ROWS = 3;
export const FIELD_POSITION_COUNT = FIELD_COLUMNS * FIELD_ROWS;

export function createBattlefield(ownerId: PlayerId): Battlefield {
  return Object.freeze({
    ownerId,
    cells: Object.freeze(Array.from({ length: FIELD_POSITION_COUNT }, () => null)),
  });
}

export function isValidPosition(position: FieldPosition): boolean {
  return Number.isInteger(position.row)
    && Number.isInteger(position.column)
    && position.row >= 0
    && position.row < FIELD_ROWS
    && position.column >= 0
    && position.column < FIELD_COLUMNS;
}

export function fieldIndex(position: FieldPosition): number | null {
  return isValidPosition(position) ? position.row * FIELD_COLUMNS + position.column : null;
}

export function getFieldPosition(field: Battlefield, position: FieldPosition): PositionQueryResult {
  const index = fieldIndex(position);
  if (index === null) return { ok: false, error: 'invalid-coordinate' };
  return { ok: true, card: field.cells[index] };
}

export function withCardAt(
  field: Battlefield,
  position: FieldPosition,
  card: CardInstance | null,
): Battlefield | null {
  const index = fieldIndex(position);
  if (index === null) return null;
  const cells = [...field.cells];
  cells[index] = card;
  return Object.freeze({ ...field, cells: Object.freeze(cells) });
}
