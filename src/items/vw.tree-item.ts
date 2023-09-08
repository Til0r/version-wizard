import path = require("path");
import { Command, TreeItem, TreeItemCollapsibleState } from "vscode";

export class VWTreeItem extends TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: TreeItemCollapsibleState,
    public readonly iconPath: any,
    public readonly command?: Command,
    public readonly data?: any
  ) {
    super(label, collapsibleState);

    this.description = data;
    this.contextValue = "vWTreeItem";
    this.iconPath = {
      light: path.join(
        __filename,
        "..",
        "..",
        "..",
        "resources",
        "light",
        iconPath
      ),
      dark: path.join(
        __filename,
        "..",
        "..",
        "..",
        "resources",
        "dark",
        iconPath
      ),
    };
  }
}
