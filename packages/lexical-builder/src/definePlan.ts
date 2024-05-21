/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {
  AnyLexicalPlan,
  LexicalPlan,
  LexicalPlanConfig,
  PlanConfigBase,
} from './types';

export function definePlan<Config extends PlanConfigBase, Name extends string>(
  plan: LexicalPlan<Config, Name>,
) {
  return plan;
}

export function configPlan<Plan extends AnyLexicalPlan>(
  plan: Plan,
  config: Partial<LexicalPlanConfig<Plan>>,
): [Plan, Partial<LexicalPlanConfig<Plan>>] {
  return [plan, config];
}
