import { cn } from '@teable/ui-lib';
import React from 'react';

export interface ISelectTag {
  label: string;
  color?: string;
  backgroundColor?: string;
  className?: string;
}

export const SelectTag: React.FC<React.PropsWithChildren<ISelectTag>> = (props) => {
  const { label, color, backgroundColor, className, children } = props;
  return (
    <div
      className={cn(
        'text-[13px] px-2 h-6 leading-6 rounded-md bg-secondary text-secondary-foreground shrink-0',
        className
      )}
      style={{ color, backgroundColor }}
      title={label}
    >
      <p className="flex-1 truncate">{label}</p>
      {children}
    </div>
  );
};
