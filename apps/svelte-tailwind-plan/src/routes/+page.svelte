<svelte:options runes={true} />

<script lang="ts">
  import { mergeRegister } from "@lexical/utils";
  import {
    getPlanDependencyFromEditor,
    type LexicalEditorWithDispose,
  } from "@etrepum/lexical-builder";
  import { MarkdownTransformersPlan } from "@etrepum/lexical-builder-markdown";
  import { $getRoot as L$getRoot } from "lexical";
  import { buildEditor } from "$lib/buildEditor";
  import { $createStickyNode as L$createStickyNode } from "$lib/sticky/StickyNode";

  let editorRef: HTMLElement;
  let stateRef: HTMLElement;
  let editor: LexicalEditorWithDispose;

  $effect(() => {
    editor = buildEditor();
    const transformers = getPlanDependencyFromEditor(
      editor,
      MarkdownTransformersPlan,
    ).output;
    const cleanup = mergeRegister(
      () => editor.dispose(),
      editor.registerUpdateListener(({ editorState }) => {
        stateRef!.textContent = editorState.read(() =>
          transformers.$markdownExport(),
        );
      }),
    );
    editor.setRootElement(editorRef);
    return cleanup;
  });

  function handleAddSticky() {
    editor.update(() => {
      L$getRoot().append(L$createStickyNode());
    });
  }
</script>

<svelte:head>
  <title>Lexical Builder + Svelte + Tailwind</title>
</svelte:head>

<header class="m-4">
  <h1 class="my-4 text-xl font-bold">Lexical Builder + Svelte + Tailwind</h1>
</header>
<main class="m-4">
  <div
    class="border p-4 border-solid container mx-auto relative"
    bind:this={editorRef}
    contenteditable
  ></div>
</main>
<button
  type="button"
  class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
  onclick={handleAddSticky}>Add sticky</button
>
<footer class="my-4">
  <h2 class="m-4 text-lg font-bold">Markdown Export:</h2>
  <div
    bind:this={stateRef}
    class="w-full whitespace-pre-wrap font-mono container mx-auto"
  ></div>
</footer>
