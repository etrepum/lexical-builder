<script lang="ts">
  import "@fontsource/reenie-beanie";
  import { type LexicalEditor } from "lexical";
  import { mergeRegister } from "@lexical/utils";
  import { $canShowPlaceholder as L$canShowPlaceholder } from "@lexical/text";
  import { draggable } from "@neodrag/svelte";
  import type { DragOptions } from "@neodrag/svelte";
  import { StickyNode, type StickyNoteColor } from "./StickyNode";
  /* eslint-disable prefer-const -- svelte runes */
  let captionRoot: HTMLDivElement;
  let { node, editor }: { node: StickyNode; editor: LexicalEditor } = $props();
  let isDragging = $state(false);
  let position = $derived({ x: node.__x, y: node.__y });
  let dragOptions: DragOptions = $derived({
    axis: "both",
    bounds: editor.getRootElement() ?? "parent",
    position,
    onDragStart: () => {
      isDragging = true;
    },
    onDrag: ({ offsetX, offsetY }) => {
      position.x = offsetX;
      position.y = offsetY;
    },
    onDragEnd: ({ offsetX, offsetY }) => {
      isDragging = false;
      editor.update(() => {
        node.setPosition(offsetX, offsetY);
      });
    },
  });

  const placeholderText = "What's up?";

  let { caption, color } = $derived({
    caption: node.__caption,
    color: node.__color,
  });
  const getCanShowPlaceholder = () =>
    caption
      .getEditorState()
      .read(() => L$canShowPlaceholder(caption.isComposing()));
  let placeholder = $state(getCanShowPlaceholder());

  const handleDelete = (): void => {
    editor.update(() => {
      node.remove();
    });
  };

  const handleColorChange = (): void => {
    editor.update(() => {
      node.toggleColor();
    });
  };

  $effect(() => {
    caption.setRootElement(captionRoot);
    return mergeRegister(
      caption.registerEditableListener(() => {
        placeholder = getCanShowPlaceholder();
      }),
      caption.registerUpdateListener(() => {
        placeholder = getCanShowPlaceholder();
      }),
      () => {
        caption.setRootElement(null);
      },
    );
  });
  const colorClasses: Record<StickyNoteColor, string> = {
    yellow:
      "border-[#fdfd86] bg-[linear-gradient(135deg,#ffff88_81%,#ffff88_82%,#ffff88_82%,#ffffc6_100%)]",
    pink: "border-[#e7d1e4] bg-[linear-gradient(135deg,#f7cbe8_81%,#f7cbe8_82%,#f7cbe8_82%,#e7bfe1_100%)]",
  };
</script>

<div class="absolute top-0 left-0">
  <div
    class="absolute z-10 cursor-move m-[25px] border-[#e8e8e8]"
    use:draggable={dragOptions}
    style:user-select={isDragging ? "none" : undefined}
    style:transition={isDragging
      ? undefined
      : "top 0.3s ease 0s, left 0.3s ease 0s"}
  >
    <div class="relative flex border-t-1 {colorClasses[color]}">
      <button
        onclick={handleDelete}
        type="button"
        class="absolute top-2 right-2.5 cursor-pointer opacity-50 text-[10px] hover:opacity-100 hover:font-bold"
        aria-label="Delete sticky note"
        title="Delete"
      >
        X
      </button>
      <button
        onclick={handleColorChange}
        type="button"
        class="absolute top-2 right-[25px] cursor-pointer opacity-50 text-[10px] hover:opacity-100"
        aria-label="Change sticky note color"
        title="Color"
      >
        <i class="bucket block size-3 bg-contain"></i>
      </button>
      <div
        class="font-['Reenie_Beanie'] cursor-text leading-none text-[24px] relative my-[30px] mx-[20px] w-[120px]"
      >
        <div
          bind:this={captionRoot}
          contenteditable
          aria-placeholder={placeholder ? placeholderText : undefined}
          class="border-0 resize-none min-h-5 caret-[#050505] relative outline-0 select-text whitespace-pre-wrap break-words"
        ></div>
        {#if placeholder}
          <div
            aria-hidden="true"
            class="absolute left-0 top-0 text-[#999] overflow-hidden text-ellipsis select-none inline-block pointer-events-none"
          >
            {placeholderText}
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  .bucket {
    background-image: url("./icons/paint-bucket.svg");
  }
</style>
