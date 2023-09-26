import { booleanCellRenderer } from './booleanCellRenderer';
import { chartCellRenderer } from './chartCellRenderer';
import { imageCellRenderer } from './imageCellRenderer';
import { CellType } from './interface';
import { loadingCellRenderer } from './loadingCellRenderer';
import { numberCellRenderer } from './numberCellRenderer';
import { ratingCellRenderer } from './ratingCellRenderer';
import { selectCellRenderer } from './selectCellRenderer';
import { textCellRenderer } from './textCellRenderer';

export * from './interface';

export const getCellRenderer = (cellType: CellType) => {
  switch (cellType) {
    case CellType.Text:
      return textCellRenderer;
    case CellType.Number:
      return numberCellRenderer;
    case CellType.Boolean:
      return booleanCellRenderer;
    case CellType.Select:
      return selectCellRenderer;
    case CellType.Image:
      return imageCellRenderer;
    case CellType.Rating:
      return ratingCellRenderer;
    case CellType.Chart:
      return chartCellRenderer;
    case CellType.Loading:
    default:
      return loadingCellRenderer;
  }
};
