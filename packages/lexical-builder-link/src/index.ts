/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

export const PACKAGE_VERSION: string = import.meta.env.PACKAGE_VERSION;

export { type LinkConfig, type LinkOutput, LinkPlan } from "./LinkPlan";
export {
  type AutoLinkConfig,
  type AutoLinkOutput,
  AutoLinkPlan,
} from "./AutoLinkPlan";
export {
  type ClickableLinkConfig,
  type ClickableLinkOutput,
  ClickableLinkPlan,
} from "./ClickableLinkPlan";
