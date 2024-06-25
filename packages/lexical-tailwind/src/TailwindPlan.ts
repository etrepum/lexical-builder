import { definePlan } from "@etrepum/lexical-builder";
import { type EditorThemeClasses } from "lexical";

const theme: EditorThemeClasses = {
  blockCursor:
    "block pointer-events-none absolute after:block after:absolute after:-top-0.5 after:width-5 after:border-t after:border-solid after:border-black",
};

export const TailwindPlan = definePlan({
  name: "@etrepum/lexical-tailwind",
  theme,
});
