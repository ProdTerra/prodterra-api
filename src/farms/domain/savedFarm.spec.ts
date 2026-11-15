import { validateSavedFarmInput, isFarmNameTaken } from './savedFarm.js';

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

describe('isFarmNameTaken', () => {
  const farms = [
    { id: 'farm-1', name: 'La Esperanza' },
    { id: 'farm-2', name: 'Finca  Norte' },
  ];

  it('treats names that differ only in case, accents or spaces as the same name', () => {
    expect(isFarmNameTaken(farms, 'la esperanza')).toBe(true);
    expect(isFarmNameTaken(farms, '  LA ESPERANZÁ ')).toBe(true);
    expect(isFarmNameTaken(farms, 'finca norte')).toBe(true);
    expect(isFarmNameTaken(farms, 'Finca Sur')).toBe(false);
  });

  it('lets a farm keep its own name when it is updated', () => {
    expect(isFarmNameTaken(farms, 'La Esperanza', 'farm-1')).toBe(false);
    expect(isFarmNameTaken(farms, 'La Esperanza', 'farm-2')).toBe(true);
  });
});
