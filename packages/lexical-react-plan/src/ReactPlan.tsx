/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  declarePeerDependency,
  definePlan,
  provideOutput,
  shallowMergeConfig,
} from "@etrepum/lexical-builder";
import { type LexicalComposerContextWithEditor } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { buildEditorComponent } from "./buildEditorComponent";
import { type ReactConfig, type ReactOutputs } from "./types";
import { DefaultEditorChildrenComponent } from "./DefaultEditorChildrenComponent";
import { ReactProviderPlan } from "./ReactProviderPlan";
import invariant from "./shared/invariant";

const initialConfig: ReactConfig = {
  EditorChildrenComponent: DefaultEditorChildrenComponent,
  ErrorBoundary: LexicalErrorBoundary,
  contentEditable: <ContentEditable />,
  decorators: [],
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
  name: "@etrepum/lexical-builder/React",
  peerDependencies: [
    // We are not trying to avoid the import, just the direct dependency,
    // so using the plan directly is fine.
    declarePeerDependency<typeof ReactProviderPlan>(ReactProviderPlan.name),
  ],
  register(editor, config, state) {
    const providerPeer = state.getPeer<typeof ReactProviderPlan>(
      ReactProviderPlan.name,
    );
    if (!providerPeer) {
      invariant(
        false,
        "No ReactProviderPlan detected. You must use ReactPluginHostPlan or LexicalPlanComposer to host React plans. The following plans depend on ReactPlan: %s",
        [...state.getDirectDependentNames()].join(" "),
      );
    }
    const context: LexicalComposerContextWithEditor = [
      editor,
      { getTheme: () => editor._config.theme },
    ];
    const Component = buildEditorComponent(config, context);
    return provideOutput<ReactOutputs>({
      context,
      Component,
    });
  },
});
