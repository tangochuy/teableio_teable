import { ApiProperty } from '@nestjs/swagger';
import { DateFieldCore, Relationship, CellValueType, DbFieldType } from '@teable-group/core';
import type { IDateFieldOptions } from '@teable-group/core';
import { plainToInstance } from 'class-transformer';
import type { CreateFieldRo } from '../create-field.ro';
import type { IFieldBase } from '../field-base';
import { DatetimeFormattingDto } from './formatting.dto';

export class DateOptionsDto implements IDateFieldOptions {
  @ApiProperty({
    type: 'boolean',
    example: false,
    description:
      'Whether the new row is automatically filled with the current time, caveat: the autoFill is just a formatter, it dose not effect the storing value of the record',
  })
  autoFill!: boolean;

  @ApiProperty({
    type: DatetimeFormattingDto,
  })
  formatting!: DatetimeFormattingDto;
}

export class DateFieldDto extends DateFieldCore implements IFieldBase {
  static factory(fieldRo: CreateFieldRo) {
    const isLookup = fieldRo.isLookup;
    const isMultipleCellValue =
      fieldRo.lookupOptions && fieldRo.lookupOptions.relationship === Relationship.ManyOne;

    return plainToInstance(DateFieldDto, {
      ...fieldRo,
      isComputed: isLookup,
      cellValueType: CellValueType.DateTime,
      dbFieldType: isMultipleCellValue ? DbFieldType.Text : DbFieldType.DateTime,
      isMultipleCellValue,
    } as DateFieldDto);
  }

  convertCellValue2DBValue(value: unknown): unknown {
    if (this.isMultipleCellValue) {
      return JSON.stringify(value);
    }
    return value;
  }

  convertDBValue2CellValue(value: unknown): unknown {
    if (this.isMultipleCellValue) {
      return value && JSON.parse(value as string);
    }
    return value;
  }
}
