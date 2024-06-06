#!/usr/bin/env node

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

"use strict";

/* eslint-disable turbo/no-undeclared-env-vars */

const { exec } = require("child-process-promise");
const fs = require("node:fs");

const isPrerelease = process.env.npm_package_version.indexOf("-") !== -1;

async function updateChangelog() {
  const fn = "CHANGELOG.md";
  const prevChangeLog = fs.readFileSync(fn, "utf8");
  const date = (
    await exec(`git log --pretty=format:%as HEAD^-1`)
  ).stdout.trim();
  const header = `## v${process.env.npm_package_version} (${date})`;
  const changelogContent = (
    await exec(
      `git --no-pager log --oneline ${process.env.LATEST_RELEASE}...HEAD~1 --pretty=format:"- %s %an"`,
    )
  ).stdout
    .replace(/[^a-zA-Z0-9()\n \-,.#/]/g, "")
    .trim();
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(
      process.env.GITHUB_OUTPUT,
      ["changelog<<EOF", header, changelogContent, "EOF", ""].join("\n"),
    );
  }
  fs.writeFileSync(
    fn,
    [header, changelogContent, "", prevChangeLog].join("\n"),
  );
}

if (!isPrerelease) {
  updateChangelog();
}
