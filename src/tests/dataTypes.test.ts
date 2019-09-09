import { TypedDataType, FixedType } from '../cursiveruntime/DataType';

const dtObject = new TypedDataType<object>('object', '#ff0000', false);
const dtSet = new TypedDataType<Set<object>>('set', '#ff9900', false, dtObject, () => new Set<object>());

const dtString = new FixedType<string>('string', '#cccccc', v => v, null, undefined, new RegExp('.*'));
const dtFloat = new FixedType<number>('decimal', '#00cc99', v => parseFloat(v), dtString, undefined, new RegExp('^[0-9]+(\.[0-9]*)?$'));
const dtInt = new FixedType<number>('integer', '#0099ff', v => parseInt(v), dtFloat, undefined, new RegExp('^[0-9]+$'));

test('Data type is assignable from parent', () => {
    expect(dtSet.isAssignableTo(dtObject)).toEqual(true);
});

test('Data type is not assignable from child', () => {
    expect(dtObject.isAssignableTo(dtSet)).toEqual(false);
});

test('Fixed type is assignable from parent', () => {
    expect(dtInt.isAssignableTo(dtFloat)).toEqual(true);
});

test('Fixed type is not assignable from child', () => {
    expect(dtFloat.isAssignableTo(dtInt)).toEqual(false);
});

test('Fixed type is assignable from grandparent', () => {
    expect(dtInt.isAssignableTo(dtString)).toEqual(true);
});

test('Fixed type is not assignable from grandchild', () => {
    expect(dtString.isAssignableTo(dtInt)).toEqual(false);
});

test('Data type is not assignable from unrelated type', () => {
    expect(dtString.isAssignableTo(dtSet)).toEqual(false);
});