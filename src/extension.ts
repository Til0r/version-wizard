import { ExtensionContext, WorkspaceFolder, commands, window, workspace } from 'vscode';
import { VWTreeItem } from './items/vw.tree-item';
import { VWNodeProvider, getPackageManagerList } from './vw-node-provider';
import { vWQuickPick } from './vw-quickpick';

export function activate(context: ExtensionContext) {
  const rootPath = workspace.rootPath || '.';

  const vWNodeProvider = new VWNodeProvider(rootPath);
  window.registerTreeDataProvider('vw', vWNodeProvider);

  commands.registerCommand('vw.command', (task: VWTreeItem | string, cwd: string) => {
    if (task instanceof VWTreeItem) commands.executeCommand('vw.openQuickPick', { task, cwd });
  });

  commands.registerCommand('vw.refresh', () => vWNodeProvider.refresh());

  commands.registerCommand('vw.openQuickPick', vWQuickPick());

  if (!workspace.workspaceFolders?.length) initWatchChangeFiles(context, vWNodeProvider, rootPath);
  else
    (workspace.workspaceFolders as WorkspaceFolder[]).forEach((folder) => {
      initWatchChangeFiles(context, vWNodeProvider, folder.uri.fsPath);
    });
}

function initWatchChangeFiles(
  context: ExtensionContext,
  vWNodeProvider: VWNodeProvider,
  rootPath: string,
) {
  const watchChangeFiles = workspace.createFileSystemWatcher(rootPath + '/[^.]*');

  const checkIfPackageManagerChanged = (fsPath: string) => {
    if (getPackageManagerList().some((item) => fsPath.includes(item))) vWNodeProvider.refresh();
  };

  watchChangeFiles.onDidChange((uri) => {
    checkIfPackageManagerChanged(uri.fsPath);
  });

  watchChangeFiles.onDidCreate((uri) => {
    checkIfPackageManagerChanged(uri.fsPath);
  });

  watchChangeFiles.onDidDelete((uri) => {
    checkIfPackageManagerChanged(uri.fsPath);
  });

  context.subscriptions.push(watchChangeFiles);
}

export function deactivate() {}
