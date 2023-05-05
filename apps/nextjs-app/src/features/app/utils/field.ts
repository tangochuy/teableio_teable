import {
  FieldType,
  NumberFieldCore,
  SingleLineTextFieldCore,
  SingleSelectFieldCore,
} from '@teable-group/core';
import FieldNumberIcon from '@teable-group/ui-lib/icons/app/field-number.svg';
import FieldSelectIcon from '@teable-group/ui-lib/icons/app/field-select.svg';
import FieldTextIcon from '@teable-group/ui-lib/icons/app/field-text.svg';

export const FIELD_CONSTANT = [
  {
    text: 'Single line text',
    type: FieldType.SingleLineText,
    IconComponent: FieldTextIcon,
  },
  {
    text: 'Single select',
    type: FieldType.SingleSelect,
    IconComponent: FieldSelectIcon,
  },
  {
    text: 'Number',
    type: FieldType.Number,
    IconComponent: FieldNumberIcon,
  },
];

export const NUMBER_FIELD_PRECISION = [
  {
    text: '1',
    value: 0,
  },
  {
    text: '1.0',
    value: 1,
  },
  {
    text: '1.00',
    value: 2,
  },
  {
    text: '1.000',
    value: 3,
  },
  {
    text: '1.0000',
    value: 4,
  },
];

export const fieldDefaultOptionMap: Record<string, unknown> = {
  [FieldType.SingleLineText]: SingleLineTextFieldCore.defaultOptions(),
  [FieldType.SingleSelect]: SingleSelectFieldCore.defaultOptions(),
  [FieldType.Number]: NumberFieldCore.defaultOptions(),
};
