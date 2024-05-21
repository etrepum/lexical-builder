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
  LexicalPlanRegistry,
} from "./types";

import invariant from "./shared/invariant";

import { shallowMergeConfig } from "./shallowMergeConfig";

export class PlanRep<Plan extends AnyLexicalPlan> {
  builder: LexicalBuilder;
  configs: Set<LexicalPlanConfig<Plan>>;
  _config?: LexicalPlanConfig<Plan>;
  plan: Plan;
  constructor(builder: LexicalBuilder, plan: Plan) {
    this.builder = builder;
    this.plan = plan;
    this.configs = new Set();
  }
  getPeerConfig<Name extends keyof LexicalPlanRegistry>(
    name: string,
  ): undefined | LexicalPlanConfig<LexicalPlanRegistry[Name]> {
    const rep = this.builder.planNameMap.get(name);
    return rep && rep.getConfig();
  }
  getDependencyConfig<Dependency extends AnyLexicalPlan>(
    dep: Dependency,
  ): LexicalPlanConfig<Dependency> {
    const pair = this.builder.planMap.get(dep);
    invariant(
      pair !== undefined,
      "LexicalPlanBuilder: Plan %s missing dependency plan %s to be in registry",
      this.plan.name,
      dep.name,
    );
    return pair[1].getConfig();
  }
  getConfig(): LexicalPlanConfig<Plan> {
    if (this._config) {
      return this._config;
    }
    let config = this.plan.config;
    const mergeConfig = this.plan.mergeConfig
      ? this.plan.mergeConfig.bind(this.plan)
      : shallowMergeConfig;
    for (const cfg of this.configs) {
      config = mergeConfig(config, cfg);
    }
    this._config = config;
    return config;
  }
}
