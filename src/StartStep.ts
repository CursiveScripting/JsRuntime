import { ReturningStep } from './ReturningStep';
import { StepType } from './Step';
import { CallStack } from './CallStack';
import { ValueSet } from './ValueSet';

export class StartStep extends ReturningStep {
    constructor(id: string) {
        super(id);
    }

    public readonly stepType = StepType.Start;

    public run(stack: CallStack, inputs: ValueSet) {
        const variables = stack.currentVariables.values;

        for (const [name, var] of this.outputMapping) {
            variables.set(var.name, inputs.get(name));
        }

        return this.defaultReturnPath;
    }
}