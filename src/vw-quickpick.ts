import { readFile } from 'fs';
import { Terminal, window } from 'vscode';
import { PackageManagerFileListConstant } from './constants/package-manager-file-list.constant';
import { VWScriptsCommandConstant } from './constants/vw-scripts-command.constant';
import { VWQuickPickItem } from './items/vw-quick.pick-item';
import { VWTreeItem } from './items/vw.tree-item';
import { getPackageManager } from './vw-node-provider';
import path = require('path');

export function vWQuickPick() {
  return function ({ task, cwd }: { task: VWTreeItem; cwd: string }) {
    const fsPath = (task as VWTreeItem).command?.arguments?.at(1);

    const runScripts = function (scriptBuild = '') {
      const name: string = `${path.basename(fsPath)} ~ ${task.label}`;

      let terminal: Terminal;

      const terminalAlreadyCreated = window.terminals.find((item) => item.name === name);

      if (terminalAlreadyCreated) terminal = terminalAlreadyCreated;
      else {
        terminal = window.createTerminal({ cwd, name });
      }

      terminal.show();

      terminal.sendText(`${task.data} ${VWScriptsCommandConstant.NO_GIT_TAG_VERSION}`);

      setTimeout(() => {
        getDataFromPackageJson(fsPath).then((packageJson) => {
          const version = packageJson.version;

          terminal.sendText(
            `${scriptBuild ? `${getPackageManager(fsPath)} run ${scriptBuild} &&` : ''} ${
              VWScriptsCommandConstant.ADD_ALL
            } && ${VWScriptsCommandConstant.COMMIT_TAG(
              version,
            )} && ${VWScriptsCommandConstant.CREATE_TAG(
              version,
            )} && ${VWScriptsCommandConstant.PUSH_TAG(version)} && ${
              VWScriptsCommandConstant.PUSH
            }`,
          );
        });
      }, 3500);
    };

    generateQuickPick(
      `Version Wizard (task ~ ${task.label}): run a build too?`,
      [new VWQuickPickItem('Yes', ''), new VWQuickPickItem('No', '')],
      (selectedOption: VWQuickPickItem) => {
        switch (selectedOption.label) {
          case 'Yes':
            getDataFromPackageJson(fsPath).then((packageJson) => {
              if (packageJson) {
                const scriptForBuildFounded = Object.keys(packageJson.scripts)
                  .map((key: string) => {
                    const value: string = packageJson.scripts[key];
                    if (key.includes('build') || value.includes('build'))
                      return new VWQuickPickItem(key, value);
                  })
                  .filter(Boolean) as VWQuickPickItem[];

                if (scriptForBuildFounded.length)
                  generateQuickPick(
                    `Version Wizard (task ~ ${task.label}): Choose the script for build:`,
                    scriptForBuildFounded,
                    (selectedOption: VWQuickPickItem) => {
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
}

function generateQuickPick(
  title: string,
  vWQuickPickItem: VWQuickPickItem[],
  action: (selectedOption: VWQuickPickItem) => void,
) {
  const quickPick = window.createQuickPick<VWQuickPickItem>();
  quickPick.title = title;
  quickPick.items = vWQuickPickItem;

  quickPick.onDidChangeSelection((selection) => {
    const currentValue = selection[0];
    if (currentValue) {
      action(currentValue);
      quickPick.hide();
    }
  });

  quickPick.onDidHide(() => quickPick.dispose());
  quickPick.show();
}

function getDataFromPackageJson(
  cwd: string,
): Promise<{ scripts: Record<string, string>; version: string }> {
  return new Promise((resolve, reject) => {
    const packageJsonPath = path.join(cwd, PackageManagerFileListConstant.PACKAGE);

    readFile(packageJsonPath, 'utf8', (err, data) => {
      if (err) reject(err);
      resolve(JSON.parse(data));
    });
  });
}
