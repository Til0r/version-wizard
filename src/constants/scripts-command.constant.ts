import { existsSync } from "fs";
import { workspace } from "vscode";
import path = require("path");

const getFlagYarn = () => (getPackageManager() === "yarn" ? "--" : "");

export class ScriptsCommandConstant {
  public static ADD_ALL = "git add .";
  public static PATCH = `${getPackageManager()} version ${getFlagYarn()}patch`;
  public static MINOR = `${getPackageManager()} version ${getFlagYarn()}minor`;
  public static MAJOR = `${getPackageManager()} version ${getFlagYarn()}major`;
  public static PRERELEASE = `${getPackageManager()} version ${getFlagYarn()}prerelease --preid=rc`;
  public static CREATE_TAG = (version: string) => `git tag ${version}`;
  public static PUSH_TAG = (version: string) => `git push origin ${version}`;
  public static NO_GIT_TAG_VERSION = "--no-git-tag-version";
  public static COMMIT_TAG = (version: string, branch: string) =>
    `git commit -am 'New version(${version}) from branch ${branch}'`;
}

export const baseScriptsConstant = [
  {
    name: "patch",
    command: ScriptsCommandConstant.PATCH,
  },
  {
    name: "minor",
    command: ScriptsCommandConstant.MINOR,
  },
  {
    name: "major",
    command: ScriptsCommandConstant.MAJOR,
  },
  {
    name: "prerelease",
    command: ScriptsCommandConstant.PRERELEASE,
  },
];

export function getPackageManager() {
  const rootPath: string = workspace.rootPath || ".";

  if (existsSync(path.join(rootPath, "pnpm-lock.yaml"))) return "pnpm";
  if (existsSync(path.join(rootPath, "yarn-lock.json"))) return "yarn";

  return "npm";
}
