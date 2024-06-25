<script lang="ts">
  /**
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *
   */

  import { type LexicalEditor } from "lexical";
  import {
    buildEditorFromPlans,
    DragonPlan,
    RichTextPlan,
    HistoryPlan,
  } from "@etrepum/lexical-builder";
  import {
    MarkdownTransformersPlan,
    MarkdownShortcutsPlan,
  } from "@etrepum/lexical-builder-markdown";
  import { TailwindPlan } from "@etrepum/lexical-tailwind";

  import prepopulatedRichText from "$lib/$prepopulatedRichText";
  import { onMount } from "svelte";

  let editorRef: HTMLElement;
  let stateRef: HTMLPreElement;
  let editor: LexicalEditor;

  onMount(() => {
    editor = buildEditorFromPlans({
      name: "[root]",
      dependencies: [
        DragonPlan,
        RichTextPlan,
        MarkdownTransformersPlan,
        MarkdownShortcutsPlan,
        TailwindPlan,
        HistoryPlan,
      ],
      $initialEditorState: prepopulatedRichText,
      register: (editor) =>
        editor.registerUpdateListener(({ editorState }) => {
          stateRef!.textContent = JSON.stringify(editorState.toJSON(), undefined, 2);
        }),
    });
    editor.setRootElement(editorRef);
  });
</script>

<svelte:head>
  <title>Lexical Builder + Svelte + Tailwind</title>
</svelte:head>

<header class="m-4">
  <h1>Lexical Builder + Svelte + Tailwind</h1>
</header>
<main class="m-4">
  <div class="border p-4 border-solid" bind:this={editorRef} contenteditable></div>
</main>
<footer class="m-4">
  <h4>Editor state:</h4>
  <pre bind:this={stateRef} class="w-full"></pre>
</footer>
