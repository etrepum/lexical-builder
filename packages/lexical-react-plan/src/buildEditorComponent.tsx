import {
  LexicalComposerContext,
  LexicalComposerContextWithEditor,
} from "@lexical/react/LexicalComposerContext";
import { Suspense, useMemo } from "react";
import { useReactDecorators } from "./useReactDecorators";
import { ReactConfig, EditorComponentProps, ReactOutputs } from "./types";
import { Placeholder } from "./Placeholder";

/** @internal */
export function buildEditorComponent(
  config: ReactConfig,
  context: LexicalComposerContextWithEditor,
) {
  const [editor] = context;
  const rawConfigDecorators = config.decorators.map((El) =>
    typeof El === "function" ? <El context={context} /> : El,
  );
  return function EditorComponent(props: Partial<EditorComponentProps>) {
    const {
      EditorChildrenComponent = config.EditorChildrenComponent,
      ErrorBoundary = config.ErrorBoundary,
      contentEditable = config.contentEditable,
      placeholder = config.placeholder,
      children,
    } = props;
    const decorators = useReactDecorators(editor, ErrorBoundary);
    const configDecorators = useMemo(
      () =>
        rawConfigDecorators.map((decorator, i) => (
          <ErrorBoundary onError={(e) => editor._onError(e)} key={i}>
            <Suspense fallback={null}>{decorator}</Suspense>
          </ErrorBoundary>
        )),
      [ErrorBoundary],
    );
    return (
      <LexicalComposerContext.Provider value={context}>
        <EditorChildrenComponent
          context={context}
          contentEditable={contentEditable}
          placeholder={placeholder && <Placeholder content={placeholder} />}
        >
          {children}
          {configDecorators}
          {decorators}
        </EditorChildrenComponent>
      </LexicalComposerContext.Provider>
    );
  };
}
