import { Step } from './Step';

export abstract class ReturningStep extends Step {
    public defaultReturnPath?: Step;
    
    constructor(id: string) {
        super(id);
    }
}