import { AliasOptions, type UserConfig } from "vite";
import { fileURLToPath } from "node:url";
import * as path from "node:path";
import * as fs from "node:fs";
import { globSync } from "glob";

function readPackageJson(base: string | URL) {
  return JSON.parse(fs.readFileSync(new URL("./package.json", base), "utf8"));
}

function buildResolveAlias(base: string | URL): AliasOptions {
  return Object.fromEntries(
    globSync(
      fileURLToPath(
        new URL("../lexical-*/src/index.{ts,tsx}", base)
      ).replaceAll("\\", "/")
    ).map((entry) => [
      readPackageJson(
        new URL(`../${path.basename(path.resolve(entry, "..", ".."))}/`, base)
      ).name,
      entry,
    ])
  );
}

export async function defineTestConfig(
  base: URL | string
): Promise<UserConfig> {
  const pkg = readPackageJson(base);
  const hasReact = "@vitejs/plugin-react" in (pkg.devDependencies ?? {});
  return {
    plugins: [
      ...(hasReact ? [(await import("@vitejs/plugin-react")).default()] : []),
    ],
    test: {
      environment: "jsdom",
      setupFiles: [
        fileURLToPath(new URL('./setupJestDom.ts', import.meta.url)),
        ...(hasReact ? [fileURLToPath(new URL('./setupReact.ts', import.meta.url))] : [])
      ]
    },
    resolve: { alias: buildResolveAlias(base) },
  };
}
