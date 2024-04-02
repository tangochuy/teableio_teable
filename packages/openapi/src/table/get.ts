import type { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { axios } from '../axios';
import { registerRoute, urlBuilder } from '../utils';
import { z } from '../zod';
import type { ITableVo } from './create';
import { tableVoSchema } from './create';
import type { IGetTableQuery } from './get-list';
import { getTableQuerySchema } from './get-list';

export const GET_TABLE = '/base/{baseId}/table/{tableId}';

export const GetTableRoute: RouteConfig = registerRoute({
  method: 'get',
  path: GET_TABLE,
  description: 'Get a table',
  request: {
    params: z.object({
      baseId: z.string(),
      tableId: z.string(),
    }),
    query: getTableQuerySchema,
  },
  responses: {
    200: {
      description: 'Returns data about a table.',
      content: {
        'application/json': {
          schema: tableVoSchema,
        },
      },
    },
  },
  tags: ['table'],
});

export const getTableById = async (baseId: string, tableId: string, query: IGetTableQuery) => {
  return axios.get<ITableVo>(
    urlBuilder(GET_TABLE, {
      baseId,
      tableId,
    }),
    {
      params: query,
    }
  );
};
