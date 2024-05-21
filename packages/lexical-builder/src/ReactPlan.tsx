/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {AnyLexicalPlanArgument} from './types';

import {
  LexicalComposerContext,
  type LexicalComposerContextWithEditor,
} from '@lexical/react/LexicalComposerContext';
import {ContentEditable} from '@lexical/react/LexicalContentEditable';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import useLexicalEditable from '@lexical/react/useLexicalEditable';
import * as React from 'react';
import {Suspense, useEffect, useMemo, useRef} from 'react';

import {definePlan} from './definePlan';
import {LexicalBuilder} from './LexicalBuilder';
import {canShowPlaceholder} from './registerShowPlaceholder';
import {safeCast} from './safeCast';
import {shallowMergeConfig} from './shallowMergeConfig';
import {type ErrorBoundaryType, useReactDecorators} from './useReactDecorators';
import {useRegisterSubscription} from './useRegisterSubscription';

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
  setComponent: (
    component: undefined | EditorComponentType,
    context: LexicalComposerContextWithEditor,
  ) => void;
  decorators: readonly DecoratorComponentType[];
}

function notImplemented() {}

export interface LexicalPlanComposerProps {
  plan: AnyLexicalPlanArgument;
  children: React.ReactNode;
}

const scheduleMicrotask =
  'queueMicrotask' in globalThis
    ? queueMicrotask
    : (fn: () => void) => Promise.resolve().then(fn);

export function LexicalPlanComposer({
  plan,
  children,
}: LexicalPlanComposerProps) {
  const componentRef = useRef<EditorComponentType | undefined>(undefined);
  const handle = useMemo(() => {
    return LexicalBuilder.fromPlans(
      [
        ReactPlan,
        safeCast<Partial<ReactConfig>>({
          setComponent: (component) => {
            componentRef.current = component;
          },
        }),
      ],
      plan,
    ).buildEditor();
  }, [plan]);
  useEffect(() => {
    // This is an awful trick to detect StrictMode
    let didMount = false;
    scheduleMicrotask(() => {
      didMount = true;
    });
    return () => {
      if (didMount) {
        handle.dispose();
      }
    };
  }, [handle]);
  const EditorComponent = componentRef.current;
  return EditorComponent ? <EditorComponent>{children}</EditorComponent> : null;
}

function DefaultEditorChildrenComponent({
  contentEditable,
  placeholder,
  children,
}: EditorChildrenComponentProps) {
  return (
    <>
      {contentEditable}
      {placeholder && <Placeholder content={placeholder} />}
      {children}
    </>
  );
}

function buildEditorComponent(
  context: LexicalComposerContextWithEditor,
  config: ReactConfig,
) {
  const [editor] = context;
  const rawConfigDecorators = config.decorators.map((El) =>
    typeof El === 'function' ? <El context={context} /> : El,
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
          placeholder={placeholder && <Placeholder content={placeholder} />}>
          {children}
          {configDecorators}
          {decorators}
        </EditorChildrenComponent>
      </LexicalComposerContext.Provider>
    );
  };
}

function WithEditable({
  content,
}: {
  content: (isEditable: boolean) => null | JSX.Element;
}) {
  return content(useLexicalEditable());
}

function Placeholder({
  content,
}: {
  content: ((isEditable: boolean) => null | JSX.Element) | JSX.Element;
}): null | JSX.Element {
  const showPlaceholder = useRegisterSubscription(canShowPlaceholder);
  if (!showPlaceholder) {
    return null;
  } else if (typeof content === 'function') {
    return <WithEditable content={content} />;
  } else {
    return content;
  }
}

export const ReactPlan = definePlan({
  config: safeCast<ReactConfig>({
    EditorChildrenComponent: DefaultEditorChildrenComponent,
    ErrorBoundary: LexicalErrorBoundary,
    contentEditable: <ContentEditable />,
    decorators: [],
    placeholder: null,
    setComponent: notImplemented,
  }),
  mergeConfig(a, b) {
    const config = shallowMergeConfig(a, b);
    if (b && b.decorators && b.decorators.length > 0) {
      config.decorators = [...a.decorators, ...b.decorators];
    }
    return config;
  },
  name: '@etrepum/lexical-builder/ReactPlan',
  register(editor, config) {
    const context: LexicalComposerContextWithEditor = [
      editor,
      {getTheme: () => editor._config.theme},
    ];
    config.setComponent(buildEditorComponent(context, config), context);
    return () => {
      config.setComponent(undefined, context);
    };
  },
});
