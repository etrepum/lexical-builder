/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import path from "path";
import { defineConfig } from "vite";
import dataPlugin from "vite-plugin-data";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { normalizePath } from "vite";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    dataPlugin(),
    viteStaticCopy({
      targets: [
        {
          src: normalizePath(
            path.resolve(
              require.resolve("emoji-datasource-facebook"),
              "../img/facebook/64/*.png"
            )
          ),
          dest: "../public/emoji",
        },
      ],
    }),
  ],
});
