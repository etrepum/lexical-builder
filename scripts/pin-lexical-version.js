const fs = require("node:fs");
const glob = require("glob");
const argv = require("minimist")(process.argv.slice(2));
const semver = require("semver");

function main() {
  if (argv._.length !== 1) {
    throw new Error(`Expected one argument for the lexical version`);
  }
  const [version] = argv._;
  const peerVersion = /-nightly\./.test(version)
    ? `>=${version}`
    : `>=${version} || >=${semver.inc(version, "prerelease", "nightly")}`;
  for (const fn of glob.sync([
    "package.json",
    "{apps,packages}/*/package.json",
  ])) {
    const json = JSON.parse(fs.readFileSync(fn, "utf8"));
    for (const depK of [
      "dependencies",
      "devDependencies",
      "peerDependencies",
    ]) {
      const deps = json[depK];
      if (!deps) {
        continue;
      }
      const v = depK === "peerDependencies" ? peerVersion : version;
      for (const k of Object.keys(deps)) {
        if (/^(?:lexical$|@lexical\/)/.test(k)) {
          deps[k] = v;
        }
      }
      json[depK] = Object.fromEntries(
        Object.entries(deps).sort((a, b) => a[0].localeCompare(b[0])),
      );
    }
    fs.writeFileSync(fn, `${JSON.stringify(json, null, 2)}\n`);
  }
}

main();
