import { CallStack } from './CallStack';
import { Step, StepType } from './Step';
import { ValueSet } from './ValueSet';

export class StopStep extends Step {
    public readonly stepType = StepType.Stop;

    constructor(id: string, public readonly returnValue: string | null) {
        super(id);
    }

    public run(stack: CallStack) {
        const variables = stack.currentVariables!.values;

        const outputs = ValueSet.createFromMap(this.inputMapping, v => variables.get(v.name));

        return outputs;
    }
}