/* eslint-disable @typescript-eslint/naming-convention */
import { z } from 'zod';
import type {
  BaseActions,
  FieldActions,
  RecordActions,
  SpaceActions,
  TableActions,
  ViewActions,
} from './actions';

export enum SpaceRole {
  Owner = 'owner',
  Creator = 'creator',
  Editor = 'editor',
  Commenter = 'commenter',
  Viewer = 'viewer',
}

export const spaceRolesSchema = z.nativeEnum(SpaceRole);

export const spacePermissions: Record<
  SpaceRole,
  Record<
    SpaceActions | BaseActions | TableActions | ViewActions | FieldActions | RecordActions,
    boolean
  >
> = {
  owner: {
    'space|create': true,
    'space|delete': true,
    'space|read': true,
    'space|update': true,
    'base|create': true,
    'base|delete': true,
    'base|read': true,
    'base|update': true,
    'table|create': true,
    'table|read': true,
    'table|delete': true,
    'table|update': true,
    'view|create': true,
    'view|delete': true,
    'view|read': true,
    'view|update': true,
    'field|create': true,
    'field|delete': true,
    'field|read': true,
    'field|update': true,
    'record|create': true,
    'record|comment': true,
    'record|delete': true,
    'record|read': true,
    'record|update': true,
  },
  creator: {
    'space|create': false,
    'space|delete': false,
    'space|update': false,
    'space|read': true,
    'base|create': true,
    'base|delete': true,
    'base|read': true,
    'base|update': true,
    'table|create': true,
    'table|read': true,
    'table|delete': true,
    'table|update': true,
    'view|create': true,
    'view|delete': true,
    'view|read': true,
    'view|update': true,
    'field|create': true,
    'field|delete': true,
    'field|read': true,
    'field|update': true,
    'record|create': true,
    'record|comment': true,
    'record|delete': true,
    'record|read': true,
    'record|update': true,
  },
  editor: {
    'space|create': false,
    'space|delete': false,
    'space|update': false,
    'space|read': true,
    'base|create': false,
    'base|delete': false,
    'base|read': true,
    'base|update': false,
    'table|create': false,
    'table|read': true,
    'table|delete': false,
    'table|update': false,
    'view|create': true,
    'view|delete': true,
    'view|read': true,
    'view|update': true,
    'field|create': false,
    'field|delete': false,
    'field|read': true,
    'field|update': false,
    'record|create': true,
    'record|comment': true,
    'record|delete': true,
    'record|read': true,
    'record|update': true,
  },
  commenter: {
    'space|create': false,
    'space|delete': false,
    'space|update': false,
    'space|read': true,
    'base|create': false,
    'base|delete': false,
    'base|read': true,
    'base|update': false,
    'table|create': false,
    'table|read': true,
    'table|delete': false,
    'table|update': false,
    'view|create': false,
    'view|delete': false,
    'view|read': true,
    'view|update': false,
    'field|create': false,
    'field|delete': false,
    'field|read': true,
    'field|update': false,
    'record|create': false,
    'record|comment': true,
    'record|delete': false,
    'record|read': true,
    'record|update': false,
  },
  viewer: {
    'space|create': false,
    'space|delete': false,
    'space|update': false,
    'space|read': true,
    'base|create': false,
    'base|delete': false,
    'base|read': true,
    'base|update': false,
    'table|create': false,
    'table|read': true,
    'table|delete': false,
    'table|update': false,
    'view|create': false,
    'view|delete': false,
    'view|read': true,
    'view|update': false,
    'field|create': false,
    'field|delete': false,
    'field|read': true,
    'field|update': false,
    'record|create': false,
    'record|comment': false,
    'record|delete': false,
    'record|read': true,
    'record|update': false,
  },
};
