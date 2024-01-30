import { useQuery } from '@tanstack/react-query';
import { Component, Database, X } from '@teable-group/icons';
import type { IGetBaseVo, IGetSpaceVo } from '@teable-group/openapi';
import { getBaseAll, getSpaceList } from '@teable-group/openapi';
import { Button } from '@teable-group/ui-lib/shadcn';
import { isEmpty } from 'lodash';
import { useTranslation } from 'next-i18next';
import { useMemo } from 'react';
import { Emoji } from '@/features/app/components/emoji/Emoji';

interface IAccessListProps {
  baseIds: string[];
  spaceIds: string[];
  onDeleteBaseId: (baseId: string) => void;
  onDeleteSpaceId: (spaceId: string) => void;
}

export const AccessList = (props: IAccessListProps) => {
  const { baseIds, spaceIds, onDeleteBaseId, onDeleteSpaceId } = props;
  const { t } = useTranslation('token');

  const { data: spaceList } = useQuery({
    queryKey: ['space-list'],
    queryFn: getSpaceList,
  });
  const { data: baseList } = useQuery({
    queryKey: ['base-all'],
    queryFn: () => getBaseAll(),
  });

  const spaceMap = useMemo(() => {
    const spaceMap: Record<string, IGetSpaceVo> = {};
    spaceList?.data?.forEach((item) => {
      spaceMap[item.id] = item;
    });
    return spaceMap;
  }, [spaceList?.data]);

  const baseMap = useMemo(() => {
    const baseMap: Record<string, IGetBaseVo> = {};
    baseList?.data?.forEach((item) => {
      baseMap[item.id] = item;
    });
    return baseMap;
  }, [baseList]);

  const { displaySpaceMap, displayBaseMap, allDisplaySpaceIds } = useMemo(() => {
    if (isEmpty(baseMap) || isEmpty(spaceMap)) {
      return { displayBaseMap: {}, displaySpaceMap: {}, allDisplaySpaceIds: [] };
    }
    const displaySpaceMap: Record<string, IGetSpaceVo> = {};
    const displayBaseMap: Record<string, IGetBaseVo[]> = {};
    const allDisplaySpaceIds = new Set<string>();

    spaceIds.forEach((spaceId) => {
      displaySpaceMap[spaceId] = spaceMap[spaceId];
      allDisplaySpaceIds.add(spaceId);
    });

    baseIds.forEach((baseId) => {
      const base = baseMap[baseId];
      const cur = displayBaseMap[base.spaceId];
      allDisplaySpaceIds.add(base.spaceId);
      displayBaseMap[base.spaceId] = cur ? [...cur, base] : [base];
    });

    return { displayBaseMap, displaySpaceMap, allDisplaySpaceIds: Array.from(allDisplaySpaceIds) };
  }, [spaceIds, baseIds, spaceMap, baseMap]);

  return (
    <div className="py-3 pl-1 text-sm">
      {allDisplaySpaceIds.map((spaceId) => {
        const space = spaceMap[spaceId];
        const displaySpace = displaySpaceMap[spaceId];
        const displayBases = displayBaseMap[spaceId];
        return (
          <div key={spaceId} className="space-y-1">
            <div className="text-xs text-muted-foreground">{space.name}</div>
            <div>
              {displaySpace && (
                <div className="flex h-8 items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Component className="size-4 shrink-0" />
                    {t('allSpace')}
                  </div>
                  <Button
                    variant={'ghost'}
                    size={'sm'}
                    onClick={() => onDeleteSpaceId(displaySpace.id)}
                  >
                    <X />
                  </Button>
                </div>
              )}
              {displayBases?.map((base) => (
                <div key={base.id} className="flex h-8 items-center justify-between">
                  <div className="flex items-center gap-2">
                    {base.icon ? (
                      <Emoji className="w-4 shrink-0" emoji={base.icon} size={16} />
                    ) : (
                      <Database className="size-4 shrink-0" />
                    )}
                    {base.name}
                  </div>
                  <Button variant={'ghost'} size={'sm'} onClick={() => onDeleteBaseId(base.id)}>
                    <X />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
