import { Plus } from '@teable-group/icons';
import { useTable, useTablePermission } from '@teable-group/sdk/hooks';
import { Button } from '@teable-group/ui-lib/shadcn/ui/button';
import { useRouter } from 'next/router';
import { useCallback } from 'react';
import { Others } from './Others';
import { ViewOperators } from './ViewOperators';

export const GridToolBar: React.FC = () => {
  const table = useTable();
  const router = useRouter();
  const permission = useTablePermission();

  const addRecord = useCallback(async () => {
    if (!table) {
      return;
    }
    await table.createRecord({}).then((res) => {
      const record = res.data.records[0];

      if (record == null) return;

      const recordId = record.id;

      router.push(
        {
          pathname: `${router.pathname}/[recordId]`,
          query: { ...router.query, recordId },
        },
        undefined,
        {
          shallow: true,
        }
      );
    });
  }, [table]);

  return (
    <div className="flex items-center gap-2 border-t px-4 py-2 @container/toolbar">
      <Button
        className="h-6 w-6 shrink-0 rounded-full p-0 font-normal"
        size={'xs'}
        variant={'outline'}
        onClick={addRecord}
        disabled={!permission['record|create']}
      >
        <Plus className="h-4 w-4" />
      </Button>
      <div className="mx-2 h-4 w-px shrink-0 bg-slate-200"></div>
      <div className="flex flex-1 justify-between overflow-x-auto scrollbar-none">
        <ViewOperators disabled={!permission['view|update']} />
        <Others />
      </div>
    </div>
  );
};
