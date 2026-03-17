import library from "@repo/eslint-config/library.js";

export default [
  ...library,
  {
    ignores: ["build/", ".docusaurus/"],
  },
];
