import { Process } from './Process';
import { Parameter } from './Parameter';
import { Variable } from './Variable';
import { StartStep } from './StartStep';
import { ValueSet } from './ValueSet';
import { CallStack } from './CallStack';
import { Step, StepType } from './Step';
import { StopStep } from './StopStep';
import { UserStep } from './UserStep';
import { IProcessResult } from './IProcessResult';

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
        super(name, description, folder, inputs, outputs, returnPaths, true);
    }

    public readonly processType = 'user';

    public firstStep?: StartStep;

    public async run(inputs: ValueSet, stack: CallStack) {
        const variableValues = ValueSet.createFromArray(this.variables, v => v.name, v => v.initialValue);

        let currentStep: Step | undefined = await this.runStartStep(inputs, stack, variableValues);

        while (currentStep !== undefined) {
            if (currentStep.stepType === StepType.Process) {
                currentStep = await this.runStep(currentStep as UserStep, stack);
            }
            
            else if (currentStep.stepType === StepType.Stop) {
                return await this.runStopStep(currentStep as StopStep, stack);
            }

            else {
                throw new Error(`Ran into unexpected step ${currentStep.id} in process "${this.name}"`);
            }
        }

        throw new Error(`The last step of process "${this.name}" wasn't a stop step`);
    }

    private async runStartStep(inputs: ValueSet, stack: CallStack, variableValues: ValueSet) {
        const step = this.firstStep!;

        await stack.enterNewProcess(this, step, variableValues);

        const nextStep = await step.run(stack, inputs);

        stack.exitStep();

        return nextStep;
    }

    private async runStep(step: UserStep, stack: CallStack) {
        await stack.enterStep(this, step);

        const nextStep = await step.run(stack);

        stack.exitStep();

        return nextStep;
    }

    private async runStopStep(step: StopStep, stack: CallStack): Promise<IProcessResult> {
        await stack.enterStep(this, step);

        const outputs = await step.run(stack);

        stack.exitProcess();

        return {
            returnPath: step.returnValue,
            outputs,
        };
    }
}