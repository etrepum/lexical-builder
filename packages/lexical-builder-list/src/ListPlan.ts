import { definePlan } from "@etrepum/lexical-builder";
import { ListItemNode, ListNode } from "@lexical/list";
import { registerList } from "./registerList";

export const ListPlan = definePlan({
  name: "@etrepum/lexical-builder-list/List",
  nodes: [ListNode, ListItemNode],
  register: registerList,
});
