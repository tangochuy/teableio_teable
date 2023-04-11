import type { Column, IOtOperation } from '../../models';
import { OpName, pathMatcher } from '../common';
import type { IOpBuilder } from '../interface';

type IMetaKey = keyof Column;

export interface IAddColumnMetaOpContext {
  name: OpName.AddColumnMeta;
  viewId: string;
  newMetaValue: { [key: string]: unknown };
  oldMetaValue?: { [key: string]: unknown };
}

export class AddColumnMetaBuilder implements IOpBuilder {
  name: OpName.AddColumnMeta = OpName.AddColumnMeta;

  build(params: {
    viewId: string;
    newMetaValue: { [key: string]: unknown };
    oldMetaValue?: { [key: string]: unknown };
  }): IOtOperation {
    const { viewId, newMetaValue, oldMetaValue } = params;

    return {
      p: ['field', 'columnMeta', viewId],
      oi: newMetaValue,
      ...(oldMetaValue ? { od: oldMetaValue } : {}),
    };
  }

  detect(op: IOtOperation): IAddColumnMetaOpContext | null {
    const { p, oi, od } = op;

    if (!oi) {
      return null;
    }

    const result = pathMatcher<{ viewId: string; metaKey: IMetaKey }>(p, [
      'field',
      'columnMeta',
      ':viewId',
    ]);

    if (!result) {
      return null;
    }

    return {
      name: this.name,
      viewId: result.viewId,
      newMetaValue: oi,
      oldMetaValue: od,
    };
  }
}
