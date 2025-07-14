/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  declarePeerDependency,
  defineExtension,
  provideOutput,
  shallowMergeConfig,
} from "@etrepum/lexical-builder";
import { type LexicalComposerContextWithEditor } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { buildEditorComponent } from "./buildEditorComponent";
import { type ReactConfig, type ReactOutputs } from "./types";
import { DefaultEditorChildrenComponent } from "./DefaultEditorChildrenComponent";
import { ReactProviderExtension } from "./ReactProviderExtension";
import invariant from "./shared/invariant";

const initialConfig: ReactConfig = {
  EditorChildrenComponent: DefaultEditorChildrenComponent,
  ErrorBoundary: LexicalErrorBoundary,
  contentEditable: <ContentEditable />,
  decorators: [],
};

/**
 * A extension to use or configure React for use with Lexical. In an editor, you
 * would typically use {@link LexicalExtensionComposer} (for React projects) or
 * {@link ReactPluginHostExtension} (to use React Extensions and plug-ins in a non-React
 * project).
 *
 * See {@link ReactConfig} for more detailed exextensionations of how to use
 * the config for this Extension.
 *
 * For a Extension developer, you can defineConfig() override the extension with
 * decorators to add JSX inside the editor context that is not
 * location-dependent (e.g. floating UI that does not need to be mounted in
 * some specific location, or effects that return null).
 */
export const ReactExtension = defineExtension({
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
    // so using the extension directly is fine.
    declarePeerDependency<typeof ReactProviderExtension>(ReactProviderExtension.name),
  ],
  register(editor, config, state) {
    const providerPeer = state.getPeer<typeof ReactProviderExtension>(
      ReactProviderExtension.name,
    );
    if (!providerPeer) {
      invariant(
        false,
        "No ReactProviderExtension detected. You must use ReactPluginHostExtension or LexicalExtensionComposer to host React extensions. The following extensions depend on ReactExtension: %s",
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
