import { FieldType } from '@teable-group/core';
import type { CombinedSelection } from '@teable-group/sdk/components';
import { SelectionRegionType } from '@teable-group/sdk/components';
import type { Field } from '@teable-group/sdk/model';
import { isEqual } from 'lodash';

export const selectionCoverAttachments = (selection: CombinedSelection, fields: Field[]) => {
  const { type, ranges } = selection;
  switch (type) {
    case SelectionRegionType.Cells: {
      const [start, end] = ranges;
      return fields
        .slice(start[0], end[0] + 1)
        .every((field) => field.type === FieldType.Attachment);
    }
    case SelectionRegionType.Rows: {
      return fields.every((field) => field.type === FieldType.Attachment);
    }
    case SelectionRegionType.Columns: {
      let allFieldsAreAttachments = true;
      for (let i = 0; i < ranges.length; i++) {
        const start = ranges[i][0];
        const end = ranges[i][1];
        const fieldsInRange = fields.slice(start, end + 1);
        const areAllAttachments = fieldsInRange.every(
          (field) => field.type === FieldType.Attachment
        );
        if (!areAllAttachments) {
          allFieldsAreAttachments = false;
          break;
        }
      }
      return allFieldsAreAttachments;
    }
    default:
      return false;
  }
};

export const getSelectionCell = (selection: CombinedSelection) => {
  const { type, ranges } = selection;
  const isSelectionCell =
    type === SelectionRegionType.Cells && ranges.length === 2 && isEqual(ranges[0], ranges[1]);
  if (!isSelectionCell) {
    return;
  }
  return ranges[0];
};

export const getActiveCell = (selection: CombinedSelection) => {
  const { type, ranges } = selection;
  switch (type) {
    case SelectionRegionType.Cells: {
      return ranges[0];
    }
    case SelectionRegionType.Rows: {
      return [0, ranges[0][0]];
    }
    case SelectionRegionType.Columns: {
      return [ranges[0][0], 0];
    }
    default:
      return null;
  }
};
