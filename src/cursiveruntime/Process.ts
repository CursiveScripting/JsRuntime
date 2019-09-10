import { CallStack } from './CallStack';
import { IProcessResult } from './IProcessResult';
import { Parameter } from './Parameter';
import { ValueSet } from './ValueSet';

export abstract class Process {
    constructor(
        public readonly name: string,
        public readonly description: string,
        public readonly folder: string | null,
        public readonly inputs: Parameter[],
        public readonly outputs: Parameter[],
        public readonly returnPaths: string[],
        public readonly isUserProcess: boolean
    ) {

    }

    public abstract run(inputs: ValueSet, stack: CallStack): Promise<IProcessResult>;
}