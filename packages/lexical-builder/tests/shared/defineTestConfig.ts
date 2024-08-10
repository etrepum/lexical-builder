import { fileURLToPath } from "node:url";
import * as path from "node:path";
import * as fs from "node:fs";
import { type AliasOptions, type UserConfig } from "vite";
import { globSync } from "glob";

function readPackageJson(base: string | URL) {
  return JSON.parse(
    fs.readFileSync(new URL("./package.json", base), "utf8"),
  ) as {
    name: string;
    devDependencies?: Record<string, string>;
    exports?: Record<string, string | Record<string, string>>;
  };
}

function buildResolveAlias(base: string | URL): AliasOptions {
  const alias: Record<string, string> = {};
  for (const indexFn of globSync(
    fileURLToPath(new URL("../lexical-*/src/index.{ts,tsx}", base)).replace(
      /\\/g,
      "/",
    ),
  )) {
    const pkgDir = path.resolve(indexFn, "..", "..");
    const json = readPackageJson(new URL(`../${path.basename(pkgDir)}/`, base));
    for (const [k, v] of Object.entries(json.exports || {})) {
      // eslint-disable-next-line prefer-named-capture-group -- index is fine
      const sub = /^\.(\/.+)/.exec(k)?.[1];
      const subPath = typeof v == "string" ? v : v.default;
      if (sub && subPath) {
        alias[`${json.name}${sub}`] = path.resolve(pkgDir, subPath);
      }
    }
    // This has to go last otherwise it takes precedence
    alias[json.name] = indexFn;
  }
  return alias;
}

export async function defineTestConfig(
  base: URL | string,
): Promise<UserConfig> {
  const pkg = readPackageJson(base);
  const hasReact = "@vitejs/plugin-react" in (pkg.devDependencies ?? {});
  const hasDom = "@testing-library/jest-dom" in (pkg.devDependencies ?? {});
  return {
    plugins: [
      ...(hasReact ? [(await import("@vitejs/plugin-react")).default()] : []),
    ],
    test: {
      environment: "jsdom",
      setupFiles: [
        ...(hasDom
          ? [fileURLToPath(new URL("./setupJestDom.ts", import.meta.url))]
          : []),
        ...(hasReact
          ? [fileURLToPath(new URL("./setupReact.ts", import.meta.url))]
          : []),
      ],
    },
    resolve: { alias: buildResolveAlias(base) },
  };
}
