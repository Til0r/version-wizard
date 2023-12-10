import { readFile } from 'fs';
import { ExtensionContext, Terminal, window } from 'vscode';
import { VersionWizardPackageManagerFileConstant } from './constants/vw-package-manager-file-list.constant';
import { VersionWizardScriptsCommandConstant } from './constants/vw-scripts-command.constant';
import { VersionWizardQuickPickItem } from './items/vw-quick.pick-item';
import { VersionWizardTreeItem } from './items/vw.tree-item';
import { getPackageManager } from './vw-node-provider';
import { GlobalState } from './vw-workspace-state';
import path = require('path');

export function VersionWizardWQuickPick(context: ExtensionContext) {
  return function ({ task, cwd }: { task: VersionWizardTreeItem; cwd: string }) {
    const fsPath = (task as VersionWizardTreeItem).command?.arguments?.at(1);

    let data = task.data || '';
    const label = task.label;

    const runScripts = function (scriptBuild = '') {
      const name: string = `${path.basename(fsPath)} ~ ${label}`;

      let terminal: Terminal;

      const terminalAlreadyCreated = window.terminals.find((item) => item.name === name);

      if (terminalAlreadyCreated) terminal = terminalAlreadyCreated;
      else terminal = window.createTerminal({ cwd, name });

      terminal.show();

      terminal.sendText(`${data} ${VersionWizardScriptsCommandConstant.NO_GIT_TAG_VERSION}`);

      setTimeout(() => {
        getDataFromPackageJson(fsPath).then((packageJson) => {
          const version = packageJson.version;

          terminal.sendText(
            `${scriptBuild ? `${getPackageManager(fsPath)} run ${scriptBuild} &&` : ''} ${
              VersionWizardScriptsCommandConstant.ADD_ALL
            } && ${VersionWizardScriptsCommandConstant.COMMIT_TAG(
              version,
            )} && ${VersionWizardScriptsCommandConstant.CREATE_TAG(
              version,
            )} && ${VersionWizardScriptsCommandConstant.PUSH_TAG(version)} && ${
              VersionWizardScriptsCommandConstant.PUSH
            }`,
          );
        });
      }, 3500);
    };

    const promptVersionWizardWithBuildOption = function () {
      generateQuickPick(
        `Version Wizard (task ~ ${label}): run a build too?`,
        [new VersionWizardQuickPickItem('Yes', ''), new VersionWizardQuickPickItem('No', '')],
        (selectedOption: VersionWizardQuickPickItem) => {
          switch (selectedOption.label) {
            case 'Yes':
              getDataFromPackageJson(fsPath).then((packageJson) => {
                if (packageJson) {
                  const scriptForBuildFounded = Object.keys(packageJson.scripts)
                    .map((key: string) => {
                      const value: string = packageJson.scripts[key];
                      if (key.includes('build') || value.includes('build'))
                        return new VersionWizardQuickPickItem(key, value);
                    })
                    .filter(Boolean) as VersionWizardQuickPickItem[];

                  if (scriptForBuildFounded.length)
                    generateQuickPick(
                      `Version Wizard (task ~ ${label}): Choose the script for build:`,
                      scriptForBuildFounded,
                      (selectedOption: VersionWizardQuickPickItem) => {
                        runScripts(selectedOption.label);
                      },
                    );
                  else window.showErrorMessage('Workspace has no build scripts!');
                }
              });
              break;
            case 'No':
              runScripts();
              break;
            default:
              break;
          }
        },
      );
    };

    if (data.includes('pre')) {
      const globalStatePreid = new GlobalState(
        context,
        `version-wizard.${VersionWizardScriptsCommandConstant.PREID}`,
        ['rc'],
      );

      generateQuickPick(
        `Version Wizard (task ~ ${label}): choose preid:`,
        globalStatePreid
          .getState()
          .map((workspaceItem) => new VersionWizardQuickPickItem(workspaceItem, '')),
        (selectedOption: VersionWizardQuickPickItem) => {
          data = `${data} --${VersionWizardScriptsCommandConstant.PREID}=${selectedOption.label}`;
          promptVersionWizardWithBuildOption();
        },
        globalStatePreid,
      );
    } else promptVersionWizardWithBuildOption();
  };
}

function generateQuickPick(
  title: string,
  versionWizardQuickPickItem: VersionWizardQuickPickItem[],
  action: (selectedOption: VersionWizardQuickPickItem) => void,
  globalState?: GlobalState<string>,
) {
  const quickPick = window.createQuickPick<VersionWizardQuickPickItem>();
  quickPick.title = title;
  quickPick.items = versionWizardQuickPickItem;

  quickPick.onDidChangeValue(() => {
    if (versionWizardQuickPickItem.some((item) => item.label !== quickPick.value) && globalState)
      quickPick.items = [
        new VersionWizardQuickPickItem(quickPick.value, ''),
        ...versionWizardQuickPickItem,
      ];
  });

  quickPick.onDidAccept(() => {
    const selection = quickPick.activeItems[0];
    if (globalState) globalState.updateState(selection.label);
    action(selection);
    quickPick.hide();
  });

  quickPick.onDidHide(() => quickPick.dispose());
  quickPick.show();
}

function getDataFromPackageJson(
  cwd: string,
): Promise<{ scripts: Record<string, string>; version: string }> {
  return new Promise((resolve, reject) => {
    const packageJsonPath = path.join(cwd, VersionWizardPackageManagerFileConstant.PACKAGE);

    readFile(packageJsonPath, 'utf8', (err, data) => {
      if (err) reject(err);
      resolve(JSON.parse(data));
    });
  });
}
