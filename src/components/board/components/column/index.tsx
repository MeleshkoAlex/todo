import { memo, useEffect, useMemo, useRef, useState } from "react";

import cn from "classnames";

import { Button } from "@/components/shared/button/base";
import type { Actions, IColumn, ITask, TItemValue } from "@/context/types";
import { IconDragIndicator } from "@/components/icons";
import { Menu } from "@/components/shared/menu";
import { FieldCheckbox } from "@/components/shared/form/checkbox";
import { ButtonIcon } from "@/components/shared/button";
import type { moveItem, TDragStateColumn } from "@/types/common";

import { Card } from "../card";
import { CreateTaskModal } from "../modals/createTask";

import styles from "./style.module.scss";
import { handleDrag, prepareMenuItems } from "./utils";

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
  moveItems: moveItem[];
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
    });
    const [selectedTask, setSelectedTask] = useState<ITask | undefined>();
    const [isOpenAddTask, setIsOpenAddTask] = useState(false);

    const refState = useRef(dragState);

    useEffect(() => {
      refState.current = dragState;
    }, [dragState]);

    useEffect(() => {
      const triggerEl = triggerRef;
      const dragEl = dragHandleRef.current;
      if (!triggerEl || !dragEl) return;

      return handleDrag({
        id,
        triggerEl,
        dragEl,
        setDragState,
        state: refState,
      });
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

    const menuItems = useMemo(
      () =>
        prepareMenuItems({
          id,
          moveItems,
          dataColumn: data,
          onDelete,
          onEdit,
          onMoveColumn,
        }),
      [onDelete, onEdit, onMoveColumn, moveItems, data, id],
    );

    return (
      <div
        className={cn(styles.column, className, {
          [styles[`column--${dragState.state}`]]: dragState.state,
          [styles[`column--${dragState.direction}`]]: dragState.direction,
          [styles[`column--drag-${dragState.type}`]]: dragState.type,
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
          {items?.length
            ? items.map((item) => (
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
              ))
            : dragState.type === "task" && (
                <div className={styles.column__drag_task_marker} />
              )}
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
