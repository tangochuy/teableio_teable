import type { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { spaceRolesSchema } from '@teable-group/core';
import { registerRoute } from '../utils';
import { z } from '../zod';

export const UPDATE_SPACE_INVITATION_LINK = '/space/{spaceId}/invitation/link/{invitationId}';

export const updateSpaceInvitationLinkRoSchema = z.object({
  role: spaceRolesSchema,
});

export type UpdateSpaceInvitationLinkRo = z.infer<typeof updateSpaceInvitationLinkRoSchema>;

export const updateSpaceInvitationLinkVoSchema = z.object({
  invitationId: z.string(),
  role: spaceRolesSchema,
});

export type UpdateSpaceInvitationLinkVo = z.infer<typeof updateSpaceInvitationLinkVoSchema>;

export const UpdateSpaceInvitationLinkRoute: RouteConfig = registerRoute({
  method: 'patch',
  path: UPDATE_SPACE_INVITATION_LINK,
  description: 'Update a invitation link to your',
  request: {
    params: z.object({
      invitationId: z.string(),
      spaceId: z.string(),
    }),
    body: {
      content: {
        'application/json': {
          schema: updateSpaceInvitationLinkRoSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Successful response.',
      content: {
        'application/json': {
          schema: updateSpaceInvitationLinkVoSchema,
        },
      },
    },
  },
  tags: ['space'],
});
