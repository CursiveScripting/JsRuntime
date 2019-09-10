import { Parameter } from './Parameter';
import { TypedDataType } from './TypedDataType';

export class TypedParameter<T> extends Parameter {
    constructor(
        public readonly name: string,
        public readonly type: TypedDataType<T>
    ) {
        super(name, type);
    }
}