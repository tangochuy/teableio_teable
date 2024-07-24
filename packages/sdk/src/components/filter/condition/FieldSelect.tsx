import { cn } from '@teable/ui-lib';
import { useCallback, useContext, useMemo } from 'react';
import { useFieldStaticGetter } from '../../../hooks';

import { BaseSingleSelect } from '../component';
import { FilterContext } from '../context';
import { useCompact } from '../hooks';

interface IFieldSelectProps {
  fieldId: string | null;
  onSelect: (type: string | null) => void;
}

function FieldSelect(props: IFieldSelectProps) {
  const { fieldId: value, onSelect } = props;
  const { fields } = useContext(FilterContext);
  const compact = useCompact();
  const options = useMemo(() => {
    return fields.map((field) => ({
      value: field.id,
      label: field.name,
      ...field,
    }));
  }, [fields]);
  const fieldStaticGetter = useFieldStaticGetter();

  const optionRender = useCallback(
    (option: (typeof options)[number]) => {
      const { Icon } = fieldStaticGetter(option.type, option.isLookup);
      return (
        <>
          <Icon className="shrink-0"></Icon>
          <div className="truncate pl-1 text-[13px]">{option.label}</div>
        </>
      );
    },
    [fieldStaticGetter]
  );

  return (
    <BaseSingleSelect
      options={options}
      onSelect={onSelect}
      value={value}
      className={cn('shrink-0', {
        'max-w-32': compact,
        'w-32': !compact,
      })}
      popoverClassName="w-fit"
      optionRender={optionRender}
      displayRender={(selectedField) => {
        const { type, isLookup, label } = selectedField;
        const { Icon } = fieldStaticGetter(type, isLookup);
        return (
          <div className="flex flex-1 items-center truncate">
            <Icon className="shrink-0" />
            <span className="truncate pl-1">{label}</span>
          </div>
        );
      }}
    />
  );
}

export { FieldSelect };
