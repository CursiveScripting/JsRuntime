type ColorString = string;

export abstract class DataType {
    constructor(
        public readonly name: string,
        public readonly color: ColorString,
        public readonly extendsType: DataType | null,
        public readonly validation?: RegExp,
        public readonly guidance?: string
    ) {

    }

    public abstract systemType: string; // TODO: something more useful here?

    abstract getDefaultValue(): any;

    protected static getTypeDefault(type: string): any {
        // TODO: something
    }

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
}


// TODO: extending types

export class TypedDataType<T> extends DataType {
    constructor(
        public readonly name: string,
        public readonly color: ColorString,
        public readonly extendsType: DataType | null,
        public readonly getDefault: null | (() => T),
        public readonly validation?: RegExp,
        public readonly guidance?: string
    ) {
        super(name, color, extendsType, validation, guidance);
    }

    public readonly systemType = 'TODO'; // TODO: something

    public getDefaultValue() {
        if (this.getDefault !== undefined) {
            return this.getDefault();
        }
    }
}