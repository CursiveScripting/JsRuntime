import { DataType } from './DataType';

export class Variable {
    constructor(public readonly name: string, public readonly type: DataType, public readonly initialValue: any = null) {

    }
}