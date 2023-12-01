import { accessSync, existsSync } from 'fs';
import {
  Event,
  EventEmitter,
  TreeDataProvider,
  TreeItem,
  TreeItemCollapsibleState,
  WorkspaceFolder,
  window,
  workspace,
} from 'vscode';
import { PackageManagerFileListConstant } from './constants/package-manager-file-list.constant';
import { PackageManagerListConstant } from './constants/package-manager-list.constant';
import { VWScriptsCommandConstant } from './constants/vw-scripts-command.constant';
import { VWWorkspaceTreeItem } from './items/vw-workspace.tree-item';
import { VWTreeItem } from './items/vw.tree-item';
import path = require('path');

export const getPackageManagerList = () => [
  PackageManagerFileListConstant.PNPM_LOCK,
  PackageManagerFileListConstant.YARN_LOCK,
  PackageManagerFileListConstant.PACKAGE_LOCK,
];

export class VWNodeProvider implements TreeDataProvider<VWTreeItem | VWWorkspaceTreeItem> {
  private _onDidChangeTreeData: EventEmitter<
    VWTreeItem | VWWorkspaceTreeItem | undefined | null | void
  > = new EventEmitter<VWTreeItem | undefined | null | void>();

  readonly onDidChangeTreeData: Event<VWTreeItem | VWWorkspaceTreeItem | undefined | null | void> =
    this._onDidChangeTreeData.event;

  constructor(private workspaceRoot: string) {}

  getTreeItem = (element: VWTreeItem | VWWorkspaceTreeItem): TreeItem => element;

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }

  getChildren(
    element?: VWTreeItem | VWWorkspaceTreeItem,
  ): Thenable<VWTreeItem[] | VWWorkspaceTreeItem[]> {
    return new Promise((resolve) => {
      const folders: WorkspaceFolder[] = workspace.workspaceFolders as WorkspaceFolder[];

      if (element) {
        const folder: WorkspaceFolder = folders.find(
          (o) => o.name === element.label,
        ) as WorkspaceFolder;

        this.getVWTreeItem(resolve, folder.uri.fsPath);
      } else if (folders && folders.length > 1) this.getVWWorkspaceTreeItem(resolve, folders);
      else this.getVWTreeItem(resolve, this.workspaceRoot);
    });
  }

  private getVWTreeItem(
    resolve: (
      value:
        | VWTreeItem[]
        | VWWorkspaceTreeItem[]
        | PromiseLike<VWTreeItem[] | VWWorkspaceTreeItem[]>,
    ) => void,
    fsPath: string,
  ): void {
    if (
      getPackageManagerList().some((item) => this.pathExists(path.join(this.workspaceRoot, item)))
    ) {
      const packageManager = getPackageManager(fsPath);

      resolve([
        this.getVWTreeItemClass(
          fsPath,
          VWScriptsCommandConstant.PATCH,
          VWScriptsCommandConstant.PATCH_CMD(packageManager),
        ),
        this.getVWTreeItemClass(
          fsPath,
          VWScriptsCommandConstant.MINOR,
          VWScriptsCommandConstant.MINOR_CMD(packageManager),
        ),
        this.getVWTreeItemClass(
          fsPath,
          VWScriptsCommandConstant.MAJOR,
          VWScriptsCommandConstant.MAJOR_CMD(packageManager),
        ),
        this.getVWTreeItemClass(
          fsPath,
          VWScriptsCommandConstant.PRERELEASE,
          VWScriptsCommandConstant.PRERELEASE_CMD(packageManager),
        ),
        this.getVWTreeItemClass(
          fsPath,
          VWScriptsCommandConstant.PREPATCH,
          VWScriptsCommandConstant.PREPATCH_CMD(packageManager),
        ),
        this.getVWTreeItemClass(
          fsPath,
          VWScriptsCommandConstant.PREMINOR,
          VWScriptsCommandConstant.PREMINOR_CMD(packageManager),
        ),
        this.getVWTreeItemClass(
          fsPath,
          VWScriptsCommandConstant.PREMAJOR,
          VWScriptsCommandConstant.PREMAJOR_CMD(packageManager),
        ),
      ]);
    } else {
      window.showInformationMessage('Workspace has no package manager installed');
      resolve([]);
    }
  }

  private getVWTreeItemClass = (
    fsPath: string,
    label: VWScriptsCommandConstant,
    command: string,
  ): VWTreeItem =>
    new VWTreeItem(
      label as string,
      TreeItemCollapsibleState.None,
      `${(label as string).includes('pre') ? 'pre' : label}.svg`,
      {
        title: 'Run scripts',
        command: 'vw.command',
        arguments: [label, fsPath],
      },
      command,
    );

  private getVWWorkspaceTreeItem(
    resolve: (
      value:
        | VWTreeItem[]
        | VWWorkspaceTreeItem[]
        | PromiseLike<VWTreeItem[] | VWWorkspaceTreeItem[]>,
    ) => void,
    folders: WorkspaceFolder[],
  ): void {
    const treeItems: VWWorkspaceTreeItem[] = [];

    const folderFiltered = folders.filter((fold) =>
      getPackageManagerList().some((packageManager) =>
        this.pathExists(path.join(fold.uri.fsPath, packageManager)),
      ),
    );

    if (folderFiltered.length) {
      folderFiltered.forEach((folder: WorkspaceFolder): void => {
        const workspaceRoot: string = folder.uri.fsPath;
        const packageJsonPath = path.join(workspaceRoot, PackageManagerFileListConstant.PACKAGE);

        const name = folder.name;
        if (this.pathExists(packageJsonPath)) {
          treeItems.push(
            new VWWorkspaceTreeItem(
              name,
              TreeItemCollapsibleState.Collapsed,
              `${name} Workspace Folder`,
            ),
          );
        }
      });
      resolve(treeItems);
    } else {
      window.showInformationMessage('Workspace has no package manager!');
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
  if (existsSync(path.join(fsPath, PackageManagerFileListConstant.PNPM_LOCK)))
    return PackageManagerListConstant.PNPM;
  else if (existsSync(path.join(fsPath, PackageManagerFileListConstant.YARN_LOCK)))
    return PackageManagerListConstant.YARN;
  return PackageManagerListConstant.NPM;
}
