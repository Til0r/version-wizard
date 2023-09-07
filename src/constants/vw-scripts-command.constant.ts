const getFlagYarn = (packageManager: string) =>
  packageManager === "yarn" ? "--" : "";

export class VWScriptsCommandConstant {
  public static PATCH = "patch";
  public static MINOR = "minor";
  public static MAJOR = "major";
  public static ADD_ALL = "git add .";
  public static PRERELEASE = "prerelease";
  public static PATCH_CMD = (packageManager: string) =>
    `${packageManager} version ${getFlagYarn(packageManager)}patch`;
  public static MINOR_CMD = (packageManager: string) =>
    `${packageManager} version ${getFlagYarn(packageManager)}minor`;
  public static MAJOR_CMD = (packageManager: string) =>
    `${packageManager} version ${getFlagYarn(packageManager)}major`;
  public static PRERELEASE_CMD = (packageManager: string) =>
    `${packageManager} version ${getFlagYarn(
      packageManager
    )}prerelease --preid=rc`;
  public static CREATE_TAG = (version: string) => `git tag ${version}`;
  public static PUSH_TAG = (version: string) => `git push origin ${version}`;
  public static NO_GIT_TAG_VERSION = "--no-git-tag-version";
  public static COMMIT_TAG = (version: string, branch: string) =>
    `git commit -am 'New version(${version}) from branch ${branch}'`;
}
