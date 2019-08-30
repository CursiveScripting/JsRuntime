import { Process } from './Process';
import { Parameter } from './Parameter';
import { Variable } from './Variable';

export class UserProcess extends Process {
    constructor(
        public readonly name: string,
        public readonly description: string,
        public readonly folder: string | null,
        public readonly inputs: Parameter[],
        public readonly outputs: Parameter[],
        public readonly returnPaths: string[],
        readonly variables: Variable[]
    ) {
        super(name, description, folder, inputs, outputs, returnPaths);
    }

    // TODO: methods
}