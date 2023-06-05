import type { FieldType, SelectFieldOptions } from '@teable-group/core';

export type IGridCell = ISingleSelectGridCell;

export interface ISingleSelectGridCell {
  type: FieldType.SingleSelect;
  value: string[];
  options: SelectFieldOptions;
}
