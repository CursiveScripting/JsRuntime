import { ValueSet } from './ValueSet';

export interface IProcessResult {
    returnPath: string;
    outputs: ValueSet | null;
}