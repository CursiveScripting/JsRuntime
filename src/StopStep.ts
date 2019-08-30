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

        const outputs = new ValueSet(this.inputMapping.toDictionary(m => m.key, m => variables.get(m.value.name)));

        return outputs;
    }
}