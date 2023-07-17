import { FieldType } from '@teable-group/core';
import type { IFilterMeta } from '@teable-group/core';
import { useField } from '@teable-group/sdk';
import { Input } from '@teable-group/ui-lib/shadcn/ui/input';
import { useEffect, useMemo } from 'react';
import {
  SingleSelect,
  MultipleSelect,
  FilterInput,
  FilterDatePicker,
  FilterCheckbox,
  FilterLinkSelect,
} from '../component';
import { EMPTYOPERATORS } from '../constant';

interface IFieldValue {
  filter: IFilterMeta;
  onSelect: (value: IFilterMeta['value']) => void;
}

function FieldValue(props: IFieldValue) {
  const { filter, onSelect } = props;
  const field = useField(filter.fieldId);

  const emptyComponent = <Input className="m-1" disabled />;
  const showEmptyComponent = useMemo(() => {
    const showEmpty = EMPTYOPERATORS.includes(filter.operator);
    showEmpty && onSelect?.(null);
    return showEmpty;
  }, [filter.operator, onSelect]);

  useEffect(() => {
    showEmptyComponent && onSelect(null);
  }, [onSelect, showEmptyComponent]);

  const dynamicComponent = () => {
    const InputComponent = (
      <FilterInput placeholder="Enter a value" value={filter.value as string} onChange={onSelect} />
    );

    switch (field?.type) {
      case FieldType.Number:
        return InputComponent;
      case FieldType.SingleSelect:
        return <SingleSelect field={field} value={filter.value as string} onSelect={onSelect} />;
      case FieldType.MultipleSelect:
        return (
          <MultipleSelect field={field} value={filter.value as string[]} onSelect={onSelect} />
        );
      case FieldType.Date:
        return (
          <FilterDatePicker value={filter.value} onSelect={onSelect} operator={filter.operator} />
        );
      case FieldType.SingleLineText:
        return InputComponent;
      case FieldType.Checkbox:
        return <FilterCheckbox value={filter.value} onChange={onSelect} />;
      case FieldType.Link:
        return (
          <FilterLinkSelect
            field={field}
            onSelect={onSelect}
            value={filter.value as string[]}
            operator={filter.operator}
          />
        );
      default:
        return InputComponent;
    }
  };
  return <>{showEmptyComponent ? emptyComponent : dynamicComponent()}</>;
}

export { FieldValue };
