const glob = require('glob');
const fs = require('fs');
const {version} = JSON.parse(fs.readFileSync('package.json', 'utf8'));
function main() {
  for (const fn of glob.sync('{apps,packages}/*/package.json')) {
    const json = JSON.parse(fs.readFileSync(fn, 'utf8'));
    json.version = version;
    fs.writeFileSync(fn, JSON.stringify(json, null, 2) + '\n');
  }
}

main()