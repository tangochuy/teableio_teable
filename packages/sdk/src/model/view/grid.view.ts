import { GridViewCore } from '@teable/core';
import { updateViewOptions } from '@teable/openapi';
import { Mixin } from 'ts-mixer';
import { requestWrap } from '../../utils/requestWrap';
import { View } from './view';

export class GridView extends Mixin(GridViewCore, View) {
  async updateOption({ rowHeight }: GridView['options']) {
    return await requestWrap(updateViewOptions)(this.tableId, this.id, { options: { rowHeight } });
  }

  async updateFrozenColumnCount(frozenColumnCount: number) {
    return await requestWrap(updateViewOptions)(this.tableId, this.id, {
      options: { frozenColumnCount },
    });
  }
}
