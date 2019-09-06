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

    const inputs = processData.inputs === undefined
        ? []
        : processData.inputs.map(i => { return {

        }});
    
    const outputs = something;

    const variables = something;

    return new UserProcess(
        processData.name,
        processData.description === undefined ? '' : processData.description,
        processData.folder === undefined ? null : processData.folder,
        inputs,
        outputs,
        processData.returnPaths === undefined
            ? []
            : processData.returnPaths.slice(),
        variables,
    );
}

function getProcessesByName(workspace: Workspace, userProcesses: UserProcess[]): [Map<string, Process>, string[] | null] {
    const errors = [];

    if (!areNamesUnique(userProcesses.map(p => p.name), errors)) {
        return [
            new Map<string, Process>(),
            errors
        ];
    }

    const processesByName = createMap<Process>(workspace.systemProcesses, p => p.name);

    for (const process of userProcesses) {
        if (processesByName.has(process.name)) {
            errors.push(`Process name is already used by a system process: ${process.name}`);
        }
        else {
            processesByName.set(process.name, process);
        }
    }

    
    if (errors.length > 0) {
        return [
            new Map<string, Process>(),
            errors
        ];
    }

    return [ processesByName, errors ]
}

function areNamesUnique(names: string[], errors: string[]) {
    const usedNames = new Set<string>();
    let success = true;

    for (const name of names) {
        if (usedNames.has(name)) {
            success = false;
            errors.push(`Multiple processes have the name name: ${name}`);
            continue;
        }
        
        usedNames.add(name);
    }

    return success;
}

function loadSteps(processData: IUserProcessData[], processesByName: Map<string, Process>) {
    // TODO this
    return [];
}

function applyProcessesToWorkspace(workspace: Workspace, processes: UserProcess[]) {
    clearUserProcesses(workspace);

    for (const process of processes) {
        workspace.userProcesses.push(process);
    }

    const errors: string[] = [];

    for (const required of workspace.requiredProcesses) {
        const implementations = processes.filter(p => p.name === required.name);

        if (implementations.length === 0) {
            errors.push(`No implementation of required process: ${required.name}`);
        }
        else if (implementations.length > 1) {
            errors.push(`Multiple implementation of required process: ${required.name}`);
        }
        else {
            required.implementation = implementations[0];
        }
    }

    if (errors.length > 0) {
        clearUserProcesses(workspace);
        return errors;
    }
    
    return null;
}

function clearUserProcesses(workspace: Workspace) {
    for (const process of workspace.requiredProcesses)
        process.implementation = null;

    workspace.userProcesses.splice(0, workspace.userProcesses.length);
}