import type { IFieldVo, IRecord, IViewVo } from '@teable-group/core';
import {
  ViewProvider,
  FieldProvider,
  RecordProvider,
  useTable,
  AnchorContext,
  ExpandRecordProvider,
} from '@teable-group/sdk';
import { useRouter } from 'next/router';
import { ErrorBoundary } from 'react-error-boundary';
import { useTitle } from 'react-use';
import { FailAlert } from '../table-list/FailAlert';
import { ToolBar } from '../tool-bar/ToolBar';
import { View } from '../view/View';
import { TableHeader } from './table-header/TableHeader';

export interface ITableProps {
  fieldServerData: IFieldVo[];
  viewServerData: IViewVo[];
  recordsServerData: { records: IRecord[]; total: number };
  recordServerData?: IRecord;
}

export const Table: React.FC<ITableProps> = ({
  fieldServerData,
  viewServerData,
  recordsServerData,
  recordServerData,
}) => {
  const table = useTable();
  useTitle(table?.name ? `${table?.icon ? table.icon + ' ' : ''}${table.name}` : 'Teable');
  const router = useRouter();
  const { nodeId, viewId } = router.query;
  return (
    <AnchorContext.Provider value={{ tableId: nodeId as string, viewId: viewId as string }}>
      <ViewProvider serverData={viewServerData}>
        <div className="grow flex flex-col h-full basis-[500px]">
          <TableHeader />
          <FieldProvider serverSideData={fieldServerData}>
            <ToolBar />
            <RecordProvider serverData={recordsServerData}>
              <ErrorBoundary
                fallback={
                  <div className="w-full h-full flex justify-center items-center">
                    <FailAlert />
                  </div>
                }
              >
                <ExpandRecordProvider serverData={recordServerData}>
                  <View />
                </ExpandRecordProvider>
              </ErrorBoundary>
            </RecordProvider>
          </FieldProvider>
        </div>
      </ViewProvider>
    </AnchorContext.Provider>
  );
};
