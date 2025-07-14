import { defineExtension } from "@etrepum/lexical-builder";
import { ListItemNode, ListNode } from "@lexical/list";
import { registerList } from "./registerList";

export const ListExtension = defineExtension({
  name: "@etrepum/lexical-builder-list/List",
  nodes: [ListNode, ListItemNode],
  register: registerList,
});
