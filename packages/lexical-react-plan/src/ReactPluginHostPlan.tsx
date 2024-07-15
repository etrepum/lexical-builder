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
  type LexicalEditor,
} from "lexical";
import { Suspense, useEffect, useState } from "react";
import * as React from "react";
import { createPortal } from "react-dom";
import { createRoot, type Root, type Container } from "react-dom/client";
import {
  type AnyLexicalPlan,
  configPlan,
  definePlan,
  getPlanDependencyFromEditor,
  type LexicalPlanOutput,
  provideOutput,
} from "@etrepum/lexical-builder";
import { ReactPlan } from "./ReactPlan";
import invariant from "./shared/invariant";
import { ReactProviderPlan } from "./ReactProviderPlan";
import { type DecoratorComponentProps } from "./types";

export interface HostMountCommandArg {
  root: Root;
}

export interface MountPluginCommandArg {
  key: string;
  element: JSX.Element | null;
  domNode?: Container | null;
}

export function mountReactPlanComponent<Plan extends AnyLexicalPlan>(
  editor: LexicalEditor,
  opts: {
    plan: Plan;
    props: [LexicalPlanOutput<Plan>] extends [
      {
        Component: infer OutputComponentType extends React.ComponentType;
      },
    ]
      ? /** The Props from the Plan output Component */ React.ComponentProps<OutputComponentType> | null
      : never;
  } & Omit<MountPluginCommandArg, "element">,
) {
  const { props, plan, ...rest } = opts;
  const { Component } = getPlanDependencyFromEditor(editor, plan).output;
  const element = props ? <Component {...props} /> : null;
  mountReactPluginElement(editor, {
    ...rest,
    element,
  });
}

export function mountReactPluginComponent<
  P extends Record<never, never> = Record<never, never>,
>(
  editor: LexicalEditor,
  opts: {
    Component: React.ComponentType<P>;
    props: (P & React.Attributes) | null;
  } & Omit<MountPluginCommandArg, "element">,
) {
  const { Component, props, ...rest } = opts;
  mountReactPluginElement(editor, {
    ...rest,
    element: props ? <Component {...props} /> : null,
  });
}

export function mountReactPluginElement(
  editor: LexicalEditor,
  opts: MountPluginCommandArg,
) {
  getPlanDependencyFromEditor(
    editor,
    ReactPluginHostPlan,
  ).output.mountReactPlugin(opts);
}

export function mountReactPluginHost(
  editor: LexicalEditor,
  container: Container,
) {
  getPlanDependencyFromEditor(
    editor,
    ReactPluginHostPlan,
  ).output.mountReactPluginHost(container);
}

export const REACT_PLUGIN_HOST_MOUNT_ROOT_COMMAND =
  createCommand<HostMountCommandArg>("REACT_PLUGIN_HOST_MOUNT_ROOT_COMMAND");
export const REACT_PLUGIN_HOST_MOUNT_PLUGIN_COMMAND =
  createCommand<MountPluginCommandArg>(
    "REACT_PLUGIN_HOST_MOUNT_PLUGIN_COMMAND",
  );

function PluginHostDecorator({
  context: [editor],
}: DecoratorComponentProps): JSX.Element | null {
  const {
    output: { renderMountedPlugins },
  } = getPlanDependencyFromEditor(editor, ReactPluginHostPlan);
  const [children, setChildren] = useState(renderMountedPlugins);
  useEffect(() => {
    return editor.registerCommand(
      REACT_PLUGIN_HOST_MOUNT_PLUGIN_COMMAND,
      () => {
        // This runs after the one that updates the map
        setChildren(renderMountedPlugins);
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    );
  }, [editor, renderMountedPlugins]);
  return children;
}

/**
 * This plan provides a React host for editors that are not built
 * with LexicalPlanComposer (e.g. you are using Vanilla JS or some
 * other framework).
 *
 * You must use {@link mountReactPluginHost} for any React content to work.
 * Afterwards, you may use {@link mountReactPlanComponent} to
 * render UI for a specific React Plan.
 * {@link mountReactPluginComponent} and
 * {@link mountReactPluginElement} can be used to render
 * legacy React plug-ins (or any React content).
 */
export const ReactPluginHostPlan = definePlan({
  dependencies: [
    ReactProviderPlan,
    configPlan(ReactPlan, { decorators: [PluginHostDecorator] }),
  ],
  name: "@etrepum/lexical-builder/ReactPluginHost",
  register(editor, _config, state) {
    let root: Root | undefined;
    const mountedPlugins = new Map<
      MountPluginCommandArg["key"],
      MountPluginCommandArg
    >();
    const reactDep = state.getDependency(ReactPlan);
    const {
      config: { ErrorBoundary },
      output: { Component },
    } = reactDep;
    const onError = editor._onError.bind(editor);
    function renderMountedPlugins() {
      const children: JSX.Element[] = [];
      for (const { key, element, domNode } of mountedPlugins.values()) {
        if (!element) {
          continue;
        }
        const wrapped = (
          <ErrorBoundary onError={onError} key={key}>
            <Suspense fallback={null}>{element}</Suspense>
          </ErrorBoundary>
        );
        children.push(domNode ? createPortal(wrapped, domNode, key) : wrapped);
      }
      return children.length > 0 ? <>{children}</> : null;
    }
    return provideOutput(
      {
        renderMountedPlugins,
        // Using outputs to wrap commands will give us better error messages
        // if the mount functions are called on an editor without this plan
        mountReactPluginHost: (container: Container) =>
          editor.dispatchCommand(REACT_PLUGIN_HOST_MOUNT_ROOT_COMMAND, {
            root: createRoot(container),
          }),
        mountReactPlugin: (arg: MountPluginCommandArg) =>
          editor.dispatchCommand(REACT_PLUGIN_HOST_MOUNT_PLUGIN_COMMAND, arg),
      },
      mergeRegister(
        () => {
          if (root) {
            root.unmount();
          }
          mountedPlugins.clear();
        },
        editor.registerCommand(
          REACT_PLUGIN_HOST_MOUNT_PLUGIN_COMMAND,
          (arg) => {
            // This runs before the PluginHost version
            mountedPlugins.set(arg.key, arg);
            return false;
          },
          COMMAND_PRIORITY_CRITICAL,
        ),
        editor.registerCommand(
          REACT_PLUGIN_HOST_MOUNT_ROOT_COMMAND,
          (arg) => {
            invariant(
              root === undefined,
              "ReactPluginHostPlan: Root is already mounted",
            );
            root = arg.root;
            root.render(<Component contentEditable={null} />);
            return true;
          },
          COMMAND_PRIORITY_EDITOR,
        ),
      ),
    );
  },
});
