import { buildPestsFromSpreadsheet, pestKeyFrom, splitPestCell } from './spreadsheetPests.js';

const spreadsheetSource = { label: 'Spreadsheet', url: null };

describe('splitPestCell', () => {
  it('splits on commas and keeps a scientific name in parentheses with its common name', () => {
    expect(splitPestCell('Mancha púrpura (Alternaria porri), Antracnosis (Colletotrichum gloesporioides)')).toEqual([
      'Mancha púrpura (Alternaria porri)',
      'Antracnosis (Colletotrichum gloesporioides)',
    ]);
  });

  it('joins names broken by a line break and drops a dangling conjunction', () => {
    expect(splitPestCell('Fusarium oxysforum, Rhizoctonia\nsp. Y')).toEqual(['Fusarium oxysforum', 'Rhizoctonia sp.']);
  });

  it('splits on " y " between two names', () => {
    expect(splitPestCell('Heliothrips haemborroidalis y Selenothrip rubrocicantus, Oligonychus punicae Hirst')).toEqual([
      'Heliothrips haemborroidalis',
      'Selenothrip rubrocicantus',
      'Oligonychus punicae Hirst',
    ]);
  });

  it('splits commas without a following space and keeps the spelling of the sheet', () => {
    expect(splitPestCell('Mancha foliar por septoria,Marchitez bacterial')).toEqual([
      'Mancha foliar por septoria',
      'Marchitez bacterial',
    ]);
  });

  it('keeps an author citation written after a comma with its scientific name', () => {
    expect(splitPestCell('Cercospora purpurea, Cooke, Antracnosis')).toEqual(['Cercospora purpurea Cooke', 'Antracnosis']);
  });

  it('capitalizes the first letter and drops N/A cells', () => {
    expect(splitPestCell('orugas (Spodoptera spp.)')).toEqual(['Orugas (Spodoptera spp.)']);
    expect(splitPestCell('N/A')).toEqual([]);
    expect(splitPestCell('STENOCARPELLA, Fusarium ')).toEqual(['STENOCARPELLA', 'Fusarium']);
  });
});

describe('pestKeyFrom', () => {
  it('builds a stable slug from the Spanish text', () => {
    expect(pestKeyFrom('Mancha púrpura (Alternaria porri)')).toBe('mancha-purpura-alternaria-porri');
    expect(pestKeyFrom('Pulgón verde-amarillento')).toBe('pulgon-verde-amarillento');
  });
});

describe('buildPestsFromSpreadsheet', () => {
  const pests = buildPestsFromSpreadsheet(
    [
      { cropKey: 'potato', familyKey: 'solanaceae', diseaseCell: 'Phytophthora infestans', pestCell: 'Tetranychus urticae' },
      { cropKey: 'cassava', familyKey: 'euphorbiaceae', diseaseCell: 'N/A', pestCell: 'Tetranychus urticae, Erynnis ello' },
      { cropKey: 'tomato', familyKey: 'solanaceae', diseaseCell: '', pestCell: 'Tetranychus urticae' },
    ],
    [spreadsheetSource],
  );

  it('creates one pest per distinct name with its type from the column', () => {
    expect(pests.map((pest) => [pest.key, pest.type])).toEqual([
      ['phytophthora-infestans', 'disease'],
      ['tetranychus-urticae', 'pest'],
      ['erynnis-ello', 'pest'],
    ]);
  });

  it('gives a pest listed under several crops every family of those crops once', () => {
    const spiderMite = pests.find((pest) => pest.key === 'tetranychus-urticae');
    expect(spiderMite?.affectedFamilyKeys).toEqual(['solanaceae', 'euphorbiaceae']);
    expect(spiderMite?.onlyAffectsCropKeys).toEqual([]);
  });

  it('keeps the Spanish name only and no scientific name, because the sheet has neither split out', () => {
    expect(pests[0]).toEqual({
      key: 'phytophthora-infestans',
      name: { es: 'Phytophthora infestans' },
      scientificName: null,
      type: 'disease',
      affectedFamilyKeys: ['solanaceae'],
      onlyAffectsCropKeys: [],
      sources: [spreadsheetSource],
    });
  });

  it('keeps the type of the first listing when the same name appears under both columns', () => {
    const conflicting = buildPestsFromSpreadsheet(
      [
        { cropKey: 'potato', familyKey: 'solanaceae', diseaseCell: 'Phytophthora infestans', pestCell: '' },
        { cropKey: 'eggplant', familyKey: 'solanaceae', diseaseCell: '', pestCell: 'Phytophthora infestans' },
      ],
      [],
    );
    expect(conflicting.map((pest) => pest.type)).toEqual(['disease']);
  });
});
