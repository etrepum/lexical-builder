<svelte:options runes={true} />

<script lang="ts">
  import { mergeRegister } from "@lexical/utils";
  import {
    getPlanDependencyFromEditor,
    type LexicalEditorWithDispose,
  } from "@etrepum/lexical-builder";
  import { MarkdownTransformersPlan } from "@etrepum/lexical-builder-markdown";
  import { $getRoot as L$getRoot } from "lexical";
  import { prerenderEditorHtml } from "@etrepum/lexical-builder-ssr";
  import { buildEditor } from "$lib/buildEditor";
  import { $createStickyNode as L$createStickyNode } from "$lib/sticky/StickyNode";

  let editorRef: HTMLElement;
  const editor: LexicalEditorWithDispose = buildEditor();
  const transformers = getPlanDependencyFromEditor(
    editor,
    MarkdownTransformersPlan,
  ).output;
  // As an exercise to the reader: we should be able to hydrate the editor by importing
  // the prerendered DOM rather than building up the state in $initialEditorState
  // on both client and server, but that would require importDOM to work perfectly.
  const initialHtml =
    typeof window === "undefined" ? prerenderEditorHtml(editor) : "";
  let currentEditorState = $state(editor.getEditorState());
  const currentMarkdown = $derived.by(() =>
    currentEditorState.read(() => transformers.$markdownExport(), { editor }),
  );
  $effect(() => {
    editor.setRootElement(editorRef);
    const cleanup = mergeRegister(
      () => editor.dispose(),
      editor.registerUpdateListener(({ editorState }) => {
        currentEditorState = editorState;
      }),
    );
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
  >
    {@html initialHtml}
  </div>
  <div class="mt-4 mx-auto container">
    <button
      type="button"
      class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
      onclick={handleAddSticky}>Add sticky</button
    >
  </div>
</main>
<footer class="my-4">
  <h2 class="m-4 text-lg font-bold">Markdown Export:</h2>
  <div class="w-full whitespace-pre-wrap font-mono container mx-auto">
    {currentMarkdown}
  </div>
</footer>
