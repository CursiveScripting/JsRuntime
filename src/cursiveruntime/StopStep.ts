import { StepType, Step } from './Step';
import { CallStack } from './CallStack';
import { ValueSet } from './ValueSet';

export class StopStep extends Step {
    constructor(id: string, public readonly returnValue: string | null) {
        super(id);
    }

    public readonly stepType = StepType.Stop;

    public run(stack: CallStack) {
        const variables = stack.currentVariables.values;

        const outputs = ValueSet.createFromMap(this.inputMapping, v => variables.get(v.name));

        return outputs;
    }
}