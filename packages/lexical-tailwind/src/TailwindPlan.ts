import { declarePeerDependency, definePlan } from "@etrepum/lexical-builder";
import { type EditorThemeClasses } from "lexical";
import type { EmojiPlan } from "@etrepum/lexical-emoji-plan";

const checklistItemCommonClasses =
  // This [&]: is necessary to override the mx-8 from listitem since the theme is not designed for tailwind semantics (both sets of classes are applied)
  "relative [&]:mx-2 px-6 list-none outline-none before:w-4 before:h-4 before:top-0.5 before:left-0 before:cursor-pointer before:block before:bg-color before:absolute rtl:before:left-auto rtl:before:right-0 focus:before:shadow-[0_0_0_2px_#a6cdfe] before:rounded-sm";

const theme: EditorThemeClasses = {
  blockCursor:
    "block pointer-events-none absolute after:block after:absolute after:-top-0.5 after:width-5 after:border-t after:border-solid after:border-black after:animate-lexical-cursor-blink",
  // characterLimit: "PlaygroundEditorTheme__characterLimit",
  // code: 'PlaygroundEditorTheme__code',
  // codeHighlight: {
  //   atrule: 'PlaygroundEditorTheme__tokenAttr',
  //   attr: 'PlaygroundEditorTheme__tokenAttr',
  //   boolean: 'PlaygroundEditorTheme__tokenProperty',
  //   builtin: 'PlaygroundEditorTheme__tokenSelector',
  //   cdata: 'PlaygroundEditorTheme__tokenComment',
  //   char: 'PlaygroundEditorTheme__tokenSelector',
  //   class: 'PlaygroundEditorTheme__tokenFunction',
  //   'class-name': 'PlaygroundEditorTheme__tokenFunction',
  //   comment: 'PlaygroundEditorTheme__tokenComment',
  //   constant: 'PlaygroundEditorTheme__tokenProperty',
  //   deleted: 'PlaygroundEditorTheme__tokenProperty',
  //   doctype: 'PlaygroundEditorTheme__tokenComment',
  //   entity: 'PlaygroundEditorTheme__tokenOperator',
  //   function: 'PlaygroundEditorTheme__tokenFunction',
  //   important: 'PlaygroundEditorTheme__tokenVariable',
  //   inserted: 'PlaygroundEditorTheme__tokenSelector',
  //   keyword: 'PlaygroundEditorTheme__tokenAttr',
  //   namespace: 'PlaygroundEditorTheme__tokenVariable',
  //   number: 'PlaygroundEditorTheme__tokenProperty',
  //   operator: 'PlaygroundEditorTheme__tokenOperator',
  //   prolog: 'PlaygroundEditorTheme__tokenComment',
  //   property: 'PlaygroundEditorTheme__tokenProperty',
  //   punctuation: 'PlaygroundEditorTheme__tokenPunctuation',
  //   regex: 'PlaygroundEditorTheme__tokenVariable',
  //   selector: 'PlaygroundEditorTheme__tokenSelector',
  //   string: 'PlaygroundEditorTheme__tokenSelector',
  //   symbol: 'PlaygroundEditorTheme__tokenProperty',
  //   tag: 'PlaygroundEditorTheme__tokenProperty',
  //   url: 'PlaygroundEditorTheme__tokenOperator',
  //   variable: 'PlaygroundEditorTheme__tokenVariable',
  // },
  // embedBlock: {
  //   base: 'PlaygroundEditorTheme__embedBlock',
  //   focus: 'PlaygroundEditorTheme__embedBlockFocus',
  // },
  // hashtag: 'PlaygroundEditorTheme__hashtag',
  heading: {
    h1: "text-[24px] text-neutral-950 font-normal m-0",
    h2: "text-[15px] text-gray-500 font-bold m-0 uppercase",
    h3: "text-[12px] m-0 uppercase",
    h4: undefined,
    h5: undefined,
    h6: undefined,
  },
  // hr: 'PlaygroundEditorTheme__hr',
  // image: 'editor-image',
  indent: "[--lexical-indent-base-value:40px]",
  // inlineImage: 'inline-editor-image',
  // layoutContainer: 'PlaygroundEditorTheme__layoutContainer',
  // layoutItem: 'PlaygroundEditorTheme__layoutItem',
  link: "text-blue-600 hover:underline hover:cursor-pointer",
  list: {
    checklist: "",
    listitem: "mx-8",
    listitemChecked: `${checklistItemCommonClasses} line-through before:border before:border-solid before:border-[rgb(61,135,245)] before:bg-[#3d87f5] before:bg-no-repeat after:cursor-pointer after:border-white after:border-solid after:absolute after:block after:top-1.5 after:width-[3px] after:inset-x-[7px] after:height-1.5 after:rotate-45 after:border-t-0 after:border-r-0.5 after:border-b-0.5 after:border-l-0`,
    listitemUnchecked: `${checklistItemCommonClasses} before:border before:border-solid before:border-[#999]`,
    nested: {
      listitem: "list-none before:hidden after:hidden",
    },
    olDepth: [
      "p-0 m-0 list-outside list-decimal",
      "p-0 m-0 list-outside list-[upper-alpha]",
      "p-0 m-0 list-outside list-[lower-alpha]",
      "p-0 m-0 list-outside list-[upper-roman]",
      "p-0 m-0 list-outside list-[lower-roman]",
    ],
    ul: "p-0 m-0 list-outside list-disc",
  },
  ltr: "text-left",
  // mark: 'PlaygroundEditorTheme__mark',
  // markOverlap: 'PlaygroundEditorTheme__markOverlap',
  paragraph: "relative m-0",
  quote:
    "m-0 ml-5 mb-2.5 text-[15px] text-gray-500 border-slate-300 border-l-4 border-solid pl-4",
  rtl: "text-right",
  table:
    "border-collapse border-spacing-0 overflow-scroll table-fixed w-max mt-0 mr-[25px] mb-[30px] ml-0",
  tableCell:
    "border border-solid border-[#bbb] w-[75px] min-w-[75px] align-top text-start py-[6px] px-2 relative outline-none",
  tableCellEditing: "shadow-[0_0_5px_rgba(0,0,0,0.4)] rounded-[3px]",
  tableCellHeader: "bg-[#f2f3f5] text-start",
  tableSelection: "selection:bg-transparent",
  // tableAddColumns: 'absolute bg-[#eee] h-full border-0 cursor-pointer animate-lexical-table-controls',
  // tableAddRows: 'PlaygroundEditorTheme__tableAddRows',
  // tableCellActionButton: 'PlaygroundEditorTheme__tableCellActionButton',
  // tableCellActionButtonContainer:
  //   'PlaygroundEditorTheme__tableCellActionButtonContainer',
  // tableCellPrimarySelected: 'PlaygroundEditorTheme__tableCellPrimarySelected',
  // tableCellResizer: 'PlaygroundEditorTheme__tableCellResizer',
  // tableCellSelected: 'PlaygroundEditorTheme__tableCellSelected',
  // tableCellSortedIndicator: 'PlaygroundEditorTheme__tableCellSortedIndicator',
  // tableResizeRuler: 'PlaygroundEditorTheme__tableCellResizeRuler',
  // tableSelected: 'PlaygroundEditorTheme__tableSelected',
  text: {
    bold: "font-bold",
    code: "font-mono text-[94%] py-px px-1 background-color: bg-slate-100",
    italic: "italic",
    strikethrough: "line-through",
    subscript: "text-[0.8em] !align-sub",
    superscript: "text-[0.8em] align-super",
    underline: "underline",
    underlineStrikethrough: "[text-decoration:underline_line-through]",
  },
};

export const TailwindPlan = definePlan({
  name: "@etrepum/lexical-tailwind",
  theme,
  peerDependencies: [
    declarePeerDependency<typeof EmojiPlan>(
      "@etrepum/lexical-emoji-plan/Emoji",
      {
        // .emoji-node
        emojiClass:
          "caret-neutral-950 bg-no-repeat bg-contain bg-[0_0.25em] inline-block",
        // .emoji-node-loaded
        emojiLoadedClass: "text-transparent",
        // .emoji-node-loading
        emojiLoadingClass: "",
      },
    ),
  ],
});
