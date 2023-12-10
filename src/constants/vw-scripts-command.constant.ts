import { VersionWizardCmd } from '../vw-scripts-cmd';

export class VersionWizardScriptsCommandConstant {
  public static PREID = 'preid';

  public static PATCH = 'patch';
  public static MINOR = 'minor';
  public static MAJOR = 'major';
  public static PREPATCH = 'prepatch';
  public static PREMINOR = 'preminor';
  public static PREMAJOR = 'premajor';
  public static PRERELEASE = 'prerelease';

  public static PATCH_CMD = (packageManager: string) =>
    new VersionWizardCmd(packageManager, VersionWizardScriptsCommandConstant.PATCH).getCommand();
  public static MINOR_CMD = (packageManager: string) =>
    new VersionWizardCmd(packageManager, VersionWizardScriptsCommandConstant.MINOR).getCommand();
  public static MAJOR_CMD = (packageManager: string) =>
    new VersionWizardCmd(packageManager, VersionWizardScriptsCommandConstant.MAJOR).getCommand();

  public static PRERELEASE_CMD = (packageManager: string) =>
    new VersionWizardCmd(
      packageManager,
      VersionWizardScriptsCommandConstant.PRERELEASE,
    ).getCommand();
  public static PREPATCH_CMD = (packageManager: string) =>
    new VersionWizardCmd(packageManager, VersionWizardScriptsCommandConstant.PREPATCH).getCommand();
  public static PREMINOR_CMD = (packageManager: string) =>
    new VersionWizardCmd(packageManager, VersionWizardScriptsCommandConstant.PREMINOR).getCommand();
  public static PREMAJOR_CMD = (packageManager: string) =>
    new VersionWizardCmd(packageManager, VersionWizardScriptsCommandConstant.PREMAJOR).getCommand();

  public static PUSH = 'git push';
  public static ADD_ALL = 'git add .';
  public static NO_GIT_TAG_VERSION = '--no-git-tag-version';
  public static CREATE_TAG = (version: string) => `git tag ${version}`;
  public static PUSH_TAG = (version: string) => `git push origin ${version}`;
  public static COMMIT_TAG = (version: string) => `git commit -am 'New version ${version}'`;
}
