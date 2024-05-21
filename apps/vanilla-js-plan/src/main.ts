/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import './styles.css';

import {
  DragonPlan,
  HistoryPlan,
  LexicalBuilder,
  mountReactPluginComponent,
  mountReactPluginHost,
  ReactPluginHostPlan,
  RichTextPlan,
} from '@etrepum/lexical-builder';
import {TreeView} from '@lexical/react/LexicalTreeView';
import {LexicalEditor} from 'lexical';

import {$prepopulatedRichText} from './$prepopulatedRichText';
import {EmojiPlan} from './emoji-plan/EmojiPlan';

const editorHandle = LexicalBuilder.fromPlans({
  $initialEditorState: $prepopulatedRichText,
  config: {},
  dependencies: [
    DragonPlan,
    RichTextPlan,
    HistoryPlan,
    EmojiPlan,
    ReactPluginHostPlan,
  ],
  name: '@lexical/examples/vanilla-js-plan',
  namespace: 'Vanilla JS Plan Demo',
  onError: (error: Error) => {
    throw error;
  },
  register: (editor: LexicalEditor) => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    mountReactPluginHost(editor, el);
    mountReactPluginComponent(editor, {
      Component: TreeView,
      domNode: document.getElementById('lexical-state')!,
      key: 'tree-view',
      props: {
        editor,
        timeTravelButtonClassName: 'debug-timetravel-button',
        timeTravelPanelButtonClassName: 'debug-timetravel-panel-button',
        timeTravelPanelClassName: 'debug-timetravel-panel',
        timeTravelPanelSliderClassName: 'debug-timetravel-panel-slider',
        treeTypeButtonClassName: 'debug-treetype-button',
        viewClassName: 'tree-view-output',
      },
    });
    return () => {
      el.remove();
    };
  },
}).buildEditor();
editorHandle.editor.setRootElement(document.getElementById('lexical-editor'));
