import { File, FileCsv } from '@teable/icons';
import { useConnection, useTablePermission } from '@teable/sdk';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@teable/ui-lib';
import AddBoldIcon from '@teable/ui-lib/icons/app/add-bold.svg';
import { Button } from '@teable/ui-lib/shadcn/ui/button';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import { GUIDE_CREATE_TABLE } from '@/components/Guide';
import { TableImport } from '../import-table';
import { DraggableList } from './DraggableList';
import { NoDraggableList } from './NoDraggableList';
import { useAddTable } from './useAddTable';

export const TableList: React.FC = () => {
  const { connected } = useConnection();
  const addTable = useAddTable();
  const permission = useTablePermission();
  const { t } = useTranslation(['table']);
  const [dialogVisible, setDialogVisible] = useState(false);

  return (
    <div className="flex w-full flex-col gap-2 overflow-auto pt-4">
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <div className="px-3">
            {permission['table|create'] && (
              <Button variant={'outline'} size={'xs'} className={`${GUIDE_CREATE_TABLE} w-full`}>
                <AddBoldIcon />
              </Button>
            )}
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={addTable} className="cursor-pointer">
            <Button variant="ghost" size="xs" className="h-4">
              <File className="size-4" />
              {t('table.operator.createBlank')}
            </Button>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="px-4">
            {t('table:import.menu.addFromOtherSource')}
          </DropdownMenuLabel>
          <DropdownMenuItem className="cursor-pointer" onClick={() => setDialogVisible(true)}>
            <Button variant="ghost" size="xs" className="h-4">
              <FileCsv className="size-4" />
              {t('table:import.menu.csvFile')}
            </Button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {dialogVisible && (
        <TableImport
          open={dialogVisible}
          onOpenChange={(open) => setDialogVisible(open)}
        ></TableImport>
      )}

      <div className="overflow-y-auto px-3">
        {connected && permission['table|update'] ? <DraggableList /> : <NoDraggableList />}
      </div>
    </div>
  );
};
