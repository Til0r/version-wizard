import path = require('path');
import { Command, TreeItem, TreeItemCollapsibleState } from 'vscode';

export class VWTreeItem extends TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: TreeItemCollapsibleState,
    public readonly vwIconPath: string,
    public readonly command?: Command,
    public readonly data?: string,
  ) {
    super(label, collapsibleState);

    this.description = data;
    this.contextValue = 'vWTreeItem';
    this.iconPath = {
      light: path.join(__filename, '..', '..', '..', 'resources', 'light', vwIconPath),
      dark: path.join(__filename, '..', '..', '..', 'resources', 'dark', vwIconPath),
    };
  }
}
