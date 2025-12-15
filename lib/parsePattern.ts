import { KNOWN_COLORS, stringToColor } from './color';

export interface LegendEntry {
  name: string;
  color: string;
}

export interface ParseResult {
  rows: string[][];
  rowCount: number;
  colCount: number | null;
  colorMap: Record<string, string>;
  rowDirections: (RowDirection | null)[];
  legend: LegendEntry[];
  errors: string[];
  warnings: string[];
}

const DEFAULT_CONSENSUS_THRESHOLD = 0.9;

type RowData = {
  rowNumber: number;
  cells: string[];
  direction: RowDirection | null;
};

type RowDirection = 'ltr' | 'rtl';

const detectDirection = (rawLine: string): RowDirection | null => {
  const lower = rawLine.toLowerCase();
  // Accept common arrow/hyphen separators and tolerate missing spaces
  const rtlPattern = /droite\s*(?:→|<-|->|−>|—>|-)?\s*gauche/;
  const ltrPattern = /gauche\s*(?:→|<-|->|−>|—>|-)?\s*droite/;
  if (rtlPattern.test(lower)) return 'rtl';
  if (ltrPattern.test(lower)) return 'ltr';
  return null;
};

const sanitizeRemainder = (rawLine: string) => {
  const rowMatch = /^\s*Ligne\s+\d+/i.exec(rawLine);
  const afterLabel = rowMatch ? rawLine.slice(rowMatch[0].length) : rawLine;
  // Remove direction info in parentheses
  let remainder = afterLabel.replace(/\([^)]*\)/g, ' ');
  const colonIndex = remainder.indexOf(':');
  if (colonIndex !== -1) {
    remainder = remainder.slice(colonIndex + 1);
  }
  const firstDigit = remainder.search(/\d/);
  if (firstDigit > 0) {
    remainder = remainder.slice(firstDigit);
  }
  // Remove stray arrows/dashes
  remainder = remainder.replace(/[→←↔↣↢↠↞⇄⇆⇋⇌⇤⇥⇦⇧⇨⇩⇪⇫⇬⇭⇮⇯]/g, ' ');
  return remainder.trim();
};

const expandRow = (
  rawLine: string,
  rowNumber: number,
  errors: string[]
): string[] | null => {
  let remainder = sanitizeRemainder(rawLine);
  if (!remainder) {
    errors.push(`Row ${rowNumber} has no segments.`);
    return null;
  }

  const tokens = remainder.split(/\s+/).filter(Boolean);
  if (tokens.length < 2) {
    errors.push(`Row ${rowNumber} has no valid segments.`);
    return null;
  }

  const cells: string[] = [];

  for (let i = 0; i < tokens.length; i += 2) {
    const countToken = tokens[i];
    const colorToken = tokens[i + 1];

    if (!colorToken) {
      errors.push(`Row ${rowNumber} has dangling count '${countToken}' with no color.`);
      return null;
    }

    if (!/^\d+$/.test(countToken) || !/^[A-Za-z_]+$/.test(colorToken)) {
      errors.push(`Invalid segment '${countToken} ${colorToken}' on row ${rowNumber}; expected '<int> <color>'.`);
      return null;
    }

    const count = Number.parseInt(countToken, 10);
    if (Number.isNaN(count) || count <= 0) {
      errors.push(`Invalid segment '${countToken} ${colorToken}' on row ${rowNumber}; count must be a positive integer.`);
      return null;
    }

    const colorName = colorToken.toLowerCase();
    for (let c = 0; c < count; c += 1) {
      cells.push(colorName);
    }
  }

  if (cells.length === 0) {
    errors.push(`Row ${rowNumber} has no valid segments.`);
    return null;
  }

  return cells;
};

export const parsePattern = (
  text: string,
  options?: { consensusThreshold?: number }
): ParseResult => {
  const consensusThreshold = options?.consensusThreshold ?? DEFAULT_CONSENSUS_THRESHOLD;
  const errors: string[] = [];
  const warnings: string[] = [];
  const rows: RowData[] = [];
  const seenColors = new Set<string>();

  const lines = text.split(/\r?\n/);

  lines.forEach((line) => {
    const match = /^\s*Ligne\s+(\d+)/i.exec(line);
    if (!match) return;
    const rowNumber = Number.parseInt(match[1], 10);
    const direction = detectDirection(line);
    const cells = expandRow(line, rowNumber, errors);
    if (cells) {
      rows.push({ rowNumber, cells, direction });
      cells.forEach((c) => seenColors.add(c));
    }
  });

  const rowCount = rows.length;
  if (rowCount === 0) {
    errors.push('No rows parsed. Ensure lines start with "Ligne <number>" and contain segments like "30 blanc".');
  }

  const lengths = rows.map((r) => r.cells.length);
  let colCount: number | null = null;

  if (rowCount > 0) {
    const frequency = new Map<number, number>();
    lengths.forEach((len) => {
      frequency.set(len, (frequency.get(len) ?? 0) + 1);
    });

    let modeLength = lengths[0];
    let modeCount = 0;
    frequency.forEach((count, len) => {
      if (count > modeCount) {
        modeLength = len;
        modeCount = count;
      }
    });

    colCount = modeLength;
    const consensus = modeCount / rowCount;
    const mismatches = rows.filter((r) => r.cells.length !== modeLength);

    if (mismatches.length > 0) {
      errors.push(
        `Inferred column count is ${modeLength} (most common). ${mismatches.length} rows differ: [${mismatches
          .map((r) => `${r.rowNumber}:${r.cells.length}`)
          .join(', ')}]`
      );
      mismatches.forEach((r) => {
        errors.push(`Row ${r.rowNumber} expands to ${r.cells.length} cells; expected ${modeLength}.`);
      });
    }

    if (consensus < consensusThreshold) {
      errors.push(
        `Only ${(consensus * 100).toFixed(1)}% of rows (${modeCount}/${rowCount}) share length ${modeLength}. Minimum ${(consensusThreshold * 100).toFixed(0)}% required.`
      );
    }
  }

  const colorMap: Record<string, string> = {};
  Array.from(seenColors)
    .sort()
    .forEach((name) => {
      const base = KNOWN_COLORS[name];
      colorMap[name] = base ?? stringToColor(name);
    });

  const legend: LegendEntry[] = Object.entries(colorMap).map(([name, color]) => ({ name, color }));

  return {
    rows: rows.map((r) => r.cells),
    rowCount,
    colCount,
    colorMap,
    rowDirections: rows.map((r) => r.direction ?? null),
    legend,
    errors,
    warnings
  };
};
