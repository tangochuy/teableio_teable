/* eslint-disable sonarjs/no-duplicate-string */
import {
  daysAgo,
  daysFromNow,
  exactDate,
  isBefore,
  oneMonthAgo,
  oneMonthFromNow,
  oneWeekAgo,
  oneWeekFromNow,
  today,
  tomorrow,
  yesterday,
} from '@teable/core';

export const IS_BEFORE_SETS = [
  {
    fieldIndex: 3,
    operator: isBefore.value,
    queryValue: {
      mode: today.value,
      timeZone: 'Asia/Singapore',
    },
    expectResultLength: 11,
  },
  {
    fieldIndex: 3,
    operator: isBefore.value,
    queryValue: {
      mode: tomorrow.value,
      timeZone: 'Asia/Singapore',
    },
    expectResultLength: 12,
  },
  {
    fieldIndex: 3,
    operator: isBefore.value,
    queryValue: {
      mode: yesterday.value,
      timeZone: 'Asia/Singapore',
    },
    expectResultLength: 10,
  },
  {
    fieldIndex: 3,
    operator: isBefore.value,
    queryValue: {
      mode: oneWeekAgo.value,
      timeZone: 'Asia/Singapore',
    },
    expectResultLength: 9,
  },
  {
    fieldIndex: 3,
    operator: isBefore.value,
    queryValue: {
      mode: oneWeekFromNow.value,
      timeZone: 'Asia/Singapore',
    },
    expectResultLength: 13,
  },
  {
    fieldIndex: 3,
    operator: isBefore.value,
    queryValue: {
      mode: oneMonthAgo.value,
      timeZone: 'Asia/Singapore',
    },
    expectResultLength: 8,
  },
  {
    fieldIndex: 3,
    operator: isBefore.value,
    queryValue: {
      mode: oneMonthFromNow.value,
      timeZone: 'Asia/Singapore',
    },
    expectResultLength: 14,
  },
  {
    fieldIndex: 3,
    operator: isBefore.value,
    queryValue: {
      mode: daysAgo.value,
      numberOfDays: 1,
      timeZone: 'Asia/Singapore',
    },
    expectResultLength: 10,
  },
  {
    fieldIndex: 3,
    operator: isBefore.value,
    queryValue: {
      mode: daysFromNow.value,
      numberOfDays: 1,
      timeZone: 'Asia/Singapore',
    },
    expectResultLength: 12,
  },
  {
    fieldIndex: 3,
    operator: isBefore.value,
    queryValue: {
      mode: exactDate.value,
      exactDate: '2019-12-31T16:00:00.000Z',
      timeZone: 'Asia/Singapore',
    },
    expectResultLength: 0,
  },
];
