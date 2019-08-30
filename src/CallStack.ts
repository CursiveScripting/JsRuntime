import { IStackFrame } from './StackFrame';
import { ValueSet } from './ValueSet';

export class CallStack {
    private readonly frames: IStackFrame[] = [];
    public currentVariables: ValueSet;

    constructor(public readonly maxStackSize: number = 100) {

    }

    protected async push(frame: IStackFrame) {

    }

    // TODO: methods
}