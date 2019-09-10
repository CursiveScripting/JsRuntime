import { CallStack } from './CallStack';
import { Process } from './Process';
import { ReturningStep } from './ReturningStep';
import { Step, StepType } from './Step';
import { ValueSet } from './ValueSet';

export class UserStep extends ReturningStep {
    public readonly stepType = StepType.Process;

    public readonly returnPaths = new Map<string, Step>();

    constructor(id: string, readonly childProcess: Process) {
        super(id);
    }

    public async run(stack: CallStack) {
        const variables = stack.currentVariables!.values;

        // map input parameters in from variables
        const childInputs = ValueSet.createFromMap(this.inputMapping, v => variables.get(v.name));
        
        // actually run the process, with the inputs named as it expects
        const { returnPath, outputs } = await this.childProcess.run(childInputs, stack);

        // map any output parameters back out into variables
        if (outputs !== null) {
            for (const [key, val] of this.outputMapping) {
                variables.set(val.name, outputs.values.get(key));
            }
        }

        if (returnPath === null) {
            if (this.returnPaths.size === 0) {
                return this.defaultReturnPath;
            }

            if (!this.childProcess.isUserProcess) {
                throw new Error(`System process "${this.childProcess.name}" unexpectedly returned a null value`);
            }

            throw new Error(`Step ${this.id} unexpectedly returned a null value`);
        }

        const nextStep = this.returnPaths.get(returnPath);

        if (nextStep === undefined) {
            if (!this.childProcess.isUserProcess) {
                throw new Error(`System process "${this.childProcess.name}" returned an unexpected value: ${returnPath}`);
            }

            throw new Error(`Step ${this.id} returned an unexpected value: ${returnPath}`);
        }

        return nextStep;
    }
}