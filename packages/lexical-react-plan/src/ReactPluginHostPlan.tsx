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
import { ComponentProps, Suspense, useEffect, useState } from "react";
import * as React from "react";
import { createPortal } from "react-dom";
import { createRoot, Root } from "react-dom/client";

import {
  AnyLexicalPlan,
  configPlan,
  definePlan,
  getPlanDependencyFromEditor,
  LexicalPlanDependency,
} from "@etrepum/lexical-builder";
import { ReactPlan } from "./ReactPlan";
import invariant from "./shared/invariant";
import { ReactProviderPlan } from "./ReactProviderPlan";

export interface HostMountCommandArg {
  root: Root;
}

export type Container = Element | DocumentFragment;

export interface MountPluginCommandArg {
  key: string;
  element: JSX.Element | null;
  domNode?: Container | null;
}

export function mountReactPlanComponent<
  Plan extends AnyLexicalPlan,
  P extends ComponentProps<LexicalPlanDependency<Plan>["output"]["Component"]>,
>(
  editor: LexicalEditor,
  opts: {
    plan: null | Plan;
    props: (P & React.Attributes) | null;
  } & Omit<MountPluginCommandArg, "element">,
) {
  const { props, plan, ...rest } = opts;
  const Component =
    plan && props
      ? getPlanDependencyFromEditor(editor, plan).output.Component
      : null;
  return mountReactPluginElement(editor, {
    ...rest,
    element: Component && <Component {...props} />,
  });
}

export function mountReactPluginComponent<
  P extends Record<never, never> = Record<never, never>,
>(
  editor: LexicalEditor,
  opts: {
    Component: null | React.ComponentType<P>;
    props: (P & React.Attributes) | null;
  } & Omit<MountPluginCommandArg, "element">,
) {
  const { Component, props, ...rest } = opts;
  return mountReactPluginElement(editor, {
    ...rest,
    element: Component && props ? <Component {...props} /> : null,
  });
}

export function mountReactPluginElement(
  editor: LexicalEditor,
  opts: MountPluginCommandArg,
) {
  editor.dispatchCommand(REACT_MOUNT_PLUGIN_COMMAND, opts);
}

export function mountReactPluginHost(
  editor: LexicalEditor,
  container: Container,
) {
  editor.dispatchCommand(REACT_PLUGIN_HOST_MOUNT_COMMAND, {
    root: createRoot(container),
  });
}

export const REACT_PLUGIN_HOST_MOUNT_COMMAND =
  createCommand<HostMountCommandArg>("REACT_PLUGIN_HOST_MOUNT_COMMAND");
export const REACT_MOUNT_PLUGIN_COMMAND = createCommand<MountPluginCommandArg>(
  "REACT_MOUNT_PLUGIN_COMMAND",
);

export const ReactPluginHostPlan = definePlan({
  config: {},
  dependencies: [
    ReactProviderPlan,
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
    const {
      config: { ErrorBoundary },
      output: { Component },
    } = state.getDependency(ReactPlan);
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
          COMMAND_PRIORITY_EDITOR,
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
          // This runs before the PluginHost version
          mountedPlugins.set(arg.key, arg);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
      editor.registerCommand(
        REACT_PLUGIN_HOST_MOUNT_COMMAND,
        (arg) => {
          invariant(
            root === undefined,
            "ReactPluginHostPlan: Root is already mounted",
          );
          root = arg.root;
          root.render(
            <Component>
              <PluginHost />
            </Component>,
          );
          return true;
        },
        COMMAND_PRIORITY_EDITOR,
      ),
    );
  },
});
