import { definePlan } from "@etrepum/lexical-builder";
import { $createLineBreakNode } from "lexical";

export const SlackPastePlan = definePlan({
  name: "SlackPastePlan",
  html: {
    import: {
      span: (node) => {
        if (
          node.nodeName === "SPAN" &&
          node.getAttribute("data-stringify-type") === "paragraph-break"
        ) {
          return {
            conversion: () => ({
              node: [$createLineBreakNode(), $createLineBreakNode()],
            }),
            priority: 4,
          };
        }
        return null;
      },
    },
  },
});
