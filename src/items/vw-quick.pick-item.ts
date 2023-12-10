import { QuickPickItem } from 'vscode';

export class VersionWizardQuickPickItem implements QuickPickItem {
  label: string;
  description: string;

  constructor(label: string, description: string) {
    this.label = label;
    this.description = description;
  }
}
