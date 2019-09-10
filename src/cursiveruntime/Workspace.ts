import { DataType } from './DataType';
import { RequiredProcess } from './RequiredProcess';
import { loadProcesses } from './services/loadProcesses';
import { IUserProcessData } from './services/serializedDataModels';
import { SystemProcess } from './SystemProcess';
import { UserProcess } from './UserProcess';

export class Workspace {
    public types: DataType[] = [];
    public requiredProcesses: RequiredProcess[] = [];
    public systemProcesses: SystemProcess[] = [];
    public userProcesses: UserProcess[] = [];

    public loadUserProcesses(processJson: string | IUserProcessData[], validateSchema: boolean = true) {
        if (typeof processJson === 'string') {
            processJson = JSON.parse(processJson) as IUserProcessData[];
        }

        return loadProcesses(this, processJson, validateSchema);
    }
}