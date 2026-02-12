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

import { IconDelete, IconEdit, IconMoveGroup } from "@/components/icons";
import type { MenuProps } from "@/components/shared/menu";
import type { Actions, IColumn } from "@/context/types";
import type { moveItem, TDragStateColumn } from "@/types/common";

export const prepareMenuItems = ({
  id,
  moveItems,
  dataColumn,
  onDelete,
  onEdit,
  onMoveColumn,
}: {
  id: string;
  moveItems: moveItem[];
  dataColumn: IColumn;
  onDelete: (id: string) => void;
  onEdit: (column: IColumn) => void;
  onMoveColumn: Actions["moveColumn"];
}) => {
  const currentIndex = moveItems.findIndex((item) => item.id === id);

  const prevItem = currentIndex > 0 ? moveItems[currentIndex - 1] : null;

  const nextItem =
    currentIndex < moveItems.length - 1 ? moveItems[currentIndex + 1] : null;

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

  const arr: MenuProps["items"] = [
    {
      label: "Edit",
      icon: <IconEdit />,
      onClick: () => onEdit(dataColumn),
    },
    {
      label: "Delete",
      icon: <IconDelete />,
      onClick: () => onDelete(id),
    },
  ];

  if (moveAfterItems.length) {
    arr.splice(1, 0, {
      label: "Move after",
      icon: <IconMoveGroup />,
      items: moveAfterItems,
    });
  }

  if (moveBeforeItems.length) {
    arr.splice(1, 0, {
      label: "Move before",
      icon: <IconMoveGroup />,
      items: moveBeforeItems,
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
  setDragState: React.Dispatch<React.SetStateAction<TDragStateColumn>>;
  state: RefObject<TDragStateColumn>;
}) =>
  combine(
    draggable({
      element: dragEl,
      getInitialData: () => ({ type: "column", id }),
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
          { id, type: "column" },
          {
            input,
            element,
            allowedEdges: ["left", "right"],
          },
        ),
      canDrop: ({ source }) =>
        source.data.id !== id &&
        (source.data.type === "task" || source.data.type === "column"),

      onDrag: (args) => {
        if (state.current.state !== "over") return;

        const closestEdge = extractClosestEdge(args.self.data) as
          | "left"
          | "right";

        if (closestEdge !== state.current.direction) {
          setDragState({
            state: "over",
            direction: closestEdge,
          });
        }
      },
      onDragEnter: ({ source }) => {
        setDragState({
          state: "over",
          direction: "left",
          type: source.data.type as "task" | "column",
        });
      },
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
