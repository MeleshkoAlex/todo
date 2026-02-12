import { memo, useEffect, useMemo, useRef, useState } from "react";

import cn from "classnames";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import {
  attachClosestEdge,
  extractClosestEdge,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { setCustomNativeDragPreview } from "@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview";

import { Button } from "@/components/shared/button/base";
import type { Actions, IColumn, ITask, TItemValue } from "@/context/types";
import {
  IconDelete,
  IconDragIndicator,
  IconEdit,
  IconMoveGroup,
} from "@/components/icons";
import { Menu } from "@/components/shared/menu";
import { FieldCheckbox } from "@/components/shared/form/checkbox";
import { ButtonIcon } from "@/components/shared/button";
import type { TDragStateColumn } from "@/types/common";

import { Card } from "../card";
import { CreateTaskModal } from "../modals/createTask";

import styles from "./style.module.scss";

interface Props {
  data: IColumn;
  className?: string;
  onDelete: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onCreateTask: Actions["addTask"];
  onUpdateTask: Actions["updateTask"];
  selectedItems: Record<string, boolean>;
  onChangeSelect: Actions["selectItem"];
  onChangeStatusTask: Actions["changeStatusTask"];
  onMoveTask: Actions["moveTaskToColumn"];
  onMoveColumn: Actions["moveColumn"];
  onEdit: (column: IColumn) => void;
  moveItems: { id: string; name: string }[];
}

export const Column: React.FC<Props> = memo(
  ({
    data,
    data: { id, name, items },
    className,
    onUpdateTask,
    onDelete,
    onDeleteTask,
    onCreateTask,
    selectedItems,
    onChangeSelect,
    onChangeStatusTask,
    onMoveTask,
    onMoveColumn,
    onEdit,
    moveItems,
  }) => {
    const [triggerRef, setTriggerRef] = useState<HTMLElement | null>(null);
    const dragHandleRef = useRef<HTMLButtonElement | null>(null);
    const [dragState, setDragState] = useState<TDragStateColumn>({
      state: "idle",
      direction: undefined,
    });
    const [selectedTask, setSelectedTask] = useState<ITask | undefined>();
    const [isOpenAddTask, setIsOpenAddTask] = useState(false);

    const refState = useRef(dragState);

    useEffect(() => {
      refState.current = dragState;
    }, [dragState]);

    useEffect(() => {
      const el = triggerRef;
      const dragEl = dragHandleRef.current;
      if (!el || !dragEl) return;

      return combine(
        draggable({
          element: dragEl,
          getInitialData: () => ({ type: "column", id }),
          onGenerateDragPreview({ nativeSetDragImage }) {
            setCustomNativeDragPreview({
              nativeSetDragImage,
              render({ container }) {
                if (!triggerRef) return;
                const cloned = triggerRef.cloneNode(true) as HTMLElement;
                cloned.style.width = triggerRef.clientWidth + "px";
                cloned.style.height = triggerRef.clientHeight + "px";
                container.appendChild(cloned);
                return () => null;
              },
            });
          },
          onDragStart: () =>
            setDragState({
              state: "dragging",
            }),
          onDrop: () =>
            setDragState({
              state: "idle",
            }),
        }),
        dropTargetForElements({
          element: el,
          getData: ({ input, element }) =>
            attachClosestEdge(
              { id },
              {
                input,
                element,
                allowedEdges: ["left", "right"],
              },
            ),
          canDrop: ({ source }) =>
            source.data.id !== id && source.data.type === "column",
          onDrag: (args) => {
            if (refState.current.state !== "over") return;

            const closestEdge = extractClosestEdge(args.self.data) as
              | "left"
              | "right";

            if (closestEdge !== refState.current.direction) {
              setDragState({
                state: "over",
                direction: closestEdge,
              });
            }
          },
          onDragEnter: () =>
            setDragState({
              state: "over",
              direction: "left",
            }),
          onDragLeave: () =>
            setDragState({
              state: "idle",
            }),
          onDrop: () =>
            setDragState({
              state: "idle",
            }),
        }),
      );
    }, [triggerRef, dragHandleRef, id]);

    const openAddTaskModal = () => {
      setIsOpenAddTask(true);
    };

    const closeAddTaskModal = () => {
      setIsOpenAddTask(false);
      setSelectedTask(undefined);
    };

    const lenItems = items?.length;

    const selectedAllItems = useMemo(
      () => !!lenItems && items?.every((item) => selectedItems?.[item.id]),
      [selectedItems, lenItems, items],
    );

    const toggleAllItems = (checked: boolean) => {
      const ids = items?.map((item) => item.id) || [];

      if (!ids.length) return;

      if (checked) {
        onChangeSelect(ids, true);
      } else {
        onChangeSelect(ids, false);
      }
    };

    const onEditTask = (id: string) => {
      const item: ITask | undefined =
        items?.find((item) => item.id === id) || undefined;

      if (item) {
        setSelectedTask(item);
        openAddTaskModal();
      }
    };

    const onCreateOrUpdateTask = (value: TItemValue) => {
      if (selectedTask) {
        onUpdateTask({
          ...selectedTask,
          ...value,
        });
      } else {
        onCreateTask(id, value);
      }
    };

    const filteredMoveItems = useMemo(
      () => moveItems.filter((item) => item.id !== id),
      [moveItems, id],
    );

    const menuItems = useMemo(() => {
      const currentIndex = moveItems.findIndex((item) => item.id === id);

      const prevItem = currentIndex > 0 ? moveItems[currentIndex - 1] : null;

      const nextItem =
        currentIndex < moveItems.length - 1
          ? moveItems[currentIndex + 1]
          : null;

      const moveBeforeItems = moveItems
        .filter((item) => item.id !== id && item.id !== nextItem?.id)
        .map((item) => ({
          label: item.name,
          onClick: () => onMoveColumn(id, item.id, "left"),
        }));

      const moveAfterItems = moveItems
        .filter((item) => item.id !== id && item.id !== prevItem?.id)
        .map((item) => ({
          label: item.name,
          onClick: () => onMoveColumn(id, item.id, "right"),
        }));

      return [
        {
          label: "Edit",
          icon: <IconEdit />,
          onClick: () => onEdit(data),
        },
        {
          label: "Move before",
          icon: <IconMoveGroup />,
          items: moveBeforeItems,
        },
        {
          label: "Move after",
          icon: <IconMoveGroup />,
          items: moveAfterItems,
        },
        {
          label: "Delete",
          icon: <IconDelete />,
          onClick: () => onDelete(id),
        },
      ];
    }, [onDelete, onEdit, onMoveColumn, moveItems, data, id]);

    return (
      <div
        className={cn(styles.column, className, {
          [styles[`column--${dragState.state}`]]: dragState.state,
          [styles[`column--${dragState.direction}`]]: dragState.direction,
        })}
        ref={(el) => {
          if (el !== triggerRef) {
            setTriggerRef(el);
          }
        }}
      >
        <div className={styles.column__header}>
          <div className={styles.column__info}>
            <ButtonIcon ref={dragHandleRef} className={styles.column__drag}>
              <IconDragIndicator />
            </ButtonIcon>
            {!!lenItems && (
              <FieldCheckbox
                value={selectedAllItems}
                onChange={(e) => {
                  const value = e.target.checked;
                  toggleAllItems(value);
                }}
              />
            )}

            <p className={styles.column__name}>{name}</p>
          </div>
          <Menu items={menuItems} />
        </div>
        <div className={styles.column__body}>
          {items?.map((item) => (
            <Card
              {...item}
              key={item.id}
              onDelete={onDeleteTask}
              onEdit={onEditTask}
              selected={!!selectedItems?.[item.id]}
              onChangeSelect={onChangeSelect}
              onChangeStatus={onChangeStatusTask}
              moveItems={filteredMoveItems}
              onMoveTask={onMoveTask}
            />
          ))}
        </div>
        <div className={styles.column__footer}>
          <Button fullWidth onClick={openAddTaskModal}>
            Create
          </Button>
          <CreateTaskModal
            isOpen={isOpenAddTask}
            onClose={closeAddTaskModal}
            initialData={selectedTask}
            isEdit={!!selectedTask}
            onSubmit={onCreateOrUpdateTask}
          />
        </div>
      </div>
    );
  },
);
