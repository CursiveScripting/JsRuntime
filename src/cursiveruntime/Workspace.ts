import { DataType } from './DataType';
import { RequiredProcess } from './RequiredProcess';
import { SystemProcess } from './SystemProcess';
import { UserProcess } from './UserProcess';
import { loadProcesses } from './services/loadProcesses';
import { IUserProcessData } from './services/serializedDataModels';

export class Workspace {
    types: DataType[] = [];
    requiredProcesses: RequiredProcess[] = [];
    systemProcesses: SystemProcess[] = [];
    userProcesses: UserProcess[] = [];

    public loadUserProcesses(processJson: string | IUserProcessData[], validateSchema: boolean = true) {
        if (typeof processJson === 'string') {
            processJson = JSON.parse(processJson) as IUserProcessData[];
        }

        return loadProcesses(this, processJson, validateSchema);
    }
}