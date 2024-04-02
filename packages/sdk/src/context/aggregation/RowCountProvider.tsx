import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getRowCount } from '@teable/openapi';
import type { FC, ReactNode } from 'react';
import { useCallback, useContext, useEffect, useMemo } from 'react';
import { ReactQueryKeys } from '../../config';
import { useActionTrigger, useIsHydrated, useSearch } from '../../hooks';
import type { PropKeys } from '../action-trigger';
import { AnchorContext } from '../anchor';
import { RowCountContext } from './RowCountContext';

interface RowCountProviderProps {
  children: ReactNode;
}

export const RowCountProvider: FC<RowCountProviderProps> = ({ children }) => {
  const isHydrated = useIsHydrated();
  const { tableId, viewId } = useContext(AnchorContext);
  const { listener } = useActionTrigger();
  const queryClient = useQueryClient();
  const { searchQuery } = useSearch();

  const rowCountQuery = useMemo(() => ({ viewId, search: searchQuery }), [searchQuery, viewId]);

  const { data: resRowCount } = useQuery({
    queryKey: ReactQueryKeys.rowCount(tableId as string, rowCountQuery),
    queryFn: ({ queryKey }) => getRowCount(queryKey[1], queryKey[2]),
    enabled: !!tableId && isHydrated,
    refetchOnWindowFocus: false,
  });

  const updateRowCount = useCallback(
    () => queryClient.invalidateQueries(ReactQueryKeys.rowCount(tableId as string, rowCountQuery)),
    [queryClient, tableId, rowCountQuery]
  );

  useEffect(() => {
    if (tableId == null) return;

    const relevantProps: PropKeys[] = ['setRecord', 'addRecord', 'deleteRecord', 'applyViewFilter'];

    listener?.(relevantProps, () => updateRowCount(), [tableId, viewId]);
  }, [listener, tableId, updateRowCount, viewId]);

  const rowCount = useMemo(() => {
    if (!resRowCount) return 0;

    const { rowCount } = resRowCount.data;
    return rowCount;
  }, [resRowCount]);
  return <RowCountContext.Provider value={rowCount}>{children}</RowCountContext.Provider>;
};
