import { ExtensionContext, WorkspaceFolder, commands, window, workspace } from 'vscode';
import { VersionWizardScriptsCommandConstant } from './constants/vw-scripts-command.constant';
import { VersionWizardTreeItem } from './items/vw.tree-item';
import { VersionWizardNodeProvider, getPackageManagerList } from './vw-node-provider';
import { VersionWizardWQuickPick } from './vw-quickpick';

export function activate(context: ExtensionContext) {
  const rootPath = workspace.rootPath || '.';

  const versionWizardNodeProvider = new VersionWizardNodeProvider(rootPath);
  window.registerTreeDataProvider('version-wizard', versionWizardNodeProvider);

  commands.registerCommand(
    'version-wizard.command',
    (task: VersionWizardTreeItem | string, cwd: string) => {
      if (task instanceof VersionWizardTreeItem)
        commands.executeCommand('version-wizard.openQuickPick', { task, cwd });
    },
  );

  commands.registerCommand('version-wizard.refresh', () => versionWizardNodeProvider.refresh());

  commands.registerCommand('version-wizard.reset-preid-state', () => {
    context.globalState.update(`version-wizard.${VersionWizardScriptsCommandConstant.PREID}`, [
      'rc',
    ]);
  });

  commands.registerCommand('version-wizard.openQuickPick', VersionWizardWQuickPick(context));

  if (!workspace.workspaceFolders?.length)
    initWatchChangeFiles(context, versionWizardNodeProvider, rootPath);
  else
    (workspace.workspaceFolders as WorkspaceFolder[]).forEach((folder) => {
      initWatchChangeFiles(context, versionWizardNodeProvider, folder.uri.fsPath);
    });
}

function initWatchChangeFiles(
  context: ExtensionContext,
  versionWizardNodeProvider: VersionWizardNodeProvider,
  rootPath: string,
) {
  const watchChangeFiles = workspace.createFileSystemWatcher(rootPath + '/[^.]*');

  const checkIfPackageManagerChanged = (fsPath: string) => {
    if (getPackageManagerList.some((item) => fsPath.includes(item)))
      versionWizardNodeProvider.refresh();
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
