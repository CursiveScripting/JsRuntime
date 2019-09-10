import { Variable } from './Variable';

export abstract class Step {
  public abstract readonly stepType: StepType;

  public readonly inputMapping = new Map<string, Variable>();
  public readonly outputMapping = new Map<string, Variable>();

  constructor(public readonly id: string) {}
}

export enum StepType {
  Start,
  Stop,
  Process,
}
