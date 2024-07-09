import { definePlan } from "@etrepum/lexical-builder";
import { $createLineBreakNode, $createTextNode } from "lexical";

export const SlackPastePlan = definePlan({
  name: "SlackPastePlan",
  html: {
    import: {
      img: (node) => {
        const emoji = node.getAttribute("data-stringify-emoji");
        if (emoji) {
          return {
            conversion: () => ({
              node: $createTextNode(emoji),
            }),
            priority: 4,
          };
        }
        return null;
      },
      span: (node) => {
        if (node.getAttribute("data-stringify-type") === "paragraph-break") {
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
