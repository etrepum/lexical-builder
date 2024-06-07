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
  LexicalPlanConfig,
  LexicalPlanDependency,
  LexicalPlanOutput,
} from "./types";
import type { LexicalPlanRegistry } from "@etrepum/lexical-builder";

import invariant from "./shared/invariant";

import { shallowMergeConfig } from "./shallowMergeConfig";
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
    const cleanup = this.plan.register(editor, this.getConfig(), {
      getPeer: this.getPeer.bind(this),
      getDependency: this.getDependency.bind(this),
      signal,
    });
    this._output = cleanup.output as LexicalPlanOutput<Plan>;
    return cleanup;
  }
  getPeer<Name extends keyof LexicalPlanRegistry>(
    name: string,
  ): undefined | LexicalPlanDependency<LexicalPlanRegistry[Name]> {
    const rep = this.builder.planNameMap.get(name);
    return rep
      ? (rep.getPlanDependency() as LexicalPlanDependency<
          LexicalPlanRegistry[Name]
        >)
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
    if (!this._config) {
      let config = this.plan.config;
      const mergeConfig = this.plan.mergeConfig
        ? this.plan.mergeConfig.bind(this.plan)
        : shallowMergeConfig;
      for (const cfg of this.configs) {
        config = mergeConfig(config, cfg);
      }
      this._config = config;
    }
    return this._config;
  }
}
