import type {
  IDateFieldOptions,
  IFormulaFieldOptions,
  ILinkFieldOptionsRo,
  INumberFieldOptions,
  ISelectFieldOptions,
  CellValueType,
  IRollupFieldOptions,
} from '@teable-group/core';
import { FieldType } from '@teable-group/core';
import type { IFieldInstance } from '@teable-group/sdk/model';
import { DateOptions } from './options/DateOptions';
import { FormulaOptions } from './options/FormulaOptions';
import { LinkOptions } from './options/LinkOptions';
import { NumberOptions } from './options/NumberOptions';
import { RollupOptions } from './options/RollupOptions';
import { SelectOptions } from './options/SelectOptions';

export interface IFieldOptionsProps {
  options: IFieldInstance['options'];
  type: FieldType;
  isLookup: boolean | undefined;
  cellValueType?: CellValueType; // for formula field with lookup only
  updateFieldOptions: (options: Partial<IFieldInstance['options']>) => void;
}

export const FieldOptions: React.FC<IFieldOptionsProps> = ({
  options,
  type,
  isLookup,
  updateFieldOptions,
}) => {
  switch (type) {
    case FieldType.SingleSelect:
    case FieldType.MultipleSelect:
      return (
        <SelectOptions
          options={options as ISelectFieldOptions}
          isLookup={isLookup}
          onChange={updateFieldOptions}
        />
      );
    case FieldType.Number:
      return (
        <NumberOptions
          options={options as INumberFieldOptions}
          isLookup={isLookup}
          onChange={updateFieldOptions}
        />
      );
    case FieldType.Link:
      return (
        <LinkOptions
          options={options as ILinkFieldOptionsRo}
          isLookup={isLookup}
          onChange={updateFieldOptions}
        />
      );
    case FieldType.Formula:
      return (
        <FormulaOptions
          options={options as IFormulaFieldOptions}
          isLookup={isLookup}
          onChange={updateFieldOptions}
        />
      );
    case FieldType.Date:
      return (
        <DateOptions
          options={options as IDateFieldOptions}
          isLookup={isLookup}
          onChange={updateFieldOptions}
        />
      );
    case FieldType.Rollup:
      return (
        <RollupOptions
          options={options as IRollupFieldOptions}
          isLookup={isLookup}
          onChange={updateFieldOptions}
        />
      );
    default:
      return <></>;
  }
};
