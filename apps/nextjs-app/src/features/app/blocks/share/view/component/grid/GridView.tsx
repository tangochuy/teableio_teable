import { TeableNew } from '@teable-group/icons';
import { ActionTriggerProvider, RecordProvider } from '@teable-group/sdk/context';
import { useIsHydrated, useView } from '@teable-group/sdk/hooks';
import { useContext } from 'react';
import { ShareViewPageContext } from '../../ShareViewPageContext';
import { AggregationProvider, RowCountProvider, GroupPointProvider } from './aggregation';
import { GridViewBase } from './GridViewBase';
import { Toolbar } from './toolbar';

export const GridView = () => {
  const { records } = useContext(ShareViewPageContext);
  const view = useView();
  const isHydrated = useIsHydrated();

  if (!isHydrated) {
    return <div className="w-full grow overflow-hidden pl-2" />;
  }

  return (
    <div className="flex h-full w-full flex-col px-3 pb-3">
      <div className="flex w-full justify-between py-3">
        <h1 className="text-2xl font-semibold">{view?.name}</h1>
        <div className="flex items-center">
          <TeableNew className="text-2xl text-black" />
          <p className="ml-1 text-2xl font-semibold">Teable</p>
        </div>
      </div>
      <div className="flex w-full grow flex-col overflow-hidden rounded border shadow-md">
        <Toolbar />
        <ActionTriggerProvider>
          <RecordProvider serverRecords={records}>
            <AggregationProvider>
              <RowCountProvider>
                <GroupPointProvider>
                  <div className="w-full grow overflow-hidden">
                    <GridViewBase />
                  </div>
                </GroupPointProvider>
              </RowCountProvider>
            </AggregationProvider>
          </RecordProvider>
        </ActionTriggerProvider>
      </div>
    </div>
  );
};
