import workspaceSchema from 'cursive-schema/workspace.json';
import { IntegerWorkspace } from './IntegerWorkspace';
import { saveWorkspace } from '../cursiveruntime/services/saveWorkspace';
import { validateSchema } from '../cursiveruntime/services/DataFunctions';

test('Saved workspace validates', () => {
    const workspace = new IntegerWorkspace();
    const workspaceJson = JSON.stringify(saveWorkspace(workspace));

    const results = validateSchema(workspaceSchema, workspaceJson);

    expect(results).toBeNull();
});