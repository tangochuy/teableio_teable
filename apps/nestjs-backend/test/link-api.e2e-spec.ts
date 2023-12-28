/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable sonarjs/no-duplicate-string */
import type { INestApplication } from '@nestjs/common';
import type { IFieldRo, ILinkFieldOptions, IRecord, ITableFullVo } from '@teable-group/core';
import {
  FieldKeyType,
  FieldType,
  IdPrefix,
  NumberFormattingType,
  RecordOpBuilder,
  Relationship,
} from '@teable-group/core';
import type { Connection, Doc } from 'sharedb/lib/client';
import { ShareDbService } from '../src/share-db/share-db.service';
import {
  createField,
  createRecords,
  createTable,
  deleteField,
  deleteRecord,
  deleteTable,
  getField,
  getFields,
  getRecord,
  getRecords,
  initApp,
  updateRecord,
  updateRecordByApi,
} from './utils/init-app';

describe('OpenAPI link (e2e)', () => {
  let app: INestApplication;
  const baseId = globalThis.testConfig.baseId;
  const split = globalThis.testConfig.driver === 'postgresql' ? '.' : '_';
  let cookie: string;
  let connection: Connection;

  beforeAll(async () => {
    const appCtx = await initApp();
    app = appCtx.app;
    cookie = appCtx.cookie;

    const shareDbService = app.get(ShareDbService);
    connection = shareDbService.connect(undefined, {
      headers: {
        cookie: cookie,
      },
    });
  });

  afterAll(async () => {
    await app.close();
  });

  async function updateRecordViaShareDb(
    tableId: string,
    recordId: string,
    fieldId: string,
    newValues: any
  ) {
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

  describe('create table with link field', () => {
    let table1: ITableFullVo;
    let table2: ITableFullVo;

    afterEach(async () => {
      table1 && (await deleteTable(baseId, table1.id));
      table2 && (await deleteTable(baseId, table2.id));
    });

    it('should create foreign link field when create a new table with many-one link field', async () => {
      const textFieldRo: IFieldRo = {
        name: 'text field',
        type: FieldType.SingleLineText,
      };

      const numberFieldRo: IFieldRo = {
        name: 'Number field',
        type: FieldType.Number,
        options: {
          formatting: { type: NumberFormattingType.Decimal, precision: 1 },
        },
      };

      table1 = await createTable(baseId, {
        fields: [textFieldRo, numberFieldRo],
        records: [
          { fields: { 'text field': 'table1_1' } },
          { fields: { 'text field': 'table1_2' } },
          { fields: { 'text field': 'table1_3' } },
        ],
      });

      const linkFieldRo: IFieldRo = {
        name: 'link field',
        type: FieldType.Link,
        options: {
          relationship: Relationship.ManyOne,
          foreignTableId: table1.id,
        },
      };
      table2 = await createTable(baseId, {
        name: 'table2',
        fields: [textFieldRo, numberFieldRo, linkFieldRo],
        records: [
          { fields: { 'text field': 'table2_1' } },
          { fields: { 'text field': 'table2_2' } },
          { fields: { 'text field': 'table2_3' } },
        ],
      });

      const getTable1FieldsResult = await getFields(table1.id);

      expect(getTable1FieldsResult).toHaveLength(3);
      expect(getTable1FieldsResult[2]).toMatchObject({
        type: FieldType.Link,
        options: {
          relationship: Relationship.OneMany,
          foreignTableId: table2.id,
          lookupFieldId: table2.fields[0].id,
          selfKeyName: '__fk_' + table2.fields[2].id,
          foreignKeyName: '__id',
          symmetricFieldId: table2.fields[2].id,
        },
      });

      expect(table2.fields[2]).toMatchObject({
        type: FieldType.Link,
        options: {
          relationship: Relationship.ManyOne,
          foreignTableId: table1.id,
          lookupFieldId: getTable1FieldsResult[0].id,
          foreignKeyName: '__fk_' + table2.fields[2].id,
          selfKeyName: '__id',
          symmetricFieldId: getTable1FieldsResult[2].id,
        },
      });
    });

    it('should create foreign link field when create a new table with many-many link field', async () => {
      const textFieldRo: IFieldRo = {
        name: 'text field',
        type: FieldType.SingleLineText,
      };

      const numberFieldRo: IFieldRo = {
        name: 'Number field',
        type: FieldType.Number,
        options: {
          formatting: { type: NumberFormattingType.Decimal, precision: 1 },
        },
      };

      table1 = await createTable(baseId, {
        fields: [textFieldRo, numberFieldRo],
        records: [
          { fields: { 'text field': 'table1_1' } },
          { fields: { 'text field': 'table1_2' } },
          { fields: { 'text field': 'table1_3' } },
        ],
      });

      const linkFieldRo: IFieldRo = {
        name: 'link field',
        type: FieldType.Link,
        options: {
          relationship: Relationship.ManyMany,
          foreignTableId: table1.id,
        },
      };
      table2 = await createTable(baseId, {
        name: 'table2',
        fields: [textFieldRo, numberFieldRo, linkFieldRo],
        records: [
          { fields: { 'text field': 'table2_1' } },
          { fields: { 'text field': 'table2_2' } },
          { fields: { 'text field': 'table2_3' } },
        ],
      });

      const getTable1FieldsResult = await getFields(table1.id);
      expect(getTable1FieldsResult).toHaveLength(3);
      table1.fields = getTable1FieldsResult;

      const fkHostTableName = `${baseId}${split}junction_${table2.fields[2].id}_${
        (table2.fields[2].options as ILinkFieldOptions).symmetricFieldId
      }`;

      expect(table1.fields[2]).toMatchObject({
        type: FieldType.Link,
        options: {
          relationship: Relationship.ManyMany,
          foreignTableId: table2.id,
          lookupFieldId: table2.fields[0].id,
          fkHostTableName: fkHostTableName,
          selfKeyName: '__fk_' + table2.fields[2].id,
          foreignKeyName: '__fk_' + table1.fields[2].id,
          symmetricFieldId: table2.fields[2].id,
        },
      });

      expect(table2.fields[2]).toMatchObject({
        type: FieldType.Link,
        options: {
          relationship: Relationship.ManyMany,
          foreignTableId: table1.id,
          lookupFieldId: table1.fields[0].id,
          fkHostTableName: fkHostTableName,
          selfKeyName: '__fk_' + table1.fields[2].id,
          foreignKeyName: '__fk_' + table2.fields[2].id,
          symmetricFieldId: table1.fields[2].id,
        },
      });
    });

    it('should auto create foreign manyOne link field when create oneMany link field', async () => {
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
        fields: [numberFieldRo, textFieldRo],
      });

      const linkFieldRo: IFieldRo = {
        name: 'link field',
        type: FieldType.Link,
        options: {
          relationship: Relationship.OneMany,
          foreignTableId: table1.id,
        },
      };

      table2 = await createTable(baseId, {
        name: 'table2',
        fields: [numberFieldRo, textFieldRo, linkFieldRo],
      });

      const getTable1FieldsResult = await getFields(table1.id);

      expect(getTable1FieldsResult).toHaveLength(3);
      expect(getTable1FieldsResult[2]).toMatchObject({
        type: FieldType.Link,
        options: {
          relationship: Relationship.ManyOne,
          foreignTableId: table2.id,
          lookupFieldId: table2.fields[0].id,
          selfKeyName: '__id',
          foreignKeyName: '__fk_' + getTable1FieldsResult[2].id,
          symmetricFieldId: table2.fields[2].id,
        },
      });

      expect(table2.fields[2]).toMatchObject({
        type: FieldType.Link,
        options: {
          relationship: Relationship.OneMany,
          foreignTableId: table1.id,
          lookupFieldId: getTable1FieldsResult[0].id,
          foreignKeyName: '__id',
          selfKeyName: '__fk_' + getTable1FieldsResult[2].id,
          symmetricFieldId: getTable1FieldsResult[2].id,
        },
      });
    });

    it('should set link record in foreign link field when create a new table with link field and link record', async () => {
      const textFieldRo: IFieldRo = {
        name: 'text field',
        type: FieldType.SingleLineText,
      };

      const numberFieldRo: IFieldRo = {
        name: 'Number field',
        type: FieldType.Number,
        options: {
          formatting: { type: NumberFormattingType.Decimal, precision: 1 },
        },
      };

      table1 = await createTable(baseId, {
        fields: [textFieldRo, numberFieldRo],
        records: [
          { fields: { 'text field': 'table1_1' } },
          { fields: { 'text field': 'table1_2' } },
          { fields: { 'text field': 'table1_3' } },
        ],
      });

      const linkFieldRo: IFieldRo = {
        name: 'link field',
        type: FieldType.Link,
        options: {
          relationship: Relationship.OneMany,
          foreignTableId: table1.id,
        },
      };

      table2 = await createTable(baseId, {
        name: 'table2',
        fields: [textFieldRo, numberFieldRo, linkFieldRo],
        records: [
          {
            fields: {
              'text field': 'table2_1',
              'link field': [{ id: table1.records[0].id }, { id: table1.records[1].id }],
            },
          },
          { fields: { 'text field': 'table2_2' } },
          { fields: { 'text field': 'table2_3' } },
        ],
      });

      expect(table2.records).toHaveLength(3);
      expect(table2.records[0].fields['link field']).toEqual([
        { id: table1.records[0].id, title: 'table1_1' },
        { id: table1.records[1].id, title: 'table1_2' },
      ]);
    });

    it('should throw error when create a new table with link field and error link record', async () => {
      const textFieldRo: IFieldRo = {
        name: 'text field',
        type: FieldType.SingleLineText,
      };

      const numberFieldRo: IFieldRo = {
        name: 'Number field',
        type: FieldType.Number,
        options: {
          formatting: { type: NumberFormattingType.Decimal, precision: 1 },
        },
      };

      table1 = await createTable(baseId, {
        fields: [textFieldRo, numberFieldRo],
        records: [
          { fields: { 'text field': 'table1_1' } },
          { fields: { 'text field': 'table1_2' } },
          { fields: { 'text field': 'table1_3' } },
        ],
      });

      const linkFieldRo: IFieldRo = {
        name: 'link field',
        type: FieldType.Link,
        options: {
          relationship: Relationship.OneMany,
          foreignTableId: table1.id,
        },
      };

      await createTable(
        baseId,
        {
          name: 'table2',
          fields: [textFieldRo, numberFieldRo, linkFieldRo],
          records: [
            {
              fields: {
                'text field': 'table2_1',
                'link field': [{ id: table1.records[0].id }, { id: table1.records[0].id }], // illegal link record
              },
            },
            { fields: { 'text field': 'table2_2' } },
            { fields: { 'text field': 'table2_3' } },
          ],
        },
        400
      );
    });

    it('should have correct title when create a new table with manyOne link field', async () => {
      const textFieldRo: IFieldRo = {
        name: 'text field',
        type: FieldType.SingleLineText,
      };

      table1 = await createTable(baseId, {
        fields: [textFieldRo],
        records: [
          { fields: { 'text field': 'table1_1' } },
          { fields: { 'text field': 'table1_2' } },
          { fields: { 'text field': 'table1_3' } },
        ],
      });

      const linkFieldRo: IFieldRo = {
        name: 'link field',
        type: FieldType.Link,
        options: {
          relationship: Relationship.ManyOne,
          foreignTableId: table1.id,
        },
      };

      const table2 = await createTable(baseId, {
        name: 'table2',
        fields: [textFieldRo, linkFieldRo],
        records: [
          {
            fields: {
              'text field': 'table2_1',
              'link field': { id: table1.records[0].id },
            },
          },
        ],
      });
      expect(table2.records[0].fields['link field']).toEqual({
        title: 'table1_1',
        id: table1.records[0].id,
      });
      const table1Records = await getRecords(table1.id, { fieldKeyType: FieldKeyType.Id });
      const table1Fields = await getFields(table1.id);

      expect(table1Records.records[0].fields[table1Fields[1].id]).toEqual([
        {
          title: 'table2_1',
          id: table2.records[0].id,
        },
      ]);
    });

    it('should have correct title when create a new table with oneMany link field', async () => {
      const textFieldRo: IFieldRo = {
        name: 'text field',
        type: FieldType.SingleLineText,
      };

      table1 = await createTable(baseId, {
        fields: [textFieldRo],
        records: [
          { fields: { 'text field': 'table1_1' } },
          { fields: { 'text field': 'table1_2' } },
          { fields: { 'text field': 'table1_3' } },
        ],
      });

      const linkFieldRo: IFieldRo = {
        name: 'link field',
        type: FieldType.Link,
        options: {
          relationship: Relationship.OneMany,
          foreignTableId: table1.id,
        },
      };
      const table2 = await createTable(baseId, {
        name: 'table2',
        fields: [textFieldRo, linkFieldRo],
        records: [
          {
            fields: {
              'text field': 'table2_1',
              'link field': [{ id: table1.records[0].id }],
            },
          },
        ],
      });
      expect(table2.records[0].fields['link field']).toEqual([
        {
          title: 'table1_1',
          id: table1.records[0].id,
        },
      ]);
      const table1Records = await getRecords(table1.id, { fieldKeyType: FieldKeyType.Id });
      const table1Fields = await getFields(table1.id);

      expect(table1Records.records[0].fields[table1Fields[1].id]).toEqual({
        title: 'table2_1',
        id: table2.records[0].id,
      });
    });
  });

  describe('create link fields', () => {
    let table1: ITableFullVo;
    let table2: ITableFullVo;
    beforeEach(async () => {
      // create tables
      const textFieldRo: IFieldRo = {
        name: 'text field',
        type: FieldType.SingleLineText,
      };

      const numberFieldRo: IFieldRo = {
        name: 'Number field',
        type: FieldType.Number,
        options: {
          formatting: { type: NumberFormattingType.Decimal, precision: 1 },
        },
      };

      table1 = await createTable(baseId, {
        fields: [textFieldRo, numberFieldRo],
        records: [
          { fields: { 'text field': 'table1_1' } },
          { fields: { 'text field': 'table1_2' } },
          { fields: { 'text field': 'table1_3' } },
        ],
      });

      table2 = await createTable(baseId, {
        name: 'table2',
        fields: [textFieldRo, numberFieldRo],
        records: [
          { fields: { 'text field': 'table2_1' } },
          { fields: { 'text field': 'table2_2' } },
          { fields: { 'text field': 'table2_3' } },
        ],
      });

      table1.fields = await getFields(table1.id);
      table2.fields = await getFields(table2.id);
    });

    afterEach(async () => {
      await deleteTable(baseId, table1.id);
      await deleteTable(baseId, table2.id);
    });

    it('should create two way, many many link', async () => {
      // create link field
      const Link1FieldRo: IFieldRo = {
        name: 'link field',
        type: FieldType.Link,
        options: {
          relationship: Relationship.ManyMany,
          foreignTableId: table2.id,
        },
      };

      const linkField1 = await createField(table1.id, Link1FieldRo);
      const fkHostTableName = `${baseId}${split}junction_${linkField1.id}_${
        (linkField1.options as ILinkFieldOptions).symmetricFieldId
      }`;

      const table2Fields = await getFields(table2.id);
      const linkField2 = table2Fields[2];

      expect(linkField1).toMatchObject({
        type: FieldType.Link,
        options: {
          relationship: Relationship.ManyMany,
          foreignTableId: table2.id,
          lookupFieldId: table2.fields[0].id,
          fkHostTableName: fkHostTableName,
          selfKeyName: '__fk_' + linkField2.id,
          foreignKeyName: '__fk_' + linkField1.id,
          symmetricFieldId: linkField2.id,
        },
      });

      expect(linkField2).toMatchObject({
        type: FieldType.Link,
        options: {
          relationship: Relationship.ManyMany,
          foreignTableId: table1.id,
          lookupFieldId: table1.fields[0].id,
          fkHostTableName: fkHostTableName,
          selfKeyName: '__fk_' + linkField1.id,
          foreignKeyName: '__fk_' + linkField2.id,
          symmetricFieldId: linkField1.id,
        },
      });
    });

    it('should create one way, many many link', async () => {
      // create link field
      const Link1FieldRo: IFieldRo = {
        name: 'link field',
        type: FieldType.Link,
        options: {
          relationship: Relationship.ManyMany,
          foreignTableId: table2.id,
          isOneWay: true,
        },
      };

      const linkField1 = await createField(table1.id, Link1FieldRo);
      const fkHostTableName = `${baseId}${split}junction_${linkField1.id}`;

      expect(linkField1).toMatchObject({
        type: FieldType.Link,
        options: {
          relationship: Relationship.ManyMany,
          foreignTableId: table2.id,
          isOneWay: true,
          fkHostTableName: fkHostTableName,
          lookupFieldId: table2.fields[0].id,
          foreignKeyName: '__fk_' + linkField1.id,
        },
      });
      expect((linkField1.options as ILinkFieldOptions).selfKeyName).toContain('rad');
      expect((linkField1.options as ILinkFieldOptions).symmetricFieldId).toBeUndefined();

      const table2Fields = await getFields(table2.id);
      expect(table2Fields.length).toEqual(2);
    });

    it('should create two way, one one link', async () => {
      // create link field
      const Link1FieldRo: IFieldRo = {
        name: 'link field',
        type: FieldType.Link,
        options: {
          relationship: Relationship.OneOne,
          foreignTableId: table2.id,
        },
      };

      const linkField1 = await createField(table1.id, Link1FieldRo);
      const table2Fields = await getFields(table2.id);
      const linkField2 = table2Fields[2];

      expect(linkField1).toMatchObject({
        type: FieldType.Link,
        options: {
          relationship: Relationship.OneOne,
          foreignTableId: table2.id,
          fkHostTableName: table1.dbTableName,
          lookupFieldId: table2.fields[0].id,
          selfKeyName: '__id',
          foreignKeyName: `__fk_${linkField1.id}`,
          symmetricFieldId: linkField2.id,
        },
      });

      expect(linkField2).toMatchObject({
        type: FieldType.Link,
        options: {
          relationship: Relationship.OneOne,
          foreignTableId: table1.id,
          fkHostTableName: table1.dbTableName,
          lookupFieldId: table1.fields[0].id,
          foreignKeyName: '__id',
          selfKeyName: `__fk_${linkField1.id}`,
          symmetricFieldId: linkField1.id,
        },
      });
    });

    it('should throw error when add a duplicate record in one way one one link field', async () => {
      // create link field
      const Link1FieldRo: IFieldRo = {
        name: 'link field',
        type: FieldType.Link,
        options: {
          relationship: Relationship.OneOne,
          foreignTableId: table2.id,
        },
      };

      const linkField1 = await createField(table1.id, Link1FieldRo);

      // set text for lookup field
      await updateRecordByApi(table2.id, table2.records[0].id, table2.fields[0].id, 'B1');

      // first update
      await updateRecordByApi(table1.id, table1.records[0].id, linkField1.id, {
        title: 'B1',
        id: table2.records[0].id,
      });

      // update a duplicated link record in other record
      await updateRecordByApi(
        table1.id,
        table1.records[1].id,
        linkField1.id,
        { id: table2.records[0].id },
        400
      );
    });

    it('should throw error when add a duplicate record in one way one one link field in create record', async () => {
      // create link field
      const Link1FieldRo: IFieldRo = {
        name: 'link field',
        type: FieldType.Link,
        options: {
          relationship: Relationship.OneOne,
          foreignTableId: table2.id,
          isOneWay: true,
        },
      };

      const linkField1 = await createField(table1.id, Link1FieldRo);

      await createRecords(
        table1.id,
        {
          records: [
            { fields: { [linkField1.id]: { id: table2.records[0].id } } },
            { fields: { [linkField1.id]: { id: table2.records[0].id } } },
          ],
        },
        400
      );
    });
  });

  describe('many one and one many link field cell update', () => {
    let table1: ITableFullVo;
    let table2: ITableFullVo;
    beforeEach(async () => {
      // create tables
      const textFieldRo: IFieldRo = {
        name: 'text field',
        type: FieldType.SingleLineText,
      };

      const numberFieldRo: IFieldRo = {
        name: 'Number field',
        type: FieldType.Number,
        options: {
          formatting: { type: NumberFormattingType.Decimal, precision: 1 },
        },
      };

      table1 = await createTable(baseId, {
        fields: [textFieldRo, numberFieldRo],
        records: [
          { fields: { 'text field': 'table1_1' } },
          { fields: { 'text field': 'table1_2' } },
          { fields: { 'text field': 'table1_3' } },
        ],
      });

      table2 = await createTable(baseId, {
        name: 'table2',
        fields: [textFieldRo, numberFieldRo],
        records: [
          { fields: { 'text field': 'table2_1' } },
          { fields: { 'text field': 'table2_2' } },
          { fields: { 'text field': 'table2_3' } },
        ],
      });

      // create link field
      const table2LinkFieldRo: IFieldRo = {
        name: 'link field',
        type: FieldType.Link,
        options: {
          relationship: Relationship.ManyOne,
          foreignTableId: table1.id,
        },
      };

      await createField(table2.id, table2LinkFieldRo);

      table1.fields = await getFields(table1.id);
      table2.fields = await getFields(table2.id);
    });

    afterEach(async () => {
      await deleteTable(baseId, table1.id);
      await deleteTable(baseId, table2.id);
    });

    it('should update foreign link field when set a new link in to link field cell', async () => {
      // table2 link field first record link to table1 first record
      await updateRecordByApi(table2.id, table2.records[0].id, table2.fields[2].id, {
        id: table1.records[0].id,
      });

      await updateRecordByApi(table2.id, table2.records[0].id, table2.fields[2].id, {
        title: 'table1_2',
        id: table1.records[1].id,
      });

      const table1RecordResult2 = await getRecords(table1.id);

      expect(table1RecordResult2.records[0].fields[table1.fields[2].name]).toBeUndefined();
      expect(table1RecordResult2.records[1].fields[table1.fields[2].name]).toEqual([
        {
          title: 'table2_1',
          id: table2.records[0].id,
        },
      ]);
    });

    it('should update foreign link field when change lookupField value', async () => {
      // table2 link field first record link to table1 first record
      await updateRecordByApi(table2.id, table2.records[0].id, table2.fields[2].id, {
        id: table1.records[0].id,
      });
      // set text for lookup field
      await updateRecordByApi(table2.id, table2.records[0].id, table2.fields[0].id, 'B1');

      await updateRecordByApi(table2.id, table2.records[1].id, table2.fields[0].id, 'B2');

      // add an extra link for table1 record1
      await updateRecordByApi(table2.id, table2.records[1].id, table2.fields[2].id, {
        title: 'table1_1',
        id: table1.records[0].id,
      });

      const table1RecordResult2 = await getRecords(table1.id);

      expect(table1RecordResult2.records[0].fields[table1.fields[2].name]).toEqual([
        {
          title: 'B1',
          id: table2.records[0].id,
        },
        {
          title: 'B2',
          id: table2.records[1].id,
        },
      ]);

      await updateRecordByApi(table1.id, table1.records[0].id, table1.fields[0].id, 'AX');

      const table2RecordResult2 = await getRecords(table2.id);

      expect(table2RecordResult2.records[0].fields[table2.fields[2].name!]).toEqual({
        title: 'AX',
        id: table1.records[0].id,
      });
    });

    it('should update self foreign link with correct title', async () => {
      // table2 link field first record link to table1 first record
      await updateRecordByApi(table2.id, table2.records[0].id, table2.fields[2].id, {
        id: table1.records[0].id,
      });
      // set text for lookup field
      await updateRecordByApi(table2.id, table2.records[0].id, table2.fields[0].id, 'B1');
      await updateRecordByApi(table2.id, table2.records[1].id, table2.fields[0].id, 'B2');

      await updateRecordByApi(table1.id, table1.records[0].id, table1.fields[2].id, [
        { title: 'B1', id: table2.records[0].id },
        { title: 'B2', id: table2.records[1].id },
      ]);

      const table1RecordResult2 = await getRecords(table1.id);

      expect(table1RecordResult2.records[0].fields[table1.fields[2].name]).toEqual([
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
      // table2 link field first record link to table1 first record
      await updateRecordByApi(table2.id, table2.records[0].id, table2.fields[2].id, {
        id: table1.records[0].id,
      });

      const table2FormulaFieldRo: IFieldRo = {
        name: 'table2Formula',
        type: FieldType.Formula,
        options: {
          expression: `{${table2.fields[2].id}}`,
        },
      };
      await createField(table2.id, table2FormulaFieldRo);

      await updateRecordByApi(table2.id, table2.records[0].id, table2.fields[2].id, {
        title: 'illegal title',
        id: table1.records[1].id,
      });

      const table1RecordResult = await getRecords(table1.id);
      const table2RecordResult = await getRecords(table2.id);

      expect(table1RecordResult.records[0].fields[table1.fields[2].name]).toBeUndefined();
      expect(table1RecordResult.records[1].fields[table1.fields[2].name]).toEqual([
        {
          title: 'table2_1',
          id: table2.records[0].id,
        },
      ]);
      expect(table2RecordResult.records[0].fields[table2FormulaFieldRo.name!]).toEqual('table1_2');
    });

    it('should update formula field when change oneMany link cell', async () => {
      // table2 link field first record link to table1 first record
      await updateRecordByApi(table2.id, table2.records[0].id, table2.fields[2].id, {
        id: table1.records[0].id,
      });

      const table1FormulaFieldRo: IFieldRo = {
        name: 'table1 formula field',
        type: FieldType.Formula,
        options: {
          expression: `{${table1.fields[2].id}}`,
        },
      };

      await createField(table1.id, table1FormulaFieldRo);

      await updateRecord(table1.id, table1.records[0].id, {
        record: {
          fields: {
            [table1.fields[2].name]: [
              { title: 'illegal test1', id: table2.records[0].id },
              { title: 'illegal test2', id: table2.records[1].id },
            ],
          },
        },
      });
      const table1RecordResult = await getRecords(table1.id);

      expect(table1RecordResult.records[0].fields[table1.fields[2].name]).toEqual([
        { title: 'table2_1', id: table2.records[0].id },
        { title: 'table2_2', id: table2.records[1].id },
      ]);

      expect(table1RecordResult.records[0].fields[table1FormulaFieldRo.name!]).toEqual([
        'table2_1',
        'table2_2',
      ]);
    });

    it('should throw error when add a duplicate record in oneMany link field', async () => {
      // set text for lookup field
      await updateRecordByApi(table2.id, table2.records[0].id, table2.fields[0].id, 'B1');
      await updateRecordByApi(table2.id, table2.records[1].id, table2.fields[0].id, 'B2');

      // first update
      await updateRecordByApi(table1.id, table1.records[0].id, table1.fields[2].id, [
        { title: 'B1', id: table2.records[0].id },
        { title: 'B2', id: table2.records[1].id },
      ]);

      // update a duplicated link record in other record
      await updateRecordByApi(
        table1.id,
        table1.records[1].id,
        table1.fields[2].id,
        [{ title: 'B1', id: table2.records[0].id }],
        400
      );

      const table1RecordResult2 = await getRecords(table1.id);

      expect(table1RecordResult2.records[0].fields[table1.fields[2].name]).toEqual([
        { title: 'B1', id: table2.records[0].id },
        { title: 'B2', id: table2.records[1].id },
      ]);
      expect(table1RecordResult2.records[1].fields[table1.fields[2].name]).toBeUndefined();
    });

    it('should throw error when add a duplicate record in oneMany link field in create record', async () => {
      await createRecords(
        table1.id,
        {
          records: [
            {
              fields: {
                [table1.fields[2].id]: [{ id: table2.records[0].id }, { id: table2.records[0].id }],
              },
            },
          ],
        },
        400
      );

      await createRecords(
        table1.id,
        {
          records: [
            { fields: { [table1.fields[2].id]: [{ id: table2.records[0].id }] } },
            { fields: { [table1.fields[2].id]: [{ id: table2.records[0].id }] } },
          ],
        },
        400
      );
    });

    it('should set a text value in a link record with typecast', async () => {
      await updateRecordByApi(table1.id, table1.records[0].id, table1.fields[0].id, 'A1');
      await updateRecordByApi(table2.id, table2.records[1].id, table2.fields[0].id, 'B2');
      // // reject data when typecast is false
      await createRecords(
        table2.id,
        {
          typecast: false,
          records: [
            {
              fields: {
                [table2.fields[2].id]: ['A1'],
              },
            },
          ],
        },
        400
      );

      const { records } = await createRecords(table2.id, {
        typecast: true,
        records: [
          {
            fields: {
              [table2.fields[2].id]: 'A1',
            },
          },
        ],
      });

      expect(records[0].fields[table2.fields[2].id]).toEqual({
        id: table1.records[0].id,
        title: 'A1',
      });

      const { records: records2 } = await createRecords(table1.id, {
        typecast: true,
        records: [
          {
            fields: {
              [table1.fields[2].id]: 'B2',
            },
          },
        ],
      });

      expect(records2[0].fields[table1.fields[2].id]).toEqual([
        {
          id: table2.records[1].id,
          title: 'B2',
        },
      ]);
    });

    it('should update link cellValue when change primary field value', async () => {
      await updateRecordByApi(table2.id, table2.records[0].id, table2.fields[0].id, 'B1');
      await updateRecordByApi(table2.id, table2.records[1].id, table2.fields[0].id, 'B2');

      await updateRecordByApi(table1.id, table1.records[0].id, table1.fields[2].id, [
        {
          id: table2.records[0].id,
        },
        {
          id: table2.records[1].id,
        },
      ]);

      await updateRecordByApi(table2.id, table2.records[0].id, table2.fields[0].id, 'B1+');

      const record1 = await getRecord(table1.id, table1.records[0].id);

      expect(record1.fields[table1.fields[2].id]).toEqual([
        {
          title: 'B1+',
          id: table2.records[0].id,
        },
        {
          title: 'B2',
          id: table2.records[1].id,
        },
      ]);

      await updateRecordByApi(table2.id, table2.records[1].id, table2.fields[0].id, 'B2+');
      const record2 = await getRecord(table1.id, table1.records[0].id);
      expect(record2.fields[table1.fields[2].id]).toEqual([
        {
          title: 'B1+',
          id: table2.records[0].id,
        },
        {
          title: 'B2+',
          id: table2.records[1].id,
        },
      ]);
    });

    it('should not insert illegal value in link cel', async () => {
      await updateRecordByApi(table1.id, table1.records[0].id, table1.fields[2].id, ['NO'], 400);
    });
  });

  describe('many many link field cell update', () => {
    let table1: ITableFullVo;
    let table2: ITableFullVo;
    beforeEach(async () => {
      // create tables
      const textFieldRo: IFieldRo = {
        name: 'text field',
        type: FieldType.SingleLineText,
      };

      const numberFieldRo: IFieldRo = {
        name: 'Number field',
        type: FieldType.Number,
        options: {
          formatting: { type: NumberFormattingType.Decimal, precision: 1 },
        },
      };

      table1 = await createTable(baseId, {
        fields: [textFieldRo, numberFieldRo],
        records: [
          { fields: { 'text field': 'table1_1' } },
          { fields: { 'text field': 'table1_2' } },
          { fields: { 'text field': 'table1_3' } },
        ],
      });

      table2 = await createTable(baseId, {
        name: 'table2',
        fields: [textFieldRo, numberFieldRo],
        records: [
          { fields: { 'text field': 'table2_1' } },
          { fields: { 'text field': 'table2_2' } },
          { fields: { 'text field': 'table2_3' } },
        ],
      });

      // create link field
      const table2LinkFieldRo: IFieldRo = {
        name: 'link field',
        type: FieldType.Link,
        options: {
          relationship: Relationship.ManyMany,
          foreignTableId: table1.id,
        },
      };

      await createField(table2.id, table2LinkFieldRo);

      table1.fields = await getFields(table1.id);
      table2.fields = await getFields(table2.id);
    });

    afterEach(async () => {
      await deleteTable(baseId, table1.id);
      await deleteTable(baseId, table2.id);
    });

    it('should update foreign link field when set a new link in to link field cell', async () => {
      // table2 link field first record link to table1 first record
      await updateRecordByApi(table2.id, table2.records[0].id, table2.fields[2].id, [
        {
          id: table1.records[0].id,
        },
      ]);

      await updateRecordByApi(table2.id, table2.records[0].id, table2.fields[2].id, [
        {
          title: 'table1_2',
          id: table1.records[1].id,
        },
      ]);

      const table1RecordResult2 = await getRecords(table1.id);

      expect(table1RecordResult2.records[0].fields[table1.fields[2].name]).toBeUndefined();
      expect(table1RecordResult2.records[1].fields[table1.fields[2].name]).toEqual([
        {
          title: 'table2_1',
          id: table2.records[0].id,
        },
      ]);
    });

    it('should update foreign link field when change lookupField value', async () => {
      // table2 link field first record link to table1 first record
      await updateRecordByApi(table2.id, table2.records[0].id, table2.fields[2].id, [
        {
          id: table1.records[0].id,
        },
      ]);
      // set text for lookup field
      await updateRecordByApi(table2.id, table2.records[0].id, table2.fields[0].id, 'B1');

      await updateRecordByApi(table2.id, table2.records[1].id, table2.fields[0].id, 'B2');

      // add an extra link for table1 record1
      await updateRecordByApi(table2.id, table2.records[1].id, table2.fields[2].id, [
        {
          title: 'table1_1',
          id: table1.records[0].id,
        },
      ]);

      const table1RecordResult2 = await getRecords(table1.id);

      expect(table1RecordResult2.records[0].fields[table1.fields[2].name]).toEqual([
        {
          title: 'B1',
          id: table2.records[0].id,
        },
        {
          title: 'B2',
          id: table2.records[1].id,
        },
      ]);

      await updateRecordByApi(table1.id, table1.records[0].id, table1.fields[0].id, 'AX');

      const table2RecordResult2 = await getRecords(table2.id);

      expect(table2RecordResult2.records[0].fields[table2.fields[2].name!]).toEqual([
        {
          title: 'AX',
          id: table1.records[0].id,
        },
      ]);
    });

    it('should update self foreign link with correct title', async () => {
      // table2 link field first record link to table1 first record
      await updateRecordByApi(table2.id, table2.records[0].id, table2.fields[2].id, [
        {
          id: table1.records[0].id,
        },
      ]);
      // set text for lookup field
      await updateRecordByApi(table2.id, table2.records[0].id, table2.fields[0].id, 'B1');
      await updateRecordByApi(table2.id, table2.records[1].id, table2.fields[0].id, 'B2');

      await updateRecordByApi(table1.id, table1.records[0].id, table1.fields[2].id, [
        { title: 'B1', id: table2.records[0].id },
        { title: 'B2', id: table2.records[1].id },
      ]);

      const table1RecordResult2 = await getRecords(table1.id);

      expect(table1RecordResult2.records[0].fields[table1.fields[2].name]).toEqual([
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

    it('should update formula field when change link cell', async () => {
      // table2 link field first record link to table1 first record
      await updateRecordByApi(table2.id, table2.records[0].id, table2.fields[2].id, [
        {
          id: table1.records[0].id,
        },
      ]);

      const table2FormulaFieldRo: IFieldRo = {
        name: 'table2Formula',
        type: FieldType.Formula,
        options: {
          expression: `{${table2.fields[2].id}}`,
        },
      };

      await createField(table2.id, table2FormulaFieldRo);

      await updateRecordByApi(table2.id, table2.records[0].id, table2.fields[2].id, [
        {
          title: 'illegal title',
          id: table1.records[1].id,
        },
      ]);

      const table1RecordResult = await getRecords(table1.id);

      const table2RecordResult = await getRecords(table2.id);

      expect(table1RecordResult.records[0].fields[table1.fields[2].name]).toBeUndefined();
      expect(table1RecordResult.records[1].fields[table1.fields[2].name]).toEqual([
        {
          title: 'table2_1',
          id: table2.records[0].id,
        },
      ]);
      expect(table2RecordResult.records[0].fields[table2FormulaFieldRo.name!]).toEqual([
        'table1_2',
      ]);
    });

    it('should update formula field with function when change link cell', async () => {
      // table2 link field first record link to table1 first record
      await updateRecordByApi(table2.id, table2.records[0].id, table2.fields[2].id, [
        { id: table1.records[0].id },
      ]);

      const table2FormulaFieldRo: IFieldRo = {
        name: 'table2Formula',
        type: FieldType.Formula,
        options: {
          expression: `AND({${table2.fields[2].id}})`,
        },
      };

      await createField(table2.id, table2FormulaFieldRo);

      const t2r1 = await getRecords(table2.id);

      expect(t2r1.records[0].fields[table2FormulaFieldRo.name!]).toEqual(true);

      // replace
      await updateRecordByApi(table2.id, table2.records[0].id, table2.fields[2].id, [
        { id: table1.records[1].id },
      ]);

      const t2r2 = await getRecords(table2.id);

      expect(t2r2.records[0].fields[table2FormulaFieldRo.name!]).toEqual(true);

      // add
      await updateRecordByApi(table2.id, table2.records[0].id, table2.fields[2].id, [
        { id: table1.records[1].id },
        { id: table1.records[2].id },
      ]);

      const t2r3 = await getRecords(table2.id);

      expect(t2r3.records[0].fields[table2FormulaFieldRo.name!]).toEqual(true);

      // remove
      await updateRecordByApi(table2.id, table2.records[0].id, table2.fields[2].id, [
        { id: table1.records[1].id },
      ]);

      const t2r4 = await getRecords(table2.id);

      expect(t2r4.records[0].fields[table2FormulaFieldRo.name!]).toEqual(true);
    });

    it('should update formula field when change many many link cell', async () => {
      const table1FormulaFieldRo: IFieldRo = {
        name: 'table1 formula field',
        type: FieldType.Formula,
        options: {
          expression: `{${table1.fields[2].id}}`,
        },
      };

      const table2FormulaFieldRo: IFieldRo = {
        name: 'table2 formula field',
        type: FieldType.Formula,
        options: {
          expression: `{${table2.fields[2].id}}`,
        },
      };

      await createField(table1.id, table1FormulaFieldRo);
      await createField(table2.id, table2FormulaFieldRo);

      await updateRecord(table1.id, table1.records[0].id, {
        record: {
          fields: {
            [table1.fields[2].name]: [
              { title: 'illegal test1', id: table2.records[0].id },
              { title: 'illegal test2', id: table2.records[1].id },
            ],
          },
        },
      });

      const table1RecordResult = await getRecords(table1.id);
      const table2RecordResult = await getRecords(table2.id);

      expect(table1RecordResult.records[0].fields[table1.fields[2].name]).toEqual([
        { title: 'table2_1', id: table2.records[0].id },
        { title: 'table2_2', id: table2.records[1].id },
      ]);

      expect(table2RecordResult.records[0].fields[table2.fields[2].name]).toEqual([
        { title: 'table1_1', id: table1.records[0].id },
      ]);
      expect(table2RecordResult.records[1].fields[table2.fields[2].name]).toEqual([
        { title: 'table1_1', id: table1.records[0].id },
      ]);

      expect(table1RecordResult.records[0].fields[table1FormulaFieldRo.name!]).toEqual([
        'table2_1',
        'table2_2',
      ]);

      expect(table2RecordResult.records[0].fields[table2FormulaFieldRo.name!]).toEqual([
        'table1_1',
      ]);
      expect(table2RecordResult.records[1].fields[table2FormulaFieldRo.name!]).toEqual([
        'table1_1',
      ]);
    });

    it('should throw error when add a duplicate record within one cell', async () => {
      // set text for lookup field
      await updateRecordByApi(table2.id, table2.records[0].id, table2.fields[0].id, 'B1');
      await updateRecordByApi(table2.id, table2.records[1].id, table2.fields[0].id, 'B2');

      // first update
      await updateRecordByApi(table1.id, table1.records[0].id, table1.fields[2].id, [
        { title: 'B1', id: table2.records[0].id },
        { title: 'B2', id: table2.records[1].id },
      ]);

      // allow to update a duplicated link record in other record
      await updateRecordByApi(table1.id, table1.records[1].id, table1.fields[2].id, [
        { title: 'B1', id: table2.records[0].id },
      ]);

      // not allow to update a duplicated link record within one cell
      await updateRecordByApi(
        table1.id,
        table1.records[2].id,
        table1.fields[2].id,
        [
          { title: 'B2', id: table2.records[1].id },
          { title: 'B2', id: table2.records[1].id },
        ],
        400
      );

      const table1RecordResult2 = await getRecords(table1.id);

      expect(table1RecordResult2.records[0].fields[table1.fields[2].name]).toEqual([
        { title: 'B1', id: table2.records[0].id },
        { title: 'B2', id: table2.records[1].id },
      ]);

      expect(table1RecordResult2.records[2].fields[table1.fields[2].name]).toBeUndefined();
    });

    it('should set a text value in a link record with typecast', async () => {
      await updateRecordByApi(table1.id, table1.records[0].id, table1.fields[0].id, 'A1');
      await updateRecordByApi(table2.id, table2.records[1].id, table2.fields[0].id, 'B2');
      // // reject data when typecast is false
      await createRecords(
        table2.id,
        {
          typecast: false,
          records: [
            {
              fields: {
                [table2.fields[2].id]: ['A1'],
              },
            },
          ],
        },
        400
      );

      const { records } = await createRecords(table2.id, {
        typecast: true,
        records: [
          {
            fields: {
              [table2.fields[2].id]: 'A1',
            },
          },
        ],
      });

      expect(records[0].fields[table2.fields[2].id]).toEqual([
        {
          id: table1.records[0].id,
          title: 'A1',
        },
      ]);

      const { records: records2 } = await createRecords(table1.id, {
        typecast: true,
        records: [
          {
            fields: {
              [table1.fields[2].id]: 'B2',
            },
          },
        ],
      });

      expect(records2[0].fields[table1.fields[2].id]).toEqual([
        {
          id: table2.records[1].id,
          title: 'B2',
        },
      ]);
    });
  });

  describe.each([{ type: 'isTwoWay' }, { type: 'isOneWay' }])(
    'one one $type link field cell update',
    ({ type }) => {
      let table1: ITableFullVo;
      let table2: ITableFullVo;
      beforeEach(async () => {
        // create tables
        const textFieldRo: IFieldRo = {
          name: 'text field',
          type: FieldType.SingleLineText,
        };

        const numberFieldRo: IFieldRo = {
          name: 'Number field',
          type: FieldType.Number,
          options: {
            formatting: { type: NumberFormattingType.Decimal, precision: 1 },
          },
        };

        table1 = await createTable(baseId, {
          fields: [textFieldRo, numberFieldRo],
          records: [
            { fields: { 'text field': 'table1_1' } },
            { fields: { 'text field': 'table1_2' } },
            { fields: { 'text field': 'table1_3' } },
          ],
        });

        table2 = await createTable(baseId, {
          name: 'table2',
          fields: [textFieldRo, numberFieldRo],
          records: [
            { fields: { 'text field': 'table2_1' } },
            { fields: { 'text field': 'table2_2' } },
            { fields: { 'text field': 'table2_3' } },
          ],
        });

        // create link field
        const table2LinkFieldRo: IFieldRo = {
          name: 'link field',
          type: FieldType.Link,
          options: {
            relationship: Relationship.OneOne,
            foreignTableId: table1.id,
            isOneWay: type === 'isOneWay',
          },
        };

        await createField(table2.id, table2LinkFieldRo);

        table1.fields = await getFields(table1.id);
        table2.fields = await getFields(table2.id);
      });

      afterEach(async () => {
        await deleteTable(baseId, table1.id);
        await deleteTable(baseId, table2.id);
      });

      it('should update foreign link field when set a new link in to link field cell', async () => {
        // table2 link field first record link to table1 first record
        await updateRecordByApi(table2.id, table2.records[0].id, table2.fields[2].id, {
          id: table1.records[0].id,
        });

        await updateRecordByApi(table2.id, table2.records[0].id, table2.fields[2].id, {
          title: 'table1_2',
          id: table1.records[1].id,
        });

        const table1RecordResult2 = await getRecords(table1.id);

        if (type === 'isOneWay') {
          expect(table1.fields[2]).toBeUndefined();
        }

        if (type === 'isTwoWay') {
          expect(table1RecordResult2.records[0].fields[table1.fields[2].name]).toBeUndefined();
          expect(table1RecordResult2.records[1].fields[table1.fields[2].name]).toEqual({
            title: 'table2_1',
            id: table2.records[0].id,
          });
        }
      });

      it('should update foreign link field when change lookupField value', async () => {
        // table2 link field first record link to table1 first record
        await updateRecordByApi(table2.id, table2.records[0].id, table2.fields[2].id, {
          id: table1.records[0].id,
        });
        await updateRecordByApi(table1.id, table1.records[0].id, table1.fields[0].id, 'AX');

        const table2RecordResult2 = await getRecords(table2.id);

        expect(table2RecordResult2.records[0].fields[table2.fields[2].name!]).toEqual({
          title: 'AX',
          id: table1.records[0].id,
        });
      });

      it('should update self foreign link with correct title', async () => {
        // table2 link field first record link to table1 first record
        await updateRecordByApi(table2.id, table2.records[0].id, table2.fields[2].id, {
          id: table1.records[0].id,
        });
        // set text for lookup field
        await updateRecordByApi(table2.id, table2.records[0].id, table2.fields[0].id, 'B1');

        const table1RecordResult2 = await getRecords(table1.id);

        if (type === 'isOneWay') {
          expect(table1.fields[2]).toBeUndefined();
        }

        if (type === 'isTwoWay') {
          expect(table1RecordResult2.records[0].fields[table1.fields[2].name]).toEqual({
            title: 'B1',
            id: table2.records[0].id,
          });
        }
      });

      it('should throw error when add a duplicate record in one one link field', async () => {
        // set text for lookup field
        await updateRecordByApi(table2.id, table2.records[0].id, table2.fields[0].id, 'B1');

        if (type === 'isOneWay') {
          // first update
          await updateRecordByApi(table2.id, table2.records[0].id, table2.fields[2].id, {
            title: 'A1',
            id: table1.records[0].id,
          });

          // update a foreign table duplicated link record in other record
          await updateRecordByApi(
            table2.id,
            table2.records[1].id,
            table2.fields[2].id,
            { id: table1.records[0].id },
            400
          );
        }

        if (type === 'isTwoWay') {
          // first update
          await updateRecordByApi(table1.id, table1.records[0].id, table1.fields[2].id, {
            title: 'B1',
            id: table2.records[0].id,
          });

          // update a duplicated link record in other record
          await updateRecordByApi(
            table1.id,
            table1.records[1].id,
            table1.fields[2].id,
            { id: table2.records[0].id },
            400
          );

          // update a foreign table duplicated link record in other record
          await updateRecordByApi(
            table2.id,
            table2.records[1].id,
            table2.fields[2].id,
            { id: table1.records[0].id },
            400
          );
        }
      });

      it('should throw error when add a duplicate record in one one link field in create record', async () => {
        if (type === 'isTwoWay') {
          await createRecords(
            table1.id,
            {
              records: [
                { fields: { [table1.fields[2].id]: { id: table2.records[0].id } } },
                { fields: { [table1.fields[2].id]: { id: table2.records[0].id } } },
              ],
            },
            400
          );
        }

        await createRecords(
          table2.id,
          {
            records: [
              { fields: { [table2.fields[2].id]: { id: table1.records[0].id } } },
              { fields: { [table2.fields[2].id]: { id: table1.records[0].id } } },
            ],
          },
          400
        );
      });

      it('should safe delete a link record in cell via socket', async () => {
        await updateRecordByApi(table2.id, table2.records[0].id, table2.fields[2].id, {
          title: 'A1',
          id: table1.records[0].id,
        });

        await updateRecordByApi(table2.id, table2.records[0].id, table2.fields[2].id, null);
        const record1 = await getRecord(table2.id, table2.records[0].id);
        expect(record1.fields[table2.fields[2].id]).toBeUndefined();

        await updateRecordViaShareDb(table2.id, table2.records[0].id, table2.fields[2].id, {
          title: 'A1',
          id: table1.records[0].id,
        });

        await updateRecordViaShareDb(table2.id, table2.records[0].id, table2.fields[2].id, null);

        const record2 = await getRecord(table2.id, table2.records[0].id);
        expect(record2.fields[table2.fields[2].id]).toBeUndefined();

        const linkFieldRo: IFieldRo = {
          name: 'link field',
          type: FieldType.Link,
          options: {
            relationship: Relationship.OneOne,
            foreignTableId: table1.id,
            isOneWay: type === 'isOneWay',
          },
        };
        const linkField = await createField(table2.id, linkFieldRo);

        await updateRecordViaShareDb(table2.id, table2.records[0].id, linkField.id, {
          id: table1.records[0].id,
        });

        await updateRecordViaShareDb(table2.id, table2.records[0].id, linkField.id, null);
        const record3 = await getRecord(table2.id, table2.records[0].id);
        expect(record3.fields[linkField.id]).toBeUndefined();
      });
    }
  );

  describe('isOneWay many one and one many link field cell update', () => {
    let table1: ITableFullVo;
    let table2: ITableFullVo;
    beforeEach(async () => {
      // create tables
      const textFieldRo: IFieldRo = {
        name: 'text field',
        type: FieldType.SingleLineText,
      };

      const numberFieldRo: IFieldRo = {
        name: 'Number field',
        type: FieldType.Number,
        options: {
          formatting: { type: NumberFormattingType.Decimal, precision: 1 },
        },
      };

      table1 = await createTable(baseId, {
        fields: [textFieldRo, numberFieldRo],
        records: [
          { fields: { 'text field': 'table1_1' } },
          { fields: { 'text field': 'table1_2' } },
          { fields: { 'text field': 'table1_3' } },
        ],
      });

      table2 = await createTable(baseId, {
        name: 'table2',
        fields: [textFieldRo, numberFieldRo],
        records: [
          { fields: { 'text field': 'table2_1' } },
          { fields: { 'text field': 'table2_2' } },
          { fields: { 'text field': 'table2_3' } },
        ],
      });

      // create link field
      const table1LinkFieldRo: IFieldRo = {
        name: 'link field',
        type: FieldType.Link,
        options: {
          relationship: Relationship.OneMany,
          foreignTableId: table2.id,
          isOneWay: true,
        },
      };

      // create link field
      const table2LinkFieldRo: IFieldRo = {
        name: 'link field',
        type: FieldType.Link,
        options: {
          relationship: Relationship.ManyOne,
          foreignTableId: table1.id,
          isOneWay: true,
        },
      };

      await createField(table1.id, table1LinkFieldRo);
      await createField(table2.id, table2LinkFieldRo);

      table1.fields = await getFields(table1.id);
      table2.fields = await getFields(table2.id);
    });

    afterEach(async () => {
      await deleteTable(baseId, table1.id);
      await deleteTable(baseId, table2.id);
    });

    it('should update foreign link field when set a new link in to link field cell', async () => {
      // table2 link field first record link to table1 first record
      await updateRecordByApi(table2.id, table2.records[0].id, table2.fields[2].id, {
        id: table1.records[0].id,
      });

      await updateRecordByApi(table2.id, table2.records[0].id, table2.fields[2].id, {
        title: 'table1_2',
        id: table1.records[1].id,
      });

      const table1RecordResult2 = await getRecords(table1.id);

      expect(table1RecordResult2.records[0].fields[table1.fields[2].name]).toBeUndefined();
      expect(table1RecordResult2.records[1].fields[table1.fields[2].name]).toBeUndefined();
    });

    it('should update foreign link field when change lookupField value', async () => {
      // set text for lookup field
      await updateRecordByApi(table2.id, table2.records[0].id, table2.fields[0].id, 'B1');
      await updateRecordByApi(table2.id, table2.records[1].id, table2.fields[0].id, 'B2');

      await updateRecordByApi(table2.id, table2.records[0].id, table2.fields[2].id, {
        title: 'table1_1',
        id: table1.records[0].id,
      });
      await updateRecordByApi(table2.id, table2.records[1].id, table2.fields[2].id, {
        title: 'table1_1',
        id: table1.records[0].id,
      });

      const table1RecordResult2 = await getRecords(table1.id);

      expect(table1RecordResult2.records[0].fields[table1.fields[2].name]).toBeUndefined();

      await updateRecordByApi(table1.id, table1.records[0].id, table1.fields[0].id, 'AX');

      const table2RecordResult2 = await getRecords(table2.id);

      expect(table2RecordResult2.records[0].fields[table2.fields[2].name!]).toEqual({
        title: 'AX',
        id: table1.records[0].id,
      });
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
      await updateRecordByApi(table2.id, table2.records[0].id, table2.fields[2].id, {
        title: 'illegal title',
        id: table1.records[1].id,
      });

      const table2RecordResult = await getRecords(table2.id);

      expect(table2RecordResult.records[0].fields[table2FormulaFieldRo.name!]).toEqual('table1_2');
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

      await updateRecord(table1.id, table1.records[0].id, {
        record: {
          fields: {
            [table1.fields[2].name]: [
              { title: 'illegal test1', id: table2.records[0].id },
              { title: 'illegal test2', id: table2.records[1].id },
            ],
          },
        },
      });
      const table1RecordResult = await getRecords(table1.id);

      expect(table1RecordResult.records[0].fields[table1.fields[2].name]).toEqual([
        { title: 'table2_1', id: table2.records[0].id },
        { title: 'table2_2', id: table2.records[1].id },
      ]);
      expect(table1RecordResult.records[0].fields[table1FormulaFieldRo.name!]).toEqual([
        'table2_1',
        'table2_2',
      ]);
    });

    it('should throw error when add a duplicate record in oneMany link field', async () => {
      // set text for lookup field
      await updateRecordByApi(table2.id, table2.records[0].id, table2.fields[0].id, 'B1');
      await updateRecordByApi(table2.id, table2.records[1].id, table2.fields[0].id, 'B2');

      // first update
      await updateRecordByApi(table1.id, table1.records[0].id, table1.fields[2].id, [
        { title: 'B1', id: table2.records[0].id },
        { title: 'B2', id: table2.records[1].id },
      ]);

      // update a duplicated link record in other record
      await updateRecordByApi(
        table1.id,
        table1.records[1].id,
        table1.fields[2].id,
        [{ title: 'B1', id: table2.records[0].id }],
        400
      );

      const table1RecordResult2 = await getRecords(table1.id);

      expect(table1RecordResult2.records[0].fields[table1.fields[2].name]).toEqual([
        { title: 'B1', id: table2.records[0].id },
        { title: 'B2', id: table2.records[1].id },
      ]);

      expect(table1RecordResult2.records[1].fields[table1.fields[2].name]).toBeUndefined();
    });

    it('should throw error when add a duplicate record in oneMany link field in create record', async () => {
      await createRecords(
        table1.id,
        {
          records: [
            {
              fields: {
                [table1.fields[2].id]: [{ id: table2.records[0].id }, { id: table2.records[0].id }],
              },
            },
          ],
        },
        400
      );

      await createRecords(
        table1.id,
        {
          records: [
            { fields: { [table1.fields[2].id]: [{ id: table2.records[0].id }] } },
            { fields: { [table1.fields[2].id]: [{ id: table2.records[0].id }] } },
          ],
        },
        400
      );
    });

    it('should set a text value in a link record with typecast', async () => {
      await updateRecordByApi(table1.id, table1.records[0].id, table1.fields[0].id, 'A1');
      await updateRecordByApi(table2.id, table2.records[1].id, table2.fields[0].id, 'B2');
      // // reject data when typecast is false
      await createRecords(
        table2.id,
        {
          typecast: false,
          records: [
            {
              fields: {
                [table2.fields[2].id]: ['A1'],
              },
            },
          ],
        },
        400
      );

      const { records } = await createRecords(table2.id, {
        typecast: true,
        records: [
          {
            fields: {
              [table2.fields[2].id]: 'A1',
            },
          },
        ],
      });

      expect(records[0].fields[table2.fields[2].id]).toEqual({
        id: table1.records[0].id,
        title: 'A1',
      });

      const { records: records2 } = await createRecords(table1.id, {
        typecast: true,
        records: [
          {
            fields: {
              [table1.fields[2].id]: 'B2',
            },
          },
        ],
      });

      expect(records2[0].fields[table1.fields[2].id]).toEqual([
        {
          id: table2.records[1].id,
          title: 'B2',
        },
      ]);
    });

    it('should update link cellValue when change primary field value', async () => {
      await updateRecordByApi(table2.id, table2.records[0].id, table2.fields[0].id, 'B1');
      await updateRecordByApi(table2.id, table2.records[1].id, table2.fields[0].id, 'B2');

      await updateRecordByApi(table1.id, table1.records[0].id, table1.fields[2].id, [
        {
          id: table2.records[0].id,
        },
        {
          id: table2.records[1].id,
        },
      ]);

      await updateRecordByApi(table2.id, table2.records[0].id, table2.fields[0].id, 'B1+');

      const record1 = await getRecord(table1.id, table1.records[0].id);

      expect(record1.fields[table1.fields[2].id]).toEqual([
        {
          title: 'B1+',
          id: table2.records[0].id,
        },
        {
          title: 'B2',
          id: table2.records[1].id,
        },
      ]);

      await updateRecordByApi(table2.id, table2.records[1].id, table2.fields[0].id, 'B2+');
      const record2 = await getRecord(table1.id, table1.records[0].id);
      expect(record2.fields[table1.fields[2].id]).toEqual([
        {
          title: 'B1+',
          id: table2.records[0].id,
        },
        {
          title: 'B2+',
          id: table2.records[1].id,
        },
      ]);
    });
  });

  describe('multi link with depends same field', () => {
    let table1: ITableFullVo;
    let table2: ITableFullVo;
    beforeEach(async () => {
      table1 = await createTable(baseId, { name: 'table1' });
      table2 = await createTable(baseId, { name: 'table2' });
    });

    afterEach(async () => {
      await deleteTable(baseId, table1.id);
      await deleteTable(baseId, table2.id);
    });

    it('should update many-one record when add both many-one and many-one link', async () => {
      const manyOneFieldRo: IFieldRo = {
        type: FieldType.Link,
        options: {
          relationship: Relationship.ManyOne,
          foreignTableId: table2.id,
        },
      };

      const oneManyFieldRo: IFieldRo = {
        type: FieldType.Link,
        options: {
          relationship: Relationship.OneMany,
          foreignTableId: table2.id,
        },
      };

      // set primary key 'x' in table2
      await updateRecordByApi(table2.id, table2.records[0].id, table2.fields[0].id, 'x');
      // get get a oneManyField involved
      const manyOneField = await createField(table1.id, manyOneFieldRo);
      await createField(table1.id, oneManyFieldRo);

      await updateRecordByApi(table1.id, table1.records[0].id, manyOneField.id, {
        id: table2.records[0].id,
      });

      await updateRecordByApi(table2.id, table2.records[0].id, table2.fields[0].id, 'y');

      const { records: table1Records } = await getRecords(table1.id, {
        fieldKeyType: FieldKeyType.Id,
      });
      expect(table1Records[0].fields[manyOneField.id]).toEqual({
        title: 'y',
        id: table2.records[0].id,
      });
    });

    it('should update one-many record when add both many-one and many-one link', async () => {
      const manyOneFieldRo: IFieldRo = {
        type: FieldType.Link,
        options: {
          relationship: Relationship.ManyOne,
          foreignTableId: table2.id,
        },
      };

      const oneManyFieldRo: IFieldRo = {
        type: FieldType.Link,
        options: {
          relationship: Relationship.OneMany,
          foreignTableId: table2.id,
        },
      };

      // set primary key 'x' in table2
      await updateRecordByApi(table2.id, table2.records[0].id, table2.fields[0].id, 'x');
      // get get a oneManyField involved
      const oneManyField = await createField(table1.id, oneManyFieldRo);
      const manyOneField = await createField(table1.id, manyOneFieldRo);

      const lookupOneManyField = await createField(table1.id, {
        type: FieldType.SingleLineText,
        isLookup: true,
        lookupOptions: {
          foreignTableId: table2.id,
          lookupFieldId: table2.fields[0].id,
          linkFieldId: oneManyField.id,
        },
      });

      const rollupOneManyField = await createField(table1.id, {
        type: FieldType.Rollup,
        options: {
          expression: 'countall({values})',
        },
        lookupOptions: {
          foreignTableId: table2.id,
          lookupFieldId: table2.fields[0].id,
          linkFieldId: oneManyField.id,
        },
      });

      const lookupManyOneField = await createField(table1.id, {
        type: FieldType.SingleLineText,
        isLookup: true,
        lookupOptions: {
          foreignTableId: table2.id,
          lookupFieldId: table2.fields[0].id,
          linkFieldId: manyOneField.id,
        },
      });

      const rollupManyOneField = await createField(table1.id, {
        type: FieldType.Rollup,
        options: {
          expression: 'countall({values})',
        },
        lookupOptions: {
          foreignTableId: table2.id,
          lookupFieldId: table2.fields[0].id,
          linkFieldId: manyOneField.id,
        },
      });

      await updateRecordByApi(table1.id, table1.records[0].id, oneManyField.id, [
        {
          id: table2.records[0].id,
        },
      ]);
      const { records: table1Records1 } = await getRecords(table1.id, {
        fieldKeyType: FieldKeyType.Id,
      });
      expect(table1Records1[0].fields[oneManyField.id]).toEqual([
        {
          title: 'x',
          id: table2.records[0].id,
        },
      ]);

      await updateRecordByApi(table2.id, table2.records[0].id, table2.fields[0].id, 'y');

      const { records: table1Records2 } = await getRecords(table1.id, {
        fieldKeyType: FieldKeyType.Id,
      });
      expect(table1Records2[0].fields[oneManyField.id]).toEqual([
        {
          title: 'y',
          id: table2.records[0].id,
        },
      ]);
      expect(table1Records2[0].fields[lookupOneManyField.id]).toEqual(['y']);
      expect(table1Records2[0].fields[rollupOneManyField.id]).toEqual(1);
      expect(table1Records2[0].fields[lookupManyOneField.id]).toEqual(undefined);
      expect(table1Records2[0].fields[rollupManyOneField.id]).toEqual(undefined);
    });
  });

  describe('update link when delete record', () => {
    let table1: ITableFullVo;
    let table2: ITableFullVo;
    beforeEach(async () => {
      table1 = await createTable(baseId, {
        name: 'table1',
      });
      table2 = await createTable(baseId, {
        name: 'table2',
      });
    });

    afterEach(async () => {
      await deleteTable(baseId, table1.id);
      await deleteTable(baseId, table2.id);
    });

    it('should clean single link record when delete a record', async () => {
      const manyOneFieldRo: IFieldRo = {
        type: FieldType.Link,
        options: {
          relationship: Relationship.ManyOne,
          foreignTableId: table2.id,
        },
      };

      // set primary key 'x' in table2
      await updateRecordByApi(table2.id, table2.records[0].id, table2.fields[0].id, 'x');
      // get get a oneManyField involved
      const manyOneField = await createField(table1.id, manyOneFieldRo);
      const symManyOneField = await getField(
        table2.id,
        (manyOneField.options as ILinkFieldOptions).symmetricFieldId as string
      );

      await updateRecordByApi(table1.id, table1.records[0].id, manyOneField.id, {
        id: table2.records[0].id,
      });

      await deleteRecord(table1.id, table1.records[0].id);

      const table2Record = await getRecord(table2.id, table2.records[0].id);
      expect(table2Record.fields[symManyOneField.id]).toBeUndefined();
    });

    it('should update single link record when delete a record', async () => {
      const manyOneFieldRo: IFieldRo = {
        type: FieldType.Link,
        options: {
          relationship: Relationship.ManyOne,
          foreignTableId: table2.id,
        },
      };

      await updateRecordByApi(table1.id, table1.records[0].id, table1.fields[0].id, 'x1');
      await updateRecordByApi(table1.id, table1.records[1].id, table1.fields[0].id, 'x2');

      // get get a oneManyField involved
      const manyOneField = await createField(table1.id, manyOneFieldRo);
      const symManyOneField = await getField(
        table2.id,
        (manyOneField.options as ILinkFieldOptions).symmetricFieldId as string
      );

      await updateRecordByApi(table1.id, table1.records[0].id, manyOneField.id, {
        id: table2.records[0].id,
      });
      await updateRecordByApi(table1.id, table1.records[1].id, manyOneField.id, {
        id: table2.records[0].id,
      });

      await deleteRecord(table1.id, table1.records[0].id);

      const table2Record = await getRecord(table2.id, table2.records[0].id);
      expect(table2Record.fields[symManyOneField.id]).toEqual([
        {
          title: 'x2',
          id: table1.records[1].id,
        },
      ]);
    });

    it('should clean multi link record when delete a record', async () => {
      const manyOneFieldRo: IFieldRo = {
        type: FieldType.Link,
        options: {
          relationship: Relationship.ManyOne,
          foreignTableId: table2.id,
        },
      };

      const oneManyFieldRo: IFieldRo = {
        type: FieldType.Link,
        options: {
          relationship: Relationship.OneMany,
          foreignTableId: table2.id,
        },
      };

      // set primary key 'x' in table2
      await updateRecordByApi(table2.id, table2.records[0].id, table2.fields[0].id, 'x');
      // get get a oneManyField involved
      const manyOneField = await createField(table1.id, manyOneFieldRo);
      const oneManyField = await createField(table1.id, oneManyFieldRo);

      const symManyOneField = await getField(
        table2.id,
        (manyOneField.options as ILinkFieldOptions).symmetricFieldId as string
      );
      const symOneManyField = await getField(
        table2.id,
        (oneManyField.options as ILinkFieldOptions).symmetricFieldId as string
      );

      await updateRecordByApi(table2.id, table2.records[0].id, symOneManyField.id, {
        id: table1.records[0].id,
      });
      await updateRecordByApi(table2.id, table2.records[0].id, symManyOneField.id, [
        {
          id: table1.records[0].id,
        },
      ]);

      await deleteRecord(table1.id, table1.records[0].id);

      const table2Record = await getRecord(table2.id, table2.records[0].id);
      expect(table2Record.fields[symManyOneField.id]).toBeUndefined();
      expect(table2Record.fields[symOneManyField.id]).toBeUndefined();
    });
  });

  describe('Create two bi-link for two tables', () => {
    let table1: ITableFullVo;
    let table2: ITableFullVo;
    beforeEach(async () => {
      // create tables
      const textFieldRo: IFieldRo = {
        name: 'text field',
        type: FieldType.SingleLineText,
      };

      table1 = await createTable(baseId, {
        fields: [textFieldRo],
        records: [
          { fields: { 'text field': 'table1_1' } },
          { fields: { 'text field': 'table1_2' } },
          { fields: { 'text field': 'table1_3' } },
        ],
      });

      table2 = await createTable(baseId, {
        name: 'table2',
        fields: [textFieldRo],
        records: [
          { fields: { 'text field': 'table2_1' } },
          { fields: { 'text field': 'table2_2' } },
          { fields: { 'text field': 'table2_3' } },
        ],
      });
    });

    afterEach(async () => {
      await deleteTable(baseId, table1.id);
      await deleteTable(baseId, table2.id);
    });

    it('should update record in two same manyOne link', async () => {
      // create link field
      const table1LinkFieldRo: IFieldRo = {
        name: 'link field',
        type: FieldType.Link,
        options: {
          relationship: Relationship.ManyOne,
          foreignTableId: table2.id,
        },
      };

      await createField(table1.id, table1LinkFieldRo);
      await createField(table1.id, table1LinkFieldRo);

      table1.fields = await getFields(table1.id);
      table2.fields = await getFields(table2.id);

      const record = await updateRecord(table1.id, table1.records[0].id, {
        fieldKeyType: FieldKeyType.Id,
        record: {
          fields: {
            [table1.fields[1].id]: {
              id: table2.records[0].id,
            },
            [table1.fields[2].id]: {
              id: table2.records[0].id,
            },
          },
        },
      });
      expect(record.fields[table1.fields[1].id]).toEqual({
        id: table2.records[0].id,
        title: 'table2_1',
      });
      expect(record.fields[table1.fields[2].id]).toEqual({
        id: table2.records[0].id,
        title: 'table2_1',
      });
    });

    it('should update record in two same oneMany link', async () => {
      // create link field
      const table1LinkFieldRo: IFieldRo = {
        name: 'link field',
        type: FieldType.Link,
        options: {
          relationship: Relationship.OneMany,
          foreignTableId: table2.id,
        },
      };

      await createField(table1.id, table1LinkFieldRo);
      await createField(table1.id, table1LinkFieldRo);

      table1.fields = await getFields(table1.id);
      table2.fields = await getFields(table2.id);

      const record = await updateRecord(table1.id, table1.records[0].id, {
        fieldKeyType: FieldKeyType.Id,
        record: {
          fields: {
            [table1.fields[1].id]: [
              {
                id: table2.records[0].id,
              },
            ],
            [table1.fields[2].id]: [
              {
                id: table2.records[0].id,
              },
            ],
          },
        },
      });
      expect(record.fields[table1.fields[1].id]).toEqual([
        {
          id: table2.records[0].id,
          title: 'table2_1',
        },
      ]);
      expect(record.fields[table1.fields[2].id]).toEqual([
        {
          id: table2.records[0].id,
          title: 'table2_1',
        },
      ]);
    });
  });

  describe('update multi cell when contains link field', () => {
    let table1: ITableFullVo;
    let table2: ITableFullVo;
    beforeEach(async () => {
      table1 = await createTable(baseId, {
        name: 'table1',
      });
      table2 = await createTable(baseId, {
        name: 'table2',
      });
    });

    afterEach(async () => {
      await deleteTable(baseId, table1.id);
      await deleteTable(baseId, table2.id);
    });

    it('should update primary field cell with another cell', async () => {
      const manyOneFieldRo: IFieldRo = {
        type: FieldType.Link,
        options: {
          relationship: Relationship.ManyOne,
          foreignTableId: table2.id,
        },
      };

      const textFieldRo: IFieldRo = {
        type: FieldType.SingleLineText,
      };

      await createField(table1.id, manyOneFieldRo);
      const textField = await createField(table1.id, textFieldRo);

      await updateRecord(table1.id, table1.records[0].id, {
        record: {
          fields: {
            [table1.fields[0].id]: 'primary',
            [textField.id]: 'text',
          },
        },
        fieldKeyType: FieldKeyType.Id,
      });
    });
  });

  describe('delete field', () => {
    describe.each([
      { relationship: Relationship.OneOne, isOneWay: true },
      { relationship: Relationship.OneOne, isOneWay: false },
      { relationship: Relationship.ManyMany, isOneWay: true },
      { relationship: Relationship.ManyMany, isOneWay: false },
      { relationship: Relationship.ManyOne, isOneWay: true },
      { relationship: Relationship.ManyOne, isOneWay: false },
      { relationship: Relationship.OneMany, isOneWay: true },
      { relationship: Relationship.OneMany, isOneWay: false },
    ])('delete $relationship link field with isOneWay: $isOneWay', ({ relationship, isOneWay }) => {
      let table1: ITableFullVo;
      let table2: ITableFullVo;
      beforeEach(async () => {
        // create tables
        const textFieldRo: IFieldRo = {
          name: 'text field',
          type: FieldType.SingleLineText,
        };

        const numberFieldRo: IFieldRo = {
          name: 'Number field',
          type: FieldType.Number,
          options: {
            formatting: { type: NumberFormattingType.Decimal, precision: 1 },
          },
        };

        table1 = await createTable(baseId, {
          fields: [textFieldRo, numberFieldRo],
          records: [
            { fields: { 'text field': 'table1_1' } },
            { fields: { 'text field': 'table1_2' } },
            { fields: { 'text field': 'table1_3' } },
          ],
        });

        table2 = await createTable(baseId, {
          name: 'table2',
          fields: [textFieldRo, numberFieldRo],
          records: [
            { fields: { 'text field': 'table2_1' } },
            { fields: { 'text field': 'table2_2' } },
            { fields: { 'text field': 'table2_3' } },
          ],
        });

        // create link field
        const table2LinkFieldRo: IFieldRo = {
          name: 'link field',
          type: FieldType.Link,
          options: {
            relationship: relationship,
            foreignTableId: table1.id,
            isOneWay: isOneWay,
          },
        };

        await createField(table2.id, table2LinkFieldRo);

        table1.fields = await getFields(table1.id);
        table2.fields = await getFields(table2.id);
      });

      afterEach(async () => {
        await deleteTable(baseId, table1.id);
        await deleteTable(baseId, table2.id);
      });

      it('should safe delete link field', async () => {
        await deleteField(table2.id, table2.fields[2].id);
        const table1Fields = await getFields(table1.id);
        expect(table1Fields.length).toEqual(2);
      });
    });
  });
});
