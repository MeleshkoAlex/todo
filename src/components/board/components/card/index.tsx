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

import type { Actions, ITask } from "@/context/types";
import { Menu } from "@/components/shared/menu";
import {
  IconDelete,
  IconDone,
  IconDragIndicator,
  IconEdit,
  IconMoveGroup,
  IconNotDone,
} from "@/components/icons";
import { FieldCheckbox } from "@/components/shared/form/checkbox";
import { Highlighted } from "@/components/shared/highlighted";
import { ButtonIcon } from "@/components/shared/button";
import type { TDragStateTask } from "@/types/common";

import styles from "./style.module.scss";

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
      const el = triggerRef;
      const dragEl = dragHandleRef.current;

      if (!el || !dragEl) return;

      return combine(
        draggable({
          element: dragEl,
          getInitialData: () => ({ type: "task", id }),
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
                allowedEdges: ["top", "bottom"],
              },
            ),
          canDrop: ({ source }) =>
            source.data.id !== id && source.data.type === "task",
          onDrag: (args) => {
            if (refState.current.state !== "over") return;

            const closestEdge = extractClosestEdge(args.self.data) as
              | "top"
              | "bottom";

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
              direction: "top",
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
    }, [triggerRef, id]);

    const actions = useMemo(() => {
      let arr = [
        {
          label: "Move to",
          icon: <IconMoveGroup />,
          items: moveItems.map((item) => ({
            label: item.name,
            onClick: () => onMoveTask(id, item.id),
          })),
        },
        {
          label: "Delete",
          icon: <IconDelete />,
          onClick: () => onDelete(id),
        },
      ];

      if (!completed) {
        arr = [
          {
            label: "Complete",
            icon: <IconDone />,
            onClick: () => onChangeStatus(id, true),
          },
          {
            label: "Edit",
            icon: <IconEdit />,
            onClick: () => onEdit(id),
          },
          ...arr,
        ];
      } else {
        arr = [
          {
            label: "Incomplete",
            icon: <IconNotDone />,
            onClick: () => onChangeStatus(id, false),
          },
          ...arr,
        ];
      }

      return arr;
    }, [
      completed,
      id,
      onDelete,
      onEdit,
      onChangeStatus,
      onMoveTask,
      moveItems,
    ]);

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
