import type { RouteConfig } from '@asteasolutions/zod-to-openapi';
import type { ICreateRecordsRo, ICreateRecordsVo } from '@teable/core';
import { createRecordsVoSchema, createRecordsRoSchema } from '@teable/core';
import { axios } from '../axios';
import { registerRoute, urlBuilder } from '../utils';
import { z } from '../zod';

export const CREATE_RECORD = '/table/{tableId}/record';

export const CreateRecordRoute: RouteConfig = registerRoute({
  method: 'post',
  path: CREATE_RECORD,
  description: 'Create multiple records',
  request: {
    params: z.object({
      tableId: z.string(),
    }),
    body: {
      content: {
        'application/json': {
          schema: createRecordsRoSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Returns data about the records.',
      content: {
        'application/json': {
          schema: createRecordsVoSchema,
        },
      },
    },
  },
  tags: ['record'],
});

export const createRecords = async (tableId: string, recordsRo: ICreateRecordsRo) => {
  return axios.post<ICreateRecordsVo>(urlBuilder(CREATE_RECORD, { tableId }), recordsRo);
};
