import { CallStack } from './CallStack';
import { DebugCallStack } from './DebugCallStack';
import { IStackFrame } from './IStackFrame';
import { Parameter } from './Parameter';
import { Process } from './Process';
import { UserProcess } from './UserProcess';
import { ValueSet } from './ValueSet';

export class RequiredProcess extends Process {
  public implementation?: UserProcess;

  constructor(
    public readonly name: string,
    public readonly description: string,
    public readonly folder: string | null,
    public readonly inputs: Parameter[],
    public readonly outputs: Parameter[],
    public readonly returnPaths: string[],
  ) {
    super(name, description, folder, inputs, outputs, returnPaths, true);
  }

  public async run(inputs: ValueSet, stack: CallStack) {
    return await this.implementation!.run(inputs, stack);
  }

  public async start(inputs: ValueSet) {
    const stack = new CallStack();
    return await this.run(inputs, stack);
  }

  public async debug(inputs: ValueSet, enteredStep: (frame: IStackFrame) => Promise<void>) {
    const stack = new DebugCallStack(enteredStep);
    return await this.run(inputs, stack);
  }
}
