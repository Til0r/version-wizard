import { Command, TreeItem, TreeItemCollapsibleState } from "vscode";

export class VWTreeItem extends TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: TreeItemCollapsibleState,
    public readonly command?: Command,
    public readonly data?: any
  ) {
    super(label, collapsibleState);

    // this.contextValue = "playable";
    this.tooltip = data;
    this.contextValue = "actionableTreeItem";
  }
}
