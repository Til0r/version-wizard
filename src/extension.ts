import { ExtensionContext, commands, window, workspace } from "vscode";
import { VWNodeProvider } from "./vw-node-provider";
import { vWQuickPick } from "./vw-quickpick";

export function activate(context: ExtensionContext) {
  const rootPath = workspace.rootPath || ".";

  const vWNodeProvider = new VWNodeProvider(rootPath);
  window.registerTreeDataProvider("vw", vWNodeProvider);

  commands.registerCommand("vw.command", (task: string, cwd: string) => {
    commands.executeCommand("vw.openQuickPick", { task, cwd });
  });

  commands.registerCommand("vw.refresh", () => vWNodeProvider.refresh());

  commands.registerCommand("vw.openQuickPick", vWQuickPick(rootPath));
}

export function deactivate() {}
