/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import type {
  AnyLexicalPlan,
  AnyLexicalPlanArgument,
  EditorHandle,
} from "./types";

import {
  LexicalEditor,
  createEditor,
  type CreateEditorArgs,
  type EditorThemeClasses,
  type HTMLConfig,
  type KlassConstructor,
  type LexicalNode,
} from "lexical";
import invariant from "./shared/invariant";

import { deepThemeMergeInPlace } from "./deepThemeMergeInPlace";
import { initializeEditor } from "./initializeEditor";
import { PlanRep } from "./PlanRep";
import { mergeRegister } from "@lexical/utils";

const buildersForEditors = new WeakMap<LexicalEditor, LexicalBuilder>();

export function buildEditorFromPlans(
  plan: AnyLexicalPlanArgument,
  ...plans: AnyLexicalPlanArgument[]
): EditorHandle {
  const builder = new LexicalBuilder();
  builder.addPlan(plan);
  for (const otherPlan of plans) {
    builder.addPlan(otherPlan);
  }
  return builder.buildEditor();
}

function noop() {}
class DisposableEditorHandle implements EditorHandle {
  editor: LexicalEditor;
  dispose: () => void;
  constructor(editor: LexicalEditor, dispose: () => void) {
    this.editor = editor;
    this.dispose = () => {
      try {
        dispose();
      } finally {
        this.dispose = noop;
      }
    };
  }
  // This should be safe even if the runtime doesn't have Symbol.dispose
  // because it will just be `handle[undefined] = dispose;`
  [Symbol.dispose]() {
    this.dispose();
  }
}

function defaultOnError(err: Error) {
  throw err;
}

/** @internal */
export class LexicalBuilder {
  phases: Map<AnyLexicalPlan, PlanRep<AnyLexicalPlan>>[];
  planMap: Map<AnyLexicalPlan, [number, PlanRep<AnyLexicalPlan>]>;
  planNameMap: Map<string, PlanRep<AnyLexicalPlan>>;
  conflicts: Map<string, string>;

  constructor() {
    // closure compiler can't handle class initializers
    this.phases = [new Map()];
    this.planMap = new Map();
    this.planNameMap = new Map();
    this.conflicts = new Map();
  }

  static fromEditor(editor: LexicalEditor): LexicalBuilder {
    const builder = buildersForEditors.get(editor);
    invariant(
      builder !== undefined,
      "LexicalBuilder.fromEditor: editor was not created with this version of LexicalBuilder",
    );
    return builder;
  }

  buildEditor(): EditorHandle {
    const { $initialEditorState, onError, ...editorConfig } =
      this.buildCreateEditorArgs();
    const editor = createEditor({
      ...editorConfig,
      ...(onError ? { onError: (err) => onError(err, editor) } : {}),
    });
    initializeEditor(editor, $initialEditorState);
    buildersForEditors.set(editor, this);
    return new DisposableEditorHandle(
      editor,
      mergeRegister(
        () => buildersForEditors.delete(editor),
        () => editor.setRootElement(null),
        this.registerEditor(editor),
      ),
    );
  }

  addPlan(arg: AnyLexicalPlanArgument): number {
    let plan: AnyLexicalPlan;
    let configs: unknown[];
    if (Array.isArray(arg)) {
      [plan, ...configs] = arg;
    } else {
      plan = arg;
      configs = [];
    }
    let [phase, planRep] = this.planMap.get(plan) || [0, undefined];
    if (!planRep) {
      const hasConflict = this.conflicts.get(plan.name);
      if (typeof hasConflict === "string") {
        invariant(
          false,
          "LexicalBuilder: plan %s conflicts with %s",
          plan.name,
          hasConflict,
        );
      }
      for (const name of plan.conflictsWith || []) {
        invariant(
          !this.planNameMap.has(name),
          "LexicalBuilder: plan %s conflicts with %s",
          plan.name,
          name,
        );
        this.conflicts.set(name, plan.name);
      }
      // TODO detect circular dependencies
      for (const dep of plan.dependencies || []) {
        phase = Math.max(phase, 1 + this.addPlan(dep));
      }
      for (const [depName, cfg] of Object.entries(
        plan.peerDependencies || {},
      )) {
        const dep = this.planNameMap.get(depName);
        if (dep) {
          phase = Math.max(phase, 1 + this.addPlan([dep.plan, cfg]));
        }
      }
      invariant(
        this.phases.length >= phase,
        "LexicalBuilder: Expected phase to be no greater than phases.length",
      );
      if (this.phases.length === phase) {
        this.phases.push(new Map());
      }
      planRep = new PlanRep(this, plan);
      invariant(
        !this.planNameMap.has(plan.name),
        "LexicalBuilder: Multiple plans registered with name %s, names must be unique",
        plan.name,
      );
      this.planMap.set(plan, [phase, planRep]);
      this.planNameMap.set(plan.name, planRep);
      const currentPhaseMap = this.phases[phase];
      invariant(
        currentPhaseMap !== undefined,
        "LexicalBuilder: Expecting phase map for phase %s",
        String(phase),
      );
      currentPhaseMap.set(plan, planRep);
    }
    for (const config of configs) {
      planRep.configs.add(config);
    }
    return phase;
  }

  *sortedPlanReps() {
    for (const phase of this.phases) {
      yield* phase.values();
    }
  }

  registerEditor(editor: LexicalEditor): () => void {
    const cleanups: (() => void)[] = [];
    const controller = new AbortController();
    for (const planRep of this.sortedPlanReps()) {
      if (planRep.plan.register) {
        cleanups.push(
          planRep.plan.register(editor, planRep.getConfig(), {
            getDependencyConfig: planRep.getDependencyConfig.bind(planRep),
            getPeerConfig: planRep.getPeerConfig.bind(planRep),
            signal: controller.signal,
          }),
        );
      }
    }
    return () => {
      for (let i = cleanups.length - 1; i >= 0; i--) {
        const cleanupFun = cleanups[i];
        invariant(
          cleanupFun !== undefined,
          "LexicalBuilder: Expecting cleanups[%s] to be defined",
          String(i),
        );
        cleanupFun();
      }
      cleanups.length = 0;
      controller.abort();
    };
  }

  buildCreateEditorArgs() {
    const config: Pick<
      CreateEditorArgs,
      "nodes" | "html" | "theme" | "disableEvents" | "editable" | "namespace"
    > &
      Pick<AnyLexicalPlan, "$initialEditorState" | "onError"> = {
        // Prefer throwing errors rather than console.error by default
        onError: defaultOnError
      };
    const nodes = new Set<NonNullable<CreateEditorArgs["nodes"]>[number]>();
    const replacedNodes = new Map<
      KlassConstructor<typeof LexicalNode>,
      PlanRep<AnyLexicalPlan>
    >();
    const htmlExport: NonNullable<HTMLConfig["export"]> = new Map();
    const htmlImport: NonNullable<HTMLConfig["import"]> = {};
    const theme: EditorThemeClasses = {};
    for (const planRep of this.sortedPlanReps()) {
      const { plan } = planRep;
      if (plan.onError !== undefined) {
        config.onError = plan.onError;
      }
      if (plan.disableEvents !== undefined) {
        config.disableEvents = plan.disableEvents;
      }
      if (plan.editable !== undefined) {
        config.editable = plan.editable;
      }
      if (plan.namespace !== undefined) {
        config.namespace = plan.namespace;
      }
      if (plan.$initialEditorState !== undefined) {
        config.$initialEditorState = plan.$initialEditorState;
      }
      if (plan.nodes) {
        for (const node of plan.nodes) {
          if (typeof node !== "function") {
            const conflictPlan = replacedNodes.get(node.replace);
            if (conflictPlan) {
              invariant(
                false,
                "LexicalBuilder: Plan %s can not register replacement for node %s because %s already did",
                plan.name,
                node.replace.name,
                conflictPlan.plan.name,
              );
            }
            replacedNodes.set(node.replace, planRep);
          }
          nodes.add(node);
        }
      }
      if (plan.html) {
        if (plan.html.export) {
          for (const [k, v] of plan.html.export.entries()) {
            htmlExport.set(k, v);
          }
        }
        if (plan.html.import) {
          Object.assign(htmlImport, plan.html.import);
        }
      }
      if (plan.theme) {
        deepThemeMergeInPlace(theme, plan.theme);
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    if (Object.keys(theme).length > 0) {
      config.theme = theme;
    }
    if (nodes.size) {
      config.nodes = [...nodes];
    }
    const hasImport = Object.keys(htmlImport).length > 0;
    const hasExport = htmlExport.size > 0;
    if (hasImport || hasExport) {
      config.html = {};
      if (hasImport) {
        config.html.import = htmlImport;
      }
      if (hasExport) {
        config.html.export = htmlExport;
      }
    }
    return config;
  }
}
