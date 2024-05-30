/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { mergeRegister } from "@lexical/utils";
import {
  COMMAND_PRIORITY_CRITICAL,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
  LexicalEditor,
} from "lexical";
import { Suspense, useEffect, useState } from "react";
import * as React from "react";
import { createPortal } from "react-dom";
import { createRoot, Root } from "react-dom/client";

import { configPlan, definePlan } from "./definePlan";
import { ReactPlan } from "./ReactPlan";

export interface HostMountCommandArg {
  root: Root;
}

type Container = Element | DocumentFragment;

export interface MountPluginCommandArg {
  key: string;
  element: JSX.Element | null;
  domNode?: Container | null;
}

export function mountReactPluginComponent<
  P extends Record<never, never> = Record<never, never>,
>(
  editor: LexicalEditor,
  opts: {
    Component: null | React.ComponentType<P>;
    props: (P & React.Attributes) | null;
  } & Omit<MountPluginCommandArg, "element">
) {
  const { Component, props, ...rest } = opts;
  return mountReactPluginElement(editor, {
    ...rest,
    element: Component && props ? <Component {...props} /> : null,
  });
}

export function mountReactPluginElement(
  editor: LexicalEditor,
  opts: MountPluginCommandArg
) {
  editor.dispatchCommand(REACT_MOUNT_PLUGIN_COMMAND, opts);
}

export function mountReactPluginHost(
  editor: LexicalEditor,
  container: Container
) {
  editor.dispatchCommand(REACT_PLUGIN_HOST_MOUNT_COMMAND, {
    root: createRoot(container),
  });
}

export const REACT_PLUGIN_HOST_MOUNT_COMMAND =
  createCommand<HostMountCommandArg>("REACT_PLUGIN_HOST_MOUNT_COMMAND");
export const REACT_MOUNT_PLUGIN_COMMAND = createCommand<MountPluginCommandArg>(
  "REACT_MOUNT_PLUGIN_COMMAND"
);

export const ReactPluginHostPlan = definePlan({
  config: {},
  dependencies: [
    configPlan(ReactPlan, {
      contentEditable: null,
    }),
  ],
  name: "@etrepum/lexical-builder/ReactPluginHostPlan",
  register(editor, _config, state) {
    let root: Root | undefined;
    const mountedPlugins = new Map<
      MountPluginCommandArg["key"],
      MountPluginCommandArg
    >();
    const { ErrorBoundary, Component } = state.getDependencyConfig(ReactPlan);
    function renderMountedPlugins() {
      const children: JSX.Element[] = [];
      for (const { key, element, domNode } of mountedPlugins.values()) {
        if (!element) {
          continue;
        }
        const wrapped = (
          <ErrorBoundary onError={(e) => editor._onError(e)} key={key}>
            <Suspense fallback={null}>{element}</Suspense>
          </ErrorBoundary>
        );
        children.push(domNode ? createPortal(wrapped, domNode, key) : wrapped);
      }
      return children.length > 0 ? <>{children}</> : null;
    }
    function PluginHost() {
      const [children, setChildren] = useState(renderMountedPlugins);
      useEffect(() => {
        return editor.registerCommand(
          REACT_MOUNT_PLUGIN_COMMAND,
          () => {
            setChildren(renderMountedPlugins);
            return true;
          },
          COMMAND_PRIORITY_EDITOR
        );
      }, []);
      return children;
    }
    return mergeRegister(
      () => {
        if (root) {
          root.unmount();
        }
      },
      editor.registerCommand(
        REACT_MOUNT_PLUGIN_COMMAND,
        (arg) => {
          mountedPlugins.set(arg.key, arg);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      ),
      editor.registerCommand(
        REACT_PLUGIN_HOST_MOUNT_COMMAND,
        (arg) => {
          root = arg.root;
          root.render(
            <Component>
              <PluginHost />
            </Component>
          );
          return true;
        },
        COMMAND_PRIORITY_EDITOR
      )
    );
  },
});
