/* eslint-disable sonarjs/no-duplicate-string */
import { faker } from '@faker-js/faker';
import type { INestApplication } from '@nestjs/common';
import type { IFieldRo, ISortItem, ITableFullVo, IGetRecordsQuery } from '@teable-group/core';
import {
  CellValueType,
  FieldKeyType,
  FieldType,
  NumberFormattingType,
  orderTypeEnum,
  TimeFormatting,
} from '@teable-group/core';
import { setViewSort as apiSetViewSort } from '@teable-group/openapi';
import { isEmpty, orderBy } from 'lodash';
import {
  createTable,
  createRecords,
  deleteTable,
  getView,
  initApp,
  updateRecordByApi,
  createField,
  getRecords,
  getFields,
} from './utils/init-app';

let app: INestApplication;
const baseId = globalThis.testConfig.baseId;

// cellValueType which need to test
const typeTests = [
  {
    type: CellValueType.String,
    valueGenerateFn: () => faker.string.numeric(5),
  },
  {
    type: CellValueType.Number,
    valueGenerateFn: () => faker.number.int(),
  },
  {
    type: CellValueType.DateTime,
    valueGenerateFn: () => faker.date.anytime(),
  },
  {
    type: CellValueType.Boolean,
    valueGenerateFn: () => faker.datatype.boolean() || null,
  },
];

// some fieldType need
const defaultFields: IFieldRo[] = [
  {
    name: CellValueType.String,
    type: FieldType.SingleLineText,
    options: {},
  },
  {
    name: CellValueType.Number,
    type: FieldType.Number,
    options: {
      formatting: {
        type: NumberFormattingType.Decimal,
        precision: 2,
      },
    },
  },
  {
    name: CellValueType.Boolean,
    type: FieldType.Checkbox,
    options: {},
  },
  {
    name: CellValueType.DateTime,
    type: FieldType.Date,
    options: {
      formatting: {
        date: 'YYYY-MM-DD',
        time: TimeFormatting.Hour24,
        timeZone: 'America/New_York',
      },
      defaultValue: 'now',
    },
  },
];

// api aggregation
const fillTable = async (tableId: string, fieldName: string, length: number) => {
  if (!length) {
    return [];
  }

  const records = Array.from({ length: length }).map((_, i) => ({
    fields: {
      [fieldName]: `String_${i}`,
    },
  }));

  const res = await createRecords(tableId, { fieldKeyType: FieldKeyType.Name, records });
  return res.records || [];
};

const createTableWithExtraRec = async (tableName: string, recordsLength = 10) => {
  const { id, fields, defaultViewId, records } = await createTable(baseId, {
    name: tableName,
    fields: defaultFields.map((f) => ({ ...f, name: f.name })),
  });

  console.log('fields', fields);

  const newRecords = await fillTable(id, fields[0].name, recordsLength);

  return {
    id,
    fields,
    defaultViewId: defaultViewId!,
    records: records.concat(newRecords),
  };
};

const createLink = async (mainTableId: string, subTableId: string) => {
  await createField(mainTableId, {
    name: 'link',
    type: FieldType.Link,
    options: {
      foreignTableId: subTableId,
      relationship: 'oneMany',
    },
  });
};

const getSortRecords = async (tableId: string, orderBy?: IGetRecordsQuery['orderBy']) => {
  const result = await getRecords(tableId, {
    orderBy: orderBy,
  });
  return result.records;
};

const setRecordsOrder = async (tableId: string, viewId: string, orderBy: ISortItem[]) => {
  await apiSetViewSort(tableId, viewId, {
    sortObjs: orderBy,
  });
};

const getRecordsByOrder = (
  records: ITableFullVo['records'],
  conditions: ISortItem[],
  fields: ITableFullVo['fields']
) => {
  if (Array.isArray(records) && !records.length) return [];
  const fns = conditions.map((condition) => {
    const { fieldId } = condition;
    const field = fields.find((field) => field.id === fieldId) as ITableFullVo['fields'][number];
    const { name, isMultipleCellValue } = field;
    return (record: ITableFullVo['records'][number]) => {
      if (isEmpty(record?.fields?.[name])) {
        return -Infinity;
      }
      if (isMultipleCellValue) {
        return JSON.stringify(record?.fields?.[name]);
      }
    };
  });
  const orders = conditions.map((condition) => condition.order || 'asc');
  return orderBy([...records], fns, orders);
};

beforeAll(async () => {
  const appCtx = await initApp();
  app = appCtx.app;
});

afterAll(async () => {
  await app.close();
});

describe('OpenAPI RecordController sort (e2e) base cellValueType', () => {
  let subTable: Pick<ITableFullVo, 'id' | 'records' | 'fields' | 'defaultViewId'>;

  beforeAll(async () => {
    console.log('subTable - --1--1');
    subTable = await createTableWithExtraRec('subTable', 10);
    console.log('subTable', subTable);
  });

  afterAll(async () => {
    console.log('subTable111', subTable);
    console.log('subTable111', JSON.stringify(subTable));
    const { id: subTableId } = subTable;
    const result2 = await deleteTable(baseId, subTableId);
    console.log('clear subTable: ', result2);
  });

  test.each(typeTests)(
    `/api/table/{tableId}/record sort (GET) Test CellValueType: $type`,
    async ({ type, valueGenerateFn }) => {
      const { id: subTableId, fields: fields2, records: subRecords } = subTable;
      const field = fields2.find((field) => field.cellValueType === type);
      const { id: fieldId } = field!;
      // write content
      for (let i = 0; i < subRecords.length; i++) {
        await updateRecordByApi(subTableId, subTable.records[i].id, fieldId, valueGenerateFn());
      }

      const ascOrders: IGetRecordsQuery['orderBy'] = [{ fieldId, order: 'asc' }];
      const descOrders: IGetRecordsQuery['orderBy'] = [{ fieldId, order: 'desc' }];
      const ascOriginRecords = await getSortRecords(subTableId, ascOrders);
      const descOriginRecords = await getSortRecords(subTableId, descOrders);

      const ascManualSortRecords = getRecordsByOrder(ascOriginRecords, ascOrders, fields2);
      const descManualSortRecords = getRecordsByOrder(descOriginRecords, descOrders, fields2);

      expect(ascOriginRecords).toEqual(ascManualSortRecords);
      expect(descOriginRecords).toEqual(descManualSortRecords);
    }
  );
});

describe('OpenAPI RecordController sort (e2e) Multiple CellValueType', () => {
  let mainTable: Pick<ITableFullVo, 'id' | 'records' | 'fields' | 'defaultViewId'>;
  let subTable: Pick<ITableFullVo, 'id' | 'records' | 'fields' | 'defaultViewId'>;

  beforeAll(async () => {
    mainTable = await createTableWithExtraRec('mainTable', 10);
    subTable = await createTableWithExtraRec('subTable', 10);

    const { id: mainTableId } = mainTable;
    const { id: subTableId } = subTable;

    await createLink(mainTableId, subTableId);

    mainTable.fields = await getFields(mainTableId);
  });

  afterAll(async () => {
    const { id: mainTableId } = mainTable;
    const { id: subTableId } = subTable;

    const result1 = await deleteTable(baseId, mainTableId);
    console.log('clear mainTable: ', result1);

    const result2 = await deleteTable(baseId, subTableId);
    console.log('clear subTable: ', result2);
  });

  test.each(typeTests)(
    `/api/table/{tableId}/record sort (GET) Test CellValueType: $type - Multiple`,
    async ({ type, valueGenerateFn }) => {
      const { id: mainTableId, fields: fields1 } = mainTable;
      const { id: subTableId, fields: fields2, records: subRecords } = subTable;

      const field = fields2.find((field) => field.cellValueType === type);
      const { id: fieldId } = field!;

      // write content
      for (let i = 0; i < subRecords.length; i++) {
        await updateRecordByApi(subTableId, subTable.records[i].id, fieldId, valueGenerateFn());
      }
      const linkField = fields1.find((field) => field.type === 'link')!;
      const lookupField = fields2.find((field) => field.cellValueType === type)!;

      const lookupRes = await createField(mainTableId, {
        name: `lookup_${type}`,
        type: lookupField.type,
        isLookup: true,
        lookupOptions: {
          foreignTableId: subTableId,
          linkFieldId: linkField.id,
          lookupFieldId: lookupField.id,
        },
      });
      fields1.push(lookupRes);
      const lookupFieldId = lookupRes?.id;

      // link records
      for (let i = 0; i < subRecords.length; i++) {
        await updateRecordByApi(mainTableId, mainTable?.records[i]?.id, linkField.id, [
          { id: subTable?.records?.[i]?.id },
        ]);
      }

      const ascOrders: IGetRecordsQuery['orderBy'] = [{ fieldId: lookupFieldId, order: 'asc' }];
      const descOrders: IGetRecordsQuery['orderBy'] = [{ fieldId: lookupFieldId, order: 'desc' }];
      const ascOriginRecords = await getSortRecords(mainTableId, ascOrders);
      const descOriginRecords = await getSortRecords(mainTableId, descOrders);

      const ascManualSortRecords = getRecordsByOrder(ascOriginRecords, ascOrders, fields1);
      const descManualSortRecords = getRecordsByOrder(descOriginRecords, descOrders, fields1);

      expect(ascOriginRecords).toEqual(ascManualSortRecords);
      expect(descOriginRecords).toEqual(descManualSortRecords);
    }
  );
});

describe('OpenAPI ViewController raw order sort (e2e) base cellValueType', () => {
  let subTable: Pick<ITableFullVo, 'id' | 'records' | 'fields'> & { defaultViewId: string };

  beforeEach(async () => {
    subTable = await createTableWithExtraRec('subTable', 10);
  });

  afterEach(async () => {
    const { id: subTableId } = subTable;
    const result2 = await deleteTable(baseId, subTableId);
    console.log('clear subTable: ', result2);
  });

  test.each(typeTests)(
    `/api/table/{tableId}/view/{viewId}/sort sort view raw order (POST) Test CellValueType: $type`,
    async ({ type, valueGenerateFn }) => {
      const {
        id: subTableId,
        fields: fields2,
        records: subRecords,
        defaultViewId: subTableDefaultViewId,
      } = subTable;
      const field = fields2.find(
        (field) => field.cellValueType === type
      ) as ITableFullVo['fields'][number];
      const { id: fieldId } = field;

      for (let i = 0; i < subRecords.length; i++) {
        await updateRecordByApi(subTableId, subTable.records[i].id, fieldId, valueGenerateFn());
      }

      const ascOrders: IGetRecordsQuery['orderBy'] = [{ fieldId, order: 'asc' }];
      await setRecordsOrder(subTableId, subTableDefaultViewId, ascOrders);
      const ascOriginRecords = await getSortRecords(subTableId);
      const descOrders: IGetRecordsQuery['orderBy'] = [{ fieldId, order: 'desc' }];
      await setRecordsOrder(subTableId, subTableDefaultViewId, descOrders);
      const descOriginRecords = await getSortRecords(subTableId);

      const ascManualSortRecords = getRecordsByOrder(ascOriginRecords, ascOrders, fields2);
      const descManualSortRecords = getRecordsByOrder(descOriginRecords, descOrders, fields2);

      expect(ascOriginRecords).toEqual(ascManualSortRecords);
      expect(descOriginRecords).toEqual(descManualSortRecords);
    }
  );
});

describe('OpenAPI ViewController raw order sort (e2e) Multiple CellValueType', () => {
  let mainTable: Pick<ITableFullVo, 'id' | 'records' | 'fields' | 'defaultViewId'>;
  let subTable: Pick<ITableFullVo, 'id' | 'records' | 'fields' | 'defaultViewId'>;

  beforeEach(async () => {
    mainTable = await createTableWithExtraRec('mainTable', 10);
    subTable = await createTableWithExtraRec('subTable', 10);

    const { id: mainTableId } = mainTable;
    const { id: subTableId } = subTable;

    await createLink(mainTableId, subTableId);

    mainTable.fields = await getFields(mainTableId);
  });

  afterEach(async () => {
    const { id: mainTableId } = mainTable;
    const { id: subTableId } = subTable;

    const result1 = await deleteTable(baseId, mainTableId);
    console.log('clear mainTable: ', result1);

    const result2 = await deleteTable(baseId, subTableId);
    console.log('clear subTable: ', result2);
  });

  test.each(typeTests)(
    `/api/table/{tableId}/view/{viewId}/sort sort view raw order (POST) Test CellValueType: $type - Multiple`,
    async ({ type, valueGenerateFn }) => {
      const { id: mainTableId, fields: fields1, defaultViewId: mainDefaultViewId } = mainTable;
      const { id: subTableId, fields: fields2, records: subRecords } = subTable;
      const field = fields2.find((field) => field.cellValueType === type);
      const { id: fieldId } = field!;

      // write content
      for (let i = 0; i < subTable.records.length; i++) {
        await updateRecordByApi(subTableId, subTable.records[i].id, fieldId, valueGenerateFn());
      }
      const linkField = fields1.find((field) => field.type === 'link')!;
      const lookupField = fields2.find((field) => field.cellValueType === type)!;

      const lookupRes = await createField(mainTableId, {
        name: `lookup_${type}`,
        type: lookupField.type,
        isLookup: true,
        lookupOptions: {
          foreignTableId: subTableId,
          linkFieldId: linkField.id,
          lookupFieldId: lookupField.id,
        },
      });
      fields1.push(lookupRes);
      const lookupFieldId = lookupRes?.id;

      // link records
      for (let i = 0; i < subRecords.length; i++) {
        await updateRecordByApi(mainTableId, mainTable?.records[i]?.id, linkField.id, [
          { id: subTable?.records?.[i]?.id },
        ]);
      }

      const ascOrders: IGetRecordsQuery['orderBy'] = [{ fieldId: lookupFieldId, order: 'asc' }];
      await setRecordsOrder(mainTableId, mainDefaultViewId!, ascOrders);
      const ascOriginRecords = await getSortRecords(mainTableId);
      const descOrders: IGetRecordsQuery['orderBy'] = [{ fieldId: lookupFieldId, order: 'desc' }];
      await setRecordsOrder(mainTableId, mainDefaultViewId!, descOrders);
      const descOriginRecords = await getSortRecords(mainTableId);

      const ascManualSortRecords = getRecordsByOrder(ascOriginRecords, ascOrders, fields1);
      const descManualSortRecords = getRecordsByOrder(descOriginRecords, descOrders, fields1);

      expect(ascOriginRecords).toEqual(ascManualSortRecords);
      expect(descOriginRecords).toEqual(descManualSortRecords);
    }
  );
});

describe('OpenAPI ViewController view order sort (e2e)', () => {
  let tableId: string;
  let viewId: string;
  let fields: IFieldRo[];
  beforeEach(async () => {
    const result = await createTable(baseId, { name: 'Table' });
    tableId = result.id;
    viewId = result.defaultViewId!;
    fields = result.fields!;
  });
  afterEach(async () => {
    await deleteTable(baseId, tableId);
  });

  test('/api/table/{tableId}/view/{viewId}/sort sort view order (PUT)', async () => {
    const assertSort = {
      sortObjs: [
        {
          fieldId: fields[0].id as string,
          order: orderTypeEnum.Enum.asc,
        },
      ],
      manualSort: false,
    };
    await apiSetViewSort(tableId, viewId, assertSort);
    const updatedView = await getView(tableId, viewId);
    const viewSort = updatedView.sort;
    expect(viewSort).toEqual(assertSort);
  });
});
