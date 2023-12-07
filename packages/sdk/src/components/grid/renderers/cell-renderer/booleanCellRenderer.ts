import { inRange } from '../../utils';
import { drawCheckbox } from '../base-renderer';
import { CellRegionType, CellType } from './interface';
import type {
  IInternalCellRenderer,
  ICellRenderProps,
  IBooleanCell,
  ICellClickProps,
  ICellClickCallback,
} from './interface';

export const booleanCellRenderer: IInternalCellRenderer<IBooleanCell> = {
  type: CellType.Boolean,
  needsHover: true,
  needsHoverPosition: true,
  draw: (cell: IBooleanCell, props: ICellRenderProps) => {
    const { data, isMultiple } = cell;
    const { ctx, rect, theme } = props;
    const { x, y, width, height } = rect;
    const { iconSizeSM, staticWhite, iconBgSelected, rowHeaderTextColor, cellHorizontalPadding } =
      theme;
    const halfIconSize = iconSizeSM / 2;

    if (!isMultiple) {
      return drawCheckbox(ctx, {
        x: x + width / 2 - halfIconSize,
        y: y + height / 2 - halfIconSize,
        size: iconSizeSM,
        stroke: data ? staticWhite : rowHeaderTextColor,
        fill: data ? iconBgSelected : undefined,
        isChecked: data,
      });
    }

    if (isMultiple && Array.isArray(data)) {
      let startX = x + cellHorizontalPadding;
      const startY = y + height / 2 - halfIconSize;
      data.forEach((check) => {
        if (check) {
          drawCheckbox(ctx, {
            x: startX,
            y: startY,
            size: iconSizeSM,
            stroke: staticWhite,
            fill: iconBgSelected,
            isChecked: true,
          });
          startX += iconSizeSM + cellHorizontalPadding / 2;
        }
      });
    }
  },
  checkRegion: (cell: IBooleanCell, props: ICellClickProps, shouldCalculate?: boolean) => {
    const { data, readonly } = cell;
    if (readonly) return { type: CellRegionType.Blank };
    const { hoverCellPosition, width, height, theme } = props;
    const [x, y] = hoverCellPosition;
    const { iconSizeSM } = theme;
    const halfIconSize = iconSizeSM / 2;

    if (
      inRange(x, width / 2 - halfIconSize, width / 2 + halfIconSize) &&
      inRange(y, height / 2 - halfIconSize, height / 2 + halfIconSize)
    ) {
      return {
        type: CellRegionType.Update,
        data: shouldCalculate ? !data : null,
      };
    }
    return { type: CellRegionType.Blank };
  },
  onClick: (cell: IBooleanCell, props: ICellClickProps, callback: ICellClickCallback) => {
    const cellRegion = booleanCellRenderer.checkRegion?.(cell, props, true);
    if (!cellRegion || cellRegion.type === CellRegionType.Blank) return;
    callback(cellRegion);
  },
};
