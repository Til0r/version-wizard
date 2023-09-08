import { readFile } from "fs";
import { Terminal, extensions, window } from "vscode";
import { VWScriptsCommandConstant } from "./constants/vw-scripts-command.constant";
import { VWTreeItem } from "./items/vw.tree-item";
import { getPackageManager } from "./vw-node-provider";
import { VWQuickPickItem } from "./items/vw-quick.pick-item";
import path = require("path");

export function vWQuickPick() {
  return function ({ task, cwd }: any) {
    const fsPath = (task as VWTreeItem).command?.arguments?.at(1);

    const runScripts = function (scriptBuild = "") {
      const name: string = `${path.basename(fsPath)} ~ ${task.label}`;

      let terminal: Terminal;

      const terminalAlreadyCreated = window.terminals.find(
        (item) => item.name === name
      );

      if (terminalAlreadyCreated) terminal = terminalAlreadyCreated;
      else {
        terminal = window.createTerminal({ cwd, name });
      }

      terminal.show();

      // terminal.sendText
      console.log(
        `${task.data} ${
          scriptBuild ? VWScriptsCommandConstant.NO_GIT_TAG_VERSION : ""
        }`
      );

      setTimeout(() => {
        getDataFromPackageJson(fsPath).then((packageJson: any) => {
          const version = packageJson["version"];

          if (scriptBuild)
            // terminal.sendText
            console.log(
              `${getPackageManager(fsPath)} run ${scriptBuild} && ${
                VWScriptsCommandConstant.ADD_ALL
              } && ${VWScriptsCommandConstant.COMMIT_TAG(
                version,
                getGitBranchName()
              )} && ${VWScriptsCommandConstant.CREATE_TAG(
                version
              )} && ${VWScriptsCommandConstant.PUSH_TAG(version)}`
            );
          // terminal.sendText
          else console.log(`${VWScriptsCommandConstant.PUSH_TAG(version)}`);
        });
      }, 1000);
    };

    generateQuickPick(
      `Version Wizard (${task.label}): Execute also a build?`,
      [new VWQuickPickItem("Yes", ""), new VWQuickPickItem("No", "")],
      (selectedOption: VWQuickPickItem) => {
        switch (selectedOption.label) {
          case "Yes":
            getDataFromPackageJson(fsPath).then((packageJson: any) => {
              if (packageJson) {
                const scriptForBuildFounded = Object.keys(
                  packageJson.scripts as Object
                )
                  .map((key: string) => {
                    const value: string = packageJson.scripts[key];
                    if (value.includes("build"))
                      return new VWQuickPickItem(key, value);
                  })
                  .filter(Boolean) as VWQuickPickItem[];

                if (scriptForBuildFounded.length)
                  generateQuickPick(
                    "Version Wizard: Choose the script for build:",
                    scriptForBuildFounded,
                    (selectedOption: VWQuickPickItem) => {
                      runScripts(selectedOption.label);
                    }
                  );
              }
            });
            break;
          case "No":
            runScripts();
            break;
          default:
            break;
        }
      }
    );
  };
}

function generateQuickPick(
  title: string,
  vWQuickPickItem: VWQuickPickItem[],
  action: Function
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

function getGitBranchName(): string | "" {
  const gitExtension = extensions.getExtension("vscode.git");

  if (gitExtension && gitExtension.isActive)
    return gitExtension.exports.getAPI(1).repositories[0].state.HEAD.name;

  return "";
}

function getDataFromPackageJson(cwd: string) {
  return new Promise((resolve: Function, reject: Function) => {
    const packageJsonPath = path.join(cwd, "package.json");

    readFile(packageJsonPath, "utf8", (err, data) => {
      if (err) reject(err);
      resolve(JSON.parse(data));
    });
  });
}
