import type { RouteConfig } from '@asteasolutions/zod-to-openapi';
import type { IRecord } from '@teable/core';
import { recordSchema } from '@teable/core';
import { axios } from '../axios';
import { registerRoute, urlBuilder } from '../utils';
import { z } from '../zod';
import { fieldKeyTypeRoSchema, typecastSchema } from './get';

export const updateRecordRoSchema = z
  .object({
    fieldKeyType: fieldKeyTypeRoSchema,
    typecast: typecastSchema,
    record: z.object({
      fields: recordSchema.shape.fields,
    }),
  })
  .openapi({
    description: 'Update record by id',
  });

export type IUpdateRecordRo = z.infer<typeof updateRecordRoSchema>;

export const updateRecordsRoSchema = z
  .object({
    fieldKeyType: fieldKeyTypeRoSchema,
    typecast: typecastSchema,
    records: z.array(
      z.object({
        id: z.string(),
        fields: recordSchema.shape.fields,
      })
    ),
  })
  .openapi({
    description: 'Multiple Update records',
  });

export type IUpdateRecordsRo = z.infer<typeof updateRecordsRoSchema>;

export const UPDATE_RECORD = '/table/{tableId}/record/{recordId}';

export const UpdateRecordRoute: RouteConfig = registerRoute({
  method: 'patch',
  path: UPDATE_RECORD,
  description: 'Update a record',
  request: {
    params: z.object({
      tableId: z.string(),
      recordId: z.string(),
    }),
    body: {
      content: {
        'application/json': {
          schema: updateRecordRoSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Returns record data after update.',
      content: {
        'application/json': {
          schema: recordSchema,
        },
      },
    },
  },
  tags: ['record'],
});

export const updateRecord = async (
  tableId: string,
  recordId: string,
  recordRo: IUpdateRecordRo
) => {
  return axios.patch<IRecord>(
    urlBuilder(UPDATE_RECORD, {
      tableId,
      recordId,
    }),
    recordRo
  );
};
