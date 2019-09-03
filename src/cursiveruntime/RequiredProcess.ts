import { Process } from './Process';
import { Parameter } from './Parameter';
import { UserProcess } from './UserProcess';
import { CallStack } from './CallStack';
import { DebugCallStack } from './DebugCallStack';
import { ValueSet } from './ValueSet';
import { IStackFrame } from './StackFrame';

export class RequiredProcess extends Process {
    constructor(
        public readonly name: string,
        public readonly description: string,
        public readonly folder: string | null,
        public readonly inputs: Parameter[],
        public readonly outputs: Parameter[],
        public readonly returnPaths: string[]
    ) {
        super(name, description, folder, inputs, outputs, returnPaths, true);
    }

    implementation: UserProcess;

    public async run(inputs: ValueSet, stack: CallStack) {
        return await this.implementation.run(inputs, stack);
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