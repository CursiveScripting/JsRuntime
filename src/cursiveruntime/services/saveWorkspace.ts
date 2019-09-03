import { Workspace } from '../Workspace';
import { IWorkspaceData } from './serializedDataModels';

export function saveWorkspace(workspace: Workspace): IWorkspaceData {
    return {
        types: workspace.types.map(t => {}),
        requiredProcesses: workspace.requiredProcesses.map(p => {}),
        userProcesses: workspace.userProcesses.map(p => {}),
    }
}