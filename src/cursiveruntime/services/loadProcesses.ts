import processesSchema from 'cursive-schema/processes.json';
import { IUserProcessData, IParameterData, IProcessStepData, IStartStepData, IStopStepData } from './serializedDataModels';
import { validateSchema, createMap } from './DataFunctions';
import { Workspace } from '../Workspace';
import { UserProcess } from '../UserProcess';
import { DataType, isDeserializable } from '../DataType';
import { Process } from '../Process';
import { Parameter } from '../Parameter';
import { Variable } from '../Variable';
import { Step } from '../Step';

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
    const inputs = loadParameters(processData.inputs, typesByName, errors, processData, 'input');
    
    const outputs = loadParameters(processData.outputs, typesByName, errors, processData, 'output');

    const variables = loadVariables(processData, typesByName, errors);

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

function loadParameters(
    parameters: IParameterData[] | undefined,
    typesByName: Map<string, DataType>,
    errors: string[],
    process: IUserProcessData,
    paramType: string
) {
    if (parameters === undefined) {
        return [];
    }

    const paramsWithTypes: [IParameterData, DataType | null][] = parameters.map(p => [
        p,
        typesByName.has(p.type)
            ? typesByName.get(p.type)
            : null
    ]);

    const errorParams = paramsWithTypes
        .filter(p => p[1] === null)
        .map(p => p[0]);
    
    for (const param of errorParams) {
        errors.push(`Unrecognised type \"${param.type}\" used by ${paramType} of process ${process.name}`);
    }

    return paramsWithTypes.map(p => new Parameter(p[0].name, p[1]));
}

function loadVariables(
    process: IUserProcessData,
    typesByName: Map<string, DataType>,
    errors: string[]
) {
    if (process.variables === undefined) {
        return [];
    }

    const variables: Variable[] = [];

    const usedNames = new Set<string>();

    for (const variableData of process.variables) {
        if (usedNames.has(variableData.name)) {
            errors.push(`Multiple variables of process ${process.name} use the same name: ${variableData.name}`);
            continue;
        }

        usedNames.add(variableData.name);

        if (!typesByName.has(variableData.type)) {
            errors.push(`Unrecognised type \"${variableData.type}\" used by variable ${variableData.name} of process ${process.name}`);
            continue;
        }

        const dataType = typesByName.get(variableData.type);
        const value = variableData.initialValue !== undefined && isDeserializable(dataType)
            ? dataType.deserialize(variableData.initialValue)
            : dataType.getDefaultValue();

        variables.push(new Variable(variableData.name, dataType, value));
    }

    return variables;
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
    let errors = [];

    for (const process of processData) {
        const userProcess = processesByName.get(process.name) as UserProcess;

        if (loadProcessSteps(userProcess, process.steps, processesByName, errors)) {
            checkUnassignedVariables(userProcess, errors);
        }
    }

    return errors.length > 0
        ? errors
        : null;
}

function loadProcessSteps(
    process: UserProcess,
    steps: Array<IStartStepData | IStopStepData | IProcessStepData>,
    processesByName: Map<string, Process>,
    errors: string[]
) {
    const stepsById = new Map<String, Step>();

    const stepsWithInputs: Array<[IStopStepData | IProcessStepData, Step, Parameter[]]> = [];
    const stepsWithOutputs: Array<[IStartStepData | IProcessStepData, Step, Parameter[]]> = [];
    
    const initialErrorCount = errors.length;

    for (const step of steps) {
        // TODO: this
    }

    const variablesByName = createMap(process.variables, v => v.name);

    for (const [stepData, step, parameters] of stepsWithInputs) {
        if (stepData.inputs !== undefined) {
            mapParameters(stepData.inputs, step, parameters, variablesByName, process, true, errors);
        }
    }

    for (const [stepData, step, parameters] of stepsWithOutputs) {
        if (stepData.outputs !== undefined) {
            mapParameters(stepData.outputs, step, parameters, variablesByName, process, false, errors);
        }

        // TODO: return paths
    }

    return errors.length === initialErrorCount;
}

function mapParameters(
    paramData: Record<string, string>,
    step: Step,
    parameters: Parameter[],
    variablesByName: Map<string, Variable>,
    process: UserProcess,
    isInputParam: boolean,
    errors: string[]
) {
    // TODO: this
}

function checkUnassignedVariables(process: UserProcess, errors: string[]) {
    // TODO: this
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