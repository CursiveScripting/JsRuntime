import { Workspace } from '../Workspace';
import { IWorkspaceData } from './serializedDataModels';
import { LookupType } from '../DataType';
import { Process } from '../Process';

export function saveWorkspace(workspace: Workspace): IWorkspaceData {
    return {
        types: workspace.types.map(t => t.isLookup
            ? {
                name: t.name,
                color: t.color,
                guidance: t.guidance,
                options: (t as LookupType).options.slice(),
            }
            : {
                name: t.name,
                color: t.color,
                guidance: t.guidance,
                extends: t.extendsType === null
                    ? undefined
                    : t.extendsType.name,
                validation: t.validation === undefined
                    ? undefined
                    : t.validation.toString(), // TODO: this looks to include flags and slashes on either end. Don't think we want those.
            }
        ),
        requiredProcesses: workspace.requiredProcesses.map(saveProcessDefinition),
        systemProcesses: workspace.systemProcesses.map(saveProcessDefinition),
    }
}

function saveProcessDefinition(process: Process) {
    return {
        name: process.name,
        description: process.description === ''
            ? undefined
            : process.description,
        folder: process.folder === null
            ? undefined
            : process.folder,
        inputs: process.inputs.length === 0
            ? undefined
            : process.inputs.map(i => { return {
                name: i.name,
                type: i.type.name,
            }}),
        outputs: process.outputs.length === 0
            ? undefined
            : process.outputs.map(o => { return {
                name: o.name,
                type: o.type.name,
            }}),
        returnPaths: process.returnPaths.length === 0
            ? undefined
            : process.returnPaths.slice(),
    }
}