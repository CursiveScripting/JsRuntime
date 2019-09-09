import { FixedType } from '../cursiveruntime/DataType';
import { TypedParameter } from '../cursiveruntime/Parameter';
import { ValueSet } from '../cursiveruntime/ValueSet';

const dtInt = new FixedType<number>('integer', '#0099ff', v => parseInt(v), null, () => -1, new RegExp('^[0-9]+$'), 'A positive integer value');

const testShort = new TypedParameter<number>('test integer', dtInt);

test('Can retrieve set value', () => {
    const values = new ValueSet();

    values.set(testShort, 27);

    expect(values.get(testShort)).toBe(27);
});

test('Cannot retrieve unset value', () => {
    const values = new ValueSet();

    expect(values.get(testShort)).toBeUndefined();
});
