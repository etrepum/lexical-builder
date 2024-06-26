/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import plugin from "tailwindcss/plugin";
import type { Config, PluginCreator } from "tailwindcss/types/config";

// eslint-disable-next-line @typescript-eslint/no-empty-interface -- no options yet
export interface LexicalTailwindOptions {
  /* empty for now */
}

const defaultOptions: LexicalTailwindOptions = {};
function pluginFunction(
  _options: LexicalTailwindOptions = defaultOptions,
): PluginCreator {
  return (_api) => {
    /* empty for now */
  };
}

function configFunction(
  _options: LexicalTailwindOptions = defaultOptions,
): Partial<Config> {
  return {
    theme: {
      extend: {
        animation: {
          "lexical-cursor-blink":
            "lexical-cursor-blink 1.1s steps(2, start) infinite",
        },
        keyframes: {
          "lexical-cursor-blink": {
            to: { visibility: "hidden" },
          },
        },
      },
    },
  };
}

const lexicalTailwindPlugin = plugin.withOptions(
  pluginFunction,
  configFunction,
);

module.exports = lexicalTailwindPlugin;
