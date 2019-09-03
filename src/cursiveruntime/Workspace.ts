import { DataType } from './DataType';
import { RequiredProcess } from './RequiredProcess';
import { SystemProcess } from './SystemProcess';
import { UserProcess } from './UserProcess';

export class Workspace {
    types: DataType[] = [];
    requiredProcesses: RequiredProcess[] = [];
    systemProcesses: SystemProcess[] = [];
    userProcesses: UserProcess[] = [];

    public loadUserProcesses(procsessJson: string) {
        // TODO: this
    }
}