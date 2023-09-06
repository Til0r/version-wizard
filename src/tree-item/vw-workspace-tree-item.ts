import { Command, ThemeIcon, TreeItem, TreeItemCollapsibleState } from "vscode";

export class VWWorkspaceTreeItem extends TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: TreeItemCollapsibleState,
    public readonly tooltip: string,
    public readonly command?: Command
  ) {
    super(label, collapsibleState);
  }

  iconPath = ThemeIcon.Folder;
  contextValue = "workspaceFolder";
}
