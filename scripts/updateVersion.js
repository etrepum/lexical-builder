const fs = require("node:fs");
const glob = require("glob");

const root = JSON.parse(fs.readFileSync("package.json", "utf8"));

function main() {
  for (const fn of glob.sync("{apps,packages}/*/package.json")) {
    const json = JSON.parse(fs.readFileSync(fn, "utf8"));
    // update version of all apps and deps
    json.version = root.version;
    for (const depK of ["dependencies", "devDependencies"]) {
      const deps = json[depK];
      if (!deps) {
        continue;
      }
      for (const k of Object.keys(deps)) {
        const v = root.devDependencies[k];
        if (typeof v === "string") {
          deps[k] = v;
        }
      }
    }
    fs.writeFileSync(fn, `${JSON.stringify(json, null, 2)}\n`);
  }
}

main();
