import { definePlan } from "@etrepum/lexical-builder";
import { type EditorThemeClasses } from "lexical";

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
  // indent: 'PlaygroundEditorTheme__indent',
  // inlineImage: 'inline-editor-image',
  // layoutContainer: 'PlaygroundEditorTheme__layoutContainer',
  // layoutItem: 'PlaygroundEditorTheme__layoutItem',
  // link: 'PlaygroundEditorTheme__link',
  // list: {
  //   checklist: 'PlaygroundEditorTheme__checklist',
  //   listitem: 'PlaygroundEditorTheme__listItem',
  //   listitemChecked: 'PlaygroundEditorTheme__listItemChecked',
  //   listitemUnchecked: 'PlaygroundEditorTheme__listItemUnchecked',
  //   nested: {
  //     listitem: 'PlaygroundEditorTheme__nestedListItem',
  //   },
  //   olDepth: [
  //     'PlaygroundEditorTheme__ol1',
  //     'PlaygroundEditorTheme__ol2',
  //     'PlaygroundEditorTheme__ol3',
  //     'PlaygroundEditorTheme__ol4',
  //     'PlaygroundEditorTheme__ol5',
  //   ],
  //   ul: 'PlaygroundEditorTheme__ul',
  // },
  ltr: "text-left",
  // mark: 'PlaygroundEditorTheme__mark',
  // markOverlap: 'PlaygroundEditorTheme__markOverlap',
  paragraph: "relative m-0",
  quote:
    "m-0 ml-5 mb-2.5 text-[15px] text-gray-500 border-slate-300 border-l-4 border-solid pl-4",
  rtl: "text-right",
  // table: 'PlaygroundEditorTheme__table',
  // tableAddColumns: 'PlaygroundEditorTheme__tableAddColumns',
  // tableAddRows: 'PlaygroundEditorTheme__tableAddRows',
  // tableCell: 'PlaygroundEditorTheme__tableCell',
  // tableCellActionButton: 'PlaygroundEditorTheme__tableCellActionButton',
  // tableCellActionButtonContainer:
  //   'PlaygroundEditorTheme__tableCellActionButtonContainer',
  // tableCellEditing: 'PlaygroundEditorTheme__tableCellEditing',
  // tableCellHeader: 'PlaygroundEditorTheme__tableCellHeader',
  // tableCellPrimarySelected: 'PlaygroundEditorTheme__tableCellPrimarySelected',
  // tableCellResizer: 'PlaygroundEditorTheme__tableCellResizer',
  // tableCellSelected: 'PlaygroundEditorTheme__tableCellSelected',
  // tableCellSortedIndicator: 'PlaygroundEditorTheme__tableCellSortedIndicator',
  // tableResizeRuler: 'PlaygroundEditorTheme__tableCellResizeRuler',
  // tableSelected: 'PlaygroundEditorTheme__tableSelected',
  // tableSelection: 'PlaygroundEditorTheme__tableSelection',
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
});
