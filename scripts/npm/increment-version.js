#!/usr/bin/env node

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
/* eslint-disable turbo/no-undeclared-env-vars */

"use strict";

const { spawn } = require("child-process-promise");

const { INCREMENT, CHANNEL, npm_package_version, GIT_REPO, LATEST_RELEASE } =
  process.env;
for (const [k, v] of Object.entries({
  INCREMENT,
  CHANNEL,
  GIT_REPO,
  npm_package_version,
  LATEST_RELEASE,
})) {
  if (!v && !(k === "LATEST_RELEASE" && CHANNEL !== "latest")) {
    console.error(`Expecting ${k} to be set in the environment`);
    process.exit(1);
  }
}
const validChannels = new Set(["next", "latest", "nightly", "dev"]);
if (!validChannels.has(CHANNEL)) {
  console.error(`Invalid value for channel: ${CHANNEL}`);
  process.exit(1);
}

const validIncrements = new Set(["minor", "patch", "prerelease"]);
if (
  !validIncrements.has(INCREMENT) ||
  (CHANNEL === "nightly" && INCREMENT !== "prerelease")
) {
  console.error(
    `Invalid value for increment in ${CHANNEL} channel: ${INCREMENT}`,
  );
  process.exit(1);
}

function incrementArgs() {
  return [
    ...(INCREMENT === "prerelease"
      ? [
          "--preid",
          CHANNEL === "nightly"
            ? `${CHANNEL}.${new Date()
                .toISOString()
                .split("T")[0]
                .replaceAll("-", "")}`
            : CHANNEL,
        ]
      : []),
    INCREMENT,
  ];
}

async function incrementVersion() {
  const commandArr = [
    "npm",
    "version",
    "--no-git-tag-version",
    "--include-workspace-root",
    "true",
    ...incrementArgs(),
  ];
  console.log(commandArr.join(" "));
  await spawn(commandArr[0], commandArr.slice(1), { stdio: "inherit" });
}

incrementVersion();
