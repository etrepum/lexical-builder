import js from "@eslint/js";
import lexicalPlugin from "@lexical/eslint-plugin";
import onlyWarn from "eslint-plugin-only-warn";
import globals from "globals";

/**
 * ESLint flat config for Next.js applications
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
        ...globals.node,
        React: true,
        JSX: true,
      },
    },
  },

  // Ignore patterns
  {
    ignores: [".*.js", "node_modules/"],
  },
];
