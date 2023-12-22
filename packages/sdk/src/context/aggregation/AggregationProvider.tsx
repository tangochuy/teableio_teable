import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { IActionTriggerBuffer } from '@teable-group/core';
import { getAggregation } from '@teable-group/openapi';
import type { FC, ReactNode } from 'react';
import { useCallback, useContext, useEffect, useMemo } from 'react';
import { ReactQueryKeys } from '../../config';
import { useActionTrigger, useIsHydrated } from '../../hooks';
import { AnchorContext } from '../anchor';
import { AggregationContext } from './AggregationContext';

type PropKeys = keyof IActionTriggerBuffer;

interface IAggregationProviderProps {
  children: ReactNode;
}

export const AggregationProvider: FC<IAggregationProviderProps> = ({ children }) => {
  const isHydrated = useIsHydrated();
  const { tableId, viewId } = useContext(AnchorContext);
  const { listener } = useActionTrigger();
  const queryClient = useQueryClient();

  const { data: resAggregations } = useQuery({
    queryKey: ReactQueryKeys.aggregations(tableId as string, { viewId }),
    queryFn: ({ queryKey }) => getAggregation(queryKey[1], queryKey[2]),
    enabled: !!tableId && isHydrated,
    refetchOnWindowFocus: false,
  });

  const updateAggregations = useCallback(
    () => queryClient.invalidateQueries(ReactQueryKeys.aggregations(tableId as string, { viewId })),
    [queryClient, tableId, viewId]
  );

  useEffect(() => {
    if (tableId == null) return;

    const relevantProps = [
      'tableAdd',
      'tableUpdate',
      'tableDelete',
      'applyViewFilter',
      'showViewField',
    ] as PropKeys[];

    listener?.(relevantProps, () => updateAggregations(), [tableId, viewId]);
  }, [listener, tableId, updateAggregations, viewId]);

  const aggregations = useMemo(() => {
    if (!resAggregations) return {};

    const { aggregations } = resAggregations.data;
    return {
      aggregations: aggregations ?? [],
    };
  }, [resAggregations]);
  return <AggregationContext.Provider value={aggregations}>{children}</AggregationContext.Provider>;
};
