import { DataType, TypedDataType } from './DataType';

export class Parameter {
    constructor(
        public readonly name: string,
        public readonly type: DataType
    ) {

    }
}

export class TypedParameter<T> extends Parameter {
    constructor(
        public readonly name: string,
        public readonly type: TypedDataType<T>
    ) {
        super(name, type);
    }
}