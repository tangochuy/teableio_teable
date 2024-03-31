import { Table2 } from '@teable/icons';
import { useConnection, useTable, useTablePermission } from '@teable/sdk/hooks';
import { Spin } from '@teable/ui-lib/base';
import { cn, Input } from '@teable/ui-lib/shadcn';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useState } from 'react';
import { Emoji } from '@/features/app/components/emoji/Emoji';
import { EmojiPicker } from '@/features/app/components/emoji/EmojiPicker';
dayjs.extend(relativeTime);

export const TableInfo: React.FC<{ className?: string }> = ({ className }) => {
  const { connected } = useConnection();
  const permission = useTablePermission();
  const [isEditing, setIsEditing] = useState(false);
  const table = useTable();

  const icon = table?.icon ? (
    <Emoji size={'1.25rem'} emoji={table.icon} />
  ) : (
    <Table2 className="size-5" />
  );
  return (
    <div
      className={cn('flex justify-center items-center relative overflow-hidden gap-2', className)}
    >
      {connected ? (
        <EmojiPicker
          className="flex size-5 cursor-pointer items-center justify-center hover:bg-muted-foreground/60"
          onChange={(icon: string) => table?.updateIcon(icon)}
          disabled={!permission['table|update']}
        >
          {icon}
        </EmojiPicker>
      ) : (
        <Spin />
      )}
      <div className="relative flex h-7 shrink-0 grow-0 flex-col items-start justify-center">
        <div
          className="text-sm leading-none"
          onDoubleClick={() => {
            permission['table|update'] && setIsEditing(true);
          }}
        >
          {table?.name}
        </div>
        {isEditing && (
          <Input
            type="text"
            defaultValue={table?.name}
            style={{
              boxShadow: 'none',
            }}
            className="round-none absolute left-0 top-0 size-full cursor-text bg-background px-2 outline-none"
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
            onBlur={(e) => {
              if (e.target.value && e.target.value !== table?.name) {
                table?.updateName(e.target.value);
              }
              setIsEditing(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (e.currentTarget.value && e.currentTarget.value !== table?.name) {
                  table?.updateName(e.currentTarget.value);
                }
                setIsEditing(false);
              }
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
          />
        )}
        <div className="hidden text-xs leading-none text-slate-400 @xl/view-header:block">
          last modified: {dayjs(table?.lastModifiedTime).fromNow()}
        </div>
      </div>
    </div>
  );
};
