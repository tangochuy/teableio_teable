import type { IRecord } from '@teable/core';
import { useToast } from '@teable/ui-lib';
import { type FC, type PropsWithChildren } from 'react';
import { useLocalStorage } from 'react-use';
import { LocalStorageKeys } from '../../config/local-storage-keys';
import { StandaloneViewProvider, ViewProvider } from '../../context';
import { useTranslation } from '../../context/app/i18n';
import { useBaseId, useTableId } from '../../hooks';
import { ExpandRecord } from './ExpandRecord';
import type { ExpandRecordModel } from './type';

const Wrap: FC<PropsWithChildren<{ tableId: string }>> = (props) => {
  const { tableId, children } = props;
  const currentTableId = useTableId();
  const baseId = useBaseId();

  if (tableId !== currentTableId) {
    return (
      <StandaloneViewProvider baseId={baseId} tableId={tableId}>
        <ViewProvider>{children}</ViewProvider>
      </StandaloneViewProvider>
    );
  }
  return <>{children}</>;
};

interface IExpandRecorderProps {
  tableId: string;
  viewId?: string;
  recordId?: string;
  recordIds?: string[];
  model?: ExpandRecordModel;
  serverData?: IRecord;
  onClose?: () => void;
  onUpdateRecordIdCallback?: (recordId: string) => void;
}

export const ExpandRecorder = (props: IExpandRecorderProps) => {
  const { model, tableId, recordId, recordIds, serverData, onClose, onUpdateRecordIdCallback } =
    props;
  const { toast } = useToast();
  const { t } = useTranslation();
  const [showActivity, setShowActivity] = useLocalStorage<boolean>(
    LocalStorageKeys.ShowActivity,
    false
  );

  if (!recordId) {
    return <></>;
  }

  const updateCurrentRecordId = (recordId: string) => {
    onUpdateRecordIdCallback?.(recordId);
  };

  const onCopyUrl = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast({ description: t('expandRecord.copy') });
  };

  const onShowActivity = () => {
    setShowActivity(!showActivity);
  };

  return (
    <div id={`${tableId}-${recordId}`}>
      <Wrap tableId={tableId}>
        <ExpandRecord
          visible
          model={model}
          recordId={recordId}
          recordIds={recordIds}
          serverData={serverData?.id === recordId ? serverData : undefined}
          showActivity={showActivity}
          onClose={onClose}
          onPrev={updateCurrentRecordId}
          onNext={updateCurrentRecordId}
          onCopyUrl={onCopyUrl}
          onShowActivity={onShowActivity}
        />
      </Wrap>
    </div>
  );
};
