import ajv from 'ajv';

export function createMap<TElement>(elements: TElement[], getKey: (el: TElement) => string) {
  const map = new Map<string, TElement>();

  for (const element of elements) {
    map.set(getKey(element), element);
  }

  return map;
}

export function validateSchema(schema: any, data: any) {
  const validator = new ajv();

  const validate = validator.compile(schema);

  const valid = validate(data);

  if (valid || validator.errors === undefined) {
    return null;
  }

  return validator.errors;
}
