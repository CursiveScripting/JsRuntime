import { LookupType } from '../LookupType';
import { Process } from '../Process';
import { Workspace } from '../Workspace';
import { IWorkspaceData } from './serializedDataModels';

export function saveWorkspace(workspace: Workspace): IWorkspaceData {
  return {
    requiredProcesses: workspace.requiredProcesses.map(saveProcessDefinition),
    systemProcesses: workspace.systemProcesses.map(saveProcessDefinition),
    types: workspace.types.map(t =>
      t.isLookup
        ? {
            color: t.color,
            guidance: t.guidance,
            name: t.name,
            options: (t as LookupType).options.slice(),
          }
        : {
            color: t.color,
            extends: t.extendsType === null ? undefined : t.extendsType.name,
            guidance: t.guidance,
            name: t.name,
            validation: t.validation === undefined ? undefined : regexToString(t.validation),
          },
    ),
  };
}

function saveProcessDefinition(process: Process) {
  return {
    description: process.description === '' ? undefined : process.description,
    folder: process.folder === null ? undefined : process.folder,
    inputs:
      process.inputs.length === 0
        ? undefined
        : process.inputs.map(i => {
            return {
              name: i.name,
              type: i.type.name,
            };
          }),
    name: process.name,
    outputs:
      process.outputs.length === 0
        ? undefined
        : process.outputs.map(o => {
            return {
              name: o.name,
              type: o.type.name,
            };
          }),
    returnPaths: process.returnPaths.length === 0 ? undefined : process.returnPaths.slice(),
  };
}

export function regexToString(regex: RegExp) {
     // TODO: this looks to include flags and slashes on either end. Don't think we want those.
    return regex.toString();
}