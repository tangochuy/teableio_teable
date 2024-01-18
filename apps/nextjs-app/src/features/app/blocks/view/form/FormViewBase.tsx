import { FieldKeyType } from '@teable-group/core';
import { useIsMobile, useTableId, useTablePermission, useViewId } from '@teable-group/sdk/hooks';
import { Record as RecordSdk } from '@teable-group/sdk/model';
import { FormMode, useFormModeStore } from '../tool-bar/store';
import { FormEditor, FormPreviewer } from './components';
import { generateUniqLocalKey } from './util';

export const FormViewBase = () => {
  const tableId = useTableId();
  const activeViewId = useViewId();
  const { modeMap } = useFormModeStore();
  const isMobile = useIsMobile();
  const permission = useTablePermission();

  const modeKey = generateUniqLocalKey(tableId, activeViewId);
  const mode = modeMap[modeKey] ?? FormMode.Edit;
  const isEditMode = permission['view|update'] && mode === FormMode.Edit;

  const submitForm = async (fields: Record<string, unknown>) => {
    if (!tableId) return;
    await RecordSdk.createRecords(tableId, {
      fieldKeyType: FieldKeyType.Id,
      records: [
        {
          fields,
        },
      ],
    });
  };

  return (
    <div className="flex size-full">
      {isEditMode && !isMobile ? <FormEditor /> : <FormPreviewer submit={submitForm} />}
    </div>
  );
};
