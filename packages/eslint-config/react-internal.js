import js from "@eslint/js";
import lexicalPlugin from "@lexical/eslint-plugin";
import onlyWarn from "eslint-plugin-only-warn";
import globals from "globals";

/**
 * This is a custom ESLint configuration for use with
 * internal (bundled by their consumer) libraries
 * that utilize React.
 * @type {import("eslint").Linter.Config[]}
 */
export default [
  // Base configs
  js.configs.recommended,

  // Lexical plugin flat config
  lexicalPlugin.configs["flat/recommended"],

  // Global configuration
  {
    plugins: {
      "only-warn": onlyWarn,
    },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        React: true,
        JSX: true,
      },
    },
  },

  // Ignore patterns
  {
    ignores: [".*.js", "node_modules/", "dist/"],
  },
];
