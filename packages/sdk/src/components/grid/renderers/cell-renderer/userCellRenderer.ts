import { GRID_DEFAULT } from '../../configs';
import type { IRectangle } from '../../interface';
import { drawAvatar, drawRect, drawSingleLineText } from '../base-renderer';
import { CellType } from './interface';
import type { IInternalCellRenderer, ICellRenderProps, IUserCell } from './interface';

const OPTION_RADIUS = 6;

const { cellHorizontalPadding, cellVerticalPaddingSM } = GRID_DEFAULT;

export const userCellRenderer: IInternalCellRenderer<IUserCell> = {
  type: CellType.User,
  needsHover: false,
  needsHoverPosition: false,
  draw: (cell: IUserCell, props: ICellRenderProps) => {
    const { ctx, rect, theme } = props;
    const { data: userSets } = cell;
    const { x: _x, y: _y, width, height } = rect;
    const {
      fontSizeXS,
      fontSizeSM,
      fontFamily,
      iconSizeSM,
      cellOptionBg,
      cellOptionTextColor,
      avatarBg,
      avatarTextColor,
      avatarSizeMD,
    } = theme;

    const drawArea: IRectangle = {
      x: _x + cellHorizontalPadding,
      y: _y + cellVerticalPaddingSM,
      width: width - 2 * cellHorizontalPadding,
      height: height - cellVerticalPaddingSM,
    };
    const rows = Math.max(
      1,
      Math.floor((drawArea.height - iconSizeSM) / (iconSizeSM + cellHorizontalPadding)) + 1
    );
    const maxTextWidth = drawArea.width - cellHorizontalPadding * 2;

    ctx.save();
    ctx.beginPath();

    if (userSets.length) {
      ctx.rect(_x, _y, width, height);
      ctx.clip();
    }

    ctx.font = `${fontSizeXS}px ${fontFamily}`;

    let x = drawArea.x;
    let row = 1;
    let y = drawArea.y;

    for (const user of userSets) {
      const text = user.name;

      const { width: displayWidth, text: displayText } = drawSingleLineText(ctx, {
        text,
        fill: cellOptionTextColor,
        maxWidth: maxTextWidth,
        needRender: false,
        fontSize: fontSizeXS,
      });

      const width = displayWidth + avatarSizeMD + 6;

      if (x !== drawArea.x && x + width > drawArea.x + drawArea.width && row < rows) {
        row++;
        y += iconSizeSM + cellVerticalPaddingSM;
        x = drawArea.x;
      }

      drawRect(ctx, {
        x: x + 4,
        y,
        width,
        height: iconSizeSM,
        radius: OPTION_RADIUS,
        fill: cellOptionBg,
      });
      drawSingleLineText(ctx, {
        text: displayText,
        x: x + avatarSizeMD + 4,
        y: y + 4,
        fill: cellOptionTextColor,
        maxWidth: maxTextWidth,
      });

      drawAvatar(ctx, {
        x,
        y: y - 2,
        width: avatarSizeMD,
        height: avatarSizeMD,
        fill: avatarBg,
        stroke: cellOptionBg,
        textColor: avatarTextColor,
        fontSize: fontSizeSM,
        fontFamily,
        user: {
          ...user,
          avatar: user.avatarUrl,
          email: '',
        },
      });

      x += width + 8;
      if (x > drawArea.x + drawArea.width && row >= rows) break;
    }

    ctx.restore();
  },
};
