import { FieldType } from '@teable/core';
import type { IImportOption, IImportOptionRo, IImportSheetItem } from '@teable/openapi';
import { Button, cn } from '@teable/ui-lib';
import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ImportOptionPanel } from '../CollapsePanel';
import { PreviewColumn } from './PreviewColumn';

export type ITableImportOptions = IImportOption & {
  autoSelectType: boolean;
};

interface IFieldConfigPanel {
  tableId?: string;
  workSheets: IImportOptionRo['worksheets'];
  errorMessage: string;
  onChange: (sheets: IImportOptionRo['worksheets']) => void;
}

const FieldConfigPanel = (props: IFieldConfigPanel) => {
  const { onChange, workSheets, errorMessage } = props;
  const { t } = useTranslation(['table']);
  const [autoSelectTypes, setAutoSelectTypes] = useState<Record<string, boolean>>({});
  const [selectedSheetKey, setSelectedSheetKey] = useState(Object.keys(workSheets)[0]);
  const lastColumnsMap = useRef<Record<string, IImportSheetItem>>(workSheets);

  const data = workSheets[selectedSheetKey];

  const options = {
    importData: data.importData,
    useFirstRowAsHeader: data.useFirstRowAsHeader,
    autoSelectType: autoSelectTypes[selectedSheetKey] ?? true,
  };

  const sheets = Object.keys(workSheets);

  const columnHandler = (columns: IImportSheetItem['columns']) => {
    const newSheets = { ...workSheets };
    newSheets[selectedSheetKey].columns = columns;
    onChange(newSheets);
  };

  const optionHandler = (value: boolean, propertyName: keyof ITableImportOptions) => {
    const updateSheet = () => {
      const newSheets = {
        ...workSheets,
        [selectedSheetKey]: { ...workSheets[selectedSheetKey], [propertyName]: value },
      };
      onChange(newSheets);
    };
    switch (propertyName) {
      case 'importData':
        updateSheet();
        break;
      case 'autoSelectType':
        {
          const newColumns = !value
            ? data.columns.map((column) => ({
                ...column,
                type: FieldType.SingleLineText,
              }))
            : lastColumnsMap.current[selectedSheetKey].columns;
          setAutoSelectTypes({ ...autoSelectTypes, [selectedSheetKey]: value });
          onChange({
            ...workSheets,
            [selectedSheetKey]: { ...workSheets[selectedSheetKey], columns: newColumns },
          });
        }
        break;
      case 'useFirstRowAsHeader':
        {
          const newColumns = !value
            ? data.columns.map((column, index) => ({
                ...column,
                name: `${t('table:import.form.defaultFieldName')} ${index + 1}`,
              }))
            : lastColumnsMap.current[selectedSheetKey].columns;

          onChange({
            ...workSheets,
            [selectedSheetKey]: {
              ...workSheets[selectedSheetKey],
              [propertyName]: value,
              columns: newColumns,
            },
          });
        }
        break;
      default:
        break;
    }
  };

  return (
    <div className="flex flex-col">
      <div>
        <p className="text-base font-bold">{t('table:import.title.importTitle')}</p>
      </div>

      <div className="mt-2 flex w-full gap-1 overflow-x-auto">
        {sheets.map((sheetKey) => (
          <Button
            variant={'outline'}
            key={sheetKey}
            size="xs"
            onClick={() => setSelectedSheetKey(sheetKey)}
            className={cn('w-20 shrink-0 cursor-pointer truncate rounded-sm', {
              'bg-secondary': sheetKey === selectedSheetKey,
            })}
          >
            {workSheets[sheetKey].name}
          </Button>
        ))}
      </div>

      <div className="my-2 h-[400px] overflow-y-auto rounded-sm border border-secondary">
        <PreviewColumn columns={data.columns} onChange={columnHandler}></PreviewColumn>
      </div>

      {errorMessage && <p className="pl-2 text-sm text-red-500">{errorMessage}</p>}

      <ImportOptionPanel onChange={optionHandler} options={options} />
    </div>
  );
};

export { FieldConfigPanel };
