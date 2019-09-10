import { DataType } from './DataType';

type ColorString = string;

export class TypedDataType<T> extends DataType {
    constructor(
        public readonly name: string,
        public readonly color: ColorString,
        public readonly isLookup: boolean,
        public readonly extendsType: DataType | null = null,
        private readonly getDefault?: () => T,
        public readonly validation?: RegExp,
        public readonly guidance?: string
    ) {
        super(name, color, isLookup, extendsType, validation, guidance);
    }

    public getDefaultValue() {
        return this.getDefault === undefined
            ? null
            : this.getDefault();
    }
}