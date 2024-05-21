/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

export function deepThemeMergeInPlace(a: unknown, b: unknown) {
  if (
    a &&
    b &&
    !Array.isArray(b) &&
    typeof a === 'object' &&
    typeof b === 'object'
  ) {
    const aObj = a as Record<string, unknown>;
    const bObj = b as Record<string, unknown>;
    for (const k in bObj) {
      aObj[k] = deepThemeMergeInPlace(aObj[k], bObj[k]);
    }
    return a;
  }
  return b;
}
