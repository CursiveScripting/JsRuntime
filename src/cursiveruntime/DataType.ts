type ColorString = string;

export abstract class DataType {
  public readonly deserializable: boolean = false;

  constructor(
    public readonly name: string,
    public readonly color: ColorString,
    public readonly isLookup: boolean,
    public readonly extendsType: DataType | null,
    public readonly validation?: RegExp,
    public readonly guidance?: string,
  ) {}

  public abstract getDefaultValue(): any;

  public isAssignableTo(destinationType: DataType) {
    let test: DataType | null = this;

    do {
      if (test === destinationType) {
        return true;
      }

      test = test.extendsType;
    } while (test !== null);

    return false;
  }
}

export interface IDeserializable {
  deserializable: true;
  deserialize(value: string): any;
}

export function isDeserializable(type: DataType): type is IDeserializable & DataType {
  return type.deserializable;
}
