import { Step } from './Step';
import { UserProcess } from './UserProcess';
import { ValueSet } from './ValueSet';

export interface IStackFrame {
    process: UserProcess;
    step: Step;
    variables: ValueSet;
}