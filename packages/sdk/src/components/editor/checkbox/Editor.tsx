import { Checkbox } from '@teable-group/ui-lib';
import type { ICellEditor } from '../type';

type ICheckboxEditor = ICellEditor<boolean>;

export const CheckboxEditor = (props: ICheckboxEditor) => {
  const { value, onChange, className, style } = props;

  return (
    <Checkbox
      style={style}
      className={className}
      checked={Boolean(value)}
      onCheckedChange={(checked) => {
        onChange?.(Boolean(checked));
      }}
    />
  );
};
