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
  LexicalEditorWithDispose,
  InitialEditorConfig,
  LexicalPlanConfig,
} from "@etrepum/lexical-builder-core";
import {
  type LexicalEditor,
  createEditor,
  type CreateEditorArgs,
  type EditorThemeClasses,
  type HTMLConfig,
  type KlassConstructor,
  type LexicalNode,
} from "lexical";
import { mergeRegister } from "@lexical/utils";
import { configPlan } from "@etrepum/lexical-builder-core";
import invariant from "./shared/invariant";
import { deepThemeMergeInPlace } from "./deepThemeMergeInPlace";
import { PlanRep } from "./PlanRep";
import { PACKAGE_VERSION } from "./PACKAGE_VERSION";
import { InitialStatePlan } from "./InitialStatePlan";

/** @internal Use a well-known symbol for dev tools purposes */
export const builderSymbol = Symbol.for("@etrepum/lexical-builder");

/**
 * Build a LexicalEditor by combining together one or more plans, optionally
 * overriding some of their configuration.
 *
 * @param plan A plan argument (a plan, or a plan with config overrides)
 * @param plans Optional additional plan arguments
 * @returns An editor handle
 *
 * @example A single root plan with multiple dependencies
 * ```ts
 * const editor = buildEditorFromPlans(
 *   definePlan({
 *     name: "[root]",
 *     dependencies: [
 *       RichTextPlan,
 *       configPlan(EmojiPlan, { emojiBaseUrl: "/assets/emoji" }),
 *     ],
 *     register: (editor: LexicalEditor) => {
 *       console.log("Editor Created");
 *       return () => console.log("Editor Disposed");
 *     },
 *   }),
 * );
 * ```
 * @example A very similar minimal configuration without the register hook
 * ```ts
 * const editor = buildEditorFromPlans(
 *   RichTextPlan,
 *   configPlan(EmojiPlan, { emojiBaseUrl: "/assets/emoji" }),
 * );
 * ```
 */
export function buildEditorFromPlans(
  plan: AnyLexicalPlanArgument,
  ...plans: AnyLexicalPlanArgument[]
): LexicalEditorWithDispose {
  const builder = new LexicalBuilder();
  builder.addPlan(InitialStatePlan);
  builder.addPlan(plan);
  for (const otherPlan of plans) {
    builder.addPlan(otherPlan);
  }
  return builder.buildEditor();
}

/** @internal */
function noop() {}

/** Throw the given Error */
function defaultOnError(err: Error) {
  throw err;
}

interface WithBuilder {
  [builderSymbol]?: LexicalBuilder;
}

/** @internal */
function maybeWithBuilder(editor: LexicalEditor): LexicalEditor & WithBuilder {
  return editor;
}

/** @internal */
export class LexicalBuilder {
  phases: Map<AnyLexicalPlan, PlanRep<AnyLexicalPlan>>[];
  planMap: Map<AnyLexicalPlan, [number, PlanRep<AnyLexicalPlan>]>;
  planNameMap: Map<string, PlanRep<AnyLexicalPlan>>;
  reverseEdges: Map<AnyLexicalPlan, Set<AnyLexicalPlan>>;
  addStack: Set<AnyLexicalPlan>;
  conflicts: Map<string, string>;
  PACKAGE_VERSION: string;

  constructor() {
    // closure compiler can't handle class initializers
    this.phases = [new Map()];
    this.planMap = new Map();
    this.planNameMap = new Map();
    this.conflicts = new Map();
    this.reverseEdges = new Map();
    this.addStack = new Set();
    this.PACKAGE_VERSION = PACKAGE_VERSION;
  }

  /** Look up the editor that was created by this LexicalBuilder or throw */
  static fromEditor(editor: LexicalEditor): LexicalBuilder {
    const builder = maybeWithBuilder(editor)[builderSymbol];
    invariant(
      builder && typeof builder === "object",
      "LexicalBuilder.fromEditor: The given editor was not created with LexicalBuilder, or has been disposed",
    );
    // The dev tools variant of this will relax some of these invariants
    invariant(
      builder.PACKAGE_VERSION === PACKAGE_VERSION,
      "LexicalBuilder.fromEditor: The given editor was created with LexicalBuilder %s but this version is %s. A project should have exactly one copy of LexicalBuilder",
      builder.PACKAGE_VERSION,
      PACKAGE_VERSION,
    );
    invariant(
      builder instanceof LexicalBuilder,
      "LexicalBuilder.fromEditor: There are multiple copies of the same version of LexicalBuilder in your project, and this editor was created with another one. Your project, or one of its dependencies, has its package.json and/or bundler configured incorrectly.",
    );
    return builder;
  }

  buildEditor(): LexicalEditorWithDispose {
    const controller = new AbortController();
    const { $initialEditorState, onError, ...editorConfig } =
      this.buildCreateEditorArgs(controller.signal);
    let disposeOnce = noop;
    function dispose() {
      try {
        disposeOnce();
      } finally {
        disposeOnce = noop;
      }
    }
    const editor: LexicalEditorWithDispose & WithBuilder = Object.assign(
      createEditor({
        ...editorConfig,
        ...(onError ? { onError: (err) => { onError(err, editor); } } : {}),
      }),
      { [builderSymbol]: this, dispose, [Symbol.dispose]: dispose },
    );
    disposeOnce = mergeRegister(
      () => {
        delete maybeWithBuilder(editor)[builderSymbol];
      },
      () => { editor.setRootElement(null); },
      this.registerEditor(editor, controller),
    );
    return editor;
  }

  getPlanRep<Plan extends AnyLexicalPlan>(
    plan: Plan,
  ): PlanRep<Plan> | undefined {
    const pair = this.planMap.get(plan);
    if (pair) {
      const rep: PlanRep<AnyLexicalPlan> = pair[1];
      return rep as PlanRep<Plan>;
    }
  }

  addPlan(arg: AnyLexicalPlanArgument, parent?: AnyLexicalPlan): number {
    let plan: AnyLexicalPlan;
    let configs: unknown[];
    if (Array.isArray(arg)) {
      [plan, ...configs] = arg;
    } else {
      plan = arg;
      configs = [];
    }
    invariant(
      typeof plan.name === "string",
      "LexicalBuilder: plan name must be string, not %s",
      typeof plan.name,
    );
    // Track incoming dependencies
    if (parent) {
      let edgeSet = this.reverseEdges.get(plan);
      if (!edgeSet) {
        edgeSet = new Set();
        this.reverseEdges.set(plan, edgeSet);
      }
      edgeSet.add(parent);
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
      invariant(
        !this.addStack.has(plan),
        "LexicalBuilder: Circular dependency detected for Plan %s from %s",
        plan.name,
        parent?.name || "[unknown]",
      );
      this.addStack.add(plan);
      for (const dep of plan.dependencies || []) {
        phase = Math.max(phase, 1 + this.addPlan(dep, plan));
      }
      for (const [depName, cfg] of plan.peerDependencies || []) {
        const dep = this.planNameMap.get(depName);
        if (dep) {
          phase = Math.max(
            phase,
            1 +
              this.addPlan(
                configPlan(
                  dep.plan,
                  (cfg || {}) as LexicalPlanConfig<typeof dep.plan>,
                ),
                plan,
              ),
          );
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
      this.addStack.delete(plan);
    }
    for (const config of configs) {
      planRep.configs.add(config as Partial<LexicalPlanConfig<AnyLexicalPlan>>);
    }
    return phase;
  }

  *sortedPlanReps() {
    for (const phase of this.phases) {
      yield* phase.values();
    }
  }

  registerEditor(
    editor: LexicalEditor,
    controller: AbortController,
  ): () => void {
    const cleanups: (() => void)[] = [];
    const signal = controller.signal;
    const planReps: PlanRep<AnyLexicalPlan>[] = [];
    for (const planRep of this.sortedPlanReps()) {
      const cleanup = planRep.register(editor, signal);
      if (cleanup) {
        cleanups.push(cleanup);
      }
      planReps.push(planRep);
    }
    for (const planRep of planReps) {
      const cleanup = planRep.afterInitialization(editor, signal);
      if (cleanup) {
        cleanups.push(cleanup);
      }
    }
    planReps.length = 0;
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

  buildCreateEditorArgs(signal: AbortSignal) {
    const config: InitialEditorConfig = {};
    const nodes = new Set<NonNullable<CreateEditorArgs["nodes"]>[number]>();
    const replacedNodes = new Map<
      KlassConstructor<typeof LexicalNode>,
      PlanRep<AnyLexicalPlan>
    >();
    const htmlExport: NonNullable<HTMLConfig["export"]> = new Map();
    const htmlImport: NonNullable<HTMLConfig["import"]> = {};
    const theme: EditorThemeClasses = {};
    const planReps = [...this.sortedPlanReps()];
    for (const planRep of planReps) {
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
    for (const planRep of planReps) {
      planRep.init(config, signal);
    }
    if (!config.onError) {
      config.onError = defaultOnError;
    }
    return config;
  }
}
