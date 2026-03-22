import { ExtensionContext } from 'vscode';

export class GlobalState<T> {
  private readonly stateKey: string;
  private state: T[] = [];
  private readonly context: ExtensionContext;

  constructor(context: ExtensionContext, stateKey: string, defaultValue: T[]) {
    this.context = context;
    this.stateKey = stateKey;

    this.state = this.context.globalState.get<T[]>(this.stateKey) || defaultValue;
  }

  get = (): T[] => this.state.filter(Boolean);

  update(value: T): void {
    if (value && !this.state.includes(value)) {
      this.state = [...this.state, value];
      this.context.globalState.update(this.stateKey, this.state);
    }
  }
}
