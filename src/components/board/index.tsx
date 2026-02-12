import { useCallback, useEffect, useMemo, useState } from "react";

import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";

import type {
  Actions,
  IColumn,
  IFilterValue,
  TColumnValue,
} from "@/context/types";
import { Button } from "@/components/shared/button/base";
import { asyncConfirm } from "@/components/shared/asyncConfirm";
import { FieldInput } from "@/components/shared/form/input";
import { useContextApp } from "@/context";
import { Menu } from "@/components/shared/menu";
import { getEdgeHorizontal, getEdgeVertical } from "@/utils/helper";
import {
  IconDelete,
  IconDone,
  IconFilter,
  IconMoveGroup,
  IconNotDone,
} from "@/components/icons";

import { Column } from "./components/column";
import { CreateColumnModal } from "./components/modals/createColumn";
import styles from "./style.module.scss";

export const Board = () => {
  const context = useContextApp();

  const [scrollableRef, setScrollableRef] = useState<HTMLDivElement | null>(
    null,
  );

  const [selectedColumn, setSelectedColumn] = useState<IColumn | undefined>(
    undefined,
  );

  const [isOpenModalColumn, setIsOpenModalColumn] = useState(false);

  useEffect(() => {
    const element = scrollableRef;
    if (!element) return;

    return combine(
      monitorForElements({
        canMonitor({ source }) {
          const type = source.data.type;
          return type === "column" || type === "task";
        },
        onDrop({ source, location }) {
          const destination = location.current.dropTargets[0];
          if (!destination) {
            return;
          }

          const closestEdge = extractClosestEdge(destination.data);

          const destinationId = destination.data.id;
          const startId = source.data.id;

          if (typeof destinationId !== "string") {
            return;
          }

          if (typeof startId !== "string") {
            return;
          }

          if (source.data.type === "column") {
            context.actions.moveColumn(
              startId,
              destinationId,
              getEdgeHorizontal(closestEdge),
            );
          }

          if (source.data.type === "task") {
            context.actions.moveTask(
              startId,
              destinationId,
              getEdgeVertical(closestEdge),
            );
          }
        },
      }),
    );
  }, [scrollableRef]);

  const selectedIds = useMemo(
    () =>
      Object.entries(context.selected)
        .filter((item) => item[1])
        .map((item) => item[0]),
    [context.selected],
  );

  const onCreateColumn = (value?: TColumnValue) => {
    if (value) {
      context.actions.addColumn(value);
    }
  };

  const onDeleteColumn = useCallback(
    async (columnId: string) => {
      const result = await asyncConfirm({
        message: "Delete this column?",
      });

      if (result) {
        context.actions.deleteColumn(columnId);
      }
    },
    [context.actions],
  );

  const onDeleteTask = useCallback(
    async (taskId: string | string[], text?: string) => {
      const result = await asyncConfirm({
        message: text || "Delete this task?",
      });

      if (result) {
        context.actions.deleteTask(taskId);
      }
    },
    [context.actions],
  );

  const onDeleteSelected = () => {
    onDeleteTask(selectedIds, "Delete selected tasks?");
  };

  const onCompleteTask = () => {
    context.actions.changeStatusTask(selectedIds, true);
  };

  const onIncompleteTask = () => {
    context.actions.changeStatusTask(selectedIds, false);
  };

  const onChangeStatusTask: Actions["changeStatusTask"] = (id, value) => {
    context.actions.changeStatusTask(id, value);
  };

  const onOpenAddColumnModal = () => {
    setIsOpenModalColumn(true);
  };

  const onCloseAddColumnModal = () => {
    setIsOpenModalColumn(false);
    setSelectedColumn(undefined);
  };

  const hasSelected = !!selectedIds?.length;

  const moveItems = useMemo(
    () =>
      context.state.columns.map((column) => ({
        id: column.id,
        name: column.name,
      })),
    [context.state.columns],
  );

  const moveToOptions = useMemo(
    () =>
      context.state.columns.map((column) => ({
        label: column.name,
        onClick: () => {
          context.actions.moveTaskToColumn(selectedIds, column.id);
        },
      })),
    [context.state.columns, context.actions, selectedIds],
  );

  const filterStatus = context.filter?.status;

  const onChangeStatusFilter = (value: IFilterValue) => {
    context.actions.changeFilter("status", value);
  };

  const filterOptions = [
    {
      label: "Status",
      items: [
        {
          label: "All",
          onClick: () => {
            onChangeStatusFilter(undefined);
          },
        },
        {
          label: "Completed",
          isActive: filterStatus === true,
          onClick: () => {
            onChangeStatusFilter(true);
          },
        },
        {
          label: "Incomplete",
          isActive: filterStatus === false,
          onClick: () => {
            onChangeStatusFilter(false);
          },
        },
      ],
    },
  ];

  const onCreateOrUpdateColumn = (value: TColumnValue) => {
    if (selectedColumn) {
      context.actions.updateColumn({
        ...selectedColumn,
        ...value,
      });
    } else {
      onCreateColumn(value);
    }
  };

  const onSelectColumn = (column: IColumn) => {
    setSelectedColumn(column);
    onOpenAddColumnModal();
  };

  const onChangeSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    context.actions.changeSearch(value);
  };

  const countFilters = useMemo(
    () =>
      Object.values(context.filter).filter(
        (item) => item !== undefined && item !== null,
      ).length,
    [context.filter],
  );

  return (
    <>
      <div className={styles.container}>
        <div className={styles.header}>Todo</div>
        <div className={styles.toolbar}>
          <Button onClick={onOpenAddColumnModal}>Add column</Button>
          <FieldInput
            name="search"
            placeholder="Search"
            value={context.search}
            onChange={onChangeSearch}
          />

          <Menu
            buttonOptions={{
              variant: "border",
              children: countFilters ? (
                <span className={styles.filter_count}>{countFilters}</span>
              ) : null,
              icon: <IconFilter />,
            }}
            items={filterOptions}
          />

          <Button
            onClick={onDeleteSelected}
            disabled={!hasSelected}
            variant="border"
            icon={<IconDelete />}
          >
            Delete selected
          </Button>
          <Button
            onClick={onCompleteTask}
            disabled={!hasSelected}
            variant="border"
            icon={<IconDone />}
          >
            Complete selected
          </Button>

          <Button
            onClick={onIncompleteTask}
            disabled={!hasSelected}
            variant="border"
            icon={<IconNotDone />}
          >
            Incomplete selected
          </Button>

          <Menu
            buttonOptions={{
              disabled: !hasSelected,
              variant: "border",
              children: "Move to column",
              icon: <IconMoveGroup />,
            }}
            items={moveToOptions}
          />
        </div>
        <div
          className={styles.workspace}
          ref={(ref) => {
            if (ref !== scrollableRef) {
              setScrollableRef(ref);
            }
          }}
        >
          <div className={styles.workspace__inner}>
            {context.state.columns.map((column) => (
              <Column
                key={column.id}
                className={styles.column}
                selectedItems={context.selected}
                onChangeSelect={context.actions.selectItem}
                onCreateTask={context.actions.addTask}
                onDelete={onDeleteColumn}
                onUpdateTask={context.actions.updateTask}
                onDeleteTask={onDeleteTask}
                onChangeStatusTask={onChangeStatusTask}
                moveItems={moveItems}
                onEdit={onSelectColumn}
                onMoveTask={context.actions.moveTaskToColumn}
                onMoveColumn={context.actions.moveColumn}
                data={column}
              />
            ))}
          </div>
        </div>
      </div>
      <CreateColumnModal
        isOpen={isOpenModalColumn}
        onClose={onCloseAddColumnModal}
        onSubmit={onCreateOrUpdateColumn}
        isEdit={!!selectedColumn}
        initialData={selectedColumn}
      />
    </>
  );
};
