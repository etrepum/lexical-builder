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
import {
  PlanRep,
  applyPermanentMark,
  applyTemporaryMark,
  isExactlyPermanentPlanRepState,
  isExactlyUnmarkedPlanRepState,
} from "./PlanRep";
import { PACKAGE_VERSION } from "./PACKAGE_VERSION";
import { InitialStatePlan } from "./InitialStatePlan";

/** @internal Use a well-known symbol for dev tools purposes */
export const builderSymbol = Symbol.for("@etrepum/lexical-builder");

/**
 * Build a LexicalEditor by combining together one or more plans, optionally
 * overriding some of their configuration.
 *
 * @param plans - Plan arguments (plans or plans with config overrides)
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
  ...plans: AnyLexicalPlanArgument[]
): LexicalEditorWithDispose {
  return LexicalBuilder.fromPlans(plans).buildEditor();
}

/** @internal */
function noop() {
  /*empty*/
}

/** Throw the given Error */
function defaultOnError(err: Error) {
  throw err;
}

interface WithBuilder {
  [builderSymbol]?: LexicalBuilder | undefined;
}

/** @internal */
function maybeWithBuilder(editor: LexicalEditor): LexicalEditor & WithBuilder {
  return editor;
}

type AnyNormalizedLexicalPlanArgument = ReturnType<
  typeof normalizePlanArgument
>;
function normalizePlanArgument(arg: AnyLexicalPlanArgument) {
  return Array.isArray(arg) ? arg : configPlan(arg);
}

/** @internal */
export class LexicalBuilder {
  roots: readonly AnyNormalizedLexicalPlanArgument[];
  planNameMap: Map<string, PlanRep<AnyLexicalPlan>>;
  outgoingConfigEdges: Map<
    string,
    Map<string, LexicalPlanConfig<AnyLexicalPlan>[]>
  >;
  incomingEdges: Map<string, Set<string>>;
  conflicts: Map<string, string>;
  _sortedPlanReps?: readonly PlanRep<AnyLexicalPlan>[];
  PACKAGE_VERSION: string;

  constructor(roots: AnyNormalizedLexicalPlanArgument[]) {
    this.outgoingConfigEdges = new Map();
    this.incomingEdges = new Map();
    this.planNameMap = new Map();
    this.conflicts = new Map();
    this.PACKAGE_VERSION = PACKAGE_VERSION;
    this.roots = roots;
    for (const plan of roots) {
      this.addPlan(plan);
    }
  }

  static fromPlans(plans: AnyLexicalPlanArgument[]): LexicalBuilder {
    const roots = [normalizePlanArgument(InitialStatePlan)];
    for (const plan of plans) {
      roots.push(normalizePlanArgument(plan));
    }
    return new LexicalBuilder(roots);
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
    const {
      $initialEditorState: _$initialEditorState,
      onError,
      ...editorConfig
    } = this.buildCreateEditorArgs(controller.signal);
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
        ...(onError
          ? {
              onError: (err) => {
                onError(err, editor);
              },
            }
          : {}),
      }),
      { [builderSymbol]: this, dispose, [Symbol.dispose]: dispose },
    );
    disposeOnce = mergeRegister(
      () => {
        maybeWithBuilder(editor)[builderSymbol] = undefined;
      },
      () => {
        editor.setRootElement(null);
      },
      this.registerEditor(editor, controller),
    );
    return editor;
  }

  getPlanRep<Plan extends AnyLexicalPlan>(
    plan: Plan,
  ): PlanRep<Plan> | undefined {
    const rep = this.planNameMap.get(plan.name);
    if (rep) {
      invariant(
        rep.plan === plan,
        "LexicalBuilder: A registered plan with name %s exists but does not match the given plan",
        plan.name,
      );
      return rep as PlanRep<Plan>;
    }
  }

  addEdge(
    fromPlanName: string,
    toPlanName: string,
    configs: LexicalPlanConfig<AnyLexicalPlan>[],
  ) {
    const outgoing = this.outgoingConfigEdges.get(fromPlanName);
    if (outgoing) {
      outgoing.set(toPlanName, configs);
    } else {
      this.outgoingConfigEdges.set(
        fromPlanName,
        new Map([[toPlanName, configs]]),
      );
    }
    const incoming = this.incomingEdges.get(toPlanName);
    if (incoming) {
      incoming.add(fromPlanName);
    } else {
      this.incomingEdges.set(toPlanName, new Set([fromPlanName]));
    }
  }

  addPlan(arg: AnyLexicalPlanArgument) {
    invariant(
      this._sortedPlanReps === undefined,
      "LexicalBuilder: addPlan called after finalization",
    );
    const normalized = normalizePlanArgument(arg);
    const [plan] = normalized;
    invariant(
      typeof plan.name === "string",
      "LexicalBuilder: plan name must be string, not %s",
      typeof plan.name,
    );
    let planRep = this.planNameMap.get(plan.name);
    invariant(
      planRep === undefined || planRep.plan === plan,
      "LexicalBuilder: Multiple plans registered with name %s, names must be unique",
      plan.name,
    );
    if (!planRep) {
      planRep = new PlanRep(this, plan);
      this.planNameMap.set(plan.name, planRep);
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
      for (const dep of plan.dependencies || []) {
        const normDep = normalizePlanArgument(dep);
        this.addEdge(plan.name, normDep[0].name, normDep.slice(1));
        this.addPlan(normDep);
      }
      for (const [depName, config] of plan.peerDependencies || []) {
        this.addEdge(plan.name, depName, config ? [config] : []);
      }
    }
  }

  sortedPlanReps(): readonly PlanRep<AnyLexicalPlan>[] {
    if (this._sortedPlanReps) {
      return this._sortedPlanReps;
    }
    // depth-first search based topological DAG sort
    // https://en.wikipedia.org/wiki/Topological_sorting
    const sortedPlanReps: PlanRep<AnyLexicalPlan>[] = [];
    const visit = (rep: PlanRep<AnyLexicalPlan>, fromPlanName?: string) => {
      let mark = rep.state;
      if (isExactlyPermanentPlanRepState(mark)) {
        return;
      }
      const planName = rep.plan.name;
      invariant(
        isExactlyUnmarkedPlanRepState(mark),
        "LexicalBuilder: Circular dependency detected for Plan %s from %s",
        planName,
        fromPlanName || "[unknown]",
      );
      mark = applyTemporaryMark(mark);
      rep.state = mark;
      const outgoingConfigEdges = this.outgoingConfigEdges.get(planName);
      if (outgoingConfigEdges) {
        for (const toPlanName of outgoingConfigEdges.keys()) {
          const toRep = this.planNameMap.get(toPlanName);
          // may be undefined for an optional peer dependency
          if (toRep) {
            visit(toRep, planName);
          }
        }
      }
      mark = applyPermanentMark(mark);
      rep.state = mark;
      sortedPlanReps.push(rep);
    };
    for (const rep of this.planNameMap.values()) {
      if (isExactlyUnmarkedPlanRepState(rep.state)) {
        visit(rep);
      }
    }
    for (const rep of sortedPlanReps) {
      for (const [toPlanName, configs] of this.outgoingConfigEdges.get(
        rep.plan.name,
      ) || []) {
        if (configs.length > 0) {
          const toRep = this.planNameMap.get(toPlanName);
          if (toRep) {
            for (const config of configs) {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- any
              toRep.configs.add(config);
            }
          }
        }
      }
    }
    for (const [plan, ...configs] of this.roots) {
      if (configs.length > 0) {
        const toRep = this.planNameMap.get(plan.name);
        invariant(
          toRep !== undefined,
          "LexicalBuilder: Expecting existing PlanRep for %s",
          plan.name,
        );
        for (const config of configs) {
          toRep.configs.add(config);
        }
      }
    }
    this._sortedPlanReps = sortedPlanReps;
    return this._sortedPlanReps;
  }

  registerEditor(
    editor: LexicalEditor,
    controller: AbortController,
  ): () => void {
    const cleanups: (() => void)[] = [];
    const planReps = this.sortedPlanReps();
    for (const planRep of planReps) {
      const cleanup = planRep.register(editor);
      if (cleanup) {
        cleanups.push(cleanup);
      }
    }
    for (const planRep of planReps) {
      const cleanup = planRep.afterInitialization(editor);
      if (cleanup) {
        cleanups.push(cleanup);
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
    const planReps = this.sortedPlanReps();
    for (const planRep of planReps) {
      const { plan } = planRep;
      if (plan.onError !== undefined) {
        config.onError = plan.onError;
      }
      if (plan.disableEvents !== undefined) {
        config.disableEvents = plan.disableEvents;
      }
      if (plan.parentEditor !== undefined) {
        config.parentEditor = plan.parentEditor;
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
