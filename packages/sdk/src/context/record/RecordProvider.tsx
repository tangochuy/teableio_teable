import type { IRecord, IRecordSnapshot, IRecordSnapshotQuery } from '@teable-group/core';
import { IdPrefix } from '@teable-group/core';
import type { ReactNode } from 'react';
import { useContext, useEffect, useMemo, useState } from 'react';
import { AppContext } from '../app/AppContext';
import { TableContext } from '../table/TableContext';
import { RecordContext } from './RecordContext';

export interface IRecordProviderContext {
  viewId?: string;
  children: ReactNode;
  serverData?: { records: IRecord[]; total: number };
}

export const RecordProvider: React.FC<IRecordProviderContext> = ({
  viewId,
  children,
  serverData,
}) => {
  const [rowCount, setRowCount] = useState(serverData?.total ?? 0);
  const { connection } = useContext(AppContext);
  const { tableId } = useContext(TableContext);

  useEffect(() => {
    const param: IRecordSnapshotQuery = {
      viewId,
      type: IdPrefix.Record,
      orderBy: [
        {
          column: '__created_time',
          order: 'desc',
        },
      ],
      aggregate: {
        rowCount: true,
      },
      offset: 0,
      limit: 1,
    };

    if (!tableId || !connection) {
      return;
    }

    const query = connection.createSubscribeQuery<IRecordSnapshot>(
      `${IdPrefix.Record}_${tableId}`,
      param
    );

    query.on('ready', () => {
      console.log('rowCount:ready:', query.extra.rowCount);
      const count = query.extra.rowCount;
      setRowCount(count);
    });

    query.on('changed', () => {
      const count = query.extra.rowCount;
      console.log('rowCount:changed:', count);
      setRowCount(count);
    });

    return () => {
      query.destroy();
    };
  }, [tableId, connection, viewId]);

  const value = useMemo(() => {
    return { rowCount, serverRecords: serverData?.records };
  }, [rowCount, serverData]);

  return <RecordContext.Provider value={value}>{children}</RecordContext.Provider>;
};
