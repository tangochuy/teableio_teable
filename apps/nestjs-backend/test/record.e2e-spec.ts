/* eslint-disable sonarjs/no-duplicate-string */
import type { INestApplication } from '@nestjs/common';
import { FieldType } from '@teable-group/core';
import request from 'supertest';
import type { UpdateRecordRoByIndexRo } from 'src/features/record/update-record-by-index.ro';
import type { FieldVo } from '../src/features/field/model/field.vo';
import type { UpdateRecordRo } from '../src/features/record/update-record.ro';
import { initApp } from './init-app';

describe('OpenAPI RecordController (e2e)', () => {
  let app: INestApplication;
  let tableId = '';
  let fields: FieldVo[] = [];

  beforeAll(async () => {
    app = await initApp();

    const result = await request(app.getHttpServer()).post('/api/table').send({
      name: 'table1',
    });
    tableId = result.body.data.id;

    const fieldsResult = await request(app.getHttpServer()).get(`/api/table/${tableId}/field`);
    fields = fieldsResult.body.data;
  });

  // afterAll(async () => {
  //   const result = await request(app.getHttpServer()).delete(`/api/table/arbitrary/${tableId}`);
  //   console.log('clear table: ', result.body);
  // });

  it('/api/table/{tableId}/record (GET)', async () => {
    const result = await request(app.getHttpServer())
      .get(`/api/table/${tableId}/record`)
      .expect(200);
    expect(result.body.data.records).toBeInstanceOf(Array);
    // console.log('result: ', result.body);
  });

  it('/api/table/{tableId}/record (POST)', async () => {
    const firstTextField = fields.find((field) => field.type === FieldType.SingleLineText);
    if (!firstTextField) {
      throw new Error('can not find text field');
    }

    await request(app.getHttpServer())
      .post(`/api/table/${tableId}/record`)
      .send({
        records: [
          {
            fields: {
              [firstTextField.id]: 'New Record' + new Date(),
            },
          },
        ],
      })
      .expect(201)
      .expect({});

    const result = await request(app.getHttpServer())
      .get(`/api/table/${tableId}/record`)
      .query({
        skip: 0,
        take: 1000,
      })
      .expect(200);
    expect(result.body.data.records).toHaveLength(4);
  });

  it('/api/table/{tableId}/record/{recordId} (PUT)', async () => {
    const recordsResponse = await request(app.getHttpServer())
      .get(`/api/table/${tableId}/record`)
      .expect(200);

    const firstTextField = fields.find((field) => field.type === FieldType.SingleLineText);
    if (!firstTextField) {
      throw new Error('can not find text field');
    }

    await request(app.getHttpServer())
      .put(`/api/table/${tableId}/record/${recordsResponse.body.data.records[0].id}`)
      .send({
        record: {
          fields: {
            [firstTextField.name]: 'new value',
          },
        },
      } as UpdateRecordRo)
      .expect(200)
      .expect({
        success: true,
      });

    const result = await request(app.getHttpServer())
      .get(`/api/table/${tableId}/record`)
      .query({
        skip: 0,
        take: 1000,
      })
      .expect(200);
    expect(result.body.data.records).toHaveLength(3);
    expect(result.body.data.records[0].fields[firstTextField.id]).toEqual('new value');
  });

  it('/api/table/{tableId}/record (PUT)', async () => {
    const viewResponse = await request(app.getHttpServer())
      .get(`/api/table/${tableId}/view`)
      .expect(200);

    const firstTextField = fields.find((field) => field.type === FieldType.SingleLineText);
    if (!firstTextField) {
      throw new Error('can not find text field');
    }

    await request(app.getHttpServer())
      .put(`/api/table/${tableId}/record`)
      .send({
        viewId: viewResponse.body.data[0].id,
        index: 1,
        record: {
          fields: {
            [firstTextField.name]: 'new value',
          },
        },
      } as UpdateRecordRoByIndexRo)
      .expect(200)
      .expect({
        success: true,
      });

    const result = await request(app.getHttpServer())
      .get(`/api/table/${tableId}/record`)
      .query({
        skip: 0,
        take: 1000,
      })
      .expect(200);
    expect(result.body.data.records).toHaveLength(3);
    expect(result.body.data.records[1].fields[firstTextField.id]).toEqual('new value');
  });

  it('/api/table/{tableId}/record (POST) (100x)', async () => {
    const count = 100;
    console.time(`create ${count} records`);
    const records = Array.from({ length: count }).map((_, i) => ({
      fields: {
        [fields[0].id]: 'New Record' + new Date(),
        [fields[1].id]: i,
        [fields[2].id]: 'light',
      },
    }));

    await request(app.getHttpServer())
      .post(`/api/table/${tableId}/record`)
      .send({
        records,
      })
      .expect(201)
      .expect({ success: true });
    console.timeEnd(`create ${count} records`);
  });
});
