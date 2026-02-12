import type { PickPartial } from "@/utils/types";

export interface ITask {
  id: string;
  name: string;
  context: string;
  completed: boolean;
  createdAt: number;
}

export interface IColumn {
  id: string;
  name: string;
  items?: ITask[];
  createdAt: number;
}

export interface AppState {
  columns: IColumn[];
}

export type TColumnValue = Pick<IColumn, "name">;

export type TItemValue = PickPartial<
  Pick<ITask, "name" | "context">,
  "context"
>;

export type IFilterValue = string | undefined | boolean;
export type IFilter = Record<string, IFilterValue>;

export interface Actions {
  addColumn: (name: TColumnValue) => void;
  updateColumn: (column: IColumn) => void;
  deleteColumn: (columnId: IColumn["id"]) => void;
  addTask: (columnId: IColumn["id"], item: TItemValue) => void;
  deleteTask: (taskId: ITask["id"] | ITask["id"][]) => void;
  updateTask: (item: ITask) => void;
  selectItem: (taskId: ITask["id"] | ITask["id"][], value: boolean) => void;
  changeStatusTask: (
    taskId: ITask["id"] | ITask["id"][],
    value: boolean,
  ) => void;
  moveTaskToColumn: (
    taskId: ITask["id"] | ITask["id"][],
    columnId: IColumn["id"],
  ) => void;
  changeSearch: (value: string) => void;
  moveColumn: (
    columnId: IColumn["id"],
    targetColumnId: IColumn["id"],
    direction: "left" | "right",
  ) => void;
  moveTask: (
    taskId: ITask["id"],
    targetTaskId: ITask["id"],
    direction: "top" | "bottom",
  ) => void;
  changeFilter: (key: string, value: IFilterValue) => void;
}

export interface Context {
  state: AppState;
  selected: Record<string, boolean>;
  actions: Actions;
  filter: IFilter;
  search: string;
}
