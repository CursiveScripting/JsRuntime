import { Step } from './Step';

export abstract class ReturningStep extends Step {
    constructor(id: string) {
        super(id);
    }

    public defaultReturnPath: Step;
}