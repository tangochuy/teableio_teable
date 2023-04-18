import type { IdPrefix } from '../utils';

export interface IFieldSnapshotQuery {
  viewId?: string;
}

export interface IAggregateQuery {
  rowCount?: boolean;
  average?: {
    [fieldId: string]: boolean;
  };
}

export interface IRecordSnapshotQuery {
  viewId?: string;
  type: IdPrefix.Record;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  where?: any;
  orderBy?: {
    column: string; // db column name for queryBuilder
    order?: 'asc' | 'desc';
    nulls?: 'first' | 'last';
  }[];
  aggregate?: IAggregateQuery;
  offset?: number;
  limit?: number;
}

export interface IAggregateQueryResult {
  rowCount?: number;
  average?: {
    [fieldId: string]: number;
  };
}
