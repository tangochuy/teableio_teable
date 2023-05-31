/* eslint-disable @typescript-eslint/naming-convention */
export interface IVisualTableDefaultField {
  __id: string;
  __version: number;
  __auto_number: number;
  __created_time: Date;
  __last_modified_time?: Date;
  __created_by: string;
  __last_modified_by?: string;
}
/* eslint-enable @typescript-eslint/naming-convention */

export const preservedFieldName = new Set([
  '__id',
  '__version',
  '__auto_number',
  '__row_default',
  '__created_time',
  '__last_modified_time',
  '__created_by',
  '__last_modified_by',
]);
