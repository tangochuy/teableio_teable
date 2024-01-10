import { ChevronLeft, ChevronRight } from '@teable-group/icons';
import { Button, cn } from '@teable-group/ui-lib';
import { useState } from 'react';

interface IRowCounterProps {
  rowCount: number;
  className?: string;
}

export const RowCounter = (props: IRowCounterProps) => {
  const { rowCount, className } = props;
  const [collapsed, setCollapsed] = useState<boolean>(false);

  const onClick = () => {
    setCollapsed(!collapsed);
  };

  const Icon = collapsed ? ChevronRight : ChevronLeft;

  return (
    <div
      className={cn(
        'flex items-center h-6 pl-2 text-xs bg-violet-200 dark:bg-zinc-600 rounded',
        className
      )}
    >
      {collapsed ? rowCount : `${rowCount} records`}
      <Button
        variant={'ghost'}
        size={'xs'}
        className="ml-[2px] h-full rounded-l-none p-[2px] hover:bg-violet-300 dark:hover:bg-zinc-500"
        onClick={onClick}
      >
        <Icon className="h-3 w-3" />
      </Button>
    </div>
  );
};
