import { parsePlanRequest } from './planRequest.js';

const boundary = {
  type: 'Polygon',
  coordinates: [
    [
      [-83.892, 9.918],
      [-83.89, 9.918],
      [-83.89, 9.92],
      [-83.892, 9.918],
    ],
  ],
};

const validLot = {
  lotId: 'lot-1',
  boundary,
  currentUse: { kind: 'crop', cropKey: 'potato', plantedOn: '2026-08' },
  previousUse: { kind: 'unknown' },
  hasIrrigation: false,
};

describe('parsePlanRequest', () => {
  it('accepts lots with their answers and fills the plan window', () => {
    const parsed = parsePlanRequest({ lots: [validLot] }, new Date(Date.UTC(2026, 10, 14)));
    expect(parsed).toEqual({
      valid: true,
      request: { startMonth: '2026-11', horizonInMonths: 12, lots: [validLot] },
    });
  });

  it('rejects a request without lots', () => {
    expect(parsePlanRequest({ lots: [] }, new Date()).valid).toBe(false);
  });

  it('rejects lots with a bad boundary, planting month or use', () => {
    const today = new Date(Date.UTC(2026, 10, 14));
    expect(parsePlanRequest({ lots: [{ ...validLot, boundary: { type: 'Point' } }] }, today)).toMatchObject({ valid: false });
    expect(
      parsePlanRequest({ lots: [{ ...validLot, currentUse: { kind: 'crop', cropKey: 'potato', plantedOn: 'agosto' } }] }, today),
    ).toMatchObject({ valid: false });
    expect(parsePlanRequest({ lots: [{ ...validLot, previousUse: { kind: 'maybe' } }] }, today)).toMatchObject({ valid: false });
  });

  it('limits the number of lots and months', () => {
    const today = new Date();
    const tooManyLots = Array.from({ length: 31 }, (_, index) => ({ ...validLot, lotId: `lot-${index}` }));
    expect(parsePlanRequest({ lots: tooManyLots }, today).valid).toBe(false);
    expect(parsePlanRequest({ lots: [validLot], horizonInMonths: 36 }, today).valid).toBe(false);
  });
});
