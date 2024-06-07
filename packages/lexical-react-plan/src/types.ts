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
  /**
   * The EditorChildrenComponent from the config
   */
  EditorChildrenComponent: EditorChildrenComponentType;
  /**
   * The children to pass to EditorChildrenComponent
   */
  children?: React.ReactNode;
  /**
   * placeholder from the config
   */
  placeholder:
    | ((isEditable: boolean) => null | JSX.Element)
    | null
    | JSX.Element;
  /**
   * contentEditable from the config
   */
  contentEditable: JSX.Element | null;
  /**
   * ErrorBoundary from the config
   */
  ErrorBoundary: ErrorBoundaryType;
}

export type EditorComponentType = (
  /** Optional overrides to any of the props, typically only children is used */
  props: Partial<EditorComponentProps>,
) => JSX.Element;

export interface ReactConfig {
  /**
   * The default root element of the editor as JSX. Uses `<ContentEditable />`
   * from @lexical/react/ContentEditable by default,
   * but may be null or another component.
   *
   * This component is responsible for calling editor.setRootElement(elem).
   */
  contentEditable: JSX.Element | null;
  /**
   * The placeholder or a `(isEditable: boolean) => JSX.Element | null`
   * function. The default is null. If specified, by default it will be
   * rendered immediatley after contentEditable, but this may be overridden
   * with `EditorChildrenComponent`.
   */
  placeholder:
    | ((isEditable: boolean) => null | JSX.Element)
    | null
    | JSX.Element;
  /**
   * The ErrorBoundary used for rendering decorators in the editor. By default
   * it is `ErrorBoundary` from @lexical/react/ErrorBoundary.
   */
  ErrorBoundary: ErrorBoundaryType;
  /**
   * The component that renders the children of the editor context, by default
   * it is {@link DefaultEditorChildrenComponent} which takes the given props
   * and renders them in this order:
   *
   * - contentEditable
   * - placeholder
   * - children
   */
  EditorChildrenComponent: EditorChildrenComponentType;

  /**
   * An array of JSX or components that return JSX that should be rendered
   * as children of Component. These will be merged by array concatenation.
   */
  decorators: readonly DecoratorComponentType[];
}

export interface ReactOutputs {
  /**
   * The editor component, this can be used by Plans that depend on this to
   * render the editor such as {@link ReactPluginHostPlan} or internally by
   * {@link LexicalPlanComposer}.
   *
   * All props have defaults based on the config and editor state, but may be
   * overridden.
   */
  Component: EditorComponentType;
  /**
   * This function is equivalent to useLexicalComposerContext() from @lexical/react/LexicalComposerContext.
   */
  getContext: () => LexicalComposerContextWithEditor;
}

export type ErrorBoundaryProps = {
  children: JSX.Element;
  onError: (error: Error) => void;
};

export type ErrorBoundaryType =
  | React.ComponentClass<ErrorBoundaryProps>
  | React.FC<ErrorBoundaryProps>;
