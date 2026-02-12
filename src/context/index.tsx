import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { store } from "@/utils/store";

import type { AppState, Context, Actions, IColumn, IFilter } from "./types";

const AppContext = createContext<Context | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<AppState>(
    store.getData<AppState>() || { columns: [] },
  );
  const [selected, setSelected] = useState({});
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<IFilter>({});

  useEffect(() => {
    store.setData(state);
  }, [state]);

  const addColumn: Actions["addColumn"] = useCallback(
    (value) => {
      setState((prev) => ({
        ...prev,
        columns: [
          ...prev.columns,
          {
            id: crypto.randomUUID(),
            name: value.name,
            items: [],
            createdAt: Date.now(),
          },
        ],
      }));
    },
    [setState],
  );

  const deleteColumn: Actions["deleteColumn"] = useCallback(
    (columnID) => {
      setState((prev) => ({
        ...prev,
        columns: prev.columns.filter((column) => column.id !== columnID),
      }));
    },
    [setState],
  );

  const deleteTask: Actions["deleteTask"] = useCallback(
    (taskIDs) => {
      if (Array.isArray(taskIDs)) {
        setState((prev) => ({
          ...prev,
          columns: prev.columns.map((column) => ({
            ...column,
            items: column.items?.filter((item) => !taskIDs.includes(item.id)),
          })),
        }));

        setSelected((prev) => ({
          ...prev,
          ...taskIDs.reduce(
            (acc: Record<string, boolean>, id) => ({
              ...acc,
              [id]: false,
            }),
            {},
          ),
        }));
      } else {
        setState((prev) => ({
          ...prev,
          columns: prev.columns.map((column) => ({
            ...column,
            items: column.items?.filter((item) => item.id !== taskIDs),
          })),
        }));

        setSelected({});
      }
    },
    [setState, setSelected],
  );

  const addTask: Actions["addTask"] = useCallback(
    (columnID, item) => {
      setState((prev) => ({
        ...prev,
        columns: prev.columns.map((column) => {
          if (column.id === columnID) {
            return {
              ...column,
              items: [
                ...(column.items || []),
                {
                  id: crypto.randomUUID(),
                  name: item.name,
                  context: item.context || "",
                  completed: false,
                  createdAt: Date.now(),
                },
              ],
            };
          }
          return column;
        }),
      }));
    },
    [setState],
  );

  const updateTask: Actions["updateTask"] = useCallback(
    (item) => {
      setState((prev) => ({
        ...prev,
        columns: prev.columns.map((column) => ({
          ...column,
          items: column.items?.map((elem) => {
            if (elem.id === item.id) {
              return item;
            }
            return elem;
          }),
        })),
      }));
    },
    [setState],
  );

  const changeStatusTask: Actions["changeStatusTask"] = useCallback(
    (ids, value) => {
      setState((prev) => ({
        ...prev,
        columns: prev.columns.map((column) => ({
          ...column,
          items: column.items?.map((item) => {
            if (ids.includes(item.id)) {
              return {
                ...item,
                completed: value,
              };
            }
            return item;
          }),
        })),
      }));
    },
    [setState],
  );

  const selectItem: Actions["selectItem"] = useCallback(
    (ids, value) => {
      if (Array.isArray(ids)) {
        setSelected((prev) => ({
          ...prev,
          ...ids.reduce(
            (acc: Record<string, boolean>, ids) => ({
              ...acc,
              [ids]: value,
            }),
            {},
          ),
        }));
      } else {
        setSelected((prev) => ({
          ...prev,
          [ids]: value,
        }));
      }
    },
    [setSelected],
  );

  const moveTaskToColumn: Actions["moveTaskToColumn"] = useCallback(
    (ids, targetColumnId) => {
      setState((prev) => {
        const tasksToMove = prev.columns.flatMap(
          (column) =>
            column.items?.filter((item) => ids.includes(item.id)) ?? [],
        );

        if (tasksToMove.length === 0) return prev;

        return {
          ...prev,
          columns: prev.columns.map((column) => {
            const newItems = column.items?.filter(
              (item) => !ids.includes(item.id),
            );

            if (column.id === targetColumnId) {
              return {
                ...column,
                items: [...(newItems ?? []), ...tasksToMove],
              };
            }

            return {
              ...column,
              items: newItems,
            };
          }),
        };
      });

      if (Array.isArray(ids)) {
        setSelected({});
      }
    },
    [setState],
  );

  const updateColumn = useCallback(
    (column: IColumn) => {
      setState((prev) => ({
        ...prev,
        columns: prev.columns.map((col) => {
          if (col.id === column.id) {
            return column;
          }
          return col;
        }),
      }));
    },
    [setState],
  );

  const moveColumn: Actions["moveColumn"] = useCallback(
    (columnId, targetColumnId, direction) => {
      setState((prev) => {
        const columns = prev.columns;

        const fromIndex = columns.findIndex((c) => c.id === columnId);
        const targetIndex = columns.findIndex((c) => c.id === targetColumnId);

        if (
          fromIndex === -1 ||
          targetIndex === -1 ||
          fromIndex === targetIndex
        ) {
          return prev;
        }

        const nextColumns = [...columns];
        const [moved] = nextColumns.splice(fromIndex, 1);

        let insertIndex: number;

        if (direction === "left") {
          insertIndex = fromIndex < targetIndex ? targetIndex - 1 : targetIndex;
        } else {
          insertIndex = fromIndex < targetIndex ? targetIndex : targetIndex + 1;
        }

        nextColumns.splice(insertIndex, 0, moved);

        return {
          ...prev,
          columns: nextColumns,
        };
      });
    },
    [setState],
  );

  const moveTask: Actions["moveTask"] = useCallback(
    (taskId, targetTaskId, direction) => {
      setState((prev) => {
        let sourceColumnIndex = -1;
        let targetColumnIndex = -1;
        let sourceTaskIndex = -1;
        let targetTaskIndex = -1;

        prev.columns.forEach((column, colIndex) => {
          const items = column.items ?? [];

          items.forEach((task, taskIndex) => {
            if (task.id === taskId) {
              sourceColumnIndex = colIndex;
              sourceTaskIndex = taskIndex;
            }

            if (task.id === targetTaskId) {
              targetColumnIndex = colIndex;
              targetTaskIndex = taskIndex;
            }
          });
        });

        if (
          sourceColumnIndex === -1 ||
          targetColumnIndex === -1 ||
          sourceTaskIndex === -1 ||
          targetTaskIndex === -1
        ) {
          return prev;
        }

        const nextColumns = [...prev.columns];

        const sourceItems = [...(nextColumns[sourceColumnIndex].items ?? [])];
        const targetItems =
          sourceColumnIndex === targetColumnIndex
            ? sourceItems
            : [...(nextColumns[targetColumnIndex].items ?? [])];

        const [movedTask] = sourceItems.splice(sourceTaskIndex, 1);

        let insertIndex: number;

        if (direction === "top") {
          insertIndex =
            sourceColumnIndex === targetColumnIndex &&
            sourceTaskIndex < targetTaskIndex
              ? targetTaskIndex - 1
              : targetTaskIndex;
        } else {
          // bottom
          insertIndex =
            sourceColumnIndex === targetColumnIndex &&
            sourceTaskIndex < targetTaskIndex
              ? targetTaskIndex
              : targetTaskIndex + 1;
        }

        targetItems.splice(insertIndex, 0, movedTask);

        nextColumns[sourceColumnIndex] = {
          ...nextColumns[sourceColumnIndex],
          items: sourceItems,
        };

        nextColumns[targetColumnIndex] = {
          ...nextColumns[targetColumnIndex],
          items: targetItems,
        };

        return {
          ...prev,
          columns: nextColumns,
        };
      });
    },
    [setState],
  );

  const changeSearch = useCallback(
    (value: string) => {
      setSearch(value);
    },
    [setSearch],
  );

  const changeFilter: Actions["changeFilter"] = useCallback(
    (key, value) => {
      setFilter((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    [setFilter],
  );

  const newState = useMemo(() => {
    const tempState = {
      ...state,
    };

    if (filter.status !== undefined) {
      const { status } = filter;

      tempState.columns = state.columns.map((column) => ({
        ...column,
        items: column.items?.filter((item) => item.completed === status),
      }));
    }

    return tempState;
  }, [state, filter]);

  const value = {
    state: newState,
    selected,
    search,
    filter,
    actions: {
      addColumn,
      updateTask,
      addTask,
      deleteColumn,
      deleteTask,
      selectItem,
      changeStatusTask,
      moveTaskToColumn,
      moveTask,
      updateColumn,
      changeSearch,
      moveColumn,
      changeFilter,
    },
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useContextApp = (): Context => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useContextApp must be used within AppProvider");
  }
  return context;
};
