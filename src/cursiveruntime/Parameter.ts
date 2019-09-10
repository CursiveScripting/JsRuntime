import { DataType } from './DataType';

export class Parameter {
    constructor(
        public readonly name: string,
        public readonly type: DataType
    ) {

    }
}