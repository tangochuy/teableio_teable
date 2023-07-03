import type { INestApplication } from '@nestjs/common';
import { FieldType } from '@teable-group/core';
import request from 'supertest';
import type { CreateFieldRo } from '../src/features/field/model/create-field.ro';
import { initApp } from './utils/init-app';

const defaultFields = [
  {
    name: 'name',
    type: FieldType.SingleLineText,
  },
  {
    name: 'number',
    type: FieldType.Number,
  },
  {
    name: 'status',
    type: FieldType.SingleSelect,
  },
];

describe('OpenAPI FieldController (e2e)', () => {
  let app: INestApplication;
  let tableId = '';

  beforeAll(async () => {
    app = await initApp();

    const result = await request(app.getHttpServer()).post('/api/table').send({
      name: 'table1',
    });
    tableId = result.body.data.id;
  });

  afterAll(async () => {
    const result = await request(app.getHttpServer()).delete(`/api/table/arbitrary/${tableId}`);
    console.log('clear table: ', result.body);
  });

  it('/api/table/{tableId}/field (GET)', async () => {
    const fieldsResult = await request(app.getHttpServer()).get(`/api/table/${tableId}/field`);
    expect(fieldsResult.body.data).toMatchObject(defaultFields);
  });

  it('/api/table/{tableId}/field (POST)', async () => {
    const fieldRo: CreateFieldRo = {
      name: 'New field',
      description: 'the new field',
      type: FieldType.SingleLineText,
    };

    await request(app.getHttpServer())
      .post(`/api/table/${tableId}/field`)
      .send(fieldRo)
      .expect(201);

    const result = await request(app.getHttpServer())
      .get(`/api/table/${tableId}/field`)
      .query({
        skip: 0,
        take: 1000,
      })
      .expect(200);

    expect(result.body.data).toMatchObject([
      ...defaultFields,
      {
        name: 'New field',
        description: 'the new field',
        type: FieldType.SingleLineText,
      },
    ]);
    // console.log('result: ', result.body);
  });
});
