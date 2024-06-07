import { axios } from '../axios';
import { registerRoute, urlBuilder } from '../utils';
import { z } from '../zod';
import type { IRangesRo } from './range';
import { rangesQuerySchema } from './range';

export const DELETE_URL = '/table/{tableId}/selection/delete';

export const deleteVoSchema = z.object({
  ids: z.array(z.string()),
});

export type IDeleteVo = z.infer<typeof deleteVoSchema>;

export const DeleteRoute = registerRoute({
  method: 'delete',
  path: DELETE_URL,
  description: 'Delete the selected data',
  request: {
    params: z.object({
      tableId: z.string(),
    }),
    query: rangesQuerySchema,
  },
  responses: {
    200: {
      description: 'Successful deletion',
      content: {
        'application/json': {
          schema: deleteVoSchema,
        },
      },
    },
  },
  tags: ['selection'],
});

export const deleteSelection = async (tableId: string, deleteRo: IRangesRo) => {
  return axios.delete<IDeleteVo>(
    urlBuilder(DELETE_URL, {
      tableId,
    }),
    {
      params: {
        ...deleteRo,
        filter: JSON.stringify(deleteRo.filter),
        orderBy: JSON.stringify(deleteRo.orderBy),
        groupBy: JSON.stringify(deleteRo.groupBy),
        ranges: JSON.stringify(deleteRo.ranges),
      },
    }
  );
};
