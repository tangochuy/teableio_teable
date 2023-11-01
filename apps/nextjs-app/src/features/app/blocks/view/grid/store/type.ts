import type { IPosition, IRectangle } from '@teable-group/sdk/components';
import type { IFieldInstance, Record } from '@teable-group/sdk/model';
import type { FieldOperator } from '@/features/app/components/field-setting/type';

export interface ISetting {
  operator: FieldOperator;
  fieldId?: string;
}

export interface IHeaderMenu {
  fields: IFieldInstance[];
  position: IPosition;
}

export interface IRecordMenu {
  fields: IFieldInstance[];
  records: Record[];
  position: IPosition;
}

export interface IStatisticMenu {
  fieldId: string;
  position: IRectangle;
}

export interface ITooltipInfo {
  text: string;
  position: IRectangle;
}
