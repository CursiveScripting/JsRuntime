import { IUserProcessData } from './serializedDataModels';
import { Workspace } from '../Workspace';
import { UserProcess } from '../UserProcess';

export function loadProcesses(workspace: Workspace, processData: IUserProcessData[]) {
    const userProcesses: UserProcess[] = [];
    
    for (const process of processData) {
        var userProcess = new UserProcess(
            process.name,
            process.description === undefined ? '' : process.description,
            process.folder === undefined ? null : process.folder,
            process.inputs === undefined
                ? []
                : process.inputs.map(i => { return {

                }}),
            process.outputs === undefined
                ? []
                : process.outputs.map(o => { return {
                    
                }}),
            process.returnPaths === undefined
                ? []
                : process.returnPaths.slice(),
            process.variables === undefined
                ? []
                : process.variables.map(v => { return {

                }}),
        )

        const steps = process.steps === undefined
            ? []
            : process.steps.map(s => {
                return {

                }
            });

        userProcess.firstStep = steps.find(s => s.type === 'start');

        userProcesses.push(userProcess);
    }

    workspace.userProcesses = userProcesses;
}