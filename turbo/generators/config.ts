import type { PlopTypes } from "@turbo/gen";
import * as fs from "node:fs";

function directoryNameToPackageName(directoryName) {
  return `@etrepum/${directoryName}`;
}

function directoryNameToExportName(directoryName) {
  return directoryName
    .replace(/^lexical-(builder-)?/, "")
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("");
}

export default function (plop: PlopTypes.NodePlopAPI) {
  // create your generators here
  plop.setGenerator("package", {
    description: "new package in repo",
    prompts: [
      {
        type: "input",
        name: "directoryName",
        message: "Package directory name (e.g. lexical-custom-plan): ",
      },
    ],
    actions: (data) => {
      const { directoryName } = data;
      data.packageName = directoryNameToPackageName(directoryName);
      data.exportName = directoryNameToExportName(directoryName);
      data.version = JSON.parse(fs.readFileSync("./package.json")).version;
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
}
