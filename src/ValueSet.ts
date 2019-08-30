import { TypedParameter } from './Parameter';

export class ValueSet {
    constructor(public readonly values: Map<string, any> = new Map<string, any>()) {

    }

    public get<TValue>(param: TypedParameter<TValue>) {
        return this.values.get(param.name) as TValue;
    }

    public set<TValue>(param: TypedParameter<TValue>, value: TValue) {
        this.values.set(param.name, value);
    }
}