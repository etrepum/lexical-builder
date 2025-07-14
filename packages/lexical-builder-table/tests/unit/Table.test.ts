import { buildEditorFromExtensions } from "@etrepum/lexical-builder";
import { describe, it, expect } from "vitest";
import {
  $isTableCellNode,
  $isTableNode,
  $isTableRowNode,
  INSERT_TABLE_COMMAND,
  type TableNode,
} from "@lexical/table";
import { $getRoot } from "lexical";
import { TableExtension } from "@etrepum/lexical-builder-table";

describe("Table", () => {
  it("Creates a table with INSERT_TABLE_COMMAND", () => {
    const editor = buildEditorFromExtensions(TableExtension);
    editor.update(
      () =>
        editor.dispatchCommand(INSERT_TABLE_COMMAND, {
          columns: "3",
          rows: "2",
          includeHeaders: true,
        }),
      { discrete: true },
    );
    editor.read(() => {
      const children = $getRoot().getChildren();
      expect(children.map((node) => node.getType())).toEqual([
        "paragraph",
        "table",
        "paragraph",
      ]);
      const table = children[1] as TableNode;
      expect($isTableNode(table)).toBe(true);
      const rows = table.getChildren();
      expect(rows.length).toBe(2);
      rows.forEach((row) => {
        expect($isTableRowNode(row)).toBe(true);
        if ($isTableRowNode(row)) {
          const cells = row.getChildren();
          expect(cells.length).toBe(3);
          expect(cells.every($isTableCellNode));
        }
      });
    });
  });
});
