import { validateSavedFarmInput } from './savedFarm.js';

const snapshot = { farmBoundary: { type: 'Polygon', coordinates: [] }, lots: [{ shapeId: 'a' }] };

describe('validateSavedFarmInput', () => {
  it('accepts a named farm with its boundary and lots', () => {
    expect(validateSavedFarmInput({ name: '  Finca La Esperanza ', snapshot })).toEqual({
      input: { name: 'Finca La Esperanza', snapshot },
    });
  });

  it('reports every invalid field with a stable code', () => {
    expect(validateSavedFarmInput({ name: ' ', snapshot: { lots: [] } })).toEqual({
      errors: [
        { field: 'name', code: 'nameRequired' },
        { field: 'snapshot', code: 'invalidSnapshot' },
      ],
    });
  });
});
