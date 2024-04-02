import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { IShareViewRowCountRo } from '@teable/openapi';
import { getShareViewRowCount } from '@teable/openapi';
import type { PropKeys } from '@teable/sdk';
import { RowCountContext, ReactQueryKeys, useActionTrigger } from '@teable/sdk';
import { useSearch, useView } from '@teable/sdk/hooks';
import type { ReactNode } from 'react';
import { useCallback, useContext, useEffect, useMemo } from 'react';
import { ShareViewPageContext } from '../../../ShareViewPageContext';

interface IRowCountProviderProps {
  children: ReactNode;
}

const useRowCountQuery = (): IShareViewRowCountRo => {
  const view = useView();
  const { searchQuery } = useSearch();
  return useMemo(
    () => ({ filter: view?.filter, search: searchQuery }),
    [view?.filter, searchQuery]
  );
};

export const RowCountProvider = ({ children }: IRowCountProviderProps) => {
  const { tableId, viewId, shareId } = useContext(ShareViewPageContext);
  const { listener } = useActionTrigger();
  const queryClient = useQueryClient();
  const query = useRowCountQuery();

  const { data: shareViewRowCount } = useQuery({
    queryKey: ReactQueryKeys.shareViewRowCount(shareId, query),
    queryFn: ({ queryKey }) => getShareViewRowCount(queryKey[1], queryKey[2]),
    refetchOnWindowFocus: false,
  });

  const updateViewRowCount = useCallback(
    () => queryClient.invalidateQueries(ReactQueryKeys.shareViewRowCount(shareId, query)),
    [query, queryClient, shareId]
  );

  useEffect(() => {
    const relevantProps: PropKeys[] = ['setRecord', 'addRecord', 'deleteRecord', 'applyViewFilter'];

    listener?.(relevantProps, () => updateViewRowCount(), [tableId, viewId]);
  }, [listener, tableId, updateViewRowCount, viewId]);

  const rowCount = useMemo(() => {
    if (!shareViewRowCount) {
      return null;
    }
    return shareViewRowCount.data.rowCount;
  }, [shareViewRowCount]);

  return <RowCountContext.Provider value={rowCount}>{children}</RowCountContext.Provider>;
};
