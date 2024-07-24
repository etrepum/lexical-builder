<script lang="ts">
  import "@fontsource/reenie-beanie";
  import { type LexicalEditor } from "lexical";
  import { calculateZoomLevel, mergeRegister } from "@lexical/utils";
  import { $canShowPlaceholder as L$canShowPlaceholder } from "@lexical/text";
  import { StickyNode, type StickyNoteColor } from "./StickyNode";
  /* eslint-disable prefer-const -- svelte runes */
  interface Positioning {
    isDragging: boolean;
    offsetX: number;
    offsetY: number;
    rootElementRect: null | DOMRect;
    x: number;
    y: number;
  }

  let stickyContainer: HTMLDivElement;
  let captionRoot: HTMLDivElement;
  let { node, editor }: { node: StickyNode; editor: LexicalEditor } = $props();
  let position = $state<Positioning>({
    isDragging: false,
    offsetX: 0,
    offsetY: 0,
    rootElementRect: editor.getRootElement()?.getBoundingClientRect() ?? null,
    x: node.__x,
    y: node.__y,
  });

  let { left, top } = $derived.by(() => {
    const rootElementRect = position.rootElementRect;
    if (rootElementRect === null) {
      return { top: undefined, left: undefined };
    }
    return {
      top: `${String(rootElementRect.top + position.y)}px`,
      left: `${String(rootElementRect.left + position.x)}px`,
    };
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

  // const { isCollabActive } = useCollaborationContext();
  const handleWindowResize = (): void => {
    const rootElement = editor.getRootElement();
    if (rootElement !== null) {
      position.rootElementRect = rootElement.getBoundingClientRect();
    }
  };

  const handlePointerMove = (event: PointerEvent): void => {
    const rootElementRect = position.rootElementRect;
    const zoom = calculateZoomLevel(stickyContainer);
    if (position.isDragging && rootElementRect !== null) {
      position.x = event.pageX / zoom - position.offsetX - rootElementRect.left;
      position.y = event.pageY / zoom - position.offsetY - rootElementRect.top;
    }
  };

  const handlePointerUp = (_event: PointerEvent): void => {
    position.isDragging = false;
    editor.update(() => {
      node.setPosition(position.x, position.y);
    });
    document.removeEventListener("pointermove", handlePointerMove);
    document.removeEventListener("pointerup", handlePointerUp);
  };

  const handlePointerDown = (event: PointerEvent): void => {
    if (event.button === 2 || event.target !== event.currentTarget) {
      // Right click or click on editor should not work
      return;
    }
    const { top, left } = stickyContainer.getBoundingClientRect();
    const zoom = calculateZoomLevel(stickyContainer);
    position.offsetX = event.clientX / zoom - left;
    position.offsetY = event.clientY / zoom - top;
    position.isDragging = true;
    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", handlePointerUp);
    event.preventDefault();
  };

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

  const resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      position.rootElementRect = entry.target.getBoundingClientRect();
    }
  });
  const cleanup = editor.registerRootListener((nextRootElem, prevRootElem) => {
    if (prevRootElem !== null) {
      resizeObserver.unobserve(prevRootElem);
    }
    if (nextRootElem !== null) {
      resizeObserver.observe(nextRootElem);
    }
  });
  $effect(() => cleanup);
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

<svelte:window onresize={handleWindowResize} />
<div class="contents">
  <div
    bind:this={stickyContainer}
    class="absolute w-[120px] inline-block z-10 cursor-move m-[25px] border-[#e8e8e8]"
    style:left
    style:top
    style:transition={position.isDragging
      ? undefined
      : "top 0.3s ease 0s, left 0.3s ease 0s"}
  >
    <div
      class="relative border-t-1 py-5 px-2.5 {colorClasses[color]}"
      onpointerdown={handlePointerDown}
    >
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
        class="font-['Reenie_Beanie'] cursor-text leading-none text-[24px] relative m-5"
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
