/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { type LexicalEditor } from "lexical";
import {
  createEmptyHistoryState,
  type HistoryState,
  registerHistory,
} from "@lexical/history";
import {
  configExtension,
  defineExtension,
  provideOutput,
  safeCast,
} from "@etrepum/lexical-builder-core";
import { disabledToggle, type DisabledToggleOutput } from "./disabledToggle";
import { getPeerDependencyFromEditor } from "./getPeerDependencyFromEditor";

export interface HistoryConfig {
  /**
   * The time (in milliseconds) the editor should delay generating a new history stack,
   * instead of merging the current changes with the current stack. The default is 300ms.
   */
  delay: number;
  /**
   * The initial history state, the default is {@link createEmptyHistoryState}.
   */
  createInitialHistoryState: (editor: LexicalEditor) => HistoryState;
  /**
   * Whether history is disabled or not
   */
  disabled: boolean;
}

export interface HistoryOutput extends DisabledToggleOutput {
  getHistoryState: () => HistoryState;
}

/**
 * Registers necessary listeners to manage undo/redo history stack and related
 * editor commands, via the \@lexical/history module.
 */
export const HistoryExtension = defineExtension({
  config: safeCast<HistoryConfig>({
    createInitialHistoryState: createEmptyHistoryState,
    delay: 300,
    disabled: typeof window === "undefined",
  }),
  name: "@etrepum/lexical-builder/History",
  register: (editor, { delay, createInitialHistoryState, disabled }) => {
    const historyState = createInitialHistoryState(editor);
    const [output, cleanup] = disabledToggle({
      disabled,
      register: () => registerHistory(editor, historyState, delay),
    });
    return provideOutput<HistoryOutput>(
      { ...output, getHistoryState: () => historyState },
      cleanup,
    );
  },
});

function getHistoryPeer(editor: LexicalEditor | null | undefined) {
  return editor
    ? getPeerDependencyFromEditor<typeof HistoryExtension>(editor, HistoryExtension.name)
    : null;
}

/**
 * Registers necessary listeners to manage undo/redo history stack and related
 * editor commands, via the \@lexical/history module, only if the parent editor
 * has a history plugin implementation.
 */
export const SharedHistoryExtension = defineExtension({
  name: "@etrepum/lexical-builder/SharedHistory",
  dependencies: [configExtension(HistoryExtension, { disabled: true })],
  init(editorConfig, _config, state) {
    // Configure the peer dependency based on the parent editor's history
    const { config } = state.getDependency(HistoryExtension);
    const parentPeer = getHistoryPeer(editorConfig.parentEditor);
    // Default is disabled by config above, we will enable it based
    // on the parent editor's history extension
    if (parentPeer) {
      config.delay = parentPeer.config.delay;
      config.createInitialHistoryState = () =>
        parentPeer.output.getHistoryState();
    }
    return parentPeer;
  },
  register(_editor, _config, state) {
    const parentPeer = state.getInitResult();
    if (!parentPeer) {
      return () => {
        /* noop */
      };
    }
    const disabled = state.getDependency(HistoryExtension).output.disabled;
    return parentPeer.output.disabled.subscribe(disabled.set.bind(disabled));
  },
});
