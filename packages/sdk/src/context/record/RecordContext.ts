import type { IRecord } from '@teable-group/core';
import React from 'react';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const RecordContext = React.createContext<{
  rowCount: number;
  serverRecords?: IRecord[];
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
}>(null!);
