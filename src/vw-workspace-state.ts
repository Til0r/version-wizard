import { ExtensionContext } from 'vscode';

export class GlobalState<T> {
  private stateKey = '';
  private state: T[] = [];
  private context: ExtensionContext;

  constructor(context: ExtensionContext, stateKey: string, defaultValue: T[]) {
    this.context = context;
    this.stateKey = stateKey;

    this.state = this.context.globalState.get<T[]>(this.stateKey) || defaultValue;
  }

  get = (): T[] => this.state.filter(Boolean);

  update(value: T): void {
    if (value && !this.state.includes(value))
      this.context.globalState.update(this.stateKey, [...this.state, value]);
  }
}
