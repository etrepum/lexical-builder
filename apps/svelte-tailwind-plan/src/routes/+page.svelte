<svelte:options runes={true} />

<script lang="ts">
  /**
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *
   */

  import { mergeRegister } from "@lexical/utils";
  import { type LexicalEditorWithDispose } from "@etrepum/lexical-builder";
  import { buildEditor } from "$lib/buildEditor";

  let editorRef: HTMLElement;
  let stateRef: HTMLPreElement;
  let editor: LexicalEditorWithDispose;

  $effect(() => {
    if (!editorRef) {
      console.log("Missing editorRef");
      return;
    }
    console.log("building editor");
    console.log(editorRef);
    editor = buildEditor();
    const cleanup = mergeRegister(
      () => editor.dispose(),
      editor.registerUpdateListener(({ editorState }) => {
        stateRef!.textContent = JSON.stringify(
          editorState.toJSON(),
          undefined,
          2,
        );
      }),
    );
    editor.setRootElement(editorRef);
    return cleanup;
  });
</script>

<svelte:head>
  <title>Lexical Builder + Svelte + Tailwind</title>
</svelte:head>

<header class="m-4">
  <h1>Lexical Builder + Svelte + Tailwind</h1>
</header>
<main class="m-4">
  <div
    class="border p-4 border-solid"
    bind:this={editorRef}
    contenteditable
  ></div>
</main>
<footer class="m-4">
  <h4>Editor state:</h4>
  <pre bind:this={stateRef} class="w-full"></pre>
</footer>
