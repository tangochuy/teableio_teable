import { FieldType } from '@teable-group/core';

export const isMatchCustomCell = (type: FieldType) => {
  return [
    FieldType.SingleSelect,
    FieldType.MultipleSelect,
    FieldType.Attachment,
    FieldType.Link,
  ].includes(type);
};
