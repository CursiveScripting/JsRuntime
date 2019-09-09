import { IStackFrame } from './IStackFrame';
import { StartStep } from './StartStep';
import { ValueSet } from './ValueSet';
import { UserProcess } from './UserProcess';
import { Step } from './Step';

export class CallStack {
    private readonly frames: IStackFrame[] = [];
    public currentVariables?: ValueSet;

    constructor(public readonly maxStackSize: number = 100) {

    }

    public async enterNewProcess(process: UserProcess, step: StartStep, variables: ValueSet) {
        this.currentVariables = variables;

        await this.enterStep(process, step);
    }

    public async enterStep(process: UserProcess, step: Step) {
        if (this.frames.length >= this.maxStackSize) {
            throw new Error(`The maximum call depth (${this.maxStackSize}) has been exceeded. Possible infinite loop detected.`);
        }

        const frame = this.createFrame(process, step);

        await this.push(frame);
    }

    protected createFrame(process: UserProcess, step: Step): IStackFrame {
        return {
            process,
            step,
            variables: this.currentVariables!,
        };
    }

    protected async push(frame: IStackFrame) {
        this.frames.push(frame);
    }

    public exitProcess() {
        this.exitStep();

        this.currentVariables = this.frames.length > 0
            ? this.frames[this.frames.length - 1].variables
            : undefined;
    }

    public exitStep() {
        this.frames.pop();
    }
}