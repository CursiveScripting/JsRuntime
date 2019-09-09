type ColorString = string;

export abstract class DataType {
    constructor(
        public readonly name: string,
        public readonly color: ColorString,
        public readonly isLookup: boolean,
        public readonly extendsType: DataType | null,
        public readonly validation?: RegExp,
        public readonly guidance?: string
    ) {

    }

    abstract getDefaultValue(): any;

    public isAssignableTo(destinationType: DataType) {
        let test: DataType | null = this;

        do
        {
            if (test == destinationType)
                return true;

            test = test.extendsType;
        } while (test != null);

        return false;
    }

    public readonly deserializable: boolean = false;
}

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

export interface IDeserializable {
    deserialize(value: string): any;
    deserializable: true;
}


export class FixedType<T> extends TypedDataType<T> implements IDeserializable {
    constructor(
        name: string,
        color: ColorString,
        public readonly deserialize: (value: string) => T,
        extendsType: DataType | null = null,
        getDefault?: () => T,
        validation?: RegExp,
        guidance?: string
    ) {
        super(name, color, false, extendsType, getDefault, validation, guidance);
    }

    public readonly deserializable = true;
}

export class LookupType extends TypedDataType<string> implements IDeserializable {
    constructor(
        name: string,
        color: ColorString,
        public readonly options: string[],
        guidance?: string
    ) {
        super(name, color, true, null, undefined, undefined, guidance);
    }

    public deserialize(value: string) {
        return value;
    }

    public readonly deserializable = true;
}

export function isDeserializable(type: DataType): type is IDeserializable & DataType {
    return type.deserializable;
}