import { VersionWizardPackageManagerConstant } from './constants/vw-package-manager.constant';
import { VersionWizardScriptsCommandConstant } from './constants/vw-scripts-command.constant';

const getFlagYarn = (packageManager: string) =>
  packageManager === VersionWizardPackageManagerConstant.YARN ? '--' : '';

export class VersionWizardCmd {
  private command: string;

  constructor(packageManager: string, updateType: VersionWizardScriptsCommandConstant) {
    this.command = `${packageManager} version ${getFlagYarn(packageManager)}${updateType}`;
  }

  getCommand = (): string => this.command;
}
