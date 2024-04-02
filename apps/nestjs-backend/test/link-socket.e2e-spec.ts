/**
 * test case for simulate frontend collaboration data flow
 */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable sonarjs/no-duplicate-string */
import type { INestApplication } from '@nestjs/common';
import type { IFieldRo, IRecord } from '@teable/core';
import {
  RecordOpBuilder,
  IdPrefix,
  FieldType,
  Relationship,
  NumberFormattingType,
} from '@teable/core';
import type { ITableFullVo } from '@teable/openapi';
import type { Doc } from 'sharedb/lib/client';
import { ShareDbService } from '../src/share-db/share-db.service';
import {
  deleteTable,
  createTable,
  initApp,
  getFields,
  getRecords,
  createField,
} from './utils/init-app';

describe('OpenAPI link (socket-e2e)', () => {
  let app: INestApplication;
  let table1: ITableFullVo;
  let table2: ITableFullVo;
  let shareDbService!: ShareDbService;
  const baseId = globalThis.testConfig.baseId;
  let cookie: string;
  let sessionID: string;

  beforeAll(async () => {
    const appCtx = await initApp();
    app = appCtx.app;
    cookie = appCtx.cookie;
    sessionID = appCtx.sessionID;

    shareDbService = app.get(ShareDbService);
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    await deleteTable(baseId, table1.id);
    await deleteTable(baseId, table2.id);
  });

  describe('link field cell update', () => {
    beforeEach(async () => {
      const numberFieldRo: IFieldRo = {
        name: 'Number field',
        type: FieldType.Number,
        options: {
          formatting: { type: NumberFormattingType.Decimal, precision: 1 },
        },
      };

      const textFieldRo: IFieldRo = {
        name: 'text field',
        type: FieldType.SingleLineText,
      };

      table1 = await createTable(baseId, {
        name: 'table1',
        fields: [textFieldRo, numberFieldRo],
        records: [
          { fields: { 'text field': 'A1' } },
          { fields: { 'text field': 'A2' } },
          { fields: { 'text field': 'A3' } },
        ],
      });

      const table2LinkFieldRo: IFieldRo = {
        name: 'link field',
        type: FieldType.Link,
        options: {
          relationship: Relationship.ManyOne,
          foreignTableId: table1.id,
        },
      };

      // table2 link manyOne table1
      table2 = await createTable(baseId, {
        name: 'table2',
        fields: [textFieldRo, numberFieldRo, table2LinkFieldRo],
        records: [
          { fields: { 'text field': 'B1' } },
          { fields: { 'text field': 'B2' } },
          { fields: { 'text field': 'B3' } },
        ],
      });

      table1.fields = await getFields(table1.id);
    });

    async function updateRecordViaShareDb(
      tableId: string,
      recordId: string,
      fieldId: string,
      newValues: any
    ) {
      const connection = shareDbService.connect(undefined, {
        headers: {
          cookie,
        },
        sessionID,
      });
      const collection = `${IdPrefix.Record}_${tableId}`;
      return new Promise<IRecord>((resolve, reject) => {
        const doc: Doc<IRecord> = connection.get(collection, recordId);
        doc.fetch((err) => {
          if (err) {
            return reject(err);
          }
          const op = RecordOpBuilder.editor.setRecord.build({
            fieldId,
            oldCellValue: doc.data.fields[fieldId],
            newCellValue: newValues,
          });

          doc.submitOp(op, undefined, (err) => {
            if (err) {
              return reject(err);
            }
            resolve(doc.data);
          });
        });
      });
    }

    it('should update foreign link field when set a new link in to link field cell', async () => {
      // t2[0](many) -> t1[1](one)
      await updateRecordViaShareDb(table2.id, table2.records[0].id, table2.fields[2].id, {
        title: 'test',
        id: table1.records[1].id,
      });

      const table2RecordResult = await getRecords(table2.id);
      expect(table2RecordResult.records[0].fields[table2.fields[2].name]).toEqual({
        title: 'A2',
        id: table1.records[1].id,
      });

      const table1RecordResult2 = await getRecords(table1.id);
      // t1[0](one) should be undefined;
      expect(table1RecordResult2.records[1].fields[table1.fields[2].name!]).toEqual([
        {
          title: 'B1',
          id: table2.records[0].id,
        },
      ]);
      expect(table1RecordResult2.records[0].fields[table1.fields[2].name!]).toBeUndefined();
    });

    it('should update foreign link field when change lookupField value', async () => {
      // set text for lookup field
      await updateRecordViaShareDb(table2.id, table2.records[0].id, table2.fields[0].id, 'B1');
      await updateRecordViaShareDb(table2.id, table2.records[1].id, table2.fields[0].id, 'B2');

      // add an extra link for table1 record1
      await updateRecordViaShareDb(table2.id, table2.records[0].id, table2.fields[2].id, {
        title: 'A1',
        id: table1.records[0].id,
      });
      await updateRecordViaShareDb(table2.id, table2.records[1].id, table2.fields[2].id, {
        title: 'A1',
        id: table1.records[0].id,
      });

      const table1RecordResult2 = await getRecords(table1.id);
      expect(table1RecordResult2.records[0].fields[table1.fields[2].name!]).toEqual([
        {
          title: 'B1',
          id: table2.records[0].id,
        },
        {
          title: 'B2',
          id: table2.records[1].id,
        },
      ]);

      await updateRecordViaShareDb(table1.id, table1.records[0].id, table1.fields[0].id, 'AX');

      const table2RecordResult2 = await getRecords(table2.id);
      expect(table2RecordResult2.records[0].fields[table2.fields[2].name!]).toEqual({
        title: 'AX',
        id: table1.records[0].id,
      });
    });

    it('should update self foreign link with correct title', async () => {
      // set text for lookup field

      await updateRecordViaShareDb(table2.id, table2.records[0].id, table2.fields[0].id, 'B1');
      await updateRecordViaShareDb(table2.id, table2.records[1].id, table2.fields[0].id, 'B2');
      await updateRecordViaShareDb(table1.id, table1.records[0].id, table1.fields[2].id, [
        { title: 'B1', id: table2.records[0].id },
        { title: 'B2', id: table2.records[1].id },
      ]);

      const table1RecordResult2 = await getRecords(table1.id);

      expect(table1RecordResult2.records[0].fields[table1.fields[2].name!]).toEqual([
        {
          title: 'B1',
          id: table2.records[0].id,
        },
        {
          title: 'B2',
          id: table2.records[1].id,
        },
      ]);
    });

    it('should update formula field when change manyOne link cell', async () => {
      const table2FormulaFieldRo: IFieldRo = {
        name: 'table2Formula',
        type: FieldType.Formula,
        options: {
          expression: `{${table2.fields[2].id}}`,
        },
      };

      await createField(table2.id, table2FormulaFieldRo);

      await updateRecordViaShareDb(table2.id, table2.records[0].id, table2.fields[2].id, {
        title: 'test1',
        id: table1.records[1].id,
      });

      const table1RecordResult = await getRecords(table1.id);

      const table2RecordResult = await getRecords(table2.id);

      expect(table1RecordResult.records[0].fields[table1.fields[2].name!]).toBeUndefined();

      expect(table1RecordResult.records[1].fields[table1.fields[2].name!]).toEqual([
        {
          title: 'B1',
          id: table2.records[0].id,
        },
      ]);

      expect(table2RecordResult.records[0].fields[table2FormulaFieldRo.name!]).toEqual('A2');
    });

    it('should update formula field when change oneMany link cell', async () => {
      const table1FormulaFieldRo: IFieldRo = {
        name: 'table1 formula field',
        type: FieldType.Formula,
        options: {
          expression: `{${table1.fields[2].id}}`,
        },
      };

      await createField(table1.id, table1FormulaFieldRo);

      await updateRecordViaShareDb(table1.id, table1.records[0].id, table1.fields[2].id, [
        { title: 'test1', id: table2.records[0].id },
        { title: 'test2', id: table2.records[1].id },
      ]);

      const table1RecordResult = await getRecords(table1.id);

      expect(table1RecordResult.records[0].fields[table1.fields[2].name]).toEqual([
        { title: 'B1', id: table2.records[0].id },
        { title: 'B2', id: table2.records[1].id },
      ]);

      expect(table1RecordResult.records[0].fields[table1FormulaFieldRo.name!]).toEqual([
        'B1',
        'B2',
      ]);
    });

    it('should update oneMany formula field when change oneMany link cell', async () => {
      const table1FormulaFieldRo: IFieldRo = {
        name: 'table1 formula field',
        type: FieldType.Formula,
        options: {
          expression: `{${table1.fields[2].id}}`,
        },
      };
      await createField(table1.id, table1FormulaFieldRo as IFieldRo);

      const table2FormulaFieldRo: IFieldRo = {
        name: 'table2 formula field',
        type: FieldType.Formula,
        options: {
          expression: `{${table2.fields[2].id}}`,
        },
      };
      await createField(table2.id, table2FormulaFieldRo as IFieldRo);

      await updateRecordViaShareDb(table2.id, table2.records[0].id, table2.fields[2].id, {
        title: 'A1',
        id: table1.records[0].id,
      });

      await updateRecordViaShareDb(table2.id, table2.records[1].id, table2.fields[2].id, {
        title: 'A2',
        id: table1.records[1].id,
      });

      // table2 record2 link from A2 to A1
      await updateRecordViaShareDb(table2.id, table2.records[1].id, table2.fields[2].id, {
        title: 'A1',
        id: table1.records[0].id,
      });

      const table1RecordResult = (await getRecords(table1.id)).records;
      const table2RecordResult = (await getRecords(table2.id)).records;

      expect(table1RecordResult[0].fields[table1FormulaFieldRo.name!]).toEqual(['B1', 'B2']);
      expect(table1RecordResult[1].fields[table1FormulaFieldRo.name!]).toEqual(undefined);
      expect(table2RecordResult[0].fields[table2FormulaFieldRo.name!]).toEqual('A1');
      expect(table2RecordResult[1].fields[table2FormulaFieldRo.name!]).toEqual('A1');
    });

    it('should throw error when add a duplicate record in oneMany link field', async () => {
      // set text for lookup field
      await updateRecordViaShareDb(table2.id, table2.records[0].id, table2.fields[0].id, 'B1');
      await updateRecordViaShareDb(table2.id, table2.records[1].id, table2.fields[0].id, 'B2');

      // first update
      await updateRecordViaShareDb(table1.id, table1.records[0].id, table1.fields[2].id, [
        { title: 'B1', id: table2.records[0].id },
        { title: 'B2', id: table2.records[1].id },
      ]);

      // // update a duplicated link record in other record
      await expect(
        updateRecordViaShareDb(table1.id, table1.records[1].id, table1.fields[2].id, [
          { title: 'B1', id: table2.records[0].id },
        ])
      ).rejects.toThrow();

      const table1RecordResult2 = await getRecords(table1.id);

      expect(table1RecordResult2.records[0].fields[table1.fields[2].name]).toEqual([
        { title: 'B1', id: table2.records[0].id },
        { title: 'B2', id: table2.records[1].id },
      ]);

      expect(table1RecordResult2.records[1].fields[table1.fields[2].name]).toBeUndefined();
    });
  });
});
