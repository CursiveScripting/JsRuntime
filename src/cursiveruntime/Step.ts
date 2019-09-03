import { Variable } from './Variable';

export abstract class Step {
    constructor(public readonly id: string) {

    }

    abstract readonly stepType: StepType;

    public readonly inputMapping = new Map<string, Variable>();
    public readonly outputMapping = new Map<string, Variable>();
}

export enum StepType
{
    Start,
    Stop,
    Process,
}