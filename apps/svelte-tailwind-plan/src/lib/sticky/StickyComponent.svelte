<script lang="ts">
  import { type LexicalEditor } from "lexical";
  import { calculateZoomLevel, mergeRegister } from "@lexical/utils";
  import { $canShowPlaceholder as L$canShowPlaceholder } from "@lexical/text";
  import { StickyNode } from "./StickyNode";
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
    rootElementRect: null,
    x: node.__x,
    y: node.__y,
  });

  let { left, top } = $derived.by(() => {
    const rootElementRect = position.rootElementRect;
    const rectLeft = rootElementRect !== null ? rootElementRect.left : 0;
    const rectTop = rootElementRect !== null ? rootElementRect.top : 0;
    return {
      top: `${String(rectTop + position.y)}px`,
      left: `${String(rectLeft + position.x)}px`,
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
    stickyContainer.classList.remove("dragging");
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

  $effect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        position.rootElementRect = entry.target.getBoundingClientRect();
      }
    });
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
      editor.registerRootListener((nextRootElem, prevRootElem) => {
        if (prevRootElem !== null) {
          resizeObserver.unobserve(prevRootElem);
        }
        if (nextRootElem !== null) {
          resizeObserver.observe(nextRootElem);
        }
      }),
    );
  });
</script>

<svelte:window onresize={handleWindowResize} />
<div class="contents">
  <div
    bind:this={stickyContainer}
    class="absolute w-[120px] inline-block z-10"
    style:left
    style:top
    style:transition={position.isDragging
      ? undefined
      : "top 0.3s ease 0s, left 0.3s ease 0s"}
  >
    <div class="sticky-note {color}" onpointerdown={handlePointerDown}>
      <button
        onclick={handleDelete}
        type="button"
        class="absolute top-2 right-2.5 cursor-pointer opacity-50"
        aria-label="Delete sticky note"
        title="Delete"
      >
        X
      </button>
      <button
        onclick={handleColorChange}
        type="button"
        class="absolute top-2 right-[25px] cursor-pointer opacity-50"
        aria-label="Change sticky note color"
        title="Color"
      >
        🪣
      </button>
      <div
        bind:this={captionRoot}
        contenteditable
        aria-placeholder={placeholder ? placeholderText : undefined}
        class="StickyNode__contentEditable"
      ></div>
      {#if placeholder}
        <div aria-hidden="true" class="StickyNode__placeholder">
          {placeholderText}
        </div>
      {/if}
    </div>
  </div>
</div>
