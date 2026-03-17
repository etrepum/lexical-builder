import js from "@eslint/js";
import lexicalPlugin from "@lexical/eslint-plugin";
import tseslint from "typescript-eslint";
import sveltePlugin from "eslint-plugin-svelte";
import onlyWarn from "eslint-plugin-only-warn";
import globals from "globals";

export default [
  // Base configs
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...sveltePlugin.configs["flat/recommended"],

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
      },
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
  },

  // Svelte TypeScript files
  {
    files: ["**/*.svelte.ts"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        extraFileExtensions: [".svelte"],
      },
    },
  },

  // Svelte-specific overrides
  {
    files: ["**/*.svelte"],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        projectService: false,
      },
    },
  },

  // Ignore patterns
  {
    ignores: [".*.js", "node_modules/", "dist/", ".svelte-kit/", "build/"],
  },
];
