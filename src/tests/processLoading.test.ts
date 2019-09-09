import addOneJson from './integerProcesses/addOne.json';
import thresholdCheckJson from './integerProcesses/thresholdCheck.json';
import { IntegerWorkspace } from './IntegerWorkspace';

test('Process loads: addOne.json', () => {
    const workspace = new IntegerWorkspace();
    const errors = workspace.loadUserProcesses(addOneJson);
    expect(errors).toBeNull();
});

test('Process loads: thresholdCheck.json', () => {
    const workspace = new IntegerWorkspace();
    const errors = workspace.loadUserProcesses(thresholdCheckJson);
    expect(errors).toBeNull();
});