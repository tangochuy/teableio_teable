import { cn } from '@teable/ui-lib';
import { useFieldStaticGetter } from '../../hooks';
import type { Field, Record } from '../../model';
import { CellEditor } from '../cell-value-editor';

export const RecordEditorItem = (props: {
  field: Field;
  record: Record | undefined;
  vertical?: boolean;
  onChange?: (newValue: unknown, fieldId: string) => void;
  readonly?: boolean;
}) => {
  const { field, record, vertical, onChange, readonly } = props;
  const { type, isLookup } = field;
  const fieldStaticGetter = useFieldStaticGetter();
  const { Icon } = fieldStaticGetter(type, isLookup);

  const cellValue = record?.getCellValue(field.id);
  const onChangeInner = (value: unknown) => {
    if (cellValue === value) return;
    onChange?.(value, field.id);
  };

  return (
    <div className={vertical ? 'flex space-x-2' : 'space-y-2'}>
      <div className={cn('w-36 flex items-top space-x-1', vertical ? 'pt-2' : 'w-full')}>
        <div className="flex size-5 items-center">
          <Icon />
        </div>
        <div className={cn('text-sm flex-1 truncate', vertical && 'break-words whitespace-normal')}>
          {field.name}
        </div>
      </div>
      <CellEditor
        wrapClassName="min-w-0 flex-1 p-0.5"
        cellValue={cellValue}
        onChange={onChangeInner}
        field={field}
        recordId={record?.id}
        readonly={!record || readonly}
      />
    </div>
  );
};
