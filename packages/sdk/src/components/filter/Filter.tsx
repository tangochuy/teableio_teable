import type { IFilter, IFilterItem } from '@teable-group/core';
import { getValidFilterOperators } from '@teable-group/core';

import { Plus, Share2 } from '@teable-group/icons';

import { Button, Popover, PopoverContent, PopoverTrigger } from '@teable-group/ui-lib';

import produce from 'immer';
import { cloneDeep, isEqual, set, get } from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDebounce } from 'react-use';

import { useFields } from '../../hooks';
import type { IFieldInstance } from '../../model';
import { Condition, ConditionGroup } from './condition';
import { EMPTYOPERATORS } from './constant';
import { FilterContext } from './context';
import type { IFilterProps, IFiltersPath } from './types';
import { isFilterItem, ConditionAddType } from './types';

const title = 'In this view, show records';
const emptyText = 'No filter conditions are applied';
const defaultFilter: IFilter = {
  conjunction: 'and',
  filterSet: [],
};
const defaultGroupFilter: IFilter = {
  ...defaultFilter,
  conjunction: 'or',
};

function Filter(props: IFilterProps) {
  const { onChange, filters: initFilter, children } = props;
  const [filters, setFilters] = useState<IFilter | null>(initFilter);

  const fields = useFields({ widthHidden: true });
  const setFilterHandler = (
    path: IFiltersPath,
    value:
      | IFilterItem['value']
      | IFilter['conjunction']
      | IFilterItem['fieldId']
      | IFilterItem['operator']
  ) => {
    if (filters) {
      const newFilters = produce(filters, (draft) => {
        set(draft, path, value);
      });
      setFilters(newFilters);
    }
  };

  useEffect(() => {
    const newFilter = cloneDeep(initFilter);
    setFilters(newFilter);
  }, [initFilter]);

  useDebounce(
    () => {
      if (!isEqual(filters, initFilter)) {
        onChange?.(filters);
      }
    },
    500,
    [filters]
  );

  // use the primary to be default metadata
  const defaultIFilterItem = useMemo<IFilterItem>(() => {
    const defaultField = fields.find((field) => field.isPrimary);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const defaultOpertor = getValidFilterOperators(defaultField!);
    return {
      operator: defaultOpertor?.[0],
      value: null,
      fieldId: defaultField?.id,
    } as IFilterItem;
  }, [fields]);

  const isCheckBox = useCallback(
    (fieldId: string) => {
      return fields.find((field) => field.id === fieldId)?.type === 'checkbox';
    },
    [fields]
  );

  const preOrder = useCallback(
    (filter: IFilter['filterSet']): Set<string> => {
      const filterIds = new Set<string>();

      filter.forEach((item) => {
        if (isFilterItem(item)) {
          // checkbox's default value is null, but it does work
          if (
            item.value === 0 ||
            item.value ||
            EMPTYOPERATORS.includes(item.operator) ||
            isCheckBox(item.fieldId)
          ) {
            filterIds.add(item.fieldId);
          }
        } else {
          const childFilterIds = preOrder(item.filterSet);
          childFilterIds.forEach((id) => filterIds.add(id));
        }
      });

      return filterIds;
    },
    [isCheckBox]
  );

  const generateFilterButtonText = (filterIds: Set<string>, fields: IFieldInstance[]): string => {
    let text = filterIds.size ? 'Filtered by ' : '';
    const defaultText = 'Filter';
    const filterIdsArr = Array.from(filterIds);

    filterIdsArr.forEach((id, index) => {
      const name = fields.find((field) => field.id === id)?.name;
      if (name) {
        text += `${index === 0 ? '' : ', '}${name}`;
      }
    });

    if (filterIds.size > 2) {
      const name = fields.find((field) => field.id === filterIdsArr?.[0])?.name;
      text = `Filtered by ${name} and ${filterIds.size - 1} other field`;
    }

    return text || defaultText;
  };

  const filterButtonText = useMemo(() => {
    let filteredIds = new Set<string>();
    if (filters) {
      filteredIds = preOrder(filters?.filterSet);
    }
    return generateFilterButtonText(filteredIds, fields);
  }, [fields, filters, preOrder]);

  const addCondition = useCallback(
    (path: IFiltersPath, type = ConditionAddType.ITEM) => {
      const conditionItem =
        type === ConditionAddType.ITEM ? { ...defaultIFilterItem } : { ...defaultGroupFilter };

      let newFilters = null;

      /**
       * first add from null, set the default
       */
      if (!filters) {
        newFilters = cloneDeep(defaultFilter);
        newFilters.filterSet.push(conditionItem);
        setFilters(newFilters);
        return;
      }

      newFilters = produce(filters, (draft) => {
        const target = path.length ? get(draft, path) : draft;
        target.filterSet.push(conditionItem);
      });

      setFilters(newFilters);
    },
    [defaultIFilterItem, filters]
  );

  /**
   * different from other way to update filters, delete need to back to parent path
   * becase current filter item only can delelte from it's parent
   * @param path Filter Object Path
   * @param index the index of filterSet which need to delete
   * @returns void
   */
  const deleteCondition = (path: IFiltersPath, index: number) => {
    let newFilters = null;
    // get the parent path
    const parentPath = path.slice(0, -2);

    newFilters = produce(filters, (draft) => {
      const target = parentPath?.length ? get(draft, parentPath) : draft;
      target.filterSet.splice(index, 1);
    });

    // delete all filter, should return null
    if (!newFilters?.filterSet.length) {
      setFilters(null);
      return;
    }

    setFilters(newFilters);
  };

  const conditionCreator = () => {
    if (!filters?.filterSet?.length) {
      return null;
    }
    const initLevel = 0;

    return (
      <div className="max-h-96 overflow-auto ">
        {filters?.filterSet?.map((filterItem, index) =>
          isFilterItem(filterItem) ? (
            <Condition
              key={index}
              filter={filterItem}
              index={index}
              conjunction={filters.conjunction}
              level={initLevel}
              path={['filterSet', index]}
            />
          ) : (
            <ConditionGroup
              key={index}
              filter={filterItem}
              index={index}
              conjunction={filters.conjunction}
              level={initLevel}
              path={['filterSet', index]}
            />
          )
        )}
      </div>
    );
  };

  return (
    <FilterContext.Provider
      value={{
        setFilters: setFilterHandler,
        onChange: onChange,
        addCondition: addCondition,
        deleteCondition: deleteCondition,
      }}
    >
      <Popover>
        <PopoverTrigger asChild>
          {children?.(filterButtonText, filterButtonText !== 'Filter')}
        </PopoverTrigger>

        <PopoverContent
          side="bottom"
          align="start"
          className="max-w-screen-md w-min min-w-[544px] p-0"
        >
          <div className="text-[11px] px-4 py-2 bg-accent max-w-full flex justify-start items-center rounded-t">
            <Share2 className="h-4 w-4 shrink-0 mr-4" />
            <span className="text-zinc-500">
              This view is being used in a view share link. Modifications to the view configuration
              will also change the view share link.
            </span>
          </div>
          <div className="text-[13px]">
            {filters?.filterSet?.length ? (
              <div className="pt-3 px-4">{title}</div>
            ) : (
              <div className="text-gray-400 pt-4 px-4 text-gray-400">{emptyText}</div>
            )}
          </div>
          <div className="px-4 pt-3">{conditionCreator()}</div>
          <div className="flex p-3 w-max ">
            <Button
              variant="ghost"
              size="xs"
              className="text-[13px]"
              onClick={() => addCondition([], ConditionAddType.ITEM)}
            >
              <Plus className="h-4 w-4" />
              Add condition
            </Button>

            <Button
              variant="ghost"
              size="xs"
              onClick={() => addCondition([], ConditionAddType.GROUP)}
              className="text-[13px]"
            >
              <Plus className="h-4 w-4" />
              Add condition group
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </FilterContext.Provider>
  );
}

export { Filter };
