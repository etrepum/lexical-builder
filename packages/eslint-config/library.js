const { resolve } = require("node:path");

const project = resolve(process.cwd(), "tsconfig.json");

/** @type {import("eslint").Linter.Config} */
module.exports = {
  rules: {
    "no-nested-ternary": "off",
    "unicorn/filename-case": "off",
    "import/no-default-export": "off",
    "@typescript-eslint/prefer-nullish-coalescing": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "turbo/no-undeclared-env-vars": [
      "warn",
      { allowList: ["PACKAGE_VERSION"] },
    ],
    eqeqeq: "off",
  },
  extends: [
    ...[
      "@vercel/style-guide/eslint/node",
      "@vercel/style-guide/eslint/typescript",
      "@vercel/style-guide/eslint/browser",
      "@vercel/style-guide/eslint/react",
      "eslint-config-turbo",
    ].map(require.resolve),
    // https://github.com/facebook/lexical/pull/6252 - do not upgrade to v0.16.0
    "plugin:@lexical/recommended",
  ],
  plugins: ["only-warn"],
  globals: {
    React: true,
    JSX: true,
  },
  env: {
    node: true,
  },
  parserOptions: { project },
  settings: {
    "import/resolver": {
      typescript: {
        project,
      },
    },
  },
  ignorePatterns: [
    // Ignore dotfiles
    ".*.js",
    "node_modules/",
    "dist/",
  ],
  overrides: [
    {
      files: ["*.tsx?", "*.ts"],
      rules: {
        "no-undef": "off",
        "no-unused-vars": "off",
      },
    },
    {
      files: ["vitest.config.ts"],
      rules: {
        // import { defineTestConfig } from "../lexical-builder/tests/shared/defineTestConfig";
        "import/no-relative-packages": "off",
      },
    },
  ],
};
