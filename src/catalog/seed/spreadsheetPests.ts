import type { Source } from '../domain/catalogValues.js';
import type { Pest, PestType } from '../domain/pest.js';

export type SpreadsheetCropPests = {
  cropKey: string;
  familyKey: string;
  diseaseCell: string;
  pestCell: string;
};

const emptyCellMarker = 'n/a';
const authorCitationsWrittenAfterAComma = ['Cooke'];
const conjunctionAtPosition = /^\s+y(?=\s|$)/i;

function capitalizeFirstLetter(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function splitOutsideParentheses(text: string): string[] {
  const fragments: string[] = [];
  let current = '';
  let depth = 0;
  let index = 0;
  while (index < text.length) {
    const character = text[index];
    if (character === '(') depth += 1;
    if (character === ')') depth = Math.max(depth - 1, 0);
    if (depth === 0 && character === ',') {
      fragments.push(current);
      current = '';
      index += 1;
      continue;
    }
    const conjunction = depth === 0 ? conjunctionAtPosition.exec(text.slice(index)) : null;
    if (conjunction) {
      fragments.push(current);
      current = '';
      index += conjunction[0].length;
      continue;
    }
    current += character;
    index += 1;
  }
  fragments.push(current);
  return fragments;
}

function joinAuthorCitations(names: string[]): string[] {
  return names.reduce<string[]>((joined, name) => {
    if (authorCitationsWrittenAfterAComma.includes(name) && joined.length > 0) {
      joined[joined.length - 1] = `${joined[joined.length - 1]} ${name}`;
      return joined;
    }
    return [...joined, name];
  }, []);
}

export function splitPestCell(cell: string): string[] {
  const singleLine = cell.replace(/\s+/g, ' ');
  const names = splitOutsideParentheses(singleLine)
    .map((fragment) => fragment.trim())
    .filter((fragment) => fragment.length > 0 && fragment.toLowerCase() !== emptyCellMarker);
  return joinAuthorCitations(names).map(capitalizeFirstLetter);
}

export function pestKeyFrom(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function listedPests(row: SpreadsheetCropPests): { name: string; type: PestType }[] {
  return [
    ...splitPestCell(row.diseaseCell).map((name) => ({ name, type: 'disease' as const })),
    ...splitPestCell(row.pestCell).map((name) => ({ name, type: 'pest' as const })),
  ];
}

export function buildPestsFromSpreadsheet(rows: SpreadsheetCropPests[], sources: Source[]): Pest[] {
  const pestsByKey = new Map<string, Pest>();
  for (const row of rows) {
    for (const { name, type } of listedPests(row)) {
      const key = pestKeyFrom(name);
      const existing = pestsByKey.get(key);
      if (!existing) {
        pestsByKey.set(key, {
          key,
          name: { es: name },
          scientificName: null,
          type,
          affectedFamilyKeys: [row.familyKey],
          onlyAffectsCropKeys: [],
          sources,
        });
      } else if (!existing.affectedFamilyKeys.includes(row.familyKey)) {
        existing.affectedFamilyKeys.push(row.familyKey);
      }
    }
  }
  return [...pestsByKey.values()];
}
