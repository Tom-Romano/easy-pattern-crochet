'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { parsePattern, type ParseResult } from '@/lib/parsePattern';
import { stringToColor } from '@/lib/color';

const EXAMPLE_TEXT = `Patron crochet (30 colonnes x 107 lignes)
Lecture en aller-retour, départ en bas à droite.

Ligne 1 (droite→gauche) : 30 blanc
Ligne 2 (gauche→droite) : 30 blanc
Ligne 3 (droite→gauche) : 13 blanc 1 vert 16 blanc
Ligne 4 (gauche→droite) : 6 blanc 4 vert 5 blanc 1 vert 14 blanc
Ligne 5 (droite→gauche) : 15 blanc 2 vert 2 blanc 7 vert 4 blanc
Ligne 6 (gauche→droite) : 3 blanc 4 vert 1 blanc 3 vert 1 blanc 1 vert 17 blanc
Ligne 7 (droite→gauche) : 18 blanc 1 vert 2 blanc 2 vert 1 blanc 3 vert 3 blanc
Ligne 8 (gauche→droite) : 3 blanc 2 vert 1 blanc 3 vert 2 blanc 1 vert 1 blanc 1 bleu_clair 16 blanc
Ligne 9 (droite→gauche) : 15 blanc 1 bleu_clair 3 blanc 1 vert 2 blanc 3 vert 1 blanc 2 vert 2 blanc
Ligne 10 (gauche→droite) : 2 blanc 1 vert 1 blanc 3 vert 2 blanc 1 vert 4 blanc 1 bleu_clair 1 blanc 4 bleu_clair 10 blanc
Ligne 11 (droite→gauche) : 10 blanc 2 bleu_clair 2 bleu_fonce 2 bleu_clair 5 blanc 1 vert 2 blanc 2 vert 1 blanc 1 vert 2 blanc
Ligne 12 (gauche→droite) : 1 blanc 4 vert 2 blanc 1 vert 5 blanc 3 bleu_clair 1 blanc 1 bleu_fonce 2 bleu_clair 1 blanc 4 bleu_clair 5 blanc
Ligne 13 (droite→gauche) : 5 blanc 1 bleu_clair 4 bleu_fonce 1 blanc 1 bleu_clair 1 bleu_fonce 1 blanc 3 bleu_clair 5 blanc 1 vert 4 blanc 2 vert 1 blanc
Ligne 14 (gauche→droite) : 1 blanc 1 vert 4 blanc 1 vert 5 blanc 1 bleu_fonce 3 bleu_clair 1 blanc 2 bleu_fonce 4 blanc 1 bleu_fonce 1 bleu_clair 5 blanc
Ligne 15 (droite→gauche) : 6 blanc 1 bleu_fonce 1 blanc 3 bleu_clair 3 blanc 3 bleu_clair 1 bleu_fonce 5 blanc 1 vert 6 blanc
Ligne 16 (gauche→droite) : 6 blanc 1 vert 4 blanc 1 bleu_fonce 3 bleu_clair 1 blanc 6 bleu_clair 1 blanc 1 bleu_fonce 6 blanc
Ligne 17 (droite→gauche) : 3 blanc 3 bleu_clair 2 blanc 6 bleu_clair 1 blanc 4 bleu_clair 1 bleu_fonce 3 blanc 1 vert 6 blanc
Ligne 18 (gauche→droite) : 6 blanc 1 vert 3 blanc 1 bleu_fonce 3 bleu_clair 1 blanc 6 bleu_clair 1 blanc 1 bleu_fonce 4 bleu_clair 3 blanc
Ligne 19 (droite→gauche) : 3 blanc 1 bleu_clair 4 bleu_fonce 1 blanc 7 bleu_clair 1 blanc 2 bleu_clair 1 bleu_fonce 3 blanc 1 vert 6 blanc
Ligne 20 (gauche→droite) : 6 blanc 1 vert 3 blanc 1 bleu_fonce 1 bleu_clair 1 bleu_fonce 8 bleu_clair 4 blanc 1 bleu_fonce 4 blanc
Ligne 21 (droite→gauche) : 4 blanc 5 bleu_clair 2 blanc 7 bleu_clair 2 bleu_fonce 3 blanc 1 vert 6 blanc
Ligne 22 (gauche→droite) : 7 blanc 1 vert 3 blanc 1 bleu_fonce 6 bleu_clair 1 blanc 9 bleu_clair 2 blanc
Ligne 23 (droite→gauche) : 1 blanc 1 bleu_clair 3 blanc 7 bleu_clair 1 blanc 4 bleu_clair 2 bleu_fonce 3 blanc 1 vert 7 blanc
Ligne 24 (gauche→droite) : 8 blanc 1 vert 3 blanc 2 bleu_fonce 2 bleu_clair 1 bleu_fonce 4 bleu_clair 2 bleu_fonce 7 blanc
Ligne 25 (droite→gauche) : 9 blanc 1 bleu_fonce 4 bleu_clair 3 bleu_fonce 1 blanc 1 vert 2 blanc 1 vert 8 blanc
Ligne 26 (gauche→droite) : 1 blanc 1 vert 7 blanc 1 vert 1 blanc 1 vert 3 blanc 5 bleu_fonce 10 blanc
Ligne 27 (droite→gauche) : 19 blanc 1 vert 2 blanc 2 vert 2 blanc 3 vert 1 blanc
Ligne 28 (gauche→droite) : 1 blanc 9 vert 1 blanc 2 vert 17 blanc
Ligne 29 (droite→gauche) : 16 blanc 1 vert 2 blanc 6 vert 1 blanc 2 vert 2 blanc
Ligne 30 (gauche→droite) : 2 blanc 3 vert 2 blanc 2 vert 1 blanc 1 vert 3 blanc 1 vert 5 blanc 4 vert 6 blanc
Ligne 31 (droite→gauche) : 5 blanc 6 vert 2 blanc 2 vert 4 blanc 2 vert 2 blanc 4 vert 3 blanc
Ligne 32 (gauche→droite) : 4 blanc 6 vert 7 blanc 1 vert 1 blanc 3 vert 1 blanc 4 vert 3 blanc
Ligne 33 (droite→gauche) : 3 blanc 3 vert 1 blanc 2 vert 2 blanc 1 vert 9 blanc 3 vert 6 blanc
Ligne 34 (gauche→droite) : 16 blanc 1 bleu_clair 1 blanc 1 vert 2 blanc 3 vert 1 blanc 2 vert 3 blanc
Ligne 35 (droite→gauche) : 2 blanc 2 vert 1 blanc 3 vert 2 blanc 1 vert 3 blanc 1 bleu_clair 15 blanc
Ligne 36 (gauche→droite) : 10 blanc 4 bleu_clair 1 blanc 1 bleu_clair 4 blanc 1 vert 2 blanc 3 vert 1 blanc 1 vert 2 blanc
Ligne 37 (droite→gauche) : 2 blanc 1 vert 1 blanc 2 vert 2 blanc 1 vert 5 blanc 2 bleu_clair 2 bleu_fonce 2 bleu_clair 10 blanc
Ligne 38 (gauche→droite) : 5 blanc 4 bleu_clair 1 blanc 2 bleu_clair 1 bleu_fonce 1 blanc 3 bleu_clair 5 blanc 1 vert 2 blanc 4 vert 1 blanc
Ligne 39 (droite→gauche) : 1 blanc 3 vert 3 blanc 1 vert 5 blanc 3 bleu_clair 1 blanc 1 bleu_fonce 1 bleu_clair 1 blanc 4 bleu_fonce 1 bleu_clair 5 blanc
Ligne 40 (gauche→droite) : 5 blanc 1 bleu_clair 1 bleu_fonce 4 blanc 2 bleu_fonce 1 blanc 3 bleu_clair 1 bleu_fonce 5 blanc 1 vert 4 blanc 1 vert 1 blanc
Ligne 41 (droite→gauche) : 6 blanc 1 vert 5 blanc 1 bleu_fonce 3 bleu_clair 3 blanc 3 bleu_clair 1 blanc 1 bleu_fonce 1 bleu_clair 5 blanc
Ligne 42 (gauche→droite) : 6 blanc 1 bleu_fonce 1 blanc 6 bleu_clair 1 blanc 3 bleu_clair 1 bleu_fonce 4 blanc 1 vert 6 blanc
Ligne 43 (droite→gauche) : 6 blanc 1 vert 3 blanc 1 bleu_fonce 4 bleu_clair 1 blanc 6 bleu_clair 2 blanc 3 bleu_clair 3 blanc
Ligne 44 (gauche→droite) : 3 blanc 4 bleu_clair 1 bleu_fonce 1 blanc 6 bleu_clair 1 blanc 3 bleu_clair 1 bleu_fonce 3 blanc 1 vert 6 blanc
Ligne 45 (droite→gauche) : 6 blanc 1 vert 3 blanc 1 bleu_fonce 2 bleu_clair 1 blanc 7 bleu_clair 1 blanc 4 bleu_fonce 1 bleu_clair 3 blanc
Ligne 46 (gauche→droite) : 3 blanc 1 bleu_clair 1 bleu_fonce 4 blanc 8 bleu_clair 1 bleu_fonce 1 bleu_clair 1 bleu_fonce 3 blanc 1 vert 6 blanc
Ligne 47 (droite→gauche) : 6 blanc 1 vert 3 blanc 2 bleu_fonce 7 bleu_clair 2 blanc 5 bleu_clair 4 blanc
Ligne 48 (gauche→droite) : 2 blanc 9 bleu_clair 1 blanc 6 bleu_clair 1 bleu_fonce 3 blanc 1 vert 7 blanc
Ligne 49 (droite→gauche) : 7 blanc 1 vert 3 blanc 2 bleu_fonce 4 bleu_clair 1 blanc 7 bleu_clair 3 blanc 1 bleu_clair 1 blanc
Ligne 50 (gauche→droite) : 7 blanc 2 bleu_fonce 4 bleu_clair 1 bleu_fonce 2 bleu_clair 2 bleu_fonce 3 blanc 1 vert 8 blanc
Ligne 51 (droite→gauche) : 8 blanc 1 vert 2 blanc 1 vert 1 blanc 3 bleu_fonce 4 bleu_clair 1 bleu_fonce 9 blanc
Ligne 52 (gauche→droite) : 10 blanc 4 bleu_fonce 4 blanc 1 vert 1 blanc 1 vert 7 blanc 1 vert 1 blanc
Ligne 53 (droite→gauche) : 1 blanc 3 vert 2 blanc 2 vert 2 blanc 1 vert 19 blanc
Ligne 54 (gauche→droite) : 17 blanc 2 vert 1 blanc 9 vert 1 blanc
Ligne 55 (droite→gauche) : 2 blanc 2 vert 1 blanc 6 vert 2 blanc 1 vert 16 blanc
Ligne 56 (gauche→droite) : 6 blanc 4 vert 5 blanc 1 vert 3 blanc 1 vert 1 blanc 2 vert 2 blanc 3 vert 2 blanc
Ligne 57 (droite→gauche) : 3 blanc 4 vert 2 blanc 2 vert 4 blanc 2 vert 2 blanc 7 vert 4 blanc
Ligne 58 (gauche→droite) : 3 blanc 4 vert 1 blanc 3 vert 1 blanc 1 vert 7 blanc 6 vert 4 blanc
Ligne 59 (droite→gauche) : 6 blanc 3 vert 9 blanc 1 vert 2 blanc 2 vert 1 blanc 3 vert 3 blanc
Ligne 60 (gauche→droite) : 3 blanc 2 vert 1 blanc 3 vert 2 blanc 1 vert 1 blanc 1 bleu_clair 16 blanc
Ligne 61 (droite→gauche) : 15 blanc 1 bleu_clair 3 blanc 1 vert 2 blanc 3 vert 1 blanc 2 vert 2 blanc
Ligne 62 (gauche→droite) : 2 blanc 1 vert 1 blanc 3 vert 2 blanc 1 vert 4 blanc 1 bleu_clair 1 blanc 4 bleu_clair 10 blanc
Ligne 63 (droite→gauche) : 10 blanc 2 bleu_clair 2 bleu_fonce 2 bleu_clair 5 blanc 1 vert 2 blanc 2 vert 1 blanc 1 vert 2 blanc
Ligne 64 (gauche→droite) : 1 blanc 4 vert 2 blanc 1 vert 5 blanc 3 bleu_clair 1 blanc 1 bleu_fonce 2 bleu_clair 1 blanc 4 bleu_clair 5 blanc
Ligne 65 (droite→gauche) : 5 blanc 1 bleu_clair 4 bleu_fonce 1 blanc 1 bleu_clair 1 bleu_fonce 1 blanc 3 bleu_clair 5 blanc 1 vert 3 blanc 3 vert 1 blanc
Ligne 66 (gauche→droite) : 1 blanc 1 vert 4 blanc 1 vert 5 blanc 1 bleu_fonce 3 bleu_clair 1 blanc 2 bleu_fonce 4 blanc 1 bleu_fonce 1 bleu_clair 5 blanc
Ligne 67 (droite→gauche) : 5 blanc 1 bleu_clair 1 bleu_fonce 1 blanc 3 bleu_clair 3 blanc 3 bleu_clair 1 bleu_fonce 5 blanc 1 vert 6 blanc
Ligne 68 (gauche→droite) : 6 blanc 1 vert 4 blanc 1 bleu_fonce 3 bleu_clair 1 blanc 6 bleu_clair 1 blanc 1 bleu_fonce 6 blanc
Ligne 69 (droite→gauche) : 3 blanc 3 bleu_clair 2 blanc 6 bleu_clair 1 blanc 4 bleu_clair 1 bleu_fonce 3 blanc 1 vert 6 blanc
Ligne 70 (gauche→droite) : 6 blanc 1 vert 3 blanc 1 bleu_fonce 3 bleu_clair 1 blanc 6 bleu_clair 1 blanc 1 bleu_fonce 4 bleu_clair 3 blanc
Ligne 71 (droite→gauche) : 3 blanc 1 bleu_clair 4 bleu_fonce 1 blanc 7 bleu_clair 1 blanc 2 bleu_clair 1 bleu_fonce 3 blanc 1 vert 6 blanc
Ligne 72 (gauche→droite) : 6 blanc 1 vert 3 blanc 1 bleu_fonce 1 bleu_clair 1 bleu_fonce 8 bleu_clair 4 blanc 1 bleu_fonce 1 bleu_clair 3 blanc
Ligne 73 (droite→gauche) : 4 blanc 5 bleu_clair 2 blanc 7 bleu_clair 2 bleu_fonce 3 blanc 1 vert 6 blanc
Ligne 74 (gauche→droite) : 7 blanc 1 vert 3 blanc 1 bleu_fonce 6 bleu_clair 1 blanc 9 bleu_clair 2 blanc
Ligne 75 (droite→gauche) : 1 blanc 1 bleu_clair 3 blanc 7 bleu_clair 1 blanc 4 bleu_clair 2 bleu_fonce 3 blanc 1 vert 7 blanc
Ligne 76 (gauche→droite) : 8 blanc 1 vert 3 blanc 2 bleu_fonce 2 bleu_clair 1 bleu_fonce 4 bleu_clair 2 bleu_fonce 7 blanc
Ligne 77 (droite→gauche) : 9 blanc 1 bleu_fonce 4 bleu_clair 3 bleu_fonce 1 blanc 1 vert 2 blanc 1 vert 8 blanc
Ligne 78 (gauche→droite) : 1 blanc 1 vert 7 blanc 1 vert 1 blanc 1 vert 3 blanc 5 bleu_fonce 10 blanc
Ligne 79 (droite→gauche) : 19 blanc 1 vert 2 blanc 2 vert 2 blanc 3 vert 1 blanc
Ligne 80 (gauche→droite) : 1 blanc 9 vert 1 blanc 2 vert 17 blanc
Ligne 81 (droite→gauche) : 16 blanc 1 vert 2 blanc 6 vert 1 blanc 2 vert 2 blanc
Ligne 82 (gauche→droite) : 2 blanc 3 vert 2 blanc 2 vert 1 blanc 1 vert 3 blanc 1 vert 5 blanc 4 vert 6 blanc
Ligne 83 (droite→gauche) : 4 blanc 7 vert 2 blanc 2 vert 4 blanc 2 vert 2 blanc 4 vert 3 blanc
Ligne 84 (gauche→droite) : 4 blanc 6 vert 7 blanc 1 vert 1 blanc 3 vert 1 blanc 4 vert 3 blanc
Ligne 85 (droite→gauche) : 3 blanc 3 vert 1 blanc 3 vert 1 blanc 1 vert 9 blanc 3 vert 6 blanc
Ligne 86 (gauche→droite) : 16 blanc 1 bleu_clair 1 blanc 1 vert 2 blanc 3 vert 1 blanc 2 vert 3 blanc
Ligne 87 (droite→gauche) : 2 blanc 2 vert 1 blanc 3 vert 2 blanc 1 vert 3 blanc 1 bleu_clair 15 blanc
Ligne 88 (gauche→droite) : 10 blanc 4 bleu_clair 1 blanc 1 bleu_clair 4 blanc 1 vert 2 blanc 3 vert 1 blanc 1 vert 2 blanc
Ligne 89 (droite→gauche) : 2 blanc 1 vert 1 blanc 2 vert 2 blanc 1 vert 5 blanc 2 bleu_clair 2 bleu_fonce 2 bleu_clair 10 blanc
Ligne 90 (gauche→droite) : 5 blanc 4 bleu_clair 1 blanc 2 bleu_clair 1 bleu_fonce 1 blanc 3 bleu_clair 5 blanc 1 vert 2 blanc 4 vert 1 blanc
Ligne 91 (droite→gauche) : 1 blanc 3 vert 3 blanc 1 vert 5 blanc 3 bleu_clair 1 blanc 1 bleu_fonce 1 bleu_clair 1 blanc 4 bleu_fonce 1 bleu_clair 5 blanc
Ligne 92 (gauche→droite) : 5 blanc 1 bleu_clair 1 bleu_fonce 4 blanc 2 bleu_fonce 1 blanc 3 bleu_clair 1 bleu_fonce 5 blanc 1 vert 4 blanc 1 vert 1 blanc
Ligne 93 (droite→gauche) : 6 blanc 1 vert 5 blanc 1 bleu_fonce 3 bleu_clair 3 blanc 3 bleu_clair 1 blanc 1 bleu_fonce 1 bleu_clair 5 blanc
Ligne 94 (gauche→droite) : 6 blanc 1 bleu_fonce 1 blanc 6 bleu_clair 1 blanc 3 bleu_clair 1 bleu_fonce 4 blanc 1 vert 6 blanc
Ligne 95 (droite→gauche) : 6 blanc 1 vert 3 blanc 1 bleu_fonce 4 bleu_clair 1 blanc 6 bleu_clair 2 blanc 3 bleu_clair 3 blanc
Ligne 96 (gauche→droite) : 3 blanc 4 bleu_clair 1 bleu_fonce 1 blanc 6 bleu_clair 1 blanc 3 bleu_clair 1 bleu_fonce 3 blanc 1 vert 6 blanc
Ligne 97 (droite→gauche) : 6 blanc 1 vert 3 blanc 1 bleu_fonce 2 bleu_clair 1 blanc 7 bleu_clair 1 blanc 4 bleu_fonce 1 bleu_clair 3 blanc
Ligne 98 (gauche→droite) : 3 blanc 1 bleu_clair 1 bleu_fonce 4 blanc 8 bleu_clair 1 bleu_fonce 1 bleu_clair 1 bleu_fonce 3 blanc 1 vert 6 blanc
Ligne 99 (droite→gauche) : 6 blanc 1 vert 3 blanc 2 bleu_fonce 7 bleu_clair 2 blanc 5 bleu_clair 4 blanc
Ligne 100 (gauche→droite) : 2 blanc 9 bleu_clair 1 blanc 6 bleu_clair 1 bleu_fonce 3 blanc 1 vert 7 blanc
Ligne 101 (droite→gauche) : 7 blanc 1 vert 3 blanc 2 bleu_fonce 4 bleu_clair 1 blanc 7 bleu_clair 3 blanc 1 bleu_clair 1 blanc
Ligne 102 (gauche→droite) : 7 blanc 2 bleu_fonce 4 bleu_clair 1 bleu_fonce 2 bleu_clair 2 bleu_fonce 3 blanc 1 vert 8 blanc
Ligne 103 (droite→gauche) : 8 blanc 1 vert 2 blanc 1 vert 1 blanc 3 bleu_fonce 4 bleu_clair 1 bleu_fonce 9 blanc
Ligne 104 (gauche→droite) : 10 blanc 5 bleu_fonce 3 blanc 1 vert 1 blanc 1 vert 9 blanc
Ligne 105 (droite→gauche) : 10 blanc 1 vert 19 blanc
Ligne 106 (gauche→droite) : 17 blanc 2 vert 11 blanc
Ligne 107 (droite→gauche) : 13 blanc 1 vert 16 blanc
Ligne 108 (gauche→droite) : 30 blanc
Ligne 109 (droite→gauche) : 30 blanc`;

const CONVERSION_PROMPT = `You are a crochet grid-to-TXT converter. Given a crochet/pixel grid IMAGE, return ONLY the pattern lines in French as:
Ligne <num> (<direction>) : <count> <color> <count> <color> ...
Rules:
- Work from bottom to top. If no arrows are visible, assume serpentine: row 1 starts bottom-right (droite→gauche), row 2 goes gauche→droite, and so on.
- If arrows/directions exist, follow them exactly.
- Group consecutive stitches of the same color into "<count> <color>" segments. Colors are lowercase, snake_case if needed (e.g., bleu_clair).
- Keep row numbers incrementing from 1 upward. Keep the same total column count across rows.
- Do not add commentary or extra text—only the lines that start with "Ligne".
Example format:
Ligne 1 (droite→gauche) : 30 blanc
Ligne 2 (gauche→droite) : 30 blanc
Ligne 3 (droite→gauche) : 13 blanc 1 vert 16 blanc`;

const CONSENSUS_THRESHOLD = 0.9;

export default function HomePage() {
  const [rawText, setRawText] = useState('');
  const [result, setResult] = useState<ParseResult | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [status, setStatus] = useState<string>('Waiting for file...');
  const [cellSize, setCellSize] = useState<number>(14);
  const [showGridLines, setShowGridLines] = useState<boolean>(true);
  const [showRowNumbers, setShowRowNumbers] = useState<boolean>(true);
  const [serpentine, setSerpentine] = useState<boolean>(true);
  const [crochetMode, setCrochetMode] = useState<boolean>(true);
  const [activeRowIndex, setActiveRowIndex] = useState<number>(0);
  const [setupCollapsed, setSetupCollapsed] = useState<boolean>(false);
  const [colorsCollapsed, setColorsCollapsed] = useState<boolean>(false);
  const [footerCollapsed, setFooterCollapsed] = useState<boolean>(false);
  const [copyStatus, setCopyStatus] = useState<string>('');
  const [customColors, setCustomColors] = useState<Record<string, string>>({});

  const handleParse = (text: string, label?: string) => {
    const parsed = parsePattern(text, { consensusThreshold: CONSENSUS_THRESHOLD });
    setResult(parsed);
    setErrors(parsed.errors);
    setWarnings(parsed.warnings);
    setRawText(text);
    setFileName(label ?? '');
    setCustomColors({});
    setStatus(parsed.errors.length === 0 ? 'Ready to render' : 'Parsing completed with issues');
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : '';
      handleParse(text, file.name);
    };
    reader.onerror = () => {
      setStatus('Failed to read file');
      setErrors([reader.error?.message || 'Unable to read file']);
    };
    reader.readAsText(file, 'utf-8');
  };

  const handleLoadExample = () => {
    handleParse(EXAMPLE_TEXT, 'example.txt');
  };

  const handleClear = () => {
    setRawText('');
    setResult(null);
    setErrors([]);
    setWarnings([]);
    setFileName('');
    setCustomColors({});
    setStatus('Waiting for file...');
    setActiveRowIndex(0);
  };

  const displayColors = useMemo(() => {
    const map: Record<string, string> = {};
    if (result?.colorMap) {
      Object.entries(result.colorMap).forEach(([name, color]) => {
        map[name] = color;
      });
    }
    Object.entries(customColors).forEach(([name, color]) => {
      if (color) map[name] = color;
    });
    return map;
  }, [result, customColors]);

  const canRender = Boolean(
    result &&
      result.colCount &&
      result.rows.length > 0 &&
      errors.length === 0 &&
      result.rows.every((r) => r.length === result.colCount)
  );

  const displayRows = useMemo(() => {
    if (!result) return [] as { row: string[]; originalIndex: number }[];
    return result.rows.map((row, idx) => ({ row, originalIndex: idx }));
  }, [result]);

  useEffect(() => {
    if (!result?.rowCount) {
      setActiveRowIndex(0);
      return;
    }
    setActiveRowIndex(0);
  }, [result]);

  const jumpToRow = (rowIndex: number) => {
    if (!result?.rowCount) return;
    const clamped = Math.max(0, Math.min(rowIndex, result.rowCount - 1));
    setActiveRowIndex(clamped);
  };

  const currentDirectionIsRtl = useMemo(() => {
    if (!result) return false;
    const explicit = result.rowDirections?.[activeRowIndex];
    if (explicit === 'rtl') return true;
    if (explicit === 'ltr') return false;
    return serpentine ? activeRowIndex % 2 === 0 : false;
  }, [result, activeRowIndex, serpentine]);

  const gridCells = useMemo(() => {
    if (!result?.colCount) return [] as { key: string; color: string; rowPos: number; colPos: number; originalRow: number }[];

    const colCount = result.colCount;
    const rowCount = result.rowCount;
    const cells: { key: string; color: string; rowPos: number; colPos: number; originalRow: number }[] = [];

    displayRows.forEach((entry) => {
      const { row, originalIndex } = entry;
      const rtl = serpentine ? originalIndex % 2 === 0 : false; // start from bottom-right, snake upwards
      const rowPos = rowCount - originalIndex; // CSS grid rows start at 1 from top

      row.forEach((color, colIdx) => {
        const colPos = rtl ? colCount - colIdx : colIdx + 1;
        cells.push({
          key: `${originalIndex}-${colIdx}`,
          color,
          rowPos,
          colPos,
          originalRow: originalIndex
        });
      });
    });
    return cells;
  }, [result, serpentine, displayRows]);

  const handleExportPng = () => {
    if (!result?.colCount || !canRender) return;
    const canvas = document.createElement('canvas');
    canvas.width = result.colCount * cellSize;
    canvas.height = result.rowCount * cellSize;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const colCount = result.colCount;
    const rowCount = result.rowCount;

    displayRows.forEach((entry) => {
      const rtl = serpentine ? entry.originalIndex % 2 === 0 : false;
      const y = (rowCount - 1 - entry.originalIndex) * cellSize; // bottom row stays at canvas bottom

      entry.row.forEach((colorName, colIdx) => {
        const x = (rtl ? colCount - 1 - colIdx : colIdx) * cellSize;
        const fill = displayColors[colorName] ?? stringToColor(colorName);
        ctx.fillStyle = fill;
        ctx.fillRect(x, y, cellSize, cellSize);
        if (showGridLines) {
          ctx.strokeStyle = 'rgba(0,0,0,0.7)';
          ctx.strokeRect(x + 0.5, y + 0.5, cellSize, cellSize);
        }
      });
    });

    const link = document.createElement('a');
    link.download = `${fileName || 'pattern'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const gridStyle: React.CSSProperties = useMemo(() => {
    const base = { '--cell-size': `${cellSize}px` } as React.CSSProperties;
    if (!result?.colCount) return base;
    return {
      ...base,
      gridTemplateColumns: `repeat(${result.colCount}, var(--cell-size))`,
      gridTemplateRows: `repeat(${result.rowCount}, var(--cell-size))`
    } as React.CSSProperties;
  }, [result, cellSize]);

  const handleNextRow = () => {
    if (!result) return;
    setActiveRowIndex((prev) => Math.min(prev + 1, result.rowCount - 1));
  };

  const handlePrevRow = () => {
    setActiveRowIndex((prev) => Math.max(prev - 1, 0));
  };

  const activeRow = displayRows[activeRowIndex];

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(CONVERSION_PROMPT);
      setCopyStatus('Copied!');
      setTimeout(() => setCopyStatus(''), 1500);
    } catch (err) {
      setCopyStatus('Clipboard blocked—copy manually.');
    }
  };

  const handleScrollToPrompt = () => {
    const el = document.getElementById('prompt-footer');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const activeRowSegments = useMemo(() => {
    if (!activeRow) return [] as { color: string; count: number }[];
    const explicit = result?.rowDirections?.[activeRowIndex];
    // If the pattern explicitly states the direction, assume the sequence is already in working order.
    const shouldReverse = explicit ? false : currentDirectionIsRtl;
    const ordered = shouldReverse ? [...activeRow.row].reverse() : activeRow.row;
    const segments: { color: string; count: number }[] = [];
    ordered.forEach((colorName) => {
      const last = segments[segments.length - 1];
      if (last && last.color === colorName) {
        last.count += 1;
      } else {
        segments.push({ color: colorName, count: 1 });
      }
    });
    return segments;
  }, [activeRow, currentDirectionIsRtl, result?.rowDirections, activeRowIndex]);

  return (
    <main>
      <h1>Crochet / Pixel Pattern Renderer</h1>
      <p className="lead">Upload a TXT pattern and crochet row by row with a clear grid and focused instructions.</p>
      <div className="button-row" style={{ marginTop: -6 }}>
        <button type="button" className="secondary slim" onClick={handleScrollToPrompt}>
          Need a TXT that always works? Use the prompt below
        </button>
      </div>

      <div className="panel collapsible" style={{ marginBottom: 16 }}>
        <div className="panel-head">
          <div>
            <strong>Setup</strong>
            {setupCollapsed && (
              <span className="small" style={{ marginLeft: 8 }}>
                {fileName || 'No file'} · {result?.rowCount ?? 0} rows
              </span>
            )}
          </div>
          <button type="button" className="secondary slim" onClick={() => setSetupCollapsed((v) => !v)}>
            {setupCollapsed ? 'Show' : 'Hide'}
          </button>
        </div>

        {!setupCollapsed && (
          <>
            <div className="controls">
              <div>
                <label htmlFor="file-input">Upload .txt pattern</label>
                <input id="file-input" type="file" accept=".txt" onChange={handleFileChange} />
              </div>
              <div className="button-row">
                <button type="button" onClick={handleLoadExample}>
                  Load example
                </button>
                <button type="button" className="secondary" onClick={handleClear}>
                  Clear
                </button>
                <button type="button" className="secondary" onClick={handleExportPng} disabled={!canRender}>
                  Export PNG
                </button>
              </div>
              <div className="toggles">
                <label>
                  <input type="checkbox" checked={showGridLines} onChange={(e) => setShowGridLines(e.target.checked)} />
                  Show grid lines
                </label>
                <label>
                  <input type="checkbox" checked={showRowNumbers} onChange={(e) => setShowRowNumbers(e.target.checked)} />
                  Show row numbers
                </label>
                <label>
                  <input type="checkbox" checked={serpentine} onChange={(e) => setSerpentine(e.target.checked)} />
                  Serpentine mode (on by default)
                </label>
                <label>
                  <input type="checkbox" checked={crochetMode} onChange={(e) => setCrochetMode(e.target.checked)} />
                  Crochet mode (row focus)
                </label>
              </div>
              <div className="range-input">
                <span>Zoom</span>
                <input
                  type="range"
                  min={4}
                  max={28}
                  value={cellSize}
                  onChange={(e) => setCellSize(Number(e.target.value))}
                />
                <span className="small">{cellSize}px</span>
              </div>
            </div>

            <div className="status-row">
              <span className={`status-pill ${errors.length === 0 && result ? 'success' : errors.length ? 'error' : ''}`}>
                {status}
              </span>
              <span className="status-pill">Rows: {result?.rowCount ?? '0'}</span>
              <span className="status-pill">Cols: {result?.colCount ?? '—'}</span>
              {fileName ? <span className="status-pill">{fileName}</span> : null}
            </div>
          </>
        )}
      </div>

      {errors.length > 0 && (
        <div className="panel" style={{ marginBottom: 16 }}>
          <strong>Errors</strong>
          <ul className="errors">
            {errors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {warnings.length > 0 && (
        <div className="panel" style={{ marginBottom: 16 }}>
          <strong>Warnings</strong>
          <ul className="warnings">
            {warnings.map((warn, idx) => (
              <li key={idx}>{warn}</li>
            ))}
          </ul>
        </div>
      )}

      {result && (
        <div className="panel collapsible" style={{ marginBottom: 16 }}>
          <div className="panel-head">
            <div>
              <strong>Colors</strong>
              {colorsCollapsed && (
                <span className="small" style={{ marginLeft: 8 }}>
                  {result.legend.length} colors
                </span>
              )}
            </div>
            <button type="button" className="secondary slim" onClick={() => setColorsCollapsed((v) => !v)}>
              {colorsCollapsed ? 'Show' : 'Hide'}
            </button>
          </div>

          {!colorsCollapsed && (
            <fieldset>
              <legend>Colors</legend>
              {result.legend.length === 0 ? (
                <div className="small">No colors detected yet.</div>
              ) : (
                <div className="legend-list">
                  {result.legend.map((entry) => {
                    const activeColor = displayColors[entry.name] ?? entry.color;
                    return (
                      <div className="legend-item" key={entry.name}>
                        <span className="swatch" style={{ backgroundColor: activeColor }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ textTransform: 'capitalize' }}>{entry.name.replace(/_/g, ' ')}</div>
                          <div className="small">{activeColor.toUpperCase()}</div>
                        </div>
                        <input
                          type="color"
                          value={activeColor}
                          aria-label={`Override ${entry.name}`}
                          onChange={(e) =>
                            setCustomColors((prev) => ({
                              ...prev,
                              [entry.name]: e.target.value
                            }))
                          }
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </fieldset>
          )}
        </div>
      )}

      {canRender && result ? (
        <div className="panel">
          <div className="canvas-layout">
            {crochetMode && (
              <div className="crochet-column">
                <div className="crochet-panel">
                  <div className="crochet-top">
                    <div>
                      <span className="crochet-chip">Crochet mode</span>
                      <div className="crochet-row-label">
                        Row {activeRowIndex + 1} / {result.rowCount}
                      </div>
                      <div className="small">
                        Direction: {currentDirectionIsRtl ? 'droite → gauche' : 'gauche → droite'} · Click “Next row” as you go
                      </div>
                </div>
                <div className="button-row">
                  <button type="button" className="secondary" onClick={handlePrevRow} disabled={activeRowIndex === 0}>
                    Previous row
                  </button>
                  <select
                    className="row-select"
                    value={activeRowIndex}
                    onChange={(e) => jumpToRow(Number(e.target.value))}
                  >
                    {displayRows.map((row) => (
                      <option key={`row-option-${row.originalIndex}`} value={row.originalIndex}>
                        Row {row.originalIndex + 1} {row.originalIndex < activeRowIndex ? '✓' : ''}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleNextRow}
                    disabled={activeRowIndex >= result.rowCount - 1}
                  >
                    Next row
                  </button>
                </div>
              </div>

                  {activeRow ? (
                    <div className="instruction-board">
                      <div className="instruction-meta">
                        <span>Follow row {activeRowIndex + 1}:</span>
                      </div>
                      <div className="segment-grid">
                        {activeRowSegments.map((segment, idx) => {
                          const fill = displayColors[segment.color] ?? stringToColor(segment.color);
                          const glow = `${fill}33`;
                          const soft = `${fill}18`;
                          return (
                            <div
                              key={`${segment.color}-${idx}`}
                              className="segment-card"
                              style={
                                {
                                  '--segment-color': fill,
                                  boxShadow: `0 12px 28px ${glow}, 0 0 0 1px ${soft}`,
                                  borderColor: fill
                                } as React.CSSProperties
                          }
                        >
                          <div className="segment-line">
                            <span className="swatch" style={{ backgroundColor: fill }} />
                            <span className="segment-count">{segment.count} stitches</span>
                            <span className="segment-dot">·</span>
                            <span className="segment-color-text">{segment.color.replace(/_/g, ' ')}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                    </div>
                  ) : null}
                </div>
              </div>
            )}

            <div className="grid-column">
              <div className="toolbar">
                <strong>Rendered grid</strong>
                <span className="small">
                  {result.rowCount} rows × {result.colCount} columns · {gridCells.length} cells
                </span>
              </div>
              <div className="grid-wrapper">
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    ...( { '--cell-size': `${cellSize}px` } as React.CSSProperties )
                  }}
                >
                  {showRowNumbers && (
                    <div
                      style={{
                        position: 'sticky',
                        left: 0,
                        marginRight: 8,
                        display: 'grid',
                        gridTemplateRows: `repeat(${result.rowCount}, var(--cell-size))`
                      }}
                    >
                      {displayRows.map((row) => (
                        <div
                          key={`row-num-${row.originalIndex}`}
                          className={`row-number ${
                            crochetMode && row.originalIndex === activeRowIndex ? 'active' : ''
                          } ${crochetMode && row.originalIndex < activeRowIndex ? 'done' : ''}`}
                          style={{
                            height: cellSize,
                            lineHeight: `${cellSize}px`,
                            gridRowStart: result.rowCount - row.originalIndex
                          }}
                          role="button"
                          tabIndex={0}
                          onClick={() => jumpToRow(row.originalIndex)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              jumpToRow(row.originalIndex);
                            }
                          }}
                        >
                          {row.originalIndex + 1}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="grid" style={gridStyle}>
                    {gridCells.map((cell) => {
                      const fill = displayColors[cell.color] ?? stringToColor(cell.color);
                      return (
                        <div
                          key={cell.key}
                          className={`cell ${showGridLines ? 'grid-lines' : ''} ${
                            crochetMode && cell.originalRow === activeRowIndex ? 'active-row' : ''
                          } ${crochetMode && cell.originalRow < activeRowIndex ? 'done-row' : ''}`}
                          style={{
                            backgroundColor: fill,
                            gridColumnStart: cell.colPos,
                            gridRowStart: cell.rowPos
                          }}
                          title={`Row ${cell.originalRow + 1}`}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="panel">
          <div className="small">Load a file or click “Load example” to render the grid.</div>
        </div>
      )}

      <footer className="panel footer-panel" id="prompt-footer">
        <div className="footer-head">
          <div>
            <strong>Always-working prompt to get a TXT from an image</strong>
            {footerCollapsed ? <span className="small" style={{ marginLeft: 8 }}>Hidden</span> : null}
          </div>
          <div className="button-row">
            <button type="button" className="secondary slim" onClick={handleCopyPrompt}>
              Copy prompt
            </button>
            <button type="button" className="secondary slim" onClick={() => setFooterCollapsed((v) => !v)}>
              {footerCollapsed ? 'Show' : 'Hide'}
            </button>
            {copyStatus ? <span className="small">{copyStatus}</span> : null}
          </div>
        </div>
        {!footerCollapsed && (
          <textarea className="prompt-box" readOnly value={CONVERSION_PROMPT} aria-label="Conversion prompt" />
        )}
      </footer>
    </main>
  );
}
