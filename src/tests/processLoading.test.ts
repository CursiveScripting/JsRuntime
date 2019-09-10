import addOneJson from './integerProcesses/addOne.json';
import thresholdCheckJson from './integerProcesses/thresholdCheck.json';
import { IntegerWorkspace } from './IntegerWorkspace';
import { IUserProcessData } from '../cursiveruntime/services/serializedDataModels';

test('Process loads: addOne.json', () => {
  const workspace = new IntegerWorkspace();
  const errors = workspace.loadUserProcesses(addOneJson as IUserProcessData[]);
  expect(errors).toBeNull();
});

test('Process loads: thresholdCheck.json', () => {
  const workspace = new IntegerWorkspace();
  const errors = workspace.loadUserProcesses(thresholdCheckJson as IUserProcessData[]);
  expect(errors).toBeNull();
});
