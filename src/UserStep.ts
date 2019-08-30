import { ReturningStep } from './ReturningStep';
import { Process } from './Process';
import { StepType, Step } from './Step';
import { CallStack } from './CallStack';

export class UserStep extends ReturningStep {
    constructor(id: string, readonly childProcess: Process) {
        super(id);
    }
    
    public readonly stepType = StepType.Process;

    public readonly returnPaths = new Map<string, Step>();

    public async run(stack: CallStack) {
        // TODO: content
    }
}