import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DraggableHandle, Star } from '@teable/icons';
import type { GetPinListVo, IGetBaseVo, IGetSpaceVo } from '@teable/openapi';
import { getPinList, getSpaceList, updatePinOrder } from '@teable/openapi';
import { ReactQueryKeys } from '@teable/sdk/config';
import type { DragEndEvent } from '@teable/ui-lib/base';
import { DndKitContext, Draggable, Droppable } from '@teable/ui-lib/base';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@teable/ui-lib/shadcn';
import { useTranslation } from 'next-i18next';
import { useEffect, useMemo, useState } from 'react';
import { spaceConfig } from '@/features/i18n/space.config';
import { useBaseList } from '../useBaseList';
import { PinItem } from './PinItem';
import { StarButton } from './StarButton';

export const PinList = () => {
  const [pinList, setPinList] = useState<GetPinListVo>([]);
  const queryClient = useQueryClient();
  const { t } = useTranslation(spaceConfig.i18nNamespaces);

  const { data: pinListData } = useQuery({
    queryKey: ReactQueryKeys.pinList(),
    queryFn: getPinList,
  });

  useEffect(() => {
    if (!pinListData?.data) {
      return;
    }
    setPinList([...pinListData.data]);
  }, [pinListData?.data]);

  const { data: spaceList } = useQuery({
    queryKey: ReactQueryKeys.spaceList(),
    queryFn: getSpaceList,
  });
  const baseList = useBaseList();

  const { mutate: updateOrder } = useMutation({
    mutationFn: updatePinOrder,
    onSuccess: () => {
      queryClient.invalidateQueries(ReactQueryKeys.pinList());
    },
    onError: () => {
      setPinList(pinListData?.data ?? []);
    },
  });

  const spaceMap = useMemo(() => {
    const map: { [key in string]: IGetSpaceVo } = {};
    spaceList?.data.forEach((space) => {
      map[space.id] = space;
    });
    return map;
  }, [spaceList?.data]);

  const baseMap = useMemo(() => {
    const map: { [key in string]: IGetBaseVo } = {};
    baseList?.forEach((base) => {
      map[base.id] = base;
    });
    return map;
  }, [baseList]);

  const onDragEndHandler = async (event: DragEndEvent) => {
    const { over, active } = event;
    const to = over?.data?.current?.sortable?.index;
    const from = active?.data?.current?.sortable?.index;
    const list = pinListData?.data ?? [];

    if (!over || !list.length || from === to) {
      return;
    }

    const [pin] = list.slice(from, from + 1);

    const anchorPin = to === 0 ? list[0] : list[to - 1];
    const position = to === 0 ? 'before' : 'after';

    updateOrder({
      id: pin.id,
      type: pin.type,
      anchorId: anchorPin.id,
      anchorType: anchorPin.type,
      position,
    });
    setPinList((prev) => {
      const pre = [...prev];
      pre.splice(from, 1);
      pre.splice(to, 0, pin);
      return pre;
    });
  };

  return (
    <Accordion
      type="single"
      collapsible
      className="max-h-[50%] w-full shrink-0 overflow-y-auto px-3"
    >
      <AccordionItem className="border-0" value="item-1">
        <AccordionTrigger className="hover:no-underline">
          <div className=" flex items-center gap-1">
            <Star className="size-3 fill-yellow-400 text-yellow-400" />
            {t('space:pin.pin')}
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="flex flex-col">
            {pinList.length === 0 && (
              <div className="text-center text-xs text-muted-foreground">
                {t('space:pin.empty')}
              </div>
            )}
            <DndKitContext onDragEnd={onDragEndHandler}>
              <Droppable
                items={pinList.map(({ id }) => id)}
                overlayRender={(active) => {
                  const activePin = pinList.find((pin) => pin.id === active?.id);
                  if (!activePin) {
                    return <div />;
                  }
                  return (
                    <div className="flex items-center gap-2 border bg-background">
                      <PinItem
                        className="group"
                        pin={activePin}
                        baseMap={baseMap}
                        spaceMap={spaceMap}
                        right={
                          <>
                            <StarButton
                              className="opacity-0 group-hover:opacity-100"
                              id={activePin.id}
                              type={activePin.type}
                            />
                            <DraggableHandle className="opacity-0 group-hover:opacity-100" />
                          </>
                        }
                      />
                    </div>
                  );
                }}
              >
                {pinList.map((pin) => (
                  <Draggable key={pin.id} id={pin.id}>
                    {({ setNodeRef, attributes, listeners, style }) => (
                      <div ref={setNodeRef} {...attributes} style={style}>
                        <div className="flex items-center gap-2">
                          <PinItem
                            className="group"
                            pin={pin}
                            baseMap={baseMap}
                            spaceMap={spaceMap}
                            right={
                              <>
                                <StarButton
                                  className="opacity-0 group-hover:opacity-100"
                                  id={pin.id}
                                  type={pin.type}
                                />
                                <DraggableHandle
                                  {...listeners}
                                  className="opacity-0 group-hover:opacity-100"
                                />
                              </>
                            }
                          />
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
              </Droppable>
            </DndKitContext>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
