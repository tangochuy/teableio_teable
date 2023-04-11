import type { StatisticsFunc } from '../view';
import type { DbFieldType, FieldType } from './constant';
import type { IColumnMeta } from './interface';
export interface IFieldRo {
  name: string;
  type: FieldType;
  description?: string;
  options?: unknown;
  notNull?: boolean;
  unique?: boolean;
  isPrimary?: boolean;
  defaultValue?: unknown;
}

export interface IFieldVo extends IFieldRo {
  id: string;
  isComputed?: boolean;
  calculatedType: unknown;
  cellValueType: CellValueType;
  dbFieldType: DbFieldType;
  columnMeta: IColumnMeta;
}

export class Column {
  order!: number;
  width?: number;
  hidden?: boolean;
  statisticFunc?: StatisticsFunc;
}

export enum CellValueType {
  String = 'string',
  Number = 'number',
  Boolean = 'boolean',
  Datetime = 'datetime',
  Array = 'array',
}

export abstract class FieldCore implements IFieldVo {
  id!: string;

  name!: string;

  description?: string;

  notNull?: boolean;

  unique?: boolean;

  isPrimary?: boolean;

  columnMeta!: IColumnMeta;

  abstract type: FieldType;

  abstract isComputed?: boolean;

  abstract dbFieldType: DbFieldType;

  abstract options?: unknown;

  abstract defaultValue?: unknown;

  // for lookup field, it is a dynamic value
  abstract calculatedType: unknown;

  // cellValue type enum (string, number, boolean, datetime, array)
  abstract cellValueType: CellValueType;

  abstract cellValue2String(value: unknown): string;

  abstract convertStringToCellValue(str: string): unknown;
}
