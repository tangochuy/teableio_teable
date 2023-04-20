import type { ITableSnapshot, ITableVo } from '../../models';
import { OpName } from '../common';
import type { ICreateOpBuilder } from '../interface';

export class AddTableBuilder implements ICreateOpBuilder {
  name: OpName.AddTable = OpName.AddTable;

  build(table: ITableVo): ITableSnapshot {
    return {
      table,
    };
  }
}
