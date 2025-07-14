/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { fileURLToPath } from "node:url";
import { defineConfig, normalizePath } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { resolve } from "import-meta-resolve";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: normalizePath(
            fileURLToPath(
              resolve(
                "@etrepum/lexical-emoji-extension/dist/emoji/*.png",
                import.meta.url,
              ),
            ),
          ),
          dest: "./assets/emoji",
        },
      ],
    }),
  ],
});
