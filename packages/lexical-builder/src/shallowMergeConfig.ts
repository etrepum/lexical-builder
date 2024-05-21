/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import type { PlanConfigBase } from "./types";

export function shallowMergeConfig<T extends PlanConfigBase>(
  a: T,
  b?: Partial<T>,
): T {
  if (!b || a === b) {
    return a;
  }
  for (const k in b) {
    if (b[k] !== a[k]) {
      return { ...a, ...b };
    }
  }
  return a;
}
