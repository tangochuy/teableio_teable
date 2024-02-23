import { useQuery } from '@tanstack/react-query';
import { Component, Database, Plus } from '@teable/icons';
import type { IGetBaseVo } from '@teable/openapi';
import { getBaseAll, getSpaceList } from '@teable/openapi';
import { Spin } from '@teable/ui-lib/base';
import {
  Button,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@teable/ui-lib/shadcn';
import { useTranslation } from 'next-i18next';
import { useMemo, useState } from 'react';
import { Emoji } from '@/features/app/components/emoji/Emoji';
import { AccessList } from './AccessList';

interface IValue {
  spaceIds: string[];
  baseIds: string[];
}

interface IFormAccess {
  value?: IValue;
  onChange: (value: IValue) => void;
}

export const AccessSelect = (props: IFormAccess) => {
  const { onChange, value } = props;
  const { t } = useTranslation('token');
  const [bases, setBases] = useState<string[]>(value?.baseIds || []);
  const [spaces, setSpaces] = useState<string[]>(value?.spaceIds || []);
  const [open, setOpen] = useState(false);

  const { data: spaceList, isLoading: spaceListLoading } = useQuery({
    queryKey: ['space-list'],
    queryFn: getSpaceList,
  });
  const { data: baseList, isLoading: baseListLoading } = useQuery({
    queryKey: ['base-all'],
    queryFn: () => getBaseAll(),
  });

  const baseMap = useMemo(
    () =>
      baseList?.data?.reduce(
        (acc, cur) => {
          const space = acc[cur.spaceId];
          acc[cur.spaceId] = space ? [...space, cur] : [cur];
          return acc;
        },
        {} as Record<string, IGetBaseVo[]>
      ) ?? {},
    [baseList]
  );

  const onChangeInner = (spaceId?: string, baseId?: string) => {
    onChange({
      spaceIds: spaceId ? [...spaces, spaceId] : spaces,
      baseIds: baseId ? [...bases, baseId] : bases,
    });
  };

  const onDeleteBaseId = (baseId: string) => {
    const newBases = bases.filter((id) => id !== baseId);
    setBases(newBases);
    onChange({
      spaceIds: spaces,
      baseIds: newBases,
    });
  };

  const onDeleteSpaceId = (spaceId: string) => {
    const newSpaces = spaces.filter((id) => id !== spaceId);
    setSpaces(newSpaces);
    onChange({
      spaceIds: newSpaces,
      baseIds: bases,
    });
  };

  if (spaceListLoading || baseListLoading) {
    return <Spin className="size-5" />;
  }

  return (
    <div>
      <AccessList
        spaceIds={spaces}
        baseIds={bases}
        onDeleteBaseId={onDeleteBaseId}
        onDeleteSpaceId={onDeleteSpaceId}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button size={'sm'} variant="outline" role="combobox" aria-expanded={open}>
            <Plus />
            {t('accessSelect.button')}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96 p-0">
          <Command>
            <CommandInput placeholder={t('accessSelect.inputPlaceholder')} className="h-9" />
            <CommandEmpty>{t('accessSelect.empty')}</CommandEmpty>
            <CommandList>
              {spaceList?.data
                ?.filter(({ id: spaceId }) => !spaces.includes(spaceId))
                ?.map(({ id, name }) => (
                  <CommandGroup
                    key={id}
                    heading={<div className="truncate text-sm">{name}</div>}
                    title={name}
                  >
                    <CommandItem
                      className="gap-1"
                      key={`${id}-all`}
                      value={name}
                      onSelect={() => {
                        setSpaces((prev) => [...prev, id]);
                        setOpen(false);
                        onChangeInner(id);
                      }}
                    >
                      <Component className="size-4 shrink-0" />
                      {t('accessSelect.spaceSelectItem')}
                    </CommandItem>
                    {baseMap[id]
                      ?.filter(({ id: baseId }) => !bases.includes(baseId))
                      ?.map((base) => (
                        <CommandItem
                          className="gap-1"
                          key={base.id}
                          value={`${base.id}-${base.name}`}
                          title={base.name}
                          onSelect={() => {
                            setBases((prev) => [...prev, base.id]);
                            setOpen(false);
                            onChangeInner(undefined, base.id);
                          }}
                        >
                          {base.icon ? (
                            <Emoji className="w-4 shrink-0" emoji={base.icon} size={16} />
                          ) : (
                            <Database className="size-4 shrink-0" />
                          )}
                          <div className="truncate">{base.name}</div>
                        </CommandItem>
                      ))}
                  </CommandGroup>
                ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};
