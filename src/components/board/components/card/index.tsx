import { memo, useEffect, useMemo, useRef, useState } from "react";

import cn from "classnames";

import type { Actions, ITask } from "@/context/types";
import { Menu } from "@/components/shared/menu";
import { IconDragIndicator } from "@/components/icons";
import { FieldCheckbox } from "@/components/shared/form/checkbox";
import { Highlighted } from "@/components/shared/highlighted";
import { ButtonIcon } from "@/components/shared/button";
import type { TDragStateTask } from "@/types/common";

import styles from "./style.module.scss";
import { handleDrag, prepareMenuItems } from "./utils";

interface Props extends ITask {
  selected: boolean;
  onChangeSelect: Actions["selectItem"];
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onChangeStatus: (id: string, value: boolean) => void;
  moveItems: { id: string; name: string }[];
  onMoveTask: Actions["moveTaskToColumn"];
}

export const Card: React.FC<Props> = memo(
  ({
    name,
    context,
    id,
    onDelete,
    selected,
    onChangeSelect,
    completed,
    onChangeStatus,
    onEdit,
    moveItems,
    onMoveTask,
  }) => {
    const [triggerRef, setTriggerRef] = useState<HTMLElement | null>(null);
    const dragHandleRef = useRef<HTMLButtonElement | null>(null);
    const [dragState, setDragState] = useState<TDragStateTask>({
      state: "idle",
      direction: undefined,
    });
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
    }, [triggerRef, id]);

    const actions = useMemo(
      () =>
        prepareMenuItems({
          id,
          moveItems,
          onDelete,
          onEdit,
          onMoveTask,
          completed,
          onChangeStatus,
        }),
      [completed, id, onDelete, onEdit, onChangeStatus, onMoveTask, moveItems],
    );

    return (
      <div
        ref={(el) => {
          if (el !== triggerRef) {
            setTriggerRef(el);
          }
        }}
        className={cn(styles.card, {
          [styles["card--completed"]]: completed,
          [styles[`card--${dragState.state}`]]: dragState.state,
          [styles[`card--${dragState.direction}`]]: dragState.direction,
        })}
      >
        <div className={styles.card__header}>
          <div className={styles.card__info}>
            <ButtonIcon ref={dragHandleRef} className={styles.card__drag}>
              <IconDragIndicator />
            </ButtonIcon>
            <FieldCheckbox
              value={selected}
              onChange={(e) => {
                const value = e.target.checked;
                onChangeSelect(id, value);
              }}
            />
            <Highlighted className={styles.card__name}>{name}</Highlighted>
          </div>
          <Menu items={actions} />
        </div>
        {!!context && (
          <Highlighted className={styles.card__context}>{context}</Highlighted>
        )}
      </div>
    );
  },
);
