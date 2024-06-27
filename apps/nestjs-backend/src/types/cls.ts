import type { PermissionAction } from '@teable/core';
import type { Prisma } from '@teable/db-main-prisma';
import type { ClsStore } from 'nestjs-cls';
import type { IRawOpMap } from '../share-db/interface';

export interface IClsStore extends ClsStore {
  user: {
    id: string;
    name: string;
    email: string;
  };
  accessTokenId?: string;
  entry?: {
    type: string;
    id: string;
  };
  tx: {
    client?: Prisma.TransactionClient;
    timeStr?: string;
    id?: string;
    rawOpMaps?: IRawOpMap[];
  };
  shareViewId?: string;
  permissions: PermissionAction[];
  // for share db adapter
  cookie?: string;
}
