export type TDragState = "dragging" | "over" | "idle";

export type TDragHorizontalDirection = "left" | "right";

export type TDragVerticalDirection = "top" | "bottom";

export type IDragDirection = TDragHorizontalDirection | TDragVerticalDirection;

export type TDragStateColumn = {
  state: TDragState;
  direction?: TDragHorizontalDirection;
};

export type TDragStateTask = {
  state: TDragState;
  direction?: TDragVerticalDirection;
};
