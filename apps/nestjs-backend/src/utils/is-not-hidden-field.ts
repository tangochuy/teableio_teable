import type { IKanbanViewOptions, IViewVo } from '@teable/core';
import { ViewType } from '@teable/core';

export const isNotHiddenField = (
  fieldId: string,
  view: Pick<IViewVo, 'type' | 'options' | 'columnMeta'>
) => {
  const { type: viewType, columnMeta, options } = view;

  // check if field is hidden by visible or hidden
  if (viewType === ViewType.Kanban) {
    const { stackFieldId, coverFieldId } = (options ?? {}) as IKanbanViewOptions;
    return (
      [stackFieldId, coverFieldId].includes(fieldId) ||
      Boolean((columnMeta[fieldId] as { visible?: boolean })?.visible)
    );
  }

  if ([ViewType.Form].includes(viewType)) {
    return Boolean((columnMeta[fieldId] as { visible?: boolean })?.visible);
  }
  return !(columnMeta[fieldId] as { hidden?: boolean })?.hidden;
};
