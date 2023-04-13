/* eslint-disable sonarjs/no-duplicated-branches */
import {
  DbFieldType,
  assertNever,
  CellValueType,
  FieldType,
  generateFieldId,
} from '@teable-group/core';
import type { Field } from '@teable-group/db-main-prisma';
import { plainToInstance } from 'class-transformer';
import type { CreateFieldRo } from './create-field.ro';
import { NumberFieldDto } from './field-dto/number-field.dto';
import { SingleLineTextFieldDto } from './field-dto/single-line-text-field.dto';
import { SingleSelectFieldDto } from './field-dto/single-select-field.dto';
import type { FieldVo } from './field.vo';

export function createFieldInstanceByRo(createFieldRo: CreateFieldRo & { id?: string }) {
  // generate Id first
  const fieldDto = createFieldRo.id ? createFieldRo : { ...createFieldRo, id: generateFieldId() };

  switch (createFieldRo.type) {
    case FieldType.SingleLineText:
      return plainToInstance(SingleLineTextFieldDto, {
        ...fieldDto,
        isComputed: false,
        calculatedType: FieldType.SingleLineText,
        cellValueType: CellValueType.String,
        dbFieldType: DbFieldType.Text,
      } as SingleLineTextFieldDto);
    case FieldType.Number:
      return plainToInstance(NumberFieldDto, {
        ...fieldDto,
        isComputed: false,
        calculatedType: FieldType.Number,
        cellValueType: CellValueType.Number,
        dbFieldType: DbFieldType.Real,
      } as NumberFieldDto);
    case FieldType.SingleSelect:
      return plainToInstance(SingleSelectFieldDto, {
        ...fieldDto,
        isComputed: false,
        calculatedType: FieldType.SingleSelect,
        cellValueType: CellValueType.String,
        dbFieldType: DbFieldType.Text,
      } as SingleSelectFieldDto);
    case FieldType.Attachment:
    case FieldType.Button:
    case FieldType.CreatedBy:
    case FieldType.Email:
    case FieldType.LastModifiedBy:
    case FieldType.LongText:
    case FieldType.MultipleSelect:
    case FieldType.PhoneNumber:
    case FieldType.URL:
    case FieldType.User:
    case FieldType.AutoNumber:
    case FieldType.Count:
    case FieldType.CreatedTime:
    case FieldType.Date:
    case FieldType.Duration:
    case FieldType.LastModifiedTime:
    case FieldType.Rating:
    case FieldType.Currency:
    case FieldType.Percent:
    case FieldType.Checkbox:
    case FieldType.Formula:
    case FieldType.Rollup:
    case FieldType.MultipleLookupValues:
    case FieldType.MultipleRecordLinks:
      return plainToInstance(SingleLineTextFieldDto, {
        ...fieldDto,
        type: FieldType.SingleLineText,
        isComputed: false,
        calculatedType: FieldType.SingleLineText,
        cellValueType: CellValueType.String,
        dbFieldType: DbFieldType.Text,
      } as SingleLineTextFieldDto);
    default:
      assertNever(createFieldRo.type);
  }
}

export function createFieldInstanceByRaw(fieldRaw: Field) {
  const field: FieldVo = {
    id: fieldRaw.id,
    name: fieldRaw.name,
    type: fieldRaw.type as FieldType,
    description: fieldRaw.description || undefined,
    options: JSON.parse(fieldRaw.options as string) || undefined,
    notNull: fieldRaw.notNull || undefined,
    unique: fieldRaw.unique || undefined,
    isComputed: fieldRaw.isComputed || undefined,
    isPrimary: fieldRaw.isPrimary || undefined,
    defaultValue: JSON.parse(fieldRaw.defaultValue as string) || undefined,
    calculatedType: fieldRaw.calculatedType as FieldType,
    cellValueType: fieldRaw.cellValueType as CellValueType,
    dbFieldType: fieldRaw.dbFieldType as DbFieldType,
    columnMeta: JSON.parse(fieldRaw.columnMeta as string),
  };

  switch (field.type) {
    case FieldType.SingleLineText:
      return plainToInstance(SingleLineTextFieldDto, field);
    case FieldType.Number:
      return plainToInstance(NumberFieldDto, field);
    case FieldType.SingleSelect:
      return plainToInstance(SingleSelectFieldDto, field);
    case FieldType.Attachment:
    case FieldType.Button:
    case FieldType.CreatedBy:
    case FieldType.Email:
    case FieldType.LastModifiedBy:
    case FieldType.LongText:
    case FieldType.MultipleSelect:
    case FieldType.PhoneNumber:
    case FieldType.URL:
    case FieldType.User:
    case FieldType.AutoNumber:
    case FieldType.Count:
    case FieldType.CreatedTime:
    case FieldType.Date:
    case FieldType.Duration:
    case FieldType.LastModifiedTime:
    case FieldType.Rating:
    case FieldType.Currency:
    case FieldType.Percent:
    case FieldType.Checkbox:
    case FieldType.Formula:
    case FieldType.Rollup:
    case FieldType.MultipleLookupValues:
    case FieldType.MultipleRecordLinks:
      throw new Error('did not implement yet');
    default:
      assertNever(field.type);
  }
}

export type IFieldInstance = ReturnType<typeof createFieldInstanceByRo>;
