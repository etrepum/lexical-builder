/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { LexicalBuilder } from "./LexicalBuilder";
import type {
  AnyLexicalPlan,
  InitialEditorConfig,
  LexicalPlanConfig,
  LexicalPlanDependency,
  LexicalPlanInit,
  LexicalPlanOutput,
  RegisterState,
} from "@etrepum/lexical-builder-core";

import invariant from "./shared/invariant";

import { shallowMergeConfig } from "@etrepum/lexical-builder-core";
import type { LexicalEditor } from "lexical";

const noop = () => {};
/**
 * @internal
 */
export class PlanRep<Plan extends AnyLexicalPlan> {
  builder: LexicalBuilder;
  configs: Set<Partial<LexicalPlanConfig<Plan>>>;
  _config?: LexicalPlanConfig<Plan>;
  _dependency?: LexicalPlanDependency<Plan>;
  _output?: LexicalPlanOutput<Plan>;
  _peerNameSet?: Set<string>;
  _registerState?: RegisterState<LexicalPlanInit<Plan>>;
  _initResult?: LexicalPlanInit<Plan>;
  plan: Plan;
  constructor(builder: LexicalBuilder, plan: Plan) {
    this.builder = builder;
    this.plan = plan;
    this.configs = new Set();
  }
  register(editor: LexicalEditor, signal: AbortSignal): () => void {
    if (!this.plan.register) {
      this._output = undefined;
      return noop;
    }
    invariant(
      this._registerState !== undefined,
      "PlanRep: register called before init",
    );
    const cleanup = this.plan.register(
      editor,
      this.getConfig(),
      this.getRegisterState(signal),
    );
    this._output = cleanup.output as LexicalPlanOutput<Plan>;
    return cleanup;
  }
  init(editorConfig: InitialEditorConfig, signal: AbortSignal) {
    const config = this.getConfig();
    const registerState = this.getRegisterState(signal);
    if (this.plan.init) {
      this._initResult = this.plan.init(editorConfig, config, registerState);
    }
  }
  getInitResult(): LexicalPlanInit<Plan> {
    invariant(
      "_initResult" in this,
      "PlanRep: getInitResult() called for Plan %s but no result was set",
      this.plan.name,
    );
    return this._initResult!;
  }
  getRegisterState(signal: AbortSignal): RegisterState<LexicalPlanInit<Plan>> {
    if (!this._registerState) {
      this._registerState = {
        getPeer: this.getPeer.bind(this),
        getDependency: this.getDependency.bind(this),
        getDirectDependentNames: this.getDirectDependentNames.bind(this),
        getPeerNameSet: this.getPeerNameSet.bind(this),
        getInitResult: this.getInitResult.bind(this),
        signal,
      };
    }
    return this._registerState;
  }
  getPeer<PeerPlan extends AnyLexicalPlan = never>(
    name: PeerPlan["name"],
  ): undefined | LexicalPlanDependency<PeerPlan> {
    const rep = this.builder.planNameMap.get(name);
    return rep
      ? (rep.getPlanDependency() as LexicalPlanDependency<PeerPlan>)
      : undefined;
  }
  getDependency<Dependency extends AnyLexicalPlan>(
    dep: Dependency,
  ): LexicalPlanDependency<Dependency> {
    const rep = this.builder.getPlanRep(dep);
    invariant(
      rep !== undefined,
      "LexicalPlanBuilder: Plan %s missing dependency plan %s to be in registry",
      this.plan.name,
      dep.name,
    );
    return rep.getPlanDependency();
  }

  getDirectDependentNames() {
    return Array.from(
      this.builder.reverseEdges.get(this.plan) || [],
      (plan) => plan.name,
    );
  }

  getPeerNameSet() {
    let s = this._peerNameSet;
    if (!s) {
      s = new Set((this.plan.peerDependencies || []).map(([name]) => name));
      this._peerNameSet = s;
    }
    return s;
  }

  getPlanDependency(): LexicalPlanDependency<Plan> {
    if (!this._dependency) {
      invariant(
        "_output" in this,
        "Plan %s used as a dependency before registration",
        this.plan.name,
      );
      this._dependency = {
        config: this.getConfig(),
        output: this._output!,
      };
    }
    return this._dependency;
  }
  getConfig(): LexicalPlanConfig<Plan> {
    if (this._config === undefined) {
      let config = this.plan.config || {};
      const mergeConfig = this.plan.mergeConfig
        ? this.plan.mergeConfig.bind(this.plan)
        : shallowMergeConfig;
      for (const cfg of this.configs) {
        config = mergeConfig(config, cfg);
      }
      this._config = config;
      return config;
    }
    return this._config;
  }
}
