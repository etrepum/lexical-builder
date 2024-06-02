#!/usr/bin/env node

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

"use strict";

const readline = require("readline");
const { spawn } = require("child-process-promise");
const { packagesManager } = require("../shared/packagesManager");
const argv = require("minimist")(process.argv.slice(2));

const nonInteractive = argv["non-interactive"];
const dryRun = argv["dry-run"];
const channel = argv.channel;

const validChannels = new Set(["next", "latest", "nightly", "dev"]);
if (!validChannels.has(channel)) {
  console.error(`Invalid release channel: ${channel}`);
  process.exit(1);
}

async function publish() {
  const pkgs = packagesManager.getPublicPackages();
  if (!nonInteractive) {
    console.info(
      `You're about to publish:
${pkgs.map((pkg) => pkg.getNpmName()).join("\n")}

Type "publish" to confirm.`
    );
    await waitForInput();
  }

  const cmd = [
    "npm",
    "publish",
    "--access",
    "public",
    "--tag",
    channel,
    ...(dryRun ? ["--dry-run"] : []),
  ];
  for (const pkg of pkgs) {
    console.info(`Publishing ${pkg.getNpmName()}...`);
    const cwd = `./packages/${pkg.getDirectoryName()}`;
    console.log(`cd ${cwd} && ${cmd.join(" ")}`);
    await spawn(cmd[0], cmd.slice(1), {
      stdio: "inherit",
      cwd,
    });
    console.info(`Done!`);
  }
}

async function waitForInput() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false,
    });

    rl.on("line", function (line) {
      if (line === "publish") {
        rl.close();
        resolve();
      }
    });
  });
}

publish().catch((err) => {
  if (err.childProcess?.exitCode) {
    process.exit(err.childProcess.exitCode);
  }
  throw err;
});
