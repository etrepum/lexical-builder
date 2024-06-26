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

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      fileName: (moduleFormat, entryName) => `${entryName}.${moduleFormat}`,
      entry: path.resolve(__dirname, "src/index.ts"),
      formats: ["cjs"],
    },
    rollupOptions: {
      // Anything that does not start with . or / is external
      external: /^[^./]/,
    },
  },
  plugins: [
    dts({
      include: ["src"],
      beforeWriteFile(filePath, content) {
        return {
          filePath: filePath.replace("/index.d.ts", "/index.d.cts"),
          content,
        };
      },
    }),
  ],
});
