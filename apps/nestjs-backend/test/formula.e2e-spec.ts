import type { INestApplication } from '@nestjs/common';
import type { IFieldRo } from '@teable-group/core';
import { FieldType, generateFieldId } from '@teable-group/core';
import request from 'supertest';
import { initApp } from './utils/init-app';

describe('OpenAPI formula (e2e)', () => {
  let app: INestApplication;
  let table1Id = '';
  let numberFieldRo: IFieldRo & { id: string; name: string };
  let textFieldRo: IFieldRo & { id: string; name: string };
  let formulaFieldRo: IFieldRo & { id: string; name: string };

  beforeAll(async () => {
    app = await initApp();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    numberFieldRo = {
      id: generateFieldId(),
      name: 'Number field',
      description: 'the number field',
      type: FieldType.Number,
      options: {
        formatting: { precision: 1 },
      },
    };

    textFieldRo = {
      id: generateFieldId(),
      name: 'text field',
      description: 'the text field',
      type: FieldType.SingleLineText,
    };

    formulaFieldRo = {
      id: generateFieldId(),
      name: 'New field',
      description: 'the new field',
      type: FieldType.Formula,
      options: {
        expression: `{${numberFieldRo.id}} & {${textFieldRo.id}}`,
      },
    };

    const result1 = await request(app.getHttpServer())
      .post('/api/table')
      .send({
        name: 'table1',
        fields: [numberFieldRo, textFieldRo, formulaFieldRo],
      })
      .expect(201);
    table1Id = result1.body.data.id;
  });

  afterEach(async () => {
    await request(app.getHttpServer()).delete(`/api/table/arbitrary/${table1Id}`);
  });

  it('should response calculate record after create', async () => {
    const recordResult = await request(app.getHttpServer())
      .post(`/api/table/${table1Id}/record`)
      .send({
        records: [
          {
            fields: {
              [numberFieldRo.name]: 1,
              [textFieldRo.name]: 'x',
            },
          },
        ],
      })
      .expect(201);

    const record = recordResult.body.data.records[0];
    expect(record.fields[numberFieldRo.name]).toEqual(1);
    expect(record.fields[textFieldRo.name]).toEqual('x');
    expect(record.fields[formulaFieldRo.name]).toEqual('1x');
  });

  it('should response calculate record after update multi record field', async () => {
    const getResult = await request(app.getHttpServer())
      .get(`/api/table/${table1Id}/record`)
      .expect(200);

    const existRecord = getResult.body.data.records[0];

    const updateResult = await request(app.getHttpServer())
      .put(`/api/table/${table1Id}/record/${existRecord.id}`)
      .send({
        record: {
          fields: {
            [numberFieldRo.name]: 1,
            [textFieldRo.name]: 'x',
          },
        },
      })
      .expect(200);

    const record = updateResult.body.data;

    expect(record.fields[numberFieldRo.name]).toEqual(1);
    expect(record.fields[textFieldRo.name]).toEqual('x');
    expect(record.fields[formulaFieldRo.name]).toEqual('1x');
  });

  it('should response calculate record after update single record field', async () => {
    const getResult = await request(app.getHttpServer())
      .get(`/api/table/${table1Id}/record`)
      .expect(200);

    const existRecord = getResult.body.data.records[0];

    const updateResult1 = await request(app.getHttpServer())
      .put(`/api/table/${table1Id}/record/${existRecord.id}`)
      .send({
        record: {
          fields: {
            [numberFieldRo.name]: 1,
          },
        },
      })
      .expect(200);

    const record1 = updateResult1.body.data;

    expect(record1.fields[numberFieldRo.name]).toEqual(1);
    expect(record1.fields[textFieldRo.name]).toBeUndefined();
    expect(record1.fields[formulaFieldRo.name]).toEqual('1');

    const updateResult2 = await request(app.getHttpServer())
      .put(`/api/table/${table1Id}/record/${existRecord.id}`)
      .send({
        record: {
          fields: {
            [textFieldRo.name]: 'x',
          },
        },
      })
      .expect(200);

    const record2 = updateResult2.body.data;

    expect(record2.fields[numberFieldRo.name]).toEqual(1);
    expect(record2.fields[textFieldRo.name]).toEqual('x');
    expect(record2.fields[formulaFieldRo.name]).toEqual('1x');
  });
});
