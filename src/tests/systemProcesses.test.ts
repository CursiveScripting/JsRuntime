import { IntegerWorkspace } from './IntegerWorkspace';

test('Compare function returns less', async () => {
  const workspace = new IntegerWorkspace();

  const result = await workspace.compare(1, 2);

  expect(result).toBe('less');
});

test('Compare function returns greater', async () => {
  const workspace = new IntegerWorkspace();

  const result = await workspace.compare(5, 1);

  expect(result).toBe('greater');
});

test('Compare function returns equal', async () => {
  const workspace = new IntegerWorkspace();

  const result = await workspace.compare(7, 7);

  expect(result).toBe('equal');
});

test('Adds 1 + 2 to get 3', async () => {
  const workspace = new IntegerWorkspace();

  const result = await workspace.add(1, 2);

  expect(result).toBe(3);
});

test('Adds 0 + 0 to get 0', async () => {
  const workspace = new IntegerWorkspace();

  const result = await workspace.add(0, 0);

  expect(result).toBe(0);
});

test('Adds 13 + 7 to get 20', async () => {
  const workspace = new IntegerWorkspace();

  const result = await workspace.add(13, 7);

  expect(result).toBe(20);
});
