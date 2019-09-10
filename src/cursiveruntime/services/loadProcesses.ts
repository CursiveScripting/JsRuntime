import processesSchema from 'cursive-schema/processes.json';
import { DataType, isDeserializable } from '../DataType';
import { Parameter } from '../Parameter';
import { Process } from '../Process';
import { ReturningStep } from '../ReturningStep';
import { StartStep } from '../StartStep';
import { Step, StepType } from '../Step';
import { StopStep } from '../StopStep';
import { UserProcess } from '../UserProcess';
import { UserStep } from '../UserStep';
import { Variable } from '../Variable';
import { Workspace } from '../Workspace';
import { createMap, validateSchema } from './DataFunctions';
import { IParameterData, IProcessStepData, IStartStepData, IStopStepData, IUserProcessData } from './serializedDataModels';

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

function createProcesses(typesByName: Map<string, DataType>, processData: IUserProcessData[]): [ UserProcess[], string[] | null ] {
    const errors: string[] = [];

    const processes = processData.map(p => createProcess(p, typesByName, errors));

    return errors.length > 0
        ? [ [], errors ]
        : [ processes, null ]
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

    const paramsWithTypes: Array<[IParameterData, DataType | null]> = parameters.map(p => {
        const type = typesByName.get(p.type);

        return [
            p,
            type === undefined
                ? null
                : type
        ]
    });

    const errorParams = paramsWithTypes
        .filter(p => p[1] === null)
        .map(p => p[0]);
    
    for (const param of errorParams) {
        errors.push(`Unrecognised type \"${param.type}\" used by ${paramType} of process ${process.name}`);
    }

    return paramsWithTypes
        .filter(p => p[1] !== null)
        .map(p => new Parameter(p[0].name, p[1]!));
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

        const dataType = typesByName.get(variableData.type);

        if (dataType === undefined) {
            errors.push(`Unrecognised type \"${variableData.type}\" used by variable ${variableData.name} of process ${process.name}`);
            continue;
        }

        const value = variableData.initialValue !== undefined && isDeserializable(dataType)
            ? dataType.deserialize(variableData.initialValue)
            : dataType.getDefaultValue();

        variables.push(new Variable(variableData.name, dataType, value));
    }

    return variables;
}

function getProcessesByName(workspace: Workspace, userProcesses: UserProcess[]): [Map<string, Process>, string[] | null] {
    const errors: string[] = [];

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

    return [ processesByName, null ];
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
    const errors: string[] = [];

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
    const stepsById = new Map<string, Step>();

    const stepsWithInputs: Array<[IStopStepData | IProcessStepData, Step, Parameter[]]> = [];
    const stepsWithOutputs: Array<[IStartStepData | IProcessStepData, ReturningStep, Parameter[]]> = [];
    
    const initialErrorCount = errors.length;

    for (const stepData of steps) {
        if (stepsById.has(stepData.id)) {
            errors.push(`Process "${process.name}" has multiple steps with ID ${stepData.id}`);
            continue;
        }

        if (isStartStep(stepData)) {
            const step = new StartStep(stepData.id);

            if (process.firstStep === undefined) {
                process.firstStep = step;
            }
            else {
                errors.push(`Process "${process.name}" has multiple start steps`);
            }

            stepsWithOutputs.push([stepData, step, process.inputs]);
            stepsById.set(step.id, step);
        }
        else if (isStopStep(stepData)) {
            const step = new StopStep(stepData.id, stepData.name === undefined ? null : stepData.name);
            stepsWithInputs.push([stepData, step, process.outputs]);
            stepsById.set(step.id, step);
        }
        else if (isProcessStep(stepData)) {
            const innerProcess = processesByName.get(stepData.process);

            if (innerProcess === undefined) {
                errors.push(`Unrecognised process "${stepData.process}" on step ${stepData.id} in process "${process.name}"`);
                continue;
            }

            const step = new UserStep(stepData.id, innerProcess);
            stepsWithInputs.push([stepData, step, innerProcess.inputs]);
            stepsWithOutputs.push([stepData, step, innerProcess.outputs]);
            stepsById.set(step.id, step);
        }
        else {
            errors.push(`Invalid type "${(stepData as any).type}" on step ${(stepData as any).id} in process "${process.name}"`);
        }
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

        if (stepData.returnPath !== undefined) {
            const destStep = stepsById.get(stepData.returnPath);
            if (destStep !== undefined) {
                step.defaultReturnPath = destStep;
            }
            else {
                errors.push(`Step ${step.id} in process "${process.name}" tries to connect to non-existent step "${stepData.returnPath}"`);
            }
        }
        else if (isProcessStep(stepData) && stepData.returnPaths !== undefined) {
            if (!isUserStep(step)) {
                continue;
            }

            const expectedReturnPaths = step.childProcess.returnPaths;

            const mappedPaths = new Set<string>();

            for (const returnPath of Object.keys(stepData.returnPaths)) {
                if (expectedReturnPaths.indexOf(returnPath) === -1) {
                    errors.push(`Step ${step.id} in process "${process.name}" tries to map unexpected return path "${returnPath}"`);
                    continue;
                }
                
                const destName = stepData.returnPaths[returnPath];                
                const destStep = stepsById.get(destName);

                if (destStep === undefined) {
                    errors.push(`Step ${step.id} tries to connect to non-existent step "${destName}" in process "${process.name}"`);
                    continue;
                }

                if (mappedPaths.has(returnPath)) {
                    errors.push(`Step ${step.id} in process "${process.name}" tries to map the "${returnPath}\" return path multiple times`);
                    continue;
                }

                step.returnPaths.set(returnPath, destStep);
                mappedPaths.add(returnPath);
            }

            for (const path of expectedReturnPaths) {
                if (!mappedPaths.has(path)) {
                    errors.push(`Step ${step.id} in process "${process.name}" fails to map the "${path}" return path`);
                }
            }
        }
    }

    return errors.length === initialErrorCount;
}

function isStartStep(step: IStartStepData | IStopStepData | IProcessStepData): step is IStartStepData {
    return step.type === 'start';
}

function isStopStep(step: IStartStepData | IStopStepData | IProcessStepData): step is IStopStepData {
    return step.type === 'stop';
}

function isProcessStep(step: IStartStepData | IStopStepData | IProcessStepData): step is IProcessStepData {
    return step.type === 'process';
}

function isUserStep(step: Step): step is UserStep {
    return step.stepType === StepType.Process;
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
    for (const paramName of Object.keys(paramData)) {
        const parameter = parameters.find(p => p.name === paramName);
        if (parameter === undefined) {
            const paramType = isInputParam ? 'input' : 'output';
            errors.push(`Step ${step.id} tries to map non-existent ${paramType} "${paramName}" in process "${process.name}"`);
            continue;
        }

        const variableName = paramData[paramName];
        const variable = variablesByName.get(variableName);

        if (variable === undefined) {
            const paramType = isInputParam ? 'input' : 'output';
            errors.push(`Step ${step.id} tries to map an ${paramType} to non-existent variable "${variableName}" in process "${process.name}"`);
            continue;
        }

        let fromType: DataType;
        let toType: DataType;
        let mapping: Map<string, Variable>;

        if (isInputParam) {
            fromType = variable.type;
            toType = parameter.type;
            mapping = step.inputMapping;
        }
        else {
            fromType = parameter.type;
            toType = variable.type;
            mapping = step.outputMapping;
        }

        if (!fromType.isAssignableTo(toType)) {
            const error = isInputParam
                ? `Step ${step.id} tries to map the "${variableName}" variable to its "${paramName}" input, but their types are not compatible (${variable.type.name} and ${parameter.type.name}), in process "${process.name}"`
                : `Step ${step.id} tries to map its "${paramName}" output to the "${variableName}" variable, but their types are not compatible (${parameter.type.name} and ${variable.type.name}), in process "${process.name}"`;
            errors.push(error);
            continue;
        }

        mapping.set(paramName, variable);
    }

    if (isInputParam) {
        for (const param of parameters) {
            if (!step.inputMapping.has(param.name)) {
                errors.push(`Step ${step.id} fails to map "${param.name}" input parameter in process "${process.name}"`);
            }
        }
    }
}

function checkUnassignedVariables(process: UserProcess, errors: string[]) {
    const unassignedVariables = new Set<Variable>(
        process.variables
            .filter(v => v.initialValue === null)
    );

    const visitedSteps = new Set<Step>();

    return checkUnassignedVariablesRecursive(process, process.firstStep!, visitedSteps, unassignedVariables, errors);
}

function checkUnassignedVariablesRecursive(
    process: UserProcess,
    currentStep: ReturningStep,
    visitedSteps: Set<Step>,
    unassignedVariables: Set<Variable>,
    errors: string[]
) {
    visitedSteps.add(currentStep);

    unassignedVariables = new Set<Variable>(unassignedVariables);

    // remove variables that currentStep's outputs connect to from the unassigned list
    for (const variable of currentStep.outputMapping.values()) {
        unassignedVariables.delete(variable);
    }

    let allValid = true;

    let nextSteps: Step[];

    if (currentStep.defaultReturnPath !== undefined) {
        nextSteps = [ currentStep.defaultReturnPath ];
    }
    else if (isUserStep(currentStep)) {
        nextSteps = Array.from(currentStep.returnPaths.values());
    }
    else {
        errors.push(`Step ${currentStep.id} in process "${process.name}" has no return paths`);
        return false;
    }

    for (const nextStep of nextSteps) {
        if (visitedSteps.has(nextStep)) {
            continue; // already processed this step, don't do it again
        }

        // check each input of nextStep, if it touches anything in unassignedVariables, that's not valid
        for (const variable of nextStep.inputMapping.values()) {
            if (unassignedVariables.has(variable)) {
                errors.push(`Step ${currentStep.id} in process "${process.name}" uses a variable before it is assigned: ${variable.name}`);
                return false; // once an uninitialized variable is used, stop down this branch
            }
        }

        if (isUserStep(nextStep) && !checkUnassignedVariablesRecursive(process, nextStep, visitedSteps, unassignedVariables, errors)) {
            allValid = false;
        }
    }

    return allValid;
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
    for (const process of workspace.requiredProcesses) {
        process.implementation = undefined;
    }

    workspace.userProcesses.splice(0, workspace.userProcesses.length);
}