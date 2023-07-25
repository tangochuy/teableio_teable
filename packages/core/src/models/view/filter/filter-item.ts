import { z } from 'zod';
import { dataFieldCellValueSchema, timeZoneStringSchema } from '../../field';
import type { IOperator, ISymbol } from './operator';
import {
  daysAgo,
  daysFromNow,
  hasAllOf,
  hasAnyOf,
  hasNoneOf,
  isAnyOf,
  isEmpty,
  isExactly,
  isNoneOf,
  isNotEmpty,
  nextNumberOfDays,
  operators,
  pastNumberOfDays,
  subOperators,
  symbols,
} from './operator';

const modesRequiringDays: string[] = [
  daysAgo.value,
  daysFromNow.value,
  pastNumberOfDays.value,
  nextNumberOfDays.value,
];
export const dateFilterSchema = z
  .object({
    mode: subOperators,
    numberOfDays: z.number().int().nonnegative().optional(),
    exactDate: dataFieldCellValueSchema.optional(),
    timeZone: timeZoneStringSchema,
  })
  .superRefine((val, ctx) => {
    if (val.mode === 'exactDate' && !val.exactDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `When the mode is set to '${val.mode}', an 'exactDate' must be provided`,
      });
    } else if (
      modesRequiringDays.includes(val.mode) &&
      (val.numberOfDays === null || val.numberOfDays === undefined)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `When the mode is '${val.mode}', a numerical value for 'numberOfDays' must be provided`,
      });
    }
  });
export type IDateFilter = z.infer<typeof dateFilterSchema>;

export const literalValueSchema = z.union([z.string(), z.number(), z.boolean()]);
export type ILiteralValue = z.infer<typeof literalValueSchema>;
export const literalValueListSchema = literalValueSchema.array().nonempty();
export type ILiteralValueList = z.infer<typeof literalValueListSchema>;

const filterValueSchema = z
  .union([literalValueSchema, literalValueListSchema, dateFilterSchema])
  .nullable();
export type IFilterValue = z.infer<typeof filterValueSchema>;

export type IFilterOperator = IOperator;
export type IFilterSymbolOperator = ISymbol;

const operatorsExpectingNull: string[] = [isEmpty.value, isNotEmpty.value];
const operatorsExpectingArray: string[] = [
  isAnyOf.value,
  isNoneOf.value,
  hasAnyOf.value,
  hasAllOf.value,
  hasNoneOf.value,
  isExactly.value,
];
const filterOperatorSchema = z
  .object({
    isSymbol: z.literal(false).optional(),
    fieldId: z.string(),
    value: filterValueSchema,
    operator: operators,
  })
  .superRefine((val, ctx) => {
    if (!val.value) {
      return z.NEVER;
    }

    if (operatorsExpectingNull.includes(val.operator)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `For the operator '${val.operator}', the 'value' should be null`,
      });
    }

    if (operatorsExpectingArray.includes(val.operator) && !Array.isArray(val.value)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `For the operator '${val.operator}', the 'value' should be an array`,
      });
    }

    if (!operatorsExpectingArray.includes(val.operator) && Array.isArray(val.value)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `For the operator '${val.operator}', the 'value' should not be an array`,
      });
    }
  });

const filterSymbolOperatorSchema = z.object({
  isSymbol: z.literal(true),
  fieldId: z.string(),
  value: filterValueSchema,
  operator: symbols,
});

export const filterItemSchema = z.union([filterOperatorSchema, filterSymbolOperatorSchema]);

export type IFilterItem = z.infer<typeof filterItemSchema>;
