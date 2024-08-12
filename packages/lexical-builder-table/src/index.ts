/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {
  HTMLTableElementWithWithTableSelectionState,
  InsertTableCommandPayload,
  TableObserver,
} from "@lexical/table";
import type { NodeKey } from "lexical";
import {
  $computeTableMap,
  $computeTableMapSkipCellCheck,
  $createTableCellNode,
  $createTableNodeWithDimensions,
  $getNodeTriplet,
  $isTableCellNode,
  $isTableNode,
  $isTableRowNode,
  applyTableHandlers,
  INSERT_TABLE_COMMAND,
  TableCellNode,
  TableNode,
  TableRowNode,
} from "@lexical/table";
import {
  $insertFirst,
  $insertNodeToNearestRoot,
  mergeRegister,
} from "@lexical/utils";
import {
  $createParagraphNode,
  $getNodeByKey,
  $isTextNode,
  COMMAND_PRIORITY_EDITOR,
} from "lexical";
import {
  definePlan,
  registerStoreToggle,
  safeCast,
  Store,
} from "@etrepum/lexical-builder";
import invariant from "./shared/invariant";

export const PACKAGE_VERSION: string = import.meta.env.PACKAGE_VERSION;

export interface TableConfig {
  hasCellMerge: boolean;
  hasCellBackgroundColor: boolean;
  hasTabHandler: boolean;
}

export const TablePlan = definePlan({
  name: "@lexical/table",
  nodes: [TableNode, TableRowNode, TableCellNode],
  config: safeCast<TableConfig>({
    hasCellMerge: true,
    hasCellBackgroundColor: true,
    hasTabHandler: true,
  }),
  init(_editorConfig, config) {
    return {
      hasCellMerge: new Store(config.hasCellMerge),
      hasCellBackgroundColor: new Store(config.hasCellBackgroundColor),
      hasTabHandler: new Store(config.hasTabHandler),
    };
  },
  register(editor, _config, state) {
    const { hasCellMerge, hasCellBackgroundColor, hasTabHandler } =
      state.getInitResult();
    return mergeRegister(
      editor.registerCommand<InsertTableCommandPayload>(
        INSERT_TABLE_COMMAND,
        ({ columns, rows, includeHeaders }) => {
          const tableNode = $createTableNodeWithDimensions(
            Number(rows),
            Number(columns),
            includeHeaders,
          );
          $insertNodeToNearestRoot(tableNode);

          const firstDescendant = tableNode.getFirstDescendant();
          if ($isTextNode(firstDescendant)) {
            firstDescendant.select();
          }

          return true;
        },
        COMMAND_PRIORITY_EDITOR,
      ),
      editor.registerNodeTransform(TableNode, (node) => {
        const [gridMap] = $computeTableMapSkipCellCheck(node, null, null);
        let maxRowLength = 0;
        for (const row of gridMap) {
          maxRowLength = Math.max(maxRowLength, row.length);
        }
        for (const row of gridMap) {
          const rowLength = row.length;
          if (rowLength === maxRowLength || rowLength === 0) {
            continue;
          }
          const lastCellMap = row[rowLength - 1]!;
          const lastRowCell = lastCellMap.cell;
          for (let j = rowLength; j < maxRowLength; ++j) {
            // TODO: inherit header state from another header or body
            const newCell = $createTableCellNode(0);
            newCell.append($createParagraphNode());
            lastRowCell.insertAfter(newCell);
          }
        }
      }),
      registerStoreToggle(
        hasTabHandler,
        // Returning true mimics useEffect, we will call the register
        // function any time the value changes
        () => true,
        () => {
          const hasTabHandlerValue = hasTabHandler.get();
          const tableSelections = new Map<NodeKey, TableObserver>();

          const initializeTableNode = (tableNode: TableNode) => {
            const nodeKey = tableNode.getKey();
            const tableElement = editor.getElementByKey(
              nodeKey,
            ) as HTMLTableElementWithWithTableSelectionState | null;
            if (tableElement && !tableSelections.has(nodeKey)) {
              const tableSelection = applyTableHandlers(
                tableNode,
                tableElement,
                editor,
                hasTabHandlerValue,
              );
              tableSelections.set(nodeKey, tableSelection);
            }
          };

          return mergeRegister(
            editor.registerMutationListener(
              TableNode,
              (nodeMutations) => {
                for (const [nodeKey, mutation] of nodeMutations) {
                  if (mutation === "created") {
                    editor.getEditorState().read(() => {
                      const tableNode = $getNodeByKey<TableNode>(nodeKey);
                      if ($isTableNode(tableNode)) {
                        initializeTableNode(tableNode);
                      }
                    });
                  } else if (mutation === "destroyed") {
                    const tableSelection = tableSelections.get(nodeKey);

                    if (tableSelection !== undefined) {
                      tableSelection.removeListeners();
                      tableSelections.delete(nodeKey);
                    }
                  }
                }
              },
              { skipInitialization: false },
            ),
            // Hook might be called multiple times so cleaning up tables listeners as well,
            // as it'll be reinitialized during recurring call
            () => {
              for (const [, tableSelection] of tableSelections) {
                tableSelection.removeListeners();
              }
            },
          );
        },
      ),
      registerStoreToggle(
        hasCellMerge,
        (v) => v,
        () =>
          editor.registerNodeTransform(TableCellNode, (node) => {
            if (node.getColSpan() > 1 || node.getRowSpan() > 1) {
              // When we have rowSpan we have to map the entire Table to understand where the new Cells
              // fit best; let's analyze all Cells at once to save us from further transform iterations
              const [, , gridNode] = $getNodeTriplet(node);
              const [gridMap] = $computeTableMap(gridNode, node, node);
              let row = gridNode.getFirstChild();
              invariant(
                $isTableRowNode(row),
                "Expected TableNode first child to be a RowNode",
              );
              // TODO this function expects Tables to be normalized. Look into this once it exists
              const rowsCount = gridMap.length;
              const columnsCount = gridMap[0]!.length;
              const unmerged = [];
              for (let i = 0; i < rowsCount; i++) {
                if (i !== 0) {
                  row = row.getNextSibling();
                  invariant(
                    $isTableRowNode(row),
                    "Expected TableNode first child to be a RowNode",
                  );
                }
                let lastRowCell: null | TableCellNode = null;
                for (let j = 0; j < columnsCount; j++) {
                  const cellMap = gridMap[i]![j]!;
                  const cell = cellMap.cell;
                  if (cellMap.startRow === i && cellMap.startColumn === j) {
                    lastRowCell = cell;
                    unmerged.push(cell);
                  } else if (cell.getColSpan() > 1 || cell.getRowSpan() > 1) {
                    invariant(
                      $isTableCellNode(cell),
                      "Expected TableNode cell to be a TableCellNode",
                    );
                    const newCell = $createTableCellNode(cell.__headerState);
                    if (lastRowCell !== null) {
                      lastRowCell.insertAfter(newCell);
                    } else {
                      $insertFirst(row, newCell);
                    }
                  }
                }
              }
              for (const cell of unmerged) {
                cell.setColSpan(1);
                cell.setRowSpan(1);
              }
            }
          }),
      ),
      registerStoreToggle(
        hasCellBackgroundColor,
        (v) => v,
        () =>
          editor.registerNodeTransform(TableCellNode, (node) => {
            if (node.getBackgroundColor() !== null) {
              node.setBackgroundColor(null);
            }
          }),
      ),
    );
  },
});
