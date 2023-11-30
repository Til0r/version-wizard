import { accessSync, existsSync } from "fs";
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
import { VWScriptsCommandConstant } from "./constants/vw-scripts-command.constant";
import { VWWorkspaceTreeItem } from "./items/vw-workspace.tree-item";
import { VWTreeItem } from "./items/vw.tree-item";
import path = require("path");

export const getPackageManagerList = () => [
  "pnpm-lock.yaml",
  "yarn.lock",
  "package-lock.json",
];

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
    this._onDidChangeTreeData.fire(undefined);
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

        this.getVWTreeItem(resolve, folder.uri.fsPath);
      } else if (folders && folders.length > 1)
        this.getVWWorkspaceTreeItem(resolve, folders);
      else this.getVWTreeItem(resolve, this.workspaceRoot);
    });
  }

  private getVWTreeItem(resolve: Function, fsPath: string): void {
    if (
      this.pathExists(path.join(fsPath, "package.json")) &&
      getPackageManagerList().some((item) =>
        this.pathExists(path.join(this.workspaceRoot, item))
      )
    ) {
      const packageManager = getPackageManager(fsPath);

      resolve([
        this.getVWTreeItemClass(
          fsPath,
          VWScriptsCommandConstant.PATCH,
          VWScriptsCommandConstant.PATCH_CMD(packageManager)
        ),
        this.getVWTreeItemClass(
          fsPath,
          VWScriptsCommandConstant.MINOR,
          VWScriptsCommandConstant.MINOR_CMD(packageManager)
        ),
        this.getVWTreeItemClass(
          fsPath,
          VWScriptsCommandConstant.MAJOR,
          VWScriptsCommandConstant.MAJOR_CMD(packageManager)
        ),
        this.getVWTreeItemClass(
          fsPath,
          VWScriptsCommandConstant.PRERELEASE,
          VWScriptsCommandConstant.PRERELEASE_CMD(packageManager)
        ),
      ]);
    } else {
      window.showInformationMessage("Workspace has no package.json");
      resolve([]);
    }
  }

  private getVWTreeItemClass = (
    fsPath: string,
    label: VWScriptsCommandConstant,
    command: string
  ): VWTreeItem =>
    new VWTreeItem(
      label as string,
      TreeItemCollapsibleState.None,
      `${label}.svg`,
      {
        title: "Run scripts",
        command: "vw.command",
        arguments: [label, fsPath],
      },
      command
    );

  private getVWWorkspaceTreeItem(
    resolve: Function,
    folders: WorkspaceFolder[]
  ): void {
    const treeItems: VWWorkspaceTreeItem[] = [];

    const folderFiltered = folders.filter((fold) =>
      getPackageManagerList().some((packageManager) =>
        this.pathExists(path.join(fold.uri.fsPath, packageManager))
      )
    );

    if (folderFiltered.length) {
      folderFiltered.forEach((folder: WorkspaceFolder): void => {
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
    } else {
      window.showInformationMessage("Workspace has no package manager!");
      resolve([]);
    }
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

export function getPackageManager(fsPath: string) {
  if (existsSync(path.join(fsPath, "pnpm-lock.yaml"))) return "pnpm";
  if (existsSync(path.join(fsPath, "yarn.lock"))) return "yarn";

  return "npm";
}
