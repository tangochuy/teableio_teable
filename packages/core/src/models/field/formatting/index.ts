import { z } from 'zod';
import { CellValueType } from '../constant';
import { datetimeFormattingSchema, defaultDatetimeFormatting } from './datetime';
import { defaultNumberFormatting, numberFormattingSchema } from './number';

export * from './number';
export * from './datetime';

export const unionFormattingSchema = z.union([datetimeFormattingSchema, numberFormattingSchema]);

export type IUnionFormatting = z.infer<typeof unionFormattingSchema>;

export const getDefaultFormatting = (cellValueType: CellValueType) => {
  switch (cellValueType) {
    case CellValueType.Number:
      return defaultNumberFormatting;
    case CellValueType.DateTime:
      return defaultDatetimeFormatting;
  }
};

export const getFormattingSchema = (cellValueType: CellValueType) => {
  switch (cellValueType) {
    case CellValueType.Number:
      return numberFormattingSchema;
    case CellValueType.DateTime:
      return datetimeFormattingSchema;
    default:
      return z.undefined().openapi({
        description: 'Only number and datetime cell value type support formatting',
      });
  }
};
