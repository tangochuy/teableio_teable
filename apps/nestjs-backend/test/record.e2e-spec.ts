/* eslint-disable sonarjs/no-duplicate-string */
import type { INestApplication } from '@nestjs/common';
import type { IFieldRo, ISelectFieldOptions, ITableFullVo } from '@teable-group/core';
import { CellFormat, FieldKeyType, FieldType } from '@teable-group/core';
import {
  createField,
  createRecords,
  createTable,
  deleteRecord,
  deleteRecords,
  deleteTable,
  getField,
  getRecord,
  getRecords,
  getViews,
  initApp,
  updateRecordByApi,
} from './utils/init-app';

describe('OpenAPI RecordController (e2e)', () => {
  let app: INestApplication;
  const baseId = globalThis.testConfig.baseId;

  beforeAll(async () => {
    const appCtx = await initApp();
    app = appCtx.app;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('simple curd', () => {
    let table: ITableFullVo;
    beforeEach(async () => {
      table = await createTable(baseId, { name: 'table1' });
    });

    afterEach(async () => {
      await deleteTable(baseId, table.id);
    });

    it('should get records', async () => {
      const result = await getRecords(table.id);
      expect(result.records).toBeInstanceOf(Array);
    });

    it('should get string records', async () => {
      const createdRecord = await createRecords(table.id, {
        records: [
          {
            fields: {
              [table.fields[0].id]: 'text value',
              [table.fields[1].id]: 123,
            },
          },
        ],
      });

      const { records } = await getRecords(table.id, {
        cellFormat: CellFormat.Text,
        fieldKeyType: FieldKeyType.Id,
      });
      expect(records[3].fields[table.fields[0].id]).toEqual('text value');
      expect(records[3].fields[table.fields[1].id]).toEqual('123.00');

      const record = await getRecord(table.id, createdRecord.records[0].id, CellFormat.Text);

      expect(record.fields[table.fields[0].id]).toEqual('text value');
      expect(record.fields[table.fields[1].id]).toEqual('123.00');
    });

    it('should create a record', async () => {
      const value1 = 'New Record' + new Date();
      const res1 = await createRecords(table.id, {
        fieldKeyType: FieldKeyType.Name,
        records: [
          {
            fields: {
              [table.fields[0].name]: value1,
            },
          },
        ],
      });
      expect(res1.records[0].fields[table.fields[0].name]).toEqual(value1);

      const result = await getRecords(table.id, { skip: 0, take: 1000 });
      expect(result.records).toHaveLength(4);

      const value2 = 'New Record' + new Date();
      // test fieldKeyType is id
      const res2 = await createRecords(table.id, {
        fieldKeyType: FieldKeyType.Id,
        records: [
          {
            fields: {
              [table.fields[0].id]: value2,
            },
          },
        ],
      });

      expect(res2.records[0].fields[table.fields[0].id]).toEqual(value2);
    });

    it('should create a record with order', async () => {
      const viewResponse = await getViews(table.id);
      const viewId = viewResponse[0].id;
      const res = await createRecords(table.id, {
        records: [
          {
            fields: {},
            recordOrder: {
              [viewId]: 0.6,
            },
          },
        ],
      });

      expect(res.records[0].recordOrder[viewId]).toEqual(0.6);
    });

    it('should update record', async () => {
      const record = await updateRecordByApi(
        table.id,
        table.records[0].id,
        table.fields[0].id,
        'new value'
      );

      expect(record.fields[table.fields[0].id]).toEqual('new value');

      const result = await getRecords(table.id, { skip: 0, take: 1000 });

      expect(result.records).toHaveLength(3);
      expect(result.records[0].fields[table.fields[0].name]).toEqual('new value');
    });

    it('should batch create records', async () => {
      const count = 100;
      console.time(`create ${count} records`);
      const records = Array.from({ length: count }).map((_, i) => ({
        fields: {
          [table.fields[0].name]: 'New Record' + new Date(),
          [table.fields[1].name]: i,
          [table.fields[2].name]: 'light',
        },
      }));

      await createRecords(table.id, {
        fieldKeyType: FieldKeyType.Name,
        records,
      });

      console.timeEnd(`create ${count} records`);
    });

    it('should delete a record', async () => {
      const value1 = 'New Record' + new Date();
      const addRecordRes = await createRecords(table.id, {
        fieldKeyType: FieldKeyType.Name,
        records: [
          {
            fields: {
              [table.fields[0].name]: value1,
            },
          },
        ],
      });

      await getRecord(table.id, addRecordRes.records[0].id, undefined, 200);

      await deleteRecord(table.id, addRecordRes.records[0].id);

      await getRecord(table.id, addRecordRes.records[0].id, undefined, 404);
    });

    it('should batch delete records', async () => {
      const value1 = 'New Record' + new Date();
      const addRecordsRes = await createRecords(table.id, {
        fieldKeyType: FieldKeyType.Name,
        records: [
          {
            fields: {
              [table.fields[0].name]: value1,
            },
          },
          {
            fields: {
              [table.fields[0].name]: value1,
            },
          },
        ],
      });
      const records = addRecordsRes.records;

      await getRecord(table.id, records[0].id, undefined, 200);
      await getRecord(table.id, records[1].id, undefined, 200);

      await deleteRecords(
        table.id,
        records.map((record) => record.id)
      );

      await getRecord(table.id, records[0].id, undefined, 404);
      await getRecord(table.id, records[1].id, undefined, 404);
    });

    it('should create a record after delete a record', async () => {
      const value1 = 'New Record' + new Date();
      await deleteRecord(table.id, table.records[0].id);

      await createRecords(table.id, {
        fieldKeyType: FieldKeyType.Name,
        records: [
          {
            fields: {
              [table.fields[0].name]: value1,
            },
          },
        ],
      });
    });
  });

  describe('calculate', () => {
    let table: ITableFullVo;
    beforeAll(async () => {
      table = await createTable(baseId, {
        name: 'table1',
      });
    });

    afterAll(async () => {
      await deleteTable(baseId, table.id);
    });

    it('should create a record and auto calculate computed field', async () => {
      const formulaFieldRo1: IFieldRo = {
        type: FieldType.Formula,
        options: {
          expression: `1 + 1`,
        },
      };

      const formulaFieldRo2: IFieldRo = {
        type: FieldType.Formula,
        options: {
          expression: `{${table.fields[0].id}} + 1`,
        },
      };

      const formulaField1 = await createField(table.id, formulaFieldRo1);
      const formulaField2 = await createField(table.id, formulaFieldRo2);

      const { records } = await createRecords(table.id, {
        records: [
          {
            fields: {
              [table.fields[0].id]: 'text value',
            },
          },
        ],
      });

      expect(records[0].fields[formulaField1.id]).toEqual(2);
      expect(records[0].fields[formulaField2.id]).toEqual('text value1');
    });

    it('should create a record with typecast', async () => {
      const selectFieldRo: IFieldRo = {
        type: FieldType.SingleSelect,
      };

      const selectField = await createField(table.id, selectFieldRo);

      // reject data when typecast is false
      await createRecords(
        table.id,
        {
          records: [
            {
              fields: {
                [selectField.id]: 'select value',
              },
            },
          ],
        },
        400
      );

      const { records } = await createRecords(table.id, {
        typecast: true,
        records: [
          {
            fields: {
              [selectField.id]: 'select value',
            },
          },
        ],
      });

      const fieldAfter = await getField(table.id, selectField.id);

      expect(records[0].fields[selectField.id]).toEqual('select value');
      expect((fieldAfter.options as ISelectFieldOptions).choices.length).toEqual(1);
      expect((fieldAfter.options as ISelectFieldOptions).choices).toMatchObject([
        { name: 'select value' },
      ]);
    });
  });
});
