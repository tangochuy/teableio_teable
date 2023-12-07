/* eslint-disable @typescript-eslint/naming-convention */
import { OpBuilderAbstract } from '../op-builder.abstract';
import { AddTableBuilder } from './add-table';
import { SetTablePropertyBuilder } from './set-table-property';

export class TableOpBuilder {
  static editor = {
    setTableProperty: new SetTablePropertyBuilder(),
  };

  static creator = new AddTableBuilder();

  static ops2Contexts = OpBuilderAbstract.ops2Contexts;

  static detect = OpBuilderAbstract.detect;
}
