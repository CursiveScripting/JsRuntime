import { TypedParameter } from './Parameter';

export class ValueSet {
  public static createFromArray<TElement, TValue>(
    elements: TElement[],
    getKey: (el: TElement) => string,
    getValue: (el: TElement) => TValue,
  ) {
    const map = new Map<string, TValue>();

    for (const element of elements) {
      map.set(getKey(element), getValue(element));
    }

    return new ValueSet(map);
  }

  public static createFromMap<TElement, TValue>(map: Map<string, TElement>, getValue: (el: TElement) => TValue) {
    const resultMap = new Map<string, TValue>();

    for (const [key, value] of map) {
      resultMap.set(key, getValue(value));
    }

    return new ValueSet(resultMap);
  }

  constructor(public readonly values: Map<string, any> = new Map<string, any>()) {}

  public get<TValue>(param: TypedParameter<TValue>) {
    return this.values.get(param.name) as TValue;
  }

  public set<TValue>(param: TypedParameter<TValue>, value: TValue) {
    this.values.set(param.name, value);
  }
}
