import type { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { axios } from '../axios';
import { registerRoute } from '../utils';
import { z } from '../zod';
import { PinType } from './types';

export const GET_PIN_LIST = '/pin/list';

export const getPinListVoSchema = z.array(
  z.object({
    id: z.string(),
    type: z.nativeEnum(PinType),
    order: z.number(),
  })
);

export type GetPinListVo = z.infer<typeof getPinListVoSchema>;

export const GetPinRoute: RouteConfig = registerRoute({
  method: 'get',
  path: GET_PIN_LIST,
  description: 'Get  pin list',
  responses: {
    200: {
      description: 'Get  pin list, include base pin',
      content: {
        'application/json': {
          schema: getPinListVoSchema,
        },
      },
    },
  },
  tags: ['pin'],
});

export const getPinList = () => {
  return axios.get<GetPinListVo>(GET_PIN_LIST);
};
