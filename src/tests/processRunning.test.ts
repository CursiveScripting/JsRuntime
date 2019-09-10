import addOneJson from './integerProcesses/addOne.json';
import thresholdCheckJson from './integerProcesses/thresholdCheck.json';
import { IntegerWorkspace } from './IntegerWorkspace';
import { IUserProcessData } from '../cursiveruntime/services/serializedDataModels';

test('Run addOne.json process on 1 to get 2', async () => {
  const workspace = new IntegerWorkspace();
  const errors = workspace.loadUserProcesses(addOneJson as IUserProcessData[], false);
  expect(errors).toBeNull();

  const result = await workspace.modifyNumber(1);

  expect(result).toBe(2);
});

test('Run thresholdCheck.json process on 2 to get 4', async () => {
  const workspace = new IntegerWorkspace();
  const errors = workspace.loadUserProcesses(thresholdCheckJson as IUserProcessData[], false);
  expect(errors).toBeNull();

  const result = await workspace.modifyNumber(2);

  expect(result).toBe(4);
});

test('Run thresholdCheck.json process on 3 to get 3', async () => {
  const workspace = new IntegerWorkspace();
  const errors = workspace.loadUserProcesses(thresholdCheckJson as IUserProcessData[], false);
  expect(errors).toBeNull();

  const result = await workspace.modifyNumber(3);

  expect(result).toBe(3);
});

test('Run thresholdCheck.json process on 6 to get 5', async () => {
  const workspace = new IntegerWorkspace();
  const errors = workspace.loadUserProcesses(thresholdCheckJson as IUserProcessData[], false);
  expect(errors).toBeNull();

  const result = await workspace.modifyNumber(6);

  expect(result).toBe(5);
});
