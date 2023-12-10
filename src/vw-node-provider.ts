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
import { VersionWizardPackageManagerFileConstant } from './constants/vw-package-manager-file-list.constant';
import { VersionWizardPackageManagerConstant } from './constants/vw-package-manager.constant';
import { VersionWizardScriptsCommandConstant } from './constants/vw-scripts-command.constant';
import { VersionWizardWorkspaceTreeItem } from './items/vw-workspace.tree-item';
import { VersionWizardTreeItem } from './items/vw.tree-item';
import path = require('path');

export const getPackageManagerList = [
  VersionWizardPackageManagerFileConstant.PNPM_LOCK,
  VersionWizardPackageManagerFileConstant.YARN_LOCK,
  VersionWizardPackageManagerFileConstant.PACKAGE_LOCK,
];

export class VersionWizardNodeProvider
  implements TreeDataProvider<VersionWizardTreeItem | VersionWizardWorkspaceTreeItem>
{
  private _onDidChangeTreeData: EventEmitter<
    VersionWizardTreeItem | VersionWizardWorkspaceTreeItem | undefined | null | void
  > = new EventEmitter<VersionWizardTreeItem | undefined | null | void>();

  readonly onDidChangeTreeData: Event<
    VersionWizardTreeItem | VersionWizardWorkspaceTreeItem | undefined | null | void
  > = this._onDidChangeTreeData.event;

  constructor(private workspaceRoot: string) {}

  getTreeItem = (element: VersionWizardTreeItem | VersionWizardWorkspaceTreeItem): TreeItem =>
    element;

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }

  getChildren(
    element?: VersionWizardTreeItem | VersionWizardWorkspaceTreeItem,
  ): Thenable<VersionWizardTreeItem[] | VersionWizardWorkspaceTreeItem[]> {
    return new Promise((resolve) => {
      const folders: WorkspaceFolder[] = workspace.workspaceFolders as WorkspaceFolder[];

      if (element) {
        const folder: WorkspaceFolder = folders.find(
          (o) => o.name === element.label,
        ) as WorkspaceFolder;

        this.getVersionWizardTreeItem(resolve, folder.uri.fsPath);
      } else if (folders && folders.length > 1)
        this.getVersionWizardWorkspaceTreeItem(resolve, folders);
      else this.getVersionWizardTreeItem(resolve, this.workspaceRoot);
    });
  }

  private getVersionWizardTreeItem(
    resolve: (
      value:
        | VersionWizardTreeItem[]
        | VersionWizardWorkspaceTreeItem[]
        | PromiseLike<VersionWizardTreeItem[] | VersionWizardWorkspaceTreeItem[]>,
    ) => void,
    fsPath: string,
  ): void {
    if (
      getPackageManagerList.some((item) => this.pathExists(path.join(this.workspaceRoot, item)))
    ) {
      const packageManager = getPackageManager(fsPath);

      resolve([
        this.getVersionWizardTreeItemClass(
          fsPath,
          VersionWizardScriptsCommandConstant.PATCH,
          VersionWizardScriptsCommandConstant.PATCH_CMD(packageManager),
        ),
        this.getVersionWizardTreeItemClass(
          fsPath,
          VersionWizardScriptsCommandConstant.MINOR,
          VersionWizardScriptsCommandConstant.MINOR_CMD(packageManager),
        ),
        this.getVersionWizardTreeItemClass(
          fsPath,
          VersionWizardScriptsCommandConstant.MAJOR,
          VersionWizardScriptsCommandConstant.MAJOR_CMD(packageManager),
        ),
        this.getVersionWizardTreeItemClass(
          fsPath,
          VersionWizardScriptsCommandConstant.PRERELEASE,
          VersionWizardScriptsCommandConstant.PRERELEASE_CMD(packageManager),
        ),
        this.getVersionWizardTreeItemClass(
          fsPath,
          VersionWizardScriptsCommandConstant.PREPATCH,
          VersionWizardScriptsCommandConstant.PREPATCH_CMD(packageManager),
        ),
        this.getVersionWizardTreeItemClass(
          fsPath,
          VersionWizardScriptsCommandConstant.PREMINOR,
          VersionWizardScriptsCommandConstant.PREMINOR_CMD(packageManager),
        ),
        this.getVersionWizardTreeItemClass(
          fsPath,
          VersionWizardScriptsCommandConstant.PREMAJOR,
          VersionWizardScriptsCommandConstant.PREMAJOR_CMD(packageManager),
        ),
      ]);
    } else {
      window.showInformationMessage('Workspace has no package manager installed');
      resolve([]);
    }
  }

  private getVersionWizardTreeItemClass = (
    fsPath: string,
    label: VersionWizardScriptsCommandConstant,
    command: string,
  ): VersionWizardTreeItem =>
    new VersionWizardTreeItem(
      label as string,
      TreeItemCollapsibleState.None,
      `${(label as string).includes('pre') ? 'pre' : label}.svg`,
      {
        title: 'Run scripts',
        command: 'version-wizard.command',
        arguments: [label, fsPath],
      },
      command,
    );

  private getVersionWizardWorkspaceTreeItem(
    resolve: (
      value:
        | VersionWizardTreeItem[]
        | VersionWizardWorkspaceTreeItem[]
        | PromiseLike<VersionWizardTreeItem[] | VersionWizardWorkspaceTreeItem[]>,
    ) => void,
    folders: WorkspaceFolder[],
  ): void {
    const treeItems: VersionWizardWorkspaceTreeItem[] = [];

    const folderFiltered = folders.filter((fold) =>
      getPackageManagerList.some((packageManager) =>
        this.pathExists(path.join(fold.uri.fsPath, packageManager)),
      ),
    );

    if (folderFiltered.length) {
      folderFiltered.forEach((folder: WorkspaceFolder): void => {
        const workspaceRoot: string = folder.uri.fsPath;
        const packageJsonPath = path.join(
          workspaceRoot,
          VersionWizardPackageManagerFileConstant.PACKAGE,
        );

        const name = folder.name;
        if (this.pathExists(packageJsonPath)) {
          treeItems.push(
            new VersionWizardWorkspaceTreeItem(
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
  if (existsSync(path.join(fsPath, VersionWizardPackageManagerFileConstant.PNPM_LOCK)))
    return VersionWizardPackageManagerConstant.PNPM;
  else if (existsSync(path.join(fsPath, VersionWizardPackageManagerFileConstant.YARN_LOCK)))
    return VersionWizardPackageManagerConstant.YARN;
  return VersionWizardPackageManagerConstant.NPM;
}
