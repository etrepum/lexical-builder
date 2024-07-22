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
  let placeholder = $state(false);

  let { caption, color } = $derived({
    caption: node.__caption,
    color: node.__color,
  });
  function resetCanShowPlaceholder() {
    caption
      .getEditorState()
      .read(() => L$canShowPlaceholder(caption.isComposing()));
  }

  // const { isCollabActive } = useCollaborationContext();
  $effect(() => {
    caption.setRootElement(captionRoot);
    return mergeRegister(
      caption.registerEditableListener(() => {
        resetCanShowPlaceholder();
      }),
      caption.registerUpdateListener(() => {
        resetCanShowPlaceholder();
      }),
      () => {
        caption.setRootElement(null);
      },
    );
  });

  $effect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        position.rootElementRect = entry.target.getBoundingClientRect();
      }
    });

    const removeRootListener = editor.registerRootListener(
      (nextRootElem, prevRootElem) => {
        if (prevRootElem !== null) {
          resizeObserver.unobserve(prevRootElem);
        }
        if (nextRootElem !== null) {
          resizeObserver.observe(nextRootElem);
        }
      },
    );

    const handleWindowResize = (): void => {
      const rootElement = editor.getRootElement();
      if (rootElement !== null) {
        position.rootElementRect = rootElement.getBoundingClientRect();
      }
    };

    window.addEventListener("resize", handleWindowResize);

    return () => {
      window.removeEventListener("resize", handleWindowResize);
      removeRootListener();
    };
  });

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
</script>

<div
  bind:this={stickyContainer}
  class="sticky-note-container"
  class:dragging={position.isDragging}
  style:left
  style:top
  style:transition="top 0.3s ease 0s, left 0.3s ease 0s"
>
  <div
    class={`sticky-note ${color}`}
    onpointerdown={(event) => {
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
    }}
  >
    <button
      onclick={handleDelete}
      type="button"
      class="delete"
      aria-label="Delete sticky note"
      title="Delete"
    >
      X
    </button>
    <button
      onclick={handleColorChange}
      type="button"
      class="color"
      aria-label="Change sticky note color"
      title="Color"
    >
      <i class="bucket"></i>
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
