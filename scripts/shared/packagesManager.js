"use strict";

const path = require("node:path");
const fs = require("node:fs");
const glob = require("glob");

exports.packagesManager = {
  getPublicPackages() {
    return glob
      .sync(`${__dirname}/../../packages/*/package.json`, {
        windowsPathsNoEscape: true,
      })
      .flatMap((fn) => {
        const json = JSON.parse(fs.readFileSync(fn, "utf8"));
        return json.private
          ? []
          : [
              {
                getDirectoryName: () => path.basename(path.dirname(fn)),
                getNpmName: () => json.name,
              },
            ];
      });
  },
};
