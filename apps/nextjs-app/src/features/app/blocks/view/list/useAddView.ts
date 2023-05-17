import { ViewType } from '@teable-group/core';
import { useTable, useViews } from '@teable-group/sdk/hooks';
import { useRouter } from 'next/router';
import { useCallback } from 'react';

export function useAddView() {
  const table = useTable();
  const views = useViews();
  const router = useRouter();
  const viewName = views[views.length - 1].name + ' ' + views.length;

  return useCallback(async () => {
    if (!table) {
      return;
    }

    const viewDoc = await table.createView(viewName, ViewType.Grid, views.length);
    const viewId = viewDoc.data.view.id;
    router.push({
      pathname: '/space/[tableId]/[viewId]',
      query: { tableId: table.id, viewId },
    });
  }, [router, table, viewName, views.length]);
}
