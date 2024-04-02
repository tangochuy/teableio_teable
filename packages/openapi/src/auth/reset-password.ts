import { axios } from '../axios';
import { registerRoute } from '../utils';
import { z } from '../zod';
import { passwordSchema } from './types';

export const RESET_PASSWORD = '/auth/reset-password';

export const resetPasswordRoSchema = z.object({
  password: passwordSchema,
  code: z.string(),
});

export type IResetPasswordRo = z.infer<typeof resetPasswordRoSchema>;

export const resetPasswordRoute = registerRoute({
  method: 'post',
  path: RESET_PASSWORD,
  description: 'Reset password',
  request: {
    body: {
      content: {
        'application/json': {
          schema: resetPasswordRoSchema,
        },
      },
    },
  },
  tags: ['auth'],
  responses: {
    200: {
      description: 'Successfully reset password',
    },
  },
});

export const resetPassword = async (ro: IResetPasswordRo) => {
  return axios.post<void>(RESET_PASSWORD, ro);
};
