import {
  is,
  isEmpty,
  isGreater,
  isGreaterEqual,
  isLess,
  isLessEqual,
  isNot,
  isNotEmpty,
} from '@teable-group/core';

export const NUMBER_FIELD_CASES = [
  {
    fieldIndex: 1,
    operator: isEmpty.value,
    queryValue: null,
    expectResultLength: 1,
    expectMoreResults: false,
  },
  {
    fieldIndex: 1,
    operator: isNotEmpty.value,
    queryValue: null,
    expectResultLength: 22,
    expectMoreResults: false,
  },
  {
    fieldIndex: 1,
    operator: is.value,
    queryValue: 9,
    expectResultLength: 1,
    expectMoreResults: false,
  },
  {
    fieldIndex: 1,
    operator: isNot.value,
    queryValue: 20,
    expectResultLength: 22,
    expectMoreResults: false,
  },
  {
    fieldIndex: 1,
    operator: isGreater.value,
    queryValue: 1,
    expectResultLength: 20,
    expectMoreResults: false,
  },
  {
    fieldIndex: 1,
    operator: isGreaterEqual.value,
    queryValue: 5,
    expectResultLength: 17,
    expectMoreResults: false,
  },
  {
    fieldIndex: 1,
    operator: isLess.value,
    queryValue: 10,
    expectResultLength: 10,
    expectMoreResults: false,
  },
  {
    fieldIndex: 1,
    operator: isLessEqual.value,
    queryValue: 3,
    expectResultLength: 4,
    expectMoreResults: false,
  },
];
