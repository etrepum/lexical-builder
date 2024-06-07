/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  definePlan,
  provideOutput,
  shallowMergeConfig,
} from "@etrepum/lexical-builder";

import { type LexicalComposerContextWithEditor } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";

import { buildEditorComponent } from "./buildEditorComponent";
import { ReactConfig } from "./types";
import { DefaultEditorChildrenComponent } from "./DefaultEditorChildrenComponent";

const initialConfig: ReactConfig = {
  EditorChildrenComponent: DefaultEditorChildrenComponent,
  ErrorBoundary: LexicalErrorBoundary,
  contentEditable: <ContentEditable />,
  decorators: [],
  placeholder: null,
};

/**
 * A plan to use or configure React for use with Lexical. In an editor, you
 * would typically use {@link LexicalPlanComposer} (for React projects) or
 * {@link ReactPluginHostPlan} (to use React Plans and plug-ins in a non-React
 * project).
 *
 * See {@link ReactConfig} for more detailed explanations of how to use
 * the config for this Plan.
 *
 * For a Plan developer, you can defineConfig() override the plan with
 * decorators to add JSX inside the editor context that is not
 * location-dependent (e.g. floating UI that does not need to be mounted in
 * some specific location, or effects that return null).
 */
export const ReactPlan = definePlan({
  config: initialConfig,
  mergeConfig(a, b) {
    const config = shallowMergeConfig(a, b);
    if (b.decorators) {
      config.decorators =
        b.decorators.length > 0
          ? [...a.decorators, ...b.decorators]
          : a.decorators;
    }
    return config;
  },
  name: "@etrepum/lexical-builder/ReactPlan",
  register(editor, config) {
    const context: LexicalComposerContextWithEditor = [
      editor,
      { getTheme: () => editor._config.theme },
    ];
    const Component = buildEditorComponent(config, context);
    return provideOutput({
      context,
      Component,
    });
  },
});
