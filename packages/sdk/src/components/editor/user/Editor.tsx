import type { IUserFieldOptions, IUserCellValue } from '@teable/core';
import { Button, Popover, PopoverContent, PopoverTrigger, cn } from '@teable/ui-lib';
import { useRef, useState } from 'react';
import type { IUserEditorMainProps } from './EditorMain';
import { UserEditorMain } from './EditorMain';
import { UserTag } from './UserTag';

interface IUserEditorProps extends Omit<IUserEditorMainProps, 'isMultiple'> {
  options: IUserFieldOptions;
}

export const UserEditor = (props: IUserEditorProps) => {
  const { value, options, onChange, className, style, readonly, ...reset } = props;
  const [open, setOpen] = useState(false);
  const selectRef = useRef<HTMLButtonElement>(null);

  const { isMultiple } = options;
  const arrayValue = (isMultiple ? value : value ? [value] : null) as IUserCellValue[];

  const onDelete = (id: string) => {
    const newValue = arrayValue?.filter((v) => v.id !== id);
    onChange?.(newValue);
  };

  const onChangeInner = (val?: IUserCellValue | IUserCellValue[]) => {
    onChange?.(val);
    if (!isMultiple) {
      setOpen(false);
    }
  };

  const triggerContent = (
    <Button
      style={style}
      variant="outline"
      role="combobox"
      aria-expanded={open}
      className={cn(
        'w-full h-auto min-h-[32px] sm:min-h-[32px] py-1 flex flex-wrap justify-start hover:bg-transparent gap-1.5',
        className
      )}
    >
      {arrayValue?.map(({ id, title, avatarUrl }) => (
        <UserTag key={id} name={title} avatar={avatarUrl} onDelete={() => onDelete(id)} />
      ))}
    </Button>
  );

  return (
    <>
      {readonly ? (
        triggerContent
      ) : (
        <Popover open={open} onOpenChange={setOpen} modal>
          <PopoverTrigger ref={selectRef} asChild>
            {triggerContent}
          </PopoverTrigger>
          <PopoverContent className="p-0" style={{ width: selectRef.current?.offsetWidth || 0 }}>
            <UserEditorMain
              {...reset}
              value={value}
              isMultiple={isMultiple}
              onChange={onChangeInner}
            />
          </PopoverContent>
        </Popover>
      )}
    </>
  );
};
