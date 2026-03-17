import js from "@eslint/js";
import lexicalPlugin from "@lexical/eslint-plugin";
import tseslint from "typescript-eslint";
import onlyWarn from "eslint-plugin-only-warn";
import globals from "globals";

/**
 * Shared ESLint flat config for library packages
 * @type {import("eslint").Linter.Config[]}
 */
export default [
  // Base configs
  js.configs.recommended,
  ...tseslint.configs.recommended,

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
    rules: {
      "no-nested-ternary": "off",
      "unicorn/filename-case": "off",
      "import/no-default-export": "off",
      "@typescript-eslint/prefer-nullish-coalescing": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/triple-slash-reference": "off",
      eqeqeq: "off",
    },
  },

  // TypeScript files - enable type checking
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "no-undef": "off",
      "no-unused-vars": "off",
    },
  },

  // Vitest config files
  {
    files: ["vitest.config.ts"],
    rules: {
      "import/no-relative-packages": "off",
    },
  },

  // Ignore patterns
  {
    ignores: [".*.js", "node_modules/", "dist/"],
  },
];
