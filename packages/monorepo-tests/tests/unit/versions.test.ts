import * as glob from "glob";
import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

describe("package.json audits", () => {
  const { version } = JSON.parse(fs.readFileSync("package.json", "utf8"));
  glob.sync("../../{apps,packages}/*/package.json").forEach((fn) => {
    describe(
      path.relative(path.resolve("../.."), path.resolve(path.dirname(fn))),
      () => {
        const json = JSON.parse(fs.readFileSync(fn, "utf8"));
        it("version", () => {
          expect(json.version).toEqual(version);
        });
        it(`monorepo dependencies are "*"`, () => {
          Object.keys(json.dependencies || {}).forEach(([k, v]) => {
            if (/^@(etrepum|repo)\//.test(k || "")) {
              expect([k, v]).toEqual([k, "*"]);
            }
          });
        });
        it(`monorepo peerDependencies are "*"`, () => {
          Object.keys(json.peerDependencies || {}).forEach(([k, v]) => {
            if (/^@(etrepum|repo)\//.test(k || "")) {
              expect([k, v]).toEqual([k, "*"]);
            }
          });
        });
      },
    );
  });
});
