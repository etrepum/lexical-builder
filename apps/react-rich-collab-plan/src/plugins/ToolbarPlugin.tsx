/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { definePlan, provideOutput } from "@etrepum/lexical-builder";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import {
  $getSelection,
  $isRangeSelection,
  BaseSelection,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_LOW,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
} from "lexical";
import { useCallback, useEffect, useRef, useState } from "react";

function Divider() {
  return <div className="divider" />;
}

export const ToolbarPlan = definePlan({
  name: import.meta.url,
  register() {
    return provideOutput({ Component: ToolbarPlugin });
  },
});

const ALIGNMENTS = ["left", "center", "right", "justify"] as const;

const FORMATS = ["bold", "italic", "underline", "strikethrough"] as const;
type CurrentFormat = Set<(typeof FORMATS)[number]>;
function formatFromSelection(selection: BaseSelection | null): CurrentFormat {
  const rval: CurrentFormat = new Set();
  if ($isRangeSelection(selection)) {
    for (const format of FORMATS) {
      if (selection.hasFormat(format)) {
        rval.add(format);
      }
    }
  }
  return rval;
}

function formatEq(a: CurrentFormat, b: CurrentFormat): boolean {
  if (a.size !== b.size) {
    return false;
  }
  for (const k of a) {
    if (!b.has(k)) {
      return false;
    }
  }
  return true;
}

function capitalizeName(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const toolbarRef = useRef(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [currentForamt, setCurrentFormat] = useState(() =>
    formatFromSelection(null),
  );

  const $updateToolbar = useCallback(() => {
    const next = formatFromSelection($getSelection());
    setCurrentFormat((prev) => (formatEq(prev, next) ? prev : next));
  }, []);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_payload, _newEditor) => {
          $updateToolbar();
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
    );
  }, [editor, $updateToolbar]);

  return (
    <div className="toolbar" ref={toolbarRef}>
      <button
        disabled={!canUndo}
        onClick={() => {
          editor.dispatchCommand(UNDO_COMMAND, undefined);
        }}
        className="toolbar-item spaced"
        aria-label="Undo"
      >
        <i className="format undo" />
      </button>
      <button
        disabled={!canRedo}
        onClick={() => {
          editor.dispatchCommand(REDO_COMMAND, undefined);
        }}
        className="toolbar-item"
        aria-label="Redo"
      >
        <i className="format redo" />
      </button>
      <Divider />
      {FORMATS.map((format) => {
        const name = capitalizeName(format);
        return (
          <button
            key={format}
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
            }}
            className={
              "toolbar-item spaced " + currentForamt.has(format) ? "active" : ""
            }
            aria-label={`Format ${name}`}
          >
            <i className={`Format ${name}`} />
          </button>
        );
      })}
      <Divider />
      {ALIGNMENTS.map((alignment) => {
        const name = capitalizeName(alignment);
        return (
          <button
            key={alignment}
            onClick={() => {
              editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, alignment);
            }}
            className="toolbar-item spaced"
            aria-label={`${name} Align`}
          >
            <i className={`format ${alignment}-align`} />
          </button>
        );
      })}
    </div>
  );
}
