import { DataType, IDeserializable } from './DataType';
import { TypedDataType } from './TypedDataType';

type ColorString = string;

export class FixedType<T> extends TypedDataType<T> implements IDeserializable {
  public readonly deserializable = true;

  constructor(
    name: string,
    color: ColorString,
    public readonly deserialize: (value: string) => T,
    extendsType: DataType | null = null,
    getDefault?: () => T,
    validation?: RegExp,
    guidance?: string,
  ) {
    super(name, color, false, extendsType, getDefault, validation, guidance);
  }
}
