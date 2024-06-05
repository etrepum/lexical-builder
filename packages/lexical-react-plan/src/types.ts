import { AnyLexicalPlanArgument } from "@etrepum/lexical-builder";
import { LexicalComposerContextWithEditor } from "@lexical/react/LexicalComposerContext";

export interface EditorChildrenComponentProps {
  context: LexicalComposerContextWithEditor;
  placeholder: null | JSX.Element;
  contentEditable: null | JSX.Element;
  children?: React.ReactNode;
}

export type EditorChildrenComponentType = (
  props: EditorChildrenComponentProps,
) => JSX.Element | null;

export interface DecoratorComponentProps {
  context: LexicalComposerContextWithEditor;
}
export type DecoratorComponentType =
  | JSX.Element
  | ((props: DecoratorComponentProps) => JSX.Element | null);

export interface EditorComponentProps {
  EditorChildrenComponent: EditorChildrenComponentType;
  children?: React.ReactNode;
  placeholder:
    | ((isEditable: boolean) => null | JSX.Element)
    | null
    | JSX.Element;
  contentEditable: JSX.Element | null;
  ErrorBoundary: ErrorBoundaryType;
}

export type EditorComponentType = (
  props: Partial<EditorComponentProps>,
) => JSX.Element;

export interface ReactConfig {
  contentEditable: JSX.Element | null;
  placeholder:
    | ((isEditable: boolean) => null | JSX.Element)
    | null
    | JSX.Element;
  ErrorBoundary: ErrorBoundaryType;
  EditorChildrenComponent: EditorChildrenComponentType;
  Component: EditorComponentType;
  getContext: () => LexicalComposerContextWithEditor;
  decorators: readonly DecoratorComponentType[];
}

export type ErrorBoundaryProps = {
  children: JSX.Element;
  onError: (error: Error) => void;
};

export type ErrorBoundaryType =
  | React.ComponentClass<ErrorBoundaryProps>
  | React.FC<ErrorBoundaryProps>;
