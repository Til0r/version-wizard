import { accessSync } from "fs";
import {
  Event,
  EventEmitter,
  TreeDataProvider,
  TreeItem,
  TreeItemCollapsibleState,
  WorkspaceFolder,
  window,
  workspace,
} from "vscode";
import { vWBaseScriptsConstant } from "./constants/vw-base-scripts.constant";
import { VWTreeItem } from "./tree-item/vw-tree-item";
import { VWWorkspaceTreeItem } from "./tree-item/vw-workspace-tree-item";
import path = require("path");

export class VWNodeProvider
  implements TreeDataProvider<VWTreeItem | VWWorkspaceTreeItem>
{
  private _onDidChangeTreeData: EventEmitter<
    VWTreeItem | VWWorkspaceTreeItem | undefined | null | void
  > = new EventEmitter<VWTreeItem | undefined | null | void>();

  readonly onDidChangeTreeData: Event<
    VWTreeItem | VWWorkspaceTreeItem | undefined | null | void
  > = this._onDidChangeTreeData.event;

  constructor(private workspaceRoot: string) {}

  getTreeItem = (element: VWTreeItem | VWWorkspaceTreeItem): TreeItem =>
    element;

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getChildren(
    element?: VWTreeItem | VWWorkspaceTreeItem
  ): Thenable<VWTreeItem[] | VWWorkspaceTreeItem[]> {
    return new Promise((resolve: Function) => {
      const folders: WorkspaceFolder[] =
        workspace.workspaceFolders as WorkspaceFolder[];

      if (element) {
        const folder: WorkspaceFolder = folders.find(
          (o) => o.name === element.label
        ) as WorkspaceFolder;

        const packageJsonPath: string = path.join(
          folder.uri.fsPath,
          "package.json"
        );
        this.getVWTreeItem(resolve, packageJsonPath);
      } else if (folders && folders.length > 1)
        this.getVWWorkspaceTreeItem(resolve, folders);
      else
        this.getVWTreeItem(
          resolve,
          path.join(this.workspaceRoot, "package.json")
        );
    });
  }

  private getVWTreeItem(resolve: Function, packageJsonPath: string): void {
    if (this.pathExists(packageJsonPath)) {
      const workspaceDir: string = path.dirname(packageJsonPath);
      resolve(
        vWBaseScriptsConstant.map(({ name, command, icon }) => {
          const cmd = {
            title: "Run scripts",
            command: "vw.command",
            arguments: [name, workspaceDir],
          };

          return new VWTreeItem(
            name,
            TreeItemCollapsibleState.None,
            icon,
            cmd,
            command
          );
        })
      );
    } else {
      window.showInformationMessage("Workspace has no package.json");
      resolve([]);
    }
  }

  private getVWWorkspaceTreeItem(
    resolve: Function,
    folders: WorkspaceFolder[]
  ): void {
    const treeItems: VWWorkspaceTreeItem[] = [];

    folders.forEach((folder: WorkspaceFolder): void => {
      const workspaceRoot: string = folder.uri.fsPath;
      const packageJsonPath = path.join(workspaceRoot, "package.json");

      const name = folder.name;
      if (this.pathExists(packageJsonPath)) {
        treeItems.push(
          new VWWorkspaceTreeItem(
            name,
            TreeItemCollapsibleState.Collapsed,
            `${name} Workspace Folder`
          )
        );
      }
    });
    resolve(treeItems);
  }

  private pathExists(p: string): boolean {
    try {
      accessSync(p);
    } catch (err) {
      return false;
    }
    return true;
  }
}
