import { CallStack } from './CallStack';
import { IProcessResult } from './IProcessResult';
import { Parameter } from './Parameter';
import { Process } from './Process';
import { ValueSet } from './ValueSet';

export class SystemProcess extends Process {
  constructor(
    public readonly name: string,
    public readonly description: string,
    public readonly folder: string | null,
    private readonly operation: (variables: ValueSet) => Promise<IProcessResult>,
    public readonly inputs: Parameter[],
    public readonly outputs: Parameter[],
    public readonly returnPaths: string[],
  ) {
    super(name, description, folder, inputs, outputs, returnPaths, false);
  }

  public async run(inputs: ValueSet, stack?: CallStack) {
    try {
      return await this.operation(inputs);
    } catch (e) {
      throw new Error(`An error occurred running system process ${this.name}: ${e}`);
    }
  }
}
