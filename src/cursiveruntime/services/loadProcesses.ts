import processesSchema from 'cursive-schema/processes.json';
import { IUserProcessData } from './serializedDataModels';
import { validateSchema, createMap } from './DataFunctions';
import { Workspace } from '../Workspace';
import { UserProcess } from '../UserProcess';
import { DataType } from '../DataType';
import { Process } from '../Process';

export function loadProcesses(workspace: Workspace, processData: IUserProcessData[], checkSchema: boolean) {
    if (checkSchema) {
        const validationErrors = validateSchema(processesSchema, processData);

        if (validationErrors !== null) {
            throw new Error(`Process data is not valid: ${validationErrors}`);
        }
    }

    const typesByName = createMap(workspace.types, t => t.name);

    let errors: string[] | null;

    let userProcesses: UserProcess[];
    [ userProcesses, errors ] = createProcesses(typesByName, processData);
    if (errors !== null) {
        return errors;
    }

    let processesByName: Map<string, Process>;
    [ processesByName, errors ] = getProcessesByName(workspace, userProcesses);
    if (errors !== null) {
        return errors;
    }

    errors = loadSteps(processData, processesByName);
    if (errors !== null) {
        return errors;
    }

    errors = applyProcessesToWorkspace(workspace, userProcesses)
    if (errors !== null) {
        return errors;
    }

    return null;

    /*
    
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
    */
}

function createProcesses(typesByName: Map<string, DataType>, processData: IUserProcessData[]): [ UserProcess[], string[] ] {
    const errors: string[] = [];

    const processes = processData.map(p => createProcess(p, typesByName, errors));

    return [
        errors.length > 0   
            ? []
            : processes,
        errors
    ];
}

function createProcess(processData: IUserProcessData, typesByName: Map<string, DataType>, errors: string[]) {
    // TODO: this
    return {} as UserProcess;
}

function getProcessesByName(workspace: Workspace, userProcesses: UserProcess[]): [Map<string, Process>, string[] | null] {
    const processesByName = createMap<Process>(workspace.systemProcesses, p => p.name);

    for (const process of userProcesses) {
        // TODO: check for name conflicts

        processesByName.set(process.name, process);
    }

    const errors = [];

    return [ processesByName, errors ]
}

function loadSteps(processData: IUserProcessData[], processesByName: Map<string, Process>) {
    // TODO this
    return [];
}

function applyProcessesToWorkspace(workspace: Workspace, userProcesses: UserProcess[]) {
    // TODO: this
    return [];
}