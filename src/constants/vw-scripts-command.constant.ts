import { PackageManagerListConstant } from '../constants/package-manager-list.constant';

const getFlagYarn = (packageManager: string) =>
  packageManager === PackageManagerListConstant.YARN ? '--' : '';

export class VWScriptsCommandConstant {
  public static PATCH = 'patch';
  public static MINOR = 'minor';
  public static MAJOR = 'major';
  public static ADD_ALL = 'git add .';
  public static PREPATCH = 'prepatch';
  public static PREMINOR = 'preminor';
  public static PREMAJOR = 'premajor';
  public static PRERELEASE = 'prerelease';
  public static PATCH_CMD = (packageManager: string) =>
    `${packageManager} version ${getFlagYarn(packageManager)} ${VWScriptsCommandConstant.PATCH}`;
  public static MINOR_CMD = (packageManager: string) =>
    `${packageManager} version ${getFlagYarn(packageManager)} ${VWScriptsCommandConstant.MINOR}`;
  public static MAJOR_CMD = (packageManager: string) =>
    `${packageManager} version ${getFlagYarn(packageManager)} ${VWScriptsCommandConstant.MAJOR}`;
  public static PRERELEASE_CMD = (packageManager: string, preid = 'rc') =>
    `${packageManager} version ${getFlagYarn(packageManager)} ${
      VWScriptsCommandConstant.PRERELEASE
    } --preid=${preid}`;
  public static PREPATCH_CMD = (packageManager: string, preid = 'rc') =>
    `${packageManager} version ${getFlagYarn(packageManager)} ${
      VWScriptsCommandConstant.PREPATCH
    } --preid=${preid}`;
  public static PREMINOR_CMD = (packageManager: string, preid = 'rc') =>
    `${packageManager} version ${getFlagYarn(packageManager)} ${
      VWScriptsCommandConstant.PREMINOR
    } --preid=${preid}`;
  public static PREMAJOR_CMD = (packageManager: string, preid = 'rc') =>
    `${packageManager} version ${getFlagYarn(packageManager)} ${
      VWScriptsCommandConstant.PREMAJOR
    } --preid=${preid}`;
  public static CREATE_TAG = (version: string) => `git tag ${version}`;
  public static PUSH_TAG = (version: string) => `git push origin ${version}`;
  public static PUSH = 'git push';
  public static NO_GIT_TAG_VERSION = '--no-git-tag-version';
  public static COMMIT_TAG = (version: string) => `git commit -am 'New version ${version}'`;
}
