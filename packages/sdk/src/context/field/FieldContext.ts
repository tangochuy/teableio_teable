import React from 'react';
import type { IFieldInstance } from '../../model';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const FieldContext = React.createContext<{
  fields: IFieldInstance[];
  setFields: React.Dispatch<React.SetStateAction<IFieldInstance[]>>;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
}>(null!);
