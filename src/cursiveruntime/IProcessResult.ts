import { ValueSet } from './ValueSet';

export interface IProcessResult {
  returnPath: string | null;
  outputs: ValueSet | null;
}
