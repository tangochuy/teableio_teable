/* eslint-disable @typescript-eslint/naming-convention */
import type { RatingIcon } from '@teable/core';
import { Check, DraggableHandle, Maximize2 } from '@teable/icons';
import { useMemo } from 'react';
import { useFieldStaticGetter } from '../../../hooks/use-field-static-getter';
import { FIELD_TYPE_ORDER, getSpriteMap } from '../../../utils';
import { RATING_ICON_MAP } from '../../editor/rating';
import { RowControlType } from '../../grid/interface';

export const useGridIcons = () => {
  const getFieldStatic = useFieldStaticGetter();

  return useMemo(() => {
    const columnHeaderIcons = getSpriteMap(
      FIELD_TYPE_ORDER.reduce<
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { type: string; IconComponent: React.JSXElementConstructor<any> }[]
      >((pre, type) => {
        const IconComponent = getFieldStatic(type, false)?.Icon;
        const LookupIconComponent = getFieldStatic(type, true)?.Icon;
        pre.push({ type: type, IconComponent });
        if (LookupIconComponent) {
          pre.push({ type: `${type}_lookup`, IconComponent: LookupIconComponent });
        }
        return pre;
      }, [])
    );
    const rowHeaderIcons = getSpriteMap([
      {
        type: RowControlType.Drag,
        IconComponent: DraggableHandle,
      },
      {
        type: RowControlType.Expand,
        IconComponent: Maximize2,
      },
      {
        type: RowControlType.Checkbox,
        IconComponent: Check,
      },
    ]);
    const ratingIcons = getSpriteMap(
      (Object.keys(RATING_ICON_MAP) as RatingIcon[]).map((iconKey) => ({
        type: iconKey,
        IconComponent: RATING_ICON_MAP[iconKey],
      }))
    );
    return {
      ...columnHeaderIcons,
      ...rowHeaderIcons,
      ...ratingIcons,
    };
  }, [getFieldStatic]);
};
