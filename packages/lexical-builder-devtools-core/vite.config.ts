/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import path from "node:path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import packageVersion from "vite-plugin-package-version";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      fileName: "index",
      entry: path.resolve(__dirname, "src/index.ts"),
      formats: ["es"],
    },
    rollupOptions: {
      // Anything that does not start with . or / is external
      external: /^[^./]/,
    },
  },
  plugins: [packageVersion(), dts({ include: ["src"] })],
});
