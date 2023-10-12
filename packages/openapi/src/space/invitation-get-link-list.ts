import type { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { spaceRolesSchema } from '@teable-group/core';
import { registerRoute } from '../utils';
import { z } from '../zod';

export const LIST_SPACE_INVITATION_LINK = '/space/{spaceId}/invitation';

export const itemSpaceInvitationLinkVoSchema = z.object({
  invitationId: z.string(),
  role: spaceRolesSchema,
  inviteUrl: z.string(),
  createdBy: z.string(),
  createdTime: z.string(),
});

export type ItemSpaceInvitationLinkVo = z.infer<typeof itemSpaceInvitationLinkVoSchema>;

export const listSpaceInvitationLinkVoSchema = z.array(itemSpaceInvitationLinkVoSchema);

export type ListSpaceInvitationLinkVo = z.infer<typeof listSpaceInvitationLinkVoSchema>;

export const ListSpaceInvitationLinkRoute: RouteConfig = registerRoute({
  method: 'get',
  path: LIST_SPACE_INVITATION_LINK,
  description: 'List a invitation link to your',
  request: {
    params: z.object({
      spaceId: z.string(),
    }),
  },
  responses: {
    200: {
      description: 'Successful response, return invitation information list.',
      content: {
        'application/json': {
          schema: listSpaceInvitationLinkVoSchema,
        },
      },
    },
  },
  tags: ['space'],
});
