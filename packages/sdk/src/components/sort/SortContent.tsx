import type { ISort } from '@teable/core';
import { SortFunc } from '@teable/core';
import { useMemo } from 'react';
import { DraggableSortList } from './DraggableSortList';
import { SortFieldAddButton } from './SortFieldAddButton';
import { SortFieldCommand } from './SortFieldCommand';

interface ISortProps {
  sortValues?: NonNullable<ISort>['sortObjs'];
  limit?: number;
  addBtnText?: string;
  onChange: (sort?: NonNullable<ISort>['sortObjs']) => void;
}

export function SortContent(props: ISortProps) {
  const { onChange, sortValues = [], addBtnText, limit = Infinity } = props;

  const selectedFields = useMemo(() => sortValues.map((sort) => sort.fieldId) || [], [sortValues]);

  const onFieldSelect = (fieldId: string) => {
    onChange([
      {
        fieldId: fieldId,
        order: SortFunc.Asc,
      },
    ]);
  };

  const onFieldAdd = (value: string) => {
    onChange(
      sortValues.concat({
        fieldId: value,
        order: SortFunc.Asc,
      })
    );
  };

  const onSortChange = (sorts: NonNullable<ISort>['sortObjs']) => {
    onChange(sorts?.length ? sorts : undefined);
  };

  if (!sortValues.length) {
    return <SortFieldCommand onSelect={onFieldSelect} />;
  }

  return (
    <div className="flex flex-col">
      <div className="max-h-96 overflow-auto p-3">
        <DraggableSortList
          sorts={sortValues}
          selectedFields={selectedFields}
          onChange={onSortChange}
        />
      </div>
      {selectedFields.length < limit && (
        <SortFieldAddButton
          addBtnText={addBtnText}
          selectedFields={selectedFields}
          onSelect={onFieldAdd}
        />
      )}
    </div>
  );
}
