import { Step } from './Step';

export class ReturningStep extends Step {
    constructor(id: string) {
        super(id);
    }

    public defaultReturnPath: Step;
}