import type { RefObject } from "react";

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

import type { moveItem, TDragStateTask } from "@/types/common";
import type { MenuProps } from "@/components/shared/menu";
import {
  IconDelete,
  IconDone,
  IconEdit,
  IconMoveGroup,
  IconNotDone,
} from "@/components/icons";
import type { Actions } from "@/context/types";

export const prepareMenuItems = ({
  id,
  moveItems,
  onDelete,
  onEdit,
  onMoveTask,
  completed,
  onChangeStatus,
}: {
  id: string;
  moveItems: moveItem[];
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onMoveTask: Actions["moveTaskToColumn"];
  completed: boolean;
  onChangeStatus: (id: string, value: boolean) => void;
}) => {
  let arr: MenuProps["items"] = [
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

  if (moveItems.length) {
    arr.splice(-1, 0, {
      label: "Move to",
      icon: <IconMoveGroup />,
      items: moveItems.map((item) => ({
        label: item.name,
        onClick: () => onMoveTask(id, item.id),
      })),
    });
  }

  return arr;
};

export const handleDrag = ({
  id,
  dragEl,
  triggerEl,
  setDragState,
  state,
}: {
  id: string;
  dragEl: HTMLElement;
  triggerEl: HTMLElement;
  setDragState: React.Dispatch<React.SetStateAction<TDragStateTask>>;
  state: RefObject<TDragStateTask>;
}) =>
  combine(
    draggable({
      element: dragEl,
      getInitialData: () => ({ type: "task", id }),
      onGenerateDragPreview({ nativeSetDragImage }) {
        setCustomNativeDragPreview({
          nativeSetDragImage,
          render({ container }) {
            if (!triggerEl) return;
            const cloned = triggerEl.cloneNode(true) as HTMLElement;
            cloned.style.width = triggerEl.clientWidth + "px";
            cloned.style.height = triggerEl.clientHeight + "px";
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
      element: triggerEl,
      getData: ({ input, element }) =>
        attachClosestEdge(
          { id, type: "task" },
          {
            input,
            element,
            allowedEdges: ["top", "bottom"],
          },
        ),
      canDrop: ({ source }) =>
        source.data.id !== id && source.data.type === "task",
      onDrag: (args) => {
        if (state.current.state !== "over") return;

        const closestEdge = extractClosestEdge(args.self.data) as
          | "top"
          | "bottom";

        if (closestEdge !== state.current.direction) {
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
