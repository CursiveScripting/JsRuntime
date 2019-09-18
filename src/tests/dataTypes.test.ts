import { FixedType } from '../cursiveruntime/FixedType';
import { TypedDataType } from '../cursiveruntime/TypedDataType';
import { regexToString } from '../cursiveruntime/services/saveWorkspace';

const dtObject = new TypedDataType<object>('object', '#ff0000', false);
const dtSet = new TypedDataType<Set<object>>('set', '#ff9900', false, dtObject, () => new Set<object>());

const dtString = new FixedType<string>('string', '#cccccc', v => v, null, () => '', new RegExp('.*'));
const dtFloat = new FixedType<number>(
  'decimal',
  '#00cc99',
  v => parseFloat(v),
  dtString,
  () => -1,
  new RegExp('^[0-9]+(.[0-9]*)?$'),
  'A positive decimal value',
);
const dtInt = new FixedType<number>(
  'integer',
  '#0099ff',
  v => parseInt(v),
  dtFloat,
  () => -1,
  new RegExp('^[0-9]+$'),
  'A positive integer value',
);

test('Data type is assignable from parent', () => {
  expect(dtSet.isAssignableTo(dtObject)).toBe(true);
});

test('Data type is not assignable from child', () => {
  expect(dtObject.isAssignableTo(dtSet)).toBe(false);
});

test('Fixed type is assignable from parent', () => {
  expect(dtInt.isAssignableTo(dtFloat)).toBe(true);
});

test('Fixed type is not assignable from child', () => {
  expect(dtFloat.isAssignableTo(dtInt)).toEqual(false);
});

test('Fixed type is assignable from grandparent', () => {
  expect(dtInt.isAssignableTo(dtString)).toBe(true);
});

test('Fixed type is not assignable from grandchild', () => {
  expect(dtString.isAssignableTo(dtInt)).toBe(false);
});

test('Data type is not assignable from unrelated type', () => {
  expect(dtString.isAssignableTo(dtSet)).toBe(false);
});

test('Unspecified reference type default is null', () => {
  expect(dtObject.getDefaultValue()).toBeNull();
});

test('Reference type default is not null', () => {
  expect(dtSet.getDefaultValue()).not.toBeNull();
});

test('Reference type default is correct type', () => {
  const defaultVal = dtSet.getDefaultValue();
  expect(defaultVal instanceof Set).toBe(true);
});

test('Reference type default instances differ', () => {
  const default1 = dtSet.getDefaultValue();
  const default2 = dtSet.getDefaultValue();
  expect(default1).not.toBe(default2);
});

test('Value type default is not null', () => {
  expect(dtInt.getDefaultValue()).not.toBeNull();
});

test('Value type uses specified default', () => {
  expect(dtInt.getDefaultValue()).toBe(-1);
});

test('Valid value validates', () => {
  expect(dtInt.validation).not.toBeUndefined();
  expect(dtInt.validation!.test('2')).toBe(true);
});

test("Invalid value doesn't validate", () => {
  expect(dtInt.validation).not.toBeUndefined();
  expect(dtInt.validation!.test('-2')).toBe(false);
});

test('Valid value validates after serialization', () => {
  expect(dtInt.validation).not.toBeUndefined();
  
  const expression = new RegExp(regexToString(dtInt.validation!));

  expect(expression.test('2')).toBe(true);
});

test("Invalid value doesn't validate after serialization", () => {
  expect(dtInt.validation).not.toBeUndefined();

  const expression = new RegExp(regexToString(dtInt.validation!));

  expect(expression.test('-2')).toBe(false);
});

test('Parses valid value', () => {
  expect(dtInt.deserialize('2')).toBe(2);
});

test('Guidance is present', () => {
  expect(dtInt.guidance).not.toBeUndefined();
});

test('Unset guidance is undefined', () => {
  expect(dtObject.guidance).toBeUndefined();
});
