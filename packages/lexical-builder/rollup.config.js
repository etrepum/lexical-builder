import nodeResolve from "@rollup/plugin-node-resolve";
import ts from "rollup-plugin-ts";
import { nodeExternals } from "rollup-plugin-node-externals";
import commonjs from "@rollup/plugin-commonjs";
import * as fs from "node:fs";

const pkg = JSON.parse(
  fs.readFileSync(new URL("./package.json", import.meta.url), "utf8")
);

export default [
  {
    input: "src/index.ts",
    output: [{ file: pkg.module, format: "es" }],
    plugins: [nodeExternals(), nodeResolve(), ts(), commonjs()],
  },
];
