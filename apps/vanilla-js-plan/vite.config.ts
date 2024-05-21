/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import path from "path";
import { defineConfig } from "vite";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@emoji-datasource-facebook": path.resolve(
        require.resolve("emoji-datasource-facebook"),
        "../img/facebook/64/"
      ),
    },
  },
});
