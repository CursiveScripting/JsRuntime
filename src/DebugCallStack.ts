import { CallStack } from './CallStack';
import { IStackFrame } from './StackFrame';

export class DebugCallStack extends CallStack {
    constructor(
        readonly stepEntered?: (frame: IStackFrame) => Promise<void>,
        maxStackSize: number = 100
    ) {
        super(maxStackSize);
    }

    protected async push(frame: IStackFrame) {
        if (this.stepEntered !== undefined) {
            await this.stepEntered(frame);
        }

        await super.push(frame);
    }

    // TODO: 
}