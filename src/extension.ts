import { ExtensionContext, commands, window, workspace } from "vscode";
import { vwQuickPick } from "./quickpick";
import { VWNodeProvider } from "./vw-node-provider";

export function activate(context: ExtensionContext) {
  const rootPath = workspace.rootPath || ".";

  const vWNodeProvider = new VWNodeProvider(rootPath);

  window.registerTreeDataProvider("vw", vWNodeProvider);

  commands.registerCommand("vw.command", (task: string, cwd: string) => {
    window.registerTreeDataProvider("vw", new VWNodeProvider(rootPath));
    commands.executeCommand("vw.openQuickPick", { task, cwd });
  });

  commands.registerCommand("vw.refresh", () => vWNodeProvider.refresh());

  commands.registerCommand("vw.openQuickPick", vwQuickPick());
}

export function deactivate() {}
