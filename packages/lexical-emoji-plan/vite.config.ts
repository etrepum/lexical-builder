/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import path from "node:path";
import { createRequire } from "node:module";
import { defineConfig, normalizePath } from "vite";
import dataPlugin from "vite-plugin-data";
import dts from "vite-plugin-dts";
import { viteStaticCopy } from "vite-plugin-static-copy";
import packageVersion from "vite-plugin-package-version";

const require = createRequire(import.meta.url);

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: [
        "index",
        "loadTextNodeTransform",
        "loadTextNodeTransform.node",
      ].map((fn) => path.resolve(__dirname, `src/${fn}.ts`)),
      formats: ["es"],
    },
    rollupOptions: {
      // Anything that does not start with . or / is external
      external: /^[^./]/,
    },
  },
  plugins: [
    packageVersion(),
    dataPlugin(),
    viteStaticCopy({
      targets: [
        {
          src: normalizePath(
            path.resolve(
              require.resolve("emoji-datasource-facebook"),
              "../img/facebook/64/*.png",
            ),
          ),
          dest: "./emoji",
        },
      ],
    }),
    dts({ include: ["src"] }),
  ],
});
