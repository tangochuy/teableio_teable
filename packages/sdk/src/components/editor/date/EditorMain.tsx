import { Calendar } from '@teable-group/ui-lib';
import type { ICellEditor } from '../type';

export interface IDateEditorMain extends ICellEditor<Date> {
  style?: React.CSSProperties;
}

export const DateEditorMain = (props: IDateEditorMain) => {
  const { value, style, className, onChange } = props;

  const onSelect = (value?: Date) => {
    onChange?.(value);
  };

  return (
    <Calendar
      style={style}
      mode="single"
      selected={value}
      onSelect={onSelect}
      className={className}
    />
  );
};
