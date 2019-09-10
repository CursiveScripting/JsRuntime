import { IDeserializable } from './DataType';
import { TypedDataType } from './TypedDataType';

type ColorString = string;

export class LookupType extends TypedDataType<string> implements IDeserializable {
  public readonly deserializable = true;

  constructor(name: string, color: ColorString, public readonly options: string[], guidance?: string) {
    super(name, color, true, null, undefined, undefined, guidance);
  }

  public deserialize(value: string) {
    return value;
  }
}
