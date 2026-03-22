import { ExtensionContext, TreeItemCollapsibleState, WorkspaceFolder, commands, window, workspace } from 'vscode';
import { VersionWizardScriptsCommandConstant } from './constants/vw-scripts-command.constant';
import { VersionWizardTreeItem } from './items/vw.tree-item';
import {
  VersionWizardNodeProvider,
  getPackageManager,
  getPackageManagerList,
} from './vw-node-provider';
import { VersionWizardWQuickPick } from './vw-quickpick';

export function activate(context: ExtensionContext) {
  const rootPath = workspace.workspaceFolders?.[0]?.uri.fsPath || '.';

  const versionWizardNodeProvider = new VersionWizardNodeProvider(rootPath);
  window.registerTreeDataProvider('version-wizard', versionWizardNodeProvider);

  commands.registerCommand(
    'version-wizard.command',
    (task: VersionWizardTreeItem | string, cwd?: string) => {
      if (task instanceof VersionWizardTreeItem) {
        const resolvedCwd = cwd || getCwdFromTask(task);

        if (!resolvedCwd) {
          window.showErrorMessage('Unable to resolve workspace folder for this command.');
          return;
        }

        commands.executeCommand('version-wizard.openQuickPick', { task, cwd: resolvedCwd });
        return;
      }

      if (typeof task === 'string' && cwd) {
        const command = getCommandFromLabel(task, cwd);

        if (!command) {
          window.showErrorMessage(`Unknown version task: "${task}".`);
          return;
        }

        const syntheticTask = new VersionWizardTreeItem(task, TreeItemCollapsibleState.None, `${task}.svg`, {
          title: 'Run scripts',
          command: 'version-wizard.command',
          arguments: [task, cwd],
        }, command);

        commands.executeCommand('version-wizard.openQuickPick', {
          task: syntheticTask,
          cwd,
        });
      }
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

function getCwdFromTask(task: VersionWizardTreeItem): string | undefined {
  const args = task.command?.arguments;

  if (!args?.length) return undefined;

  const cwdCandidate = args.at(-1);

  return typeof cwdCandidate === 'string' ? cwdCandidate : undefined;
}

function getCommandFromLabel(label: string, cwd: string): string {
  const packageManager = getPackageManager(cwd);

  switch (label) {
    case VersionWizardScriptsCommandConstant.PATCH:
      return VersionWizardScriptsCommandConstant.PATCH_CMD(packageManager);
    case VersionWizardScriptsCommandConstant.MINOR:
      return VersionWizardScriptsCommandConstant.MINOR_CMD(packageManager);
    case VersionWizardScriptsCommandConstant.MAJOR:
      return VersionWizardScriptsCommandConstant.MAJOR_CMD(packageManager);
    case VersionWizardScriptsCommandConstant.PRERELEASE:
      return VersionWizardScriptsCommandConstant.PRERELEASE_CMD(packageManager);
    case VersionWizardScriptsCommandConstant.PREPATCH:
      return VersionWizardScriptsCommandConstant.PREPATCH_CMD(packageManager);
    case VersionWizardScriptsCommandConstant.PREMINOR:
      return VersionWizardScriptsCommandConstant.PREMINOR_CMD(packageManager);
    case VersionWizardScriptsCommandConstant.PREMAJOR:
      return VersionWizardScriptsCommandConstant.PREMAJOR_CMD(packageManager);
    default:
      return '';
  }
}
