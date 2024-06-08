---
---

# Migration Guide

Migrating to Lexical Builder is designed to be seamless! Lexical Builder is
a higher-level API on top of the existing functionality you are already using.

Generally speaking, the only thing that needs to change is how you create the
editor. Everything else can be migrated (or not) at your own leisure, but
the result will be simpler and more composable if you do!

## Vanilla JS App

Before:

```ts
import { registerDragonSupport } from "@lexical/dragon";
import { createEmptyHistoryState, registerHistory } from "@lexical/history";
import { HeadingNode, QuoteNode, registerRichText } from "@lexical/rich-text";
import { mergeRegister } from "@lexical/utils";
import { createEditor } from "lexical";
import $prepopulatedRichText from "./$prepopulatedRichText";

const editorRef = document.getElementById("lexical-editor");
const stateRef = document.getElementById(
  "lexical-state",
) as HTMLTextAreaElement;

const initialConfig = {
  namespace: "Vanilla JS Demo",
  // Register nodes specific for @lexical/rich-text
  nodes: [HeadingNode, QuoteNode],
  onError: (error: Error) => {
    throw error;
  },
  theme: {
    // Adding styling to Quote node, see styles.css
    quote: "PlaygroundEditorTheme__quote",
  },
};
const editor = createEditor(initialConfig);
editor.setRootElement(editorRef);

// Registring Plugins
mergeRegister(
  registerRichText(editor),
  registerDragonSupport(editor),
  registerHistory(editor, createEmptyHistoryState(), 300),
);

editor.update(prepopulatedRichText, { tag: "history-merge" });
```

After (minimal changes):

```ts
import { registerDragonSupport } from "@lexical/dragon";
import { createEmptyHistoryState, registerHistory } from "@lexical/history";
import { HeadingNode, QuoteNode, registerRichText } from "@lexical/rich-text";
import { mergeRegister } from "@lexical/utils";
import { buildEditorFromPlans } from "@etrepum/lexical-builder";
import $prepopulatedRichText from "./$prepopulatedRichText";

const editorRef = document.getElementById("lexical-editor");
const stateRef = document.getElementById(
  "lexical-state",
) as HTMLTextAreaElement;

const editor = buildEditorFromPlans({
  namespace: "Vanilla JS Demo (with Lexical Builder)",
  // Register nodes specific for @lexical/rich-text
  nodes: [HeadingNode, QuoteNode],
  theme: {
    // Adding styling to Quote node, see styles.css
    quote: "PlaygroundEditorTheme__quote",
  },
});
editor.setRootElement(editorRef);

// Registring Plugins
mergeRegister(
  registerRichText(editor),
  registerDragonSupport(editor),
  registerHistory(editor, createEmptyHistoryState(), 300),
);

editor.update($prepopulatedRichText, { tag: "history-merge" });
```

After (all-in):

```ts
import {
  DragonPlan,
  HistoryPlan,
  RichTextPlan,
  buildEditorFromPlans,
} from "@etrepum/lexical-builder";
import prepopulatedRichText from "./prepopulatedRichText";

const editor = buildEditorFromPlans({
  $initialEditorState: $prepopulatedRichText,
  namespace: "Vanilla JS Demo (all-in with Lexical Builder)",
  dependencies: [RichTextPlan, DragonPlan, HistoryPlan],
  theme: {
    // Adding styling to Quote node, see styles.css
    quote: "PlaygroundEditorTheme__quote",
  },
});
editor.setRootElement(editorRef);
```

## React App

Before:

```tsx
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";

import ExampleTheme from "./ExampleTheme";
import ToolbarPlugin from "./plugins/ToolbarPlugin";
import TreeViewPlugin from "./plugins/TreeViewPlugin";

function Placeholder() {
  return <div className="editor-placeholder">Enter some rich text...</div>;
}

const editorConfig = {
  namespace: "React.js Demo",
  nodes: [],
  // Handling of errors during update
  onError(error: Error) {
    throw error;
  },
  // The editor theme
  theme: ExampleTheme,
};

export default function App() {
  return (
    <LexicalComposer initialConfig={editorConfig}>
      <div className="editor-container">
        <ToolbarPlugin />
        <div className="editor-inner">
          <RichTextPlugin
            contentEditable={<ContentEditable className="editor-input" />}
            placeholder={<Placeholder />}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <AutoFocusPlugin />
          <TreeViewPlugin />
        </div>
      </div>
    </LexicalComposer>
  );
}
```

After:

```tsx
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { LexicalPlanComposer } from "@etrepum/lexical-react-plan";

import ExampleTheme from "./ExampleTheme";
import ToolbarPlugin from "./plugins/ToolbarPlugin";
import TreeViewPlugin from "./plugins/TreeViewPlugin";

function Placeholder() {
  return <div className="editor-placeholder">Enter some rich text...</div>;
}

const editorPlan = definePlan({
  namespace: "React.js Plan Demo",
  dependencies: [
    AutoFocusPlan,
    RichTextPlan,
    HistoryPlan,
    configPlan(ReactPlan, {
      contentEditable: null,
      placeholder: null,
    }),
  ],
  // The editor theme
  theme: ExampleTheme,
});

export default function App() {
  return (
    <LexicalPlanComposer plan={editorPlan}>
      <div className="editor-container">
        <ToolbarPlugin />
        <div className="editor-inner">
          <ContentEditable className="editor-input" />
          <Placeholder />
          <TreeViewPlugin />
        </div>
      </div>
    </LexicalComposer>
  );
}
```

## React Plug-in (without UI)

Before:

```tsx
/**
 * USAGE:
 * 1. Add KeywordNode to your initialConfig nodes Array.
 *    If you forget this, you will get an error.
 * 2. Add the <KeywordPlugin /> as a child of your LexicalComposer.
 *    If you forget this, it will silently not work.
 * 3. Add CSS somewhere for '.keyword'.
 *    If you don't like that selector, too bad.
 */
import type { EditorConfig, LexicalNode, SerializedTextNode } from "lexical";
import { TextNode } from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLexicalTextEntity } from "@lexical/react/useLexicalTextEntity";
import { useCallback, useEffect } from "react";

export type SerializedKeywordNode = SerializedTextNode;

export class KeywordNode extends TextNode {
  static getType(): string {
    return "keyword";
  }

  static clone(node: KeywordNode): KeywordNode {
    return new KeywordNode(node.__text, node.__key);
  }

  static importJSON(serializedNode: SerializedKeywordNode): KeywordNode {
    const node = $createKeywordNode(serializedNode.text);
    node.setFormat(serializedNode.format);
    node.setDetail(serializedNode.detail);
    node.setMode(serializedNode.mode);
    node.setStyle(serializedNode.style);
    return node;
  }

  exportJSON(): SerializedKeywordNode {
    return {
      ...super.exportJSON(),
      type: "keyword",
      version: 1,
    };
  }

  createDOM(config: EditorConfig): HTMLElement {
    const dom = super.createDOM(config);
    dom.style.cursor = "default";
    dom.className = "keyword";
    return dom;
  }

  canInsertTextBefore(): boolean {
    return false;
  }

  canInsertTextAfter(): boolean {
    return false;
  }

  isTextEntity(): true {
    return true;
  }
}

export function $createKeywordNode(keyword: string): KeywordNode {
  return new KeywordNode(keyword);
}

export function $isKeywordNode(node: LexicalNode | null | undefined): boolean {
  return node instanceof KeywordNode;
}

const KEYWORDS_REGEX =
  /(^|[^A-Za-z])(congrats|congratulations|mazel tov|mazal tov)($|[^A-Za-z])/i;

export function KeywordsPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([KeywordNode])) {
      throw new Error("KeywordsPlugin: KeywordNode not registered on editor");
    }
  }, [editor]);

  const $convertToKeywordNode = useCallback(
    (textNode: TextNode): KeywordNode => {
      return $createKeywordNode(textNode.getTextContent());
    },
    [],
  );

  const getKeywordMatch = useCallback((text: string) => {
    const matchArr = KEYWORDS_REGEX.exec(text);

    if (matchArr === null) {
      return null;
    }

    const hashtagLength = matchArr[2].length;
    const startOffset = matchArr.index + matchArr[1].length;
    const endOffset = startOffset + hashtagLength;
    return {
      end: endOffset,
      start: startOffset,
    };
  }, []);

  useLexicalTextEntity<KeywordNode>(
    getKeywordMatch,
    KeywordNode,
    $convertToKeywordNode,
  );

  return null;
}
```

After (minimal & backwards compatible):

```tsx
/**
 * USAGE:
 * 1. Add KeywordsPlan as a dependency to your LexicalPlanComposer root plan
 * 2. Add CSS somewhere for '.keyword'.
 *    If you don't like that selector, too bad.
 */
import type { EditorConfig, LexicalNode, SerializedTextNode } from "lexical";
import { TextNode } from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLexicalTextEntity } from "@lexical/react/useLexicalTextEntity";
import { useCallback, useEffect } from "react";
import { ReactPlan } from "@etrepum/lexical-react-plan";
import { definePlan, configPlan } from "@etrepum/lexical-builder";

export type SerializedKeywordNode = SerializedTextNode;

export class KeywordNode extends TextNode {
  static getType(): string {
    return "keyword";
  }

  static clone(node: KeywordNode): KeywordNode {
    return new KeywordNode(node.__text, node.__key);
  }

  static importJSON(serializedNode: SerializedKeywordNode): KeywordNode {
    const node = $createKeywordNode(serializedNode.text);
    node.setFormat(serializedNode.format);
    node.setDetail(serializedNode.detail);
    node.setMode(serializedNode.mode);
    node.setStyle(serializedNode.style);
    return node;
  }

  exportJSON(): SerializedKeywordNode {
    return {
      ...super.exportJSON(),
      type: "keyword",
      version: 1,
    };
  }

  createDOM(config: EditorConfig): HTMLElement {
    const dom = super.createDOM(config);
    dom.style.cursor = "default";
    dom.className = "keyword";
    return dom;
  }

  canInsertTextBefore(): boolean {
    return false;
  }

  canInsertTextAfter(): boolean {
    return false;
  }

  isTextEntity(): true {
    return true;
  }
}

export function $createKeywordNode(keyword: string): KeywordNode {
  return new KeywordNode(keyword);
}

export function $isKeywordNode(node: LexicalNode | null | undefined): boolean {
  return node instanceof KeywordNode;
}

const KEYWORDS_REGEX =
  /(^|[^A-Za-z])(congrats|congratulations|mazel tov|mazal tov)($|[^A-Za-z])/i;

export function KeywordsPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([KeywordNode])) {
      throw new Error("KeywordsPlugin: KeywordNode not registered on editor");
    }
  }, [editor]);

  const $convertToKeywordNode = useCallback(
    (textNode: TextNode): KeywordNode => {
      return $createKeywordNode(textNode.getTextContent());
    },
    [],
  );

  const getKeywordMatch = useCallback((text: string) => {
    const matchArr = KEYWORDS_REGEX.exec(text);

    if (matchArr === null) {
      return null;
    }

    const hashtagLength = matchArr[2].length;
    const startOffset = matchArr.index + matchArr[1].length;
    const endOffset = startOffset + hashtagLength;
    return {
      end: endOffset,
      start: startOffset,
    };
  }, []);

  useLexicalTextEntity<KeywordNode>(
    getKeywordMatch,
    KeywordNode,
    $convertToKeywordNode,
  );

  return null;
}

// We only need to add metadata so that you can easily use this plan!
export const KeywordsPlan = definePlan({
  name: "@etrepum/lexical-builder-keywords",
  nodes: [KeywordNode],
  dependencies: [configPlan(ReactPlan, { decorators: [<KeywordsPlugin />] })],
});
```

After (all-in):

```tsx
/**
 * USAGE:
 * 1. Add KeywordsPlan as a dependency to your LexicalPlanComposer root plan
 *    OR use it in a Vanilla JS project because it never really needed React!
 * 2. Add CSS somewhere for '.keyword', or change it!
 *    If you don't like that selector, use
 *    `configPlan(KeywordsPlan, {className: 'something-else'})`
 */
import type { EditorConfig, LexicalNode, SerializedTextNode } from "lexical";
import { TextNode } from "lexical";
import { registerLexicalTextEntity } from "@lexical/text";
import { useCallback, useEffect } from "react";
import { definePlan, configPlan, safeCast } from "@etrepum/lexical-builder";

export type SerializedKeywordNode = SerializedTextNode;

export class KeywordNode extends TextNode {
  static getType(): string {
    return "keyword";
  }

  static clone(node: KeywordNode): KeywordNode {
    return new KeywordNode(node.__text, node.__key);
  }

  static importJSON(serializedNode: SerializedKeywordNode): KeywordNode {
    const node = $createKeywordNode(serializedNode.text);
    node.setFormat(serializedNode.format);
    node.setDetail(serializedNode.detail);
    node.setMode(serializedNode.mode);
    node.setStyle(serializedNode.style);
    return node;
  }

  exportJSON(): SerializedKeywordNode {
    return {
      ...super.exportJSON(),
      type: "keyword",
      version: 1,
    };
  }

  createDOM(config: EditorConfig): HTMLElement {
    const dom = super.createDOM(config);
    dom.style.cursor = "default";
    // This lets us configure the class name!
    dom.className = $getPlanDependency(KeywordsPlan).config.className;
    return dom;
  }

  canInsertTextBefore(): boolean {
    return false;
  }

  canInsertTextAfter(): boolean {
    return false;
  }

  isTextEntity(): true {
    return true;
  }
}

export function $createKeywordNode(keyword: string): KeywordNode {
  return new KeywordNode(keyword);
}

export function $isKeywordNode(node: LexicalNode | null | undefined): boolean {
  return node instanceof KeywordNode;
}

const KEYWORDS_REGEX =
  /(^|[^A-Za-z])(congrats|congratulations|mazel tov|mazal tov)($|[^A-Za-z])/i;

function $convertToKeywordNode(textNode: TextNode) {
  return $createKeywordNode(textNode.getTextContent());
}

// We only need to add metadata so that you can easily use this plan!
// Oh wait, we don't even need React anymore!
export const KeywordsPlan = definePlan({
  name: "@etrepum/lexical-builder-keywords",
  nodes: [KeywordNode],
  config: safeCast<KeywordsConfig>({ className: "keyword" }),
  register(editor) {
    return registerLexicalTextEntity(
      editor,
      getKeywordMatch,
      KeywordNode,
      $convertToKeywordNode,
    );
  },
});
```
