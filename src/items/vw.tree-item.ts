import path = require('path');
import { Command, TreeItem, TreeItemCollapsibleState } from 'vscode';

export class VersionWizardTreeItem extends TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: TreeItemCollapsibleState,
    public readonly versionWizardIconPath: string,
    public readonly command?: Command,
    public readonly data?: string,
  ) {
    super(label, collapsibleState);

    this.description = data;
    this.contextValue = 'versionWizardTreeItem';
    this.iconPath = {
      light: path.join(__filename, '..', '..', '..', 'resources', 'light', versionWizardIconPath),
      dark: path.join(__filename, '..', '..', '..', 'resources', 'dark', versionWizardIconPath),
    };
  }
}
