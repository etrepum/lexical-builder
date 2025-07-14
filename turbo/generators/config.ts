import * as fs from "node:fs";
import type { PlopTypes } from "@turbo/gen";

function directoryNameToPackageName(directoryName: string): string {
  return `@etrepum/${directoryName}`;
}

function directoryNameToExportName(directoryName: string): string {
  return directoryName
    .replace(/^lexical-(?:builder-)?/, "")
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("");
}

export default (plop: PlopTypes.NodePlopAPI) => {
  // create your generators here
  plop.setGenerator("package", {
    description: "new package in repo",
    prompts: [
      {
        type: "input",
        name: "directoryName",
        message: "Package directory name (e.g. lexical-custom-extension): ",
      },
    ],
    actions: (data) => {
      if (data === undefined || typeof data.directoryName !== "string") {
        throw new Error("Expecting non-empty answers");
      }
      const directoryName: string = data.directoryName;
      data.packageName = directoryNameToPackageName(directoryName);
      data.exportName = directoryNameToExportName(directoryName);
      data.dotfile = "";
      const rootPkgJson = JSON.parse(
        fs.readFileSync("./package.json", "utf-8"),
      ) as {
        version: string;
      };
      const mainPkgJson = JSON.parse(
        fs.readFileSync("./packages/lexical-builder/package.json", "utf-8"),
      ) as {
        peerDependencies: Record<"lexical", string>;
      };
      data.version = rootPkgJson.version;
      data.lexicalPeer = mainPkgJson.peerDependencies.lexical;
      return [
        {
          type: "addMany",
          // I don't know why this works ¯\_(ツ)_/¯
          templateFiles: [""],
          destination: `packages/${directoryName}`,
          base: `templates/template-package`,
        },
      ];
    },
  });
};
