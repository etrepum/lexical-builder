/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

// TypeScript 4.9's satisfies operator is not supported by our version of prettier
export function safeCast<T>(value: T): T {
  return value;
}
