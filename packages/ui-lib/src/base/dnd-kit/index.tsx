import {
  DndContext,
  useSensors,
  useSensor,
  TouchSensor,
  MouseSensor,
  DragOverlay,
  useDndContext,
} from '@dnd-kit/core';
import { useSortable, SortableContext, type SortableContextProps } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import React, { useMemo } from 'react';
import { createPortal } from 'react-dom';

type IProvidedProps = ReturnType<typeof useSortable> & {
  style: React.CSSProperties;
};

interface IDraggableContainerProps {
  id: string;
  style?: React.CSSProperties;
  children: (provided: IProvidedProps) => React.ReactElement;
}

const DndKitContext = (props: React.ComponentProps<typeof DndContext>) => {
  const sensors = useSensors(
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );
  return (
    <DndContext sensors={sensors} {...props}>
      {props.children}
    </DndContext>
  );
};

const Droppable = (props: SortableContextProps) => {
  const context = useDndContext();
  const { children } = props;
  const { active } = context;

  const customerOverLay = useMemo(() => {
    if (Array.isArray(children)) {
      return children.find((item) => !Array.isArray(item) && !item?.key) ?? null;
    }
    return null;
  }, [children]);

  const dragOverRender = useMemo(() => {
    if (!Array.isArray(children)) {
      return null;
    }
    if (active?.id) {
      // customer dragoverlay
      const listChildren = customerOverLay ? (children[0] as React.ReactElement[]) : children;
      const draggingOverLayElement = listChildren.find(({ props: { id } }) => id === active.id);
      const defaultDragOverLay = (
        <div
          style={{
            cursor: 'grabbing',
          }}
          className="rounded-sm p-0 m-0"
        >
          <div className="pointer-events-none">{draggingOverLayElement}</div>
        </div>
      );

      return customerOverLay ? null : defaultDragOverLay;
    }
    return null;
  }, [active?.id, children, customerOverLay]);

  return (
    <SortableContext {...props}>
      {props.children}
      {!customerOverLay && createPortal(<DragOverlay>{dragOverRender}</DragOverlay>, document.body)}
    </SortableContext>
  );
};

const Draggable = (props: IDraggableContainerProps) => {
  const { id, children, style: injectStyle } = props;

  const sortProps = useSortable({
    id: id,
  });
  const { transform, transition } = sortProps;
  const customTransform = transform ? { ...transform, scaleX: 1, scaleY: 1 } : null;
  const style = {
    transition,
    transform: CSS.Transform.toString(customTransform),
    ...injectStyle,
  };

  const provided = {
    ...sortProps,
    style,
  };

  return <>{children(provided)}</>;
};

export { DndKitContext as DndKitContext, Droppable, Draggable };

export * from '@dnd-kit/core';

export * from '@dnd-kit/sortable';

export * from '@dnd-kit/utilities';

export type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
