"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeftToLine } from "lucide-react";
import { parsePattern, type ParseResult } from "@/lib/parsePattern";
import { KNOWN_COLORS, stringToColor } from "@/lib/color";

type RowDirection = "ltr" | "rtl";
type WorkingRow = {
  id: string;
  cells: string[];
  direction: RowDirection | null;
  originalRowNumber: number;
};

type InputMode = "text" | "image" | "create";

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
const MODE_OPTIONS: InputMode[] = ["text", "image", "create"];
const MODE_META: Record<InputMode, { label: string; description: string }> = {
  text: {
    label: "Upload .txt pattern",
    description: "Open an existing pattern file and render it immediately.",
  },
  image: {
    label: "Upload image (PNG/JPG)",
    description:
      "Convert a pixel-art image into rows. You can adjust the column count and palette size.",
  },
  create: {
    label: "Create canvas",
    description:
      "Start from scratch: choose the size, paint with your palette, then export.",
  },
};
const DEFAULT_BASE_COLOR = KNOWN_COLORS.blanc ?? "#ffffff";

const normalizeColorName = (name: string) => {
  const trimmed = name.trim().toLowerCase().replace(/\s+/g, "_");
  const cleaned = trimmed.replace(/[^a-z0-9_]/g, "");
  return cleaned || "couleur";
};

const buildWorkingRows = (
  rows: number,
  cols: number,
  fill: string,
): WorkingRow[] =>
  Array.from({ length: rows }, (_, idx) => ({
    id: `row-${idx + 1}`,
    cells: Array.from({ length: cols }, () => fill),
    direction: null,
    originalRowNumber: idx + 1,
  }));

const buildManualResult = (
  rows: WorkingRow[],
  palette: Record<string, string>,
): ParseResult => {
  const rowCount = rows.length;
  const colCount = rowCount > 0 ? rows[0].cells.length : null;
  const colorSet = new Set<string>();
  rows.forEach((r) => r.cells.forEach((c) => colorSet.add(c)));

  const colorMap: Record<string, string> = {};
  colorSet.forEach((name) => {
    colorMap[name] = palette[name] ?? KNOWN_COLORS[name] ?? stringToColor(name);
  });

  const legend = Object.entries(colorMap).map(([name, color]) => ({
    name,
    color,
  }));

  return {
    rows: rows.map((r) => r.cells),
    rowCount,
    colCount,
    colorMap,
    rowDirections: rows.map((r) => r.direction ?? null),
    legend,
    errors: [],
    warnings: [],
  };
};

const hexToRgb = (hex: string): [number, number, number] => {
  const clean = hex.replace("#", "");
  const num = Number.parseInt(clean, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
};

const rgbToHex = ([r, g, b]: [number, number, number]) =>
  `#${[r, g, b]
    .map((v) => Math.max(0, Math.min(255, Math.round(v))))
    .map((v) => v.toString(16).padStart(2, "0"))
    .join("")}`;

const channelStep = (v: number) =>
  Math.max(0, Math.min(255, Math.round(v / 32) * 32));

const simplifyColor = (
  r: number,
  g: number,
  b: number,
): [number, number, number] => [channelStep(r), channelStep(g), channelStep(b)];

const distanceSq = (a: [number, number, number], b: [number, number, number]) =>
  (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;

const KNOWN_COLOR_ENTRIES = Object.entries(KNOWN_COLORS).map(([name, hex]) => ({
  name,
  rgb: hexToRgb(hex),
}));

const nearestKnownColor = (rgb: [number, number, number]) => {
  let best = KNOWN_COLOR_ENTRIES[0];
  let bestDist = Number.POSITIVE_INFINITY;
  KNOWN_COLOR_ENTRIES.forEach((entry) => {
    const dist = distanceSq(rgb, entry.rgb);
    if (dist < bestDist) {
      best = entry;
      bestDist = dist;
    }
  });
  return { name: best.name, hex: KNOWN_COLORS[best.name] };
};

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Unsupported file content"));
      }
    };
    reader.onerror = () =>
      reject(reader.error ?? new Error("Unable to read file"));
    reader.readAsDataURL(file);
  });

const loadImageElement = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Impossible de charger cette image."));
    img.src = src;
  });

const buildSegmentsText = (rowColors: string[]) => {
  const segments: { color: string; count: number }[] = [];
  rowColors.forEach((color) => {
    const last = segments[segments.length - 1];
    if (last && last.color === color) {
      last.count += 1;
    } else {
      segments.push({ color, count: 1 });
    }
  });
  return segments.map((seg) => `${seg.count} ${seg.color}`).join(" ");
};

type ImageConvertOptions = {
  targetColumns: number;
  maxColors: number;
  serpentine: boolean;
};

const imageToPatternTxt = async (file: File, options: ImageConvertOptions) => {
  const { targetColumns, maxColors, serpentine } = options;
  const dataUrl = await readFileAsDataUrl(file);
  const img = await loadImageElement(dataUrl);

  const targetRows = Math.max(
    1,
    Math.round((img.height / img.width) * targetColumns),
  );
  const canvas = document.createElement("canvas");
  canvas.width = targetColumns;
  canvas.height = targetRows;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas non disponible.");

  ctx.drawImage(img, 0, 0, targetColumns, targetRows);
  const { data } = ctx.getImageData(0, 0, targetColumns, targetRows);

  const histogram = new Map<
    string,
    { rgb: [number, number, number]; count: number }
  >();
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];
    const a = data[i + 3];
    if (a < 10) {
      r = 255;
      g = 255;
      b = 255;
    }
    const simplified = simplifyColor(r, g, b);
    const key = simplified.join(",");
    const entry = histogram.get(key);
    if (entry) {
      entry.count += 1;
    } else {
      histogram.set(key, { rgb: simplified, count: 1 });
    }
  }

  const palette = Array.from(histogram.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, Math.max(1, Math.min(maxColors, histogram.size)))
    .map((entry) => entry.rgb);

  const paletteNames: string[] = [];
  const usedNames = new Set<string>();
  palette.forEach((rgb, idx) => {
    const { name } = nearestKnownColor(rgb);
    let candidate = name;
    if (usedNames.has(candidate)) {
      let suffix = 2;
      while (usedNames.has(`${candidate}_${suffix}`)) {
        suffix += 1;
      }
      candidate = `${candidate}_${suffix}`;
    }
    usedNames.add(candidate);
    paletteNames[idx] = candidate;
  });

  const lines: string[] = [];
  for (let rowIdx = 0; rowIdx < targetRows; rowIdx += 1) {
    const y = targetRows - 1 - rowIdx; // bottom row is Ligne 1
    const direction = serpentine ? (rowIdx % 2 === 0 ? "rtl" : "ltr") : "ltr";
    const arrowText = direction === "rtl" ? "droite→gauche" : "gauche→droite";
    const rowColors: string[] = [];

    if (direction === "rtl") {
      for (let x = targetColumns - 1; x >= 0; x -= 1) {
        const idx = (y * targetColumns + x) * 4;
        const rgb = simplifyColor(data[idx], data[idx + 1], data[idx + 2]);
        let best = 0;
        let bestDist = Number.POSITIVE_INFINITY;
        palette.forEach((p, pIdx) => {
          const dist = distanceSq(rgb, p);
          if (dist < bestDist) {
            bestDist = dist;
            best = pIdx;
          }
        });
        rowColors.push(paletteNames[best]);
      }
    } else {
      for (let x = 0; x < targetColumns; x += 1) {
        const idx = (y * targetColumns + x) * 4;
        const rgb = simplifyColor(data[idx], data[idx + 1], data[idx + 2]);
        let best = 0;
        let bestDist = Number.POSITIVE_INFINITY;
        palette.forEach((p, pIdx) => {
          const dist = distanceSq(rgb, p);
          if (dist < bestDist) {
            bestDist = dist;
            best = pIdx;
          }
        });
        rowColors.push(paletteNames[best]);
      }
    }

    lines.push(
      `Ligne ${rowIdx + 1} (${arrowText}) : ${buildSegmentsText(rowColors)}`,
    );
  }

  const legendLines = palette
    .map(
      (rgb, idx) =>
        `- ${paletteNames[idx]} : ${nearestKnownColor(rgb).name} (${rgbToHex(rgb)})`,
    )
    .join("\n");

  const header = [
    `Patron généré automatiquement à partir de ${file.name}`,
    `Colonnes : ${targetColumns}`,
    `Lignes : ${targetRows}`,
    `Palette estimée (nom proche + hex) :`,
    legendLines,
    "",
  ].join("\n");

  return {
    text: `${header}${lines.join("\n")}`,
    cols: targetColumns,
    rows: targetRows,
  };
};

export default function HomePage() {
  const [rawText, setRawText] = useState("");
  const [result, setResult] = useState<ParseResult | null>(null);
  const [rowsState, setRowsState] = useState<WorkingRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [status, setStatus] = useState<string>("Waiting for file...");
  const [cellSize, setCellSize] = useState<number>(14);
  const [targetColumns, setTargetColumns] = useState<number>(30);
  const [maxColors, setMaxColors] = useState<number>(6);
  const [imageStatus, setImageStatus] = useState<string>("No image uploaded");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [creationMode, setCreationMode] = useState<boolean>(false);
  const [creationCols, setCreationCols] = useState<number>(30);
  const [creationRows, setCreationRows] = useState<number>(30);
  const [brushColorName, setBrushColorName] = useState<string>("blanc");
  const [brushColorHex, setBrushColorHex] =
    useState<string>(DEFAULT_BASE_COLOR);
  const [creationPalette, setCreationPalette] = useState<
    Record<string, string>
  >({
    blanc: DEFAULT_BASE_COLOR,
  });
  const [instructionDone, setInstructionDone] = useState<
    Record<string, boolean>
  >({});
  const [newColorName, setNewColorName] = useState<string>("nouveau");
  const [newColorHex, setNewColorHex] = useState<string>("#ff6b6b");
  const [showGridLines, setShowGridLines] = useState<boolean>(true);
  const [showRowNumbers, setShowRowNumbers] = useState<boolean>(true);
  const [serpentine, setSerpentine] = useState<boolean>(true);
  const [crochetMode, setCrochetMode] = useState<boolean>(true);
  const [activeRowIndex, setActiveRowIndex] = useState<number>(0);
  const [setupCollapsed, setSetupCollapsed] = useState<boolean>(false);
  const [colorsCollapsed] = useState<boolean>(false);
  const [footerCollapsed, setFooterCollapsed] = useState<boolean>(false);
  const [copyStatus, setCopyStatus] = useState<string>("");
  const [customColors, setCustomColors] = useState<Record<string, string>>({});
  const [inputMode, setInputMode] = useState<InputMode>("text");

  const handleParse = (text: string, label?: string) => {
    const parsed = parsePattern(text, {
      consensusThreshold: CONSENSUS_THRESHOLD,
    });
    setResult(parsed);
    const workingRows: WorkingRow[] = parsed.rows.map((row, idx) => ({
      id: `row-${idx + 1}`,
      cells: row,
      direction: parsed.rowDirections[idx] ?? null,
      originalRowNumber: idx + 1,
    }));
    setRowsState(workingRows);
    setErrors(parsed.errors);
    setWarnings(parsed.warnings);
    setRawText(text);
    setFileName(label ?? "");
    setCustomColors({});
    setStatus(
      parsed.errors.length === 0
        ? "Ready to render"
        : "Parsing completed with issues",
    );
    setCreationMode(false);
    setCreationPalette({ blanc: DEFAULT_BASE_COLOR });
    setBrushColorName("blanc");
    setBrushColorHex(DEFAULT_BASE_COLOR);
    setNewColorName("nouveau");
    setNewColorHex("#ff6b6b");
    setInstructionDone({});
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === "string" ? reader.result : "";
      handleParse(text, file.name);
    };
    reader.onerror = () => {
      setStatus("Failed to read file");
      setErrors([reader.error?.message || "Unable to read file"]);
    };
    reader.readAsText(file, "utf-8");
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    convertImageFile(file);
  };

  const convertImageFile = async (file: File) => {
    setStatus("Converting image...");
    setImageStatus(`Converting ${file.name}...`);
    try {
      const conversion = await imageToPatternTxt(file, {
        targetColumns,
        maxColors,
        serpentine,
      });
      handleParse(
        conversion.text,
        `${file.name.replace(/\.[^.]+$/, "")}-image.txt`,
      );
      setImageStatus(
        `Converted ${file.name} to ${conversion.cols}×${conversion.rows} grid`,
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Image conversion failed";
      setImageStatus(message);
      setStatus("Image conversion failed");
      setErrors([message]);
    }
  };

  const handleReconvertImage = () => {
    if (!imageFile) return;
    convertImageFile(imageFile);
  };

  const syncManualResult = (
    rows: WorkingRow[],
    palette: Record<string, string>,
    statusText = "Creation mode",
  ) => {
    const res = buildManualResult(rows, palette);
    setResult(res);
    setErrors([]);
    setWarnings([]);
    setStatus(statusText);
  };

  const applyManualGrid = (
    rows: WorkingRow[],
    palette: Record<string, string>,
    statusText = "Creation mode",
  ) => {
    setRowsState(rows);
    setCreationPalette(palette);
    setCreationMode(true);
    setCrochetMode(true);
    syncManualResult(rows, palette, statusText);
    setFileName("canvas");
    setRawText("");
  };

  const handleCreateCanvas = () => {
    const cols = Math.max(1, Math.min(200, creationCols || 1));
    const rows = Math.max(1, Math.min(400, creationRows || 1));
    setCreationCols(cols);
    setCreationRows(rows);
    const colorName = normalizeColorName(brushColorName || "blanc");
    const palette = {
      ...creationPalette,
      [colorName]: brushColorHex || DEFAULT_BASE_COLOR,
    };
    const working = buildWorkingRows(rows, cols, colorName);
    applyManualGrid(working, palette, "Creation mode");
  };

  const handleEnableEditing = () => {
    if (!rowsState.length || !colCount) return;
    const palette = { ...creationPalette };
    rowsState.forEach((row) =>
      row.cells.forEach((c) => {
        if (!palette[c]) {
          palette[c] = KNOWN_COLORS[c] ?? stringToColor(c);
        }
      }),
    );
    setCreationCols(colCount);
    setCreationRows(rowsState.length);
    applyManualGrid(
      rowsState.map((row) => ({ ...row, cells: [...row.cells] })),
      palette,
      "Creation mode (editing existing grid)",
    );
    setInstructionDone({});
  };

  const handleExitCreation = () => {
    if (!rowsState.length) return;
    setCreationMode(false);
    setStatus("Ready to crochet");
  };

  const handleFillCanvas = () => {
    if (!creationMode || rowsState.length === 0) return;
    const colorName = normalizeColorName(brushColorName || "blanc");
    const palette = {
      ...creationPalette,
      [colorName]: brushColorHex || DEFAULT_BASE_COLOR,
    };
    const updated = rowsState.map((row) => ({
      ...row,
      cells: row.cells.map(() => colorName),
    }));
    applyManualGrid(updated, palette, "Canvas filled");
  };

  const handlePaintCell = (rowIdx: number, colIdx: number) => {
    if (!creationMode) return;
    const colorName = normalizeColorName(brushColorName || "blanc");
    const palette = {
      ...creationPalette,
      [colorName]: brushColorHex || DEFAULT_BASE_COLOR,
    };
    const updatedRows = rowsState.map((row, idx) => {
      if (idx !== rowIdx) return row;
      const cells = [...row.cells];
      cells[colIdx] = colorName;
      return { ...row, cells };
    });
    applyManualGrid(updatedRows, palette, "Creation mode");
  };

  const handleBrushNameChange = (value: string) => {
    setBrushColorName(value);
    const normalized = normalizeColorName(value || "couleur");
    const known = KNOWN_COLORS[normalized];
    if (known) {
      setBrushColorHex(known);
      const palette = { ...creationPalette, [normalized]: known };
      setCreationPalette(palette);
      if (creationMode && rowsState.length > 0) {
        syncManualResult(rowsState, palette, "Creation mode");
      }
    }
  };

  const handleBrushHexChange = (value: string) => {
    setBrushColorHex(value);
    const normalized = normalizeColorName(brushColorName || "couleur");
    const palette = {
      ...creationPalette,
      [normalized]: value || DEFAULT_BASE_COLOR,
    };
    setCreationPalette(palette);
    if (creationMode && rowsState.length > 0) {
      syncManualResult(rowsState, palette, "Creation mode");
    }
  };

  const handleAddPaletteColor = () => {
    const name = normalizeColorName(newColorName || "couleur");
    const hex = newColorHex || DEFAULT_BASE_COLOR;
    const palette = { ...creationPalette, [name]: hex };
    setCreationPalette(palette);
    setBrushColorName(name);
    setBrushColorHex(hex);
    if (creationMode && rowsState.length > 0) {
      syncManualResult(rowsState, palette, "Creation mode");
    }
  };

  const handleLoadExample = () => {
    handleParse(EXAMPLE_TEXT, "example.txt");
  };

  const handleClear = () => {
    setRawText("");
    setResult(null);
    setRowsState([]);
    setErrors([]);
    setWarnings([]);
    setFileName("");
    setCustomColors({});
    setStatus("Waiting for file...");
    setActiveRowIndex(0);
    setImageStatus("No image uploaded");
    setImageFile(null);
    setCreationMode(false);
    setCreationPalette({ blanc: DEFAULT_BASE_COLOR });
    setBrushColorName("blanc");
    setBrushColorHex(DEFAULT_BASE_COLOR);
    setNewColorName("nouveau");
    setNewColorHex("#ff6b6b");
    setInstructionDone({});
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

  const colCount = result?.colCount ?? null;
  const rowCount = rowsState.length;

  const canRender = Boolean(
    result &&
    colCount &&
    rowCount > 0 &&
    errors.length === 0 &&
    rowsState.every((r) => r.cells.length === colCount),
  );

  const displayRows = useMemo(
    () =>
      rowsState.map((row, idx) => ({
        row: row.cells,
        direction: row.direction,
        id: row.id,
        index: idx,
        originalRowNumber: row.originalRowNumber,
      })),
    [rowsState],
  );

  useEffect(() => {
    if (rowsState.length === 0) {
      setActiveRowIndex(0);
    } else if (activeRowIndex >= rowsState.length) {
      setActiveRowIndex(rowsState.length - 1);
    }
  }, [rowsState.length, activeRowIndex]);

  const jumpToRow = (rowIndex: number) => {
    if (!rowCount) return;
    const clamped = Math.max(0, Math.min(rowIndex, rowCount - 1));
    setActiveRowIndex(clamped);
  };

  const directionForRow = useCallback(
    (rowIndex: number): RowDirection => {
      const explicit = rowsState[rowIndex]?.direction;
      if (explicit) return explicit;
      if (serpentine) {
        const original = rowsState[rowIndex]?.originalRowNumber ?? rowIndex + 1;
        const serpentineIndex = original - 1; // start bottom row as 0
        return serpentineIndex % 2 === 0 ? "rtl" : "ltr";
      }
      return "ltr";
    },
    [rowsState, serpentine],
  );

  const sideLabelForRow = (rowIndex: number) =>
    directionForRow(rowIndex) === "rtl" ? "R" : "W";

  const currentDirectionIsRtl = rowCount
    ? directionForRow(activeRowIndex) === "rtl"
    : false;

  const gridCells = useMemo(() => {
    if (!colCount || rowCount === 0) {
      return [] as {
        key: string;
        color: string;
        rowPos: number;
        colPos: number;
        originalRow: number;
        colIndex: number;
      }[];
    }

    const cells: {
      key: string;
      color: string;
      rowPos: number;
      colPos: number;
      originalRow: number;
      colIndex: number;
    }[] = [];

    displayRows.forEach((entry, idx) => {
      const rtl = directionForRow(idx) === "rtl";
      const rowPos = rowCount - idx; // CSS grid rows start at 1 from top

      entry.row.forEach((color, colIdx) => {
        const colPos = rtl ? colCount - colIdx : colIdx + 1;
        cells.push({
          key: `${entry.id}-${colIdx}`,
          color,
          rowPos,
          colPos,
          originalRow: idx,
          colIndex: colIdx,
        });
      });
    });
    return cells;
  }, [colCount, rowCount, displayRows, directionForRow]);

  const handleExportPng = () => {
    if (!colCount || !canRender || rowCount === 0) return;
    const canvas = document.createElement("canvas");
    canvas.width = colCount * cellSize;
    canvas.height = rowCount * cellSize;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const colsTotal = colCount;
    const rowsTotal = rowCount;

    displayRows.forEach((entry, idx) => {
      const rtl = directionForRow(idx) === "rtl";
      const y = (rowsTotal - 1 - idx) * cellSize; // bottom row stays at canvas bottom

      entry.row.forEach((colorName, colIdx) => {
        const x = (rtl ? colsTotal - 1 - colIdx : colIdx) * cellSize;
        const fill = displayColors[colorName] ?? stringToColor(colorName);
        ctx.fillStyle = fill;
        ctx.fillRect(x, y, cellSize, cellSize);
        if (showGridLines) {
          ctx.strokeStyle = "rgba(0,0,0,0.7)";
          ctx.strokeRect(x + 0.5, y + 0.5, cellSize, cellSize);
        }
      });
    });

    const link = document.createElement("a");
    link.download = `${fileName || "pattern"}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const serializeRow = useCallback(
    (cells: string[], rowIndex: number) => {
      const direction = directionForRow(rowIndex);
      const arrowText = direction === "rtl" ? "droite→gauche" : "gauche→droite";
      const side = direction === "rtl" ? "R" : "W";
      const segments: { color: string; count: number }[] = [];
      cells.forEach((color) => {
        const last = segments[segments.length - 1];
        if (last && last.color === color) {
          last.count += 1;
        } else {
          segments.push({ color, count: 1 });
        }
      });
      const segmentText = segments
        .map((seg) => `${seg.count} ${seg.color}`)
        .join(" ");
      return `Ligne ${rowIndex + 1} (${side} ${arrowText}) : ${segmentText}`;
    },
    [directionForRow],
  );

  const handleExportTxt = () => {
    if (!rowCount || !canRender) return;
    const legendLines = Object.entries(displayColors)
      .map(([name, color]) => `- ${name} : ${color.toUpperCase()}`)
      .join("\n");
    const rowLines = displayRows
      .map((entry, idx) => serializeRow(entry.row, idx))
      .join("\n");
    const header = [
      "Patron crochet exporté",
      `Colonnes : ${colCount ?? "—"}`,
      `Lignes : ${rowCount}`,
      "Palette (nom -> hex) :",
      legendLines,
      "",
    ].join("\n");
    const content = `${header}${rowLines}`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName?.replace(/\\.txt$/i, "") || "pattern"}-modifie.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const gridStyle: React.CSSProperties = useMemo(() => {
    const base = { "--cell-size": `${cellSize}px` } as React.CSSProperties;
    if (!colCount || !rowCount) return base;
    return {
      ...base,
      gridTemplateColumns: `repeat(${colCount}, var(--cell-size))`,
      gridTemplateRows: `repeat(${rowCount}, var(--cell-size))`,
    } as React.CSSProperties;
  }, [colCount, rowCount, cellSize]);

  const gridDimensions = useMemo(() => {
    if (!colCount || !rowCount) return { width: 0, height: 0 };
    return { width: colCount * cellSize, height: rowCount * cellSize };
  }, [colCount, rowCount, cellSize]);

  const handleNextRow = () => {
    if (!rowCount) return;
    setActiveRowIndex((prev) => Math.min(prev + 1, rowCount - 1));
  };

  const handlePrevRow = () => {
    setActiveRowIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleDeleteRow = () => {
    setRowsState((prev) => {
      if (prev.length === 0) return prev;
      const next = prev.filter((_, idx) => idx !== activeRowIndex);
      const newIndex = Math.max(0, Math.min(activeRowIndex, next.length - 1));
      setActiveRowIndex(newIndex);
      if (creationMode) {
        if (next.length === 0) {
          setResult(null);
          setCreationMode(false);
        } else {
          syncManualResult(next, creationPalette, "Creation mode");
        }
      }
      return next;
    });
  };

  const activeRow = displayRows[activeRowIndex];
  const rowCursorTop = rowCount
    ? (rowCount - activeRowIndex - 1) * cellSize
    : 0;

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(CONVERSION_PROMPT);
      setCopyStatus("Copied!");
      setTimeout(() => setCopyStatus(""), 1500);
    } catch (err) {
      setCopyStatus("Clipboard blocked—copy manually.");
    }
  };

  const handleScrollToPrompt = () => {
    const el = document.getElementById("prompt-footer");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const activeRowSegments = useMemo(() => {
    if (!activeRow) return [] as { color: string; count: number }[];
    const ordered = activeRow.row;
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
  }, [activeRow, activeRowIndex, directionForRow]);

  const toggleSegmentDone = (rowIndex: number, segmentIndex: number) => {
    const key = `${rowIndex}-${segmentIndex}`;
    setInstructionDone((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <main>
      <h1>Crochet / Pixel Pattern Renderer</h1>
      <p className="lead">
        Upload a TXT pattern and crochet row by row with a clear grid and
        focused instructions.
      </p>
      <div className="button-row" style={{ marginTop: -6 }}>
        <button
          type="button"
          className="secondary slim"
          onClick={handleScrollToPrompt}
        >
          Need a TXT that always works? Use the prompt below
        </button>
      </div>

      <div className="panel collapsible" style={{ marginBottom: 16 }}>
        <div className="panel-head">
          <div>
            <strong>Setup</strong>
            {setupCollapsed && (
              <span className="small" style={{ marginLeft: 8 }}>
                {fileName || "No file"} · {result?.rowCount ?? 0} rows
              </span>
            )}
          </div>
          <button
            type="button"
            className="secondary slim"
            onClick={() => setSetupCollapsed((v) => !v)}
          >
            {setupCollapsed ? "Show" : "Hide"}
          </button>
        </div>

        {!setupCollapsed && (
          <>
            <div className="setup-grid">
              <div className="control-card mode-panel">
                <div className="panel-head" style={{ marginBottom: 6 }}>
                  <strong>Choose your workflow</strong>
                </div>
                <div className="mode-selector">
                  {MODE_OPTIONS.map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      className={`mode-button ${inputMode === mode ? "active" : ""}`}
                      onClick={() => setInputMode(mode)}
                    >
                      {MODE_META[mode].label}
                    </button>
                  ))}
                </div>
                <div className="mode-body">
                  {inputMode === "text" && (
                    <div className="input-mode-content">
                      <p className="small">{MODE_META.text.description}</p>
                      <div className="input-block">
                        <label htmlFor="file-input">Choose .txt pattern</label>
                        <input
                          id="file-input"
                          type="file"
                          accept=".txt"
                          onChange={handleFileChange}
                        />
                        <div className="small">
                          Parse an existing pattern file.
                        </div>
                      </div>
                    </div>
                  )}
                  {inputMode === "image" && (
                    <div className="input-mode-content">
                      <p className="small">{MODE_META.image.description}</p>
                      <div className="input-block">
                        <label htmlFor="image-input">Choose image</label>
                        <input
                          id="image-input"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                        <div className="small">{imageStatus}</div>
                        <div className="button-row" style={{ marginTop: 6 }}>
                          <button
                            type="button"
                            onClick={handleReconvertImage}
                            disabled={!imageFile}
                          >
                            Convert with current sliders
                          </button>
                        </div>
                        <div className="range-input">
                          <span>Target columns (image → grid)</span>
                          <input
                            type="range"
                            min={8}
                            max={120}
                            value={targetColumns}
                            onChange={(e) =>
                              setTargetColumns(Number(e.target.value))
                            }
                          />
                          <span className="small">{targetColumns} cols</span>
                        </div>
                        <div className="range-input">
                          <span>Max colors from image</span>
                          <input
                            type="range"
                            min={2}
                            max={12}
                            value={maxColors}
                            onChange={(e) =>
                              setMaxColors(Number(e.target.value))
                            }
                          />
                          <span className="small">{maxColors} colors</span>
                        </div>
                      </div>
                    </div>
                  )}
                  {inputMode === "create" && (
                    <div className="input-mode-content">
                      <p className="small">{MODE_META.create.description}</p>
                      <div className="inline-fields">
                        <div className="input-block">
                          <label htmlFor="creation-cols">Columns</label>
                          <input
                            id="creation-cols"
                            type="number"
                            min={1}
                            max={200}
                            value={creationCols}
                            onChange={(e) =>
                              setCreationCols(Number(e.target.value))
                            }
                          />
                        </div>
                        <div className="input-block">
                          <label htmlFor="creation-rows">Rows</label>
                          <input
                            id="creation-rows"
                            type="number"
                            min={1}
                            max={400}
                            value={creationRows}
                            onChange={(e) =>
                              setCreationRows(Number(e.target.value))
                            }
                          />
                        </div>
                      </div>
                      <div className="button-row">
                        <button type="button" onClick={handleCreateCanvas}>
                          Create blank canvas
                        </button>
                        <button
                          type="button"
                          className="secondary"
                          onClick={handleFillCanvas}
                          disabled={!creationMode || !rowsState.length}
                        >
                          Fill canvas with brush
                        </button>
                      </div>
                      <div className="inline-fields">
                        <div className="input-block">
                          <label htmlFor="brush-name">Brush name</label>
                          <input
                            id="brush-name"
                            type="text"
                            value={brushColorName}
                            onChange={(e) =>
                              handleBrushNameChange(e.target.value)
                            }
                            placeholder="e.g., vert_clair"
                          />
                        </div>
                        <div className="input-block">
                          <label htmlFor="brush-hex">Brush color</label>
                          <input
                            id="brush-hex"
                            type="color"
                            value={brushColorHex}
                            onChange={(e) =>
                              handleBrushHexChange(e.target.value)
                            }
                          />
                        </div>
                      </div>
                      <div className="small">
                        Click any cell when in creation mode to paint it.
                      </div>
                    </div>
                  )}
                </div>
                <div className="mode-switch-row">
                  <span className="small">Quick switch:</span>
                  {MODE_OPTIONS.filter((mode) => mode !== inputMode).map(
                    (mode) => (
                      <button
                        key={mode}
                        type="button"
                        className="mode-switch-button"
                        onClick={() => setInputMode(mode)}
                      >
                        {MODE_META[mode].label}
                      </button>
                    ),
                  )}
                </div>
              </div>

              <div className="setup-actions">
                <div className="control-card">
                  <div className="card-head">Actions</div>
                  <div className="card-body">
                    <div className="button-row">
                      <button type="button" onClick={handleLoadExample}>
                        Load example
                      </button>
                      <button
                        type="button"
                        className="secondary"
                        onClick={handleClear}
                      >
                        Clear
                      </button>
                    </div>
                    <div className="button-row">
                      <button
                        type="button"
                        className="secondary"
                        onClick={handleExportTxt}
                        disabled={!canRender}
                      >
                        Export TXT
                      </button>
                      <button
                        type="button"
                        className="secondary"
                        onClick={handleExportPng}
                        disabled={!canRender}
                      >
                        Export PNG
                      </button>
                    </div>
                  </div>
                </div>

                <div className="control-card">
                  <div className="card-head">Display</div>
                  <div className="card-body">
                    <div className="toggles">
                      <label>
                        <input
                          type="checkbox"
                          checked={showGridLines}
                          onChange={(e) => setShowGridLines(e.target.checked)}
                        />
                        Show grid lines
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          checked={showRowNumbers}
                          onChange={(e) => setShowRowNumbers(e.target.checked)}
                        />
                        Show row numbers
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          checked={serpentine}
                          onChange={(e) => setSerpentine(e.target.checked)}
                        />
                        Serpentine mode (on by default)
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          checked={crochetMode}
                          onChange={(e) => setCrochetMode(e.target.checked)}
                        />
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
                </div>
              </div>
            </div>
            <div className="status-row">
              <span
                className={`status-pill ${errors.length === 0 && result ? "success" : errors.length ? "error" : ""}`}
              >
                {status}
              </span>
              <span className="status-pill">Rows: {rowCount}</span>
              <span className="status-pill">Cols: {colCount ?? "—"}</span>
              {fileName ? (
                <span className="status-pill">{fileName}</span>
              ) : null}
              {inputMode === "image" && imageStatus ? (
                <span className="status-pill">{imageStatus}</span>
              ) : null}
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

      {result ? (
        <div className="workspace-grid">
          <div className="panel side-panel">
            <div className="stack">
              {crochetMode && (
                <>
                  {creationMode ? (
                    <div className="crochet-panel">
                      <div className="crochet-top">
                        <div>
                          <span className="crochet-chip">Palette mode</span>
                          <div className="crochet-row-label">
                            Creation/editing active
                          </div>
                          <div className="small">
                            Click a color to set the brush, then click cells to
                            paint.
                          </div>
                        </div>
                      </div>
                      <div className="palette-board">
                        <div className="palette-section">
                          <div className="palette-title">Brush</div>
                          <div className="palette-current">
                            <span
                              className="swatch large"
                              style={{ backgroundColor: brushColorHex }}
                            />
                            <div>
                              <div className="palette-name">
                                {normalizeColorName(brushColorName)}
                              </div>
                              <div className="small">
                                {brushColorHex.toUpperCase()}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="palette-section">
                          <div className="palette-title">Colors</div>
                          <div className="palette-grid">
                            {Object.entries(creationPalette).map(
                              ([name, hex]) => (
                                <button
                                  key={name}
                                  type="button"
                                  className={`palette-chip ${normalizeColorName(name) === normalizeColorName(brushColorName) ? "active" : ""}`}
                                  onClick={() => {
                                    const normalized = normalizeColorName(name);
                                    setBrushColorName(normalized);
                                    setBrushColorHex(hex);
                                  }}
                                >
                                  <span
                                    className="swatch"
                                    style={{ backgroundColor: hex }}
                                  />
                                  <span>{name.replace(/_/g, " ")}</span>
                                </button>
                              ),
                            )}
                          </div>
                        </div>
                        <div className="palette-section">
                          <div className="palette-title">Add color</div>
                          <div className="inline-fields">
                            <div className="input-block">
                              <label htmlFor="new-color-name">Name</label>
                              <input
                                id="new-color-name"
                                type="text"
                                value={newColorName}
                                onChange={(e) =>
                                  setNewColorName(e.target.value)
                                }
                                placeholder="nouveau"
                              />
                            </div>
                            <div className="input-block">
                              <label htmlFor="new-color-hex">Hex</label>
                              <input
                                id="new-color-hex"
                                type="color"
                                value={newColorHex}
                                onChange={(e) => setNewColorHex(e.target.value)}
                              />
                            </div>
                          </div>
                          <div className="button-row" style={{ marginTop: 6 }}>
                            <button
                              type="button"
                              onClick={handleAddPaletteColor}
                            >
                              Add to palette & set brush
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="crochet-panel">
                      <div className="crochet-top">
                        <div>
                          <span className="crochet-chip">Crochet mode</span>
                          <div className="crochet-row-label">
                            Row {activeRowIndex + 1} / {rowCount}
                          </div>
                          <div className="small">
                            Side:{" "}
                            {currentDirectionIsRtl
                              ? "R (droite→gauche)"
                              : "W (gauche→droite)"}{" "}
                            · Click “Next row” as you go
                          </div>
                        </div>
                        <div className="button-row">
                          <button
                            type="button"
                            className="secondary"
                            onClick={handlePrevRow}
                            disabled={activeRowIndex === 0}
                          >
                            Previous row
                          </button>
                          <select
                            className="row-select"
                            value={activeRowIndex}
                            onChange={(e) => jumpToRow(Number(e.target.value))}
                          >
                            {displayRows.map((row) => (
                              <option
                                key={`row-option-${row.id}`}
                                value={row.index}
                              >
                                Row {row.index + 1} ·{" "}
                                {sideLabelForRow(row.index)}{" "}
                                {row.index < activeRowIndex ? "✓" : ""}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={handleNextRow}
                            disabled={activeRowIndex >= rowCount - 1}
                          >
                            Next row
                          </button>
                          <button
                            type="button"
                            className="secondary danger"
                            onClick={handleDeleteRow}
                            disabled={!rowCount}
                          >
                            Delete row
                          </button>
                        </div>
                      </div>

                      {activeRow ? (
                        <div className="instruction-board">
                          <div className="instruction-meta">
                            <span>Follow row {activeRowIndex + 1}:</span>
                            <span className="side-pill">
                              {sideLabelForRow(activeRowIndex)} side
                            </span>
                          </div>
                          <div className="segment-grid">
                            {activeRowSegments.map((segment, idx) => {
                              const fill =
                                displayColors[segment.color] ??
                                stringToColor(segment.color);
                              const segKey = `${activeRowIndex}-${idx}`;
                              const isDone = instructionDone[segKey];
                              return (
                                <div
                                  key={`${segment.color}-${idx}`}
                                  className={`segment-card ${isDone ? "done" : ""}`}
                                  style={
                                    {
                                      "--segment-color": fill,
                                    } as React.CSSProperties
                                  }
                                  onClick={() =>
                                    toggleSegmentDone(activeRowIndex, idx)
                                  }
                                  role="button"
                                  tabIndex={0}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                      e.preventDefault();
                                      toggleSegmentDone(activeRowIndex, idx);
                                    }
                                  }}
                                >
                                  <div className="segment-line">
                                    <span
                                      className="swatch"
                                      style={{ backgroundColor: fill }}
                                    />
                                    <span className="segment-count">
                                      {segment.count} stitches
                                    </span>
                                    <span className="segment-dot">·</span>
                                    <span className="segment-color-text">
                                      {segment.color.replace(/_/g, " ")}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="panel grid-panel">
            <div className="toolbar">
              <div className="toolbar-left">
                <strong>Rendered grid</strong>
                <button
                  type="button"
                  className="secondary slim"
                  onClick={handleEnableEditing}
                  disabled={creationMode || !rowsState.length || !colCount}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="secondary slim"
                  onClick={handleExitCreation}
                  disabled={!creationMode || !rowsState.length}
                >
                  Save
                </button>
              </div>
              <span className="small">
                {rowCount} rows × {colCount ?? "—"} columns · {gridCells.length}{" "}
                cells
              </span>
            </div>
            {canRender && rowCount > 0 ? (
              <div className="grid-wrapper">
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    ...({
                      "--cell-size": `${cellSize}px`,
                    } as React.CSSProperties),
                  }}
                >
                  {showRowNumbers && (
                    <div
                      style={{
                        position: "sticky",
                        left: 0,
                        marginRight: 8,
                        display: "grid",
                        gridTemplateRows: `repeat(${rowCount}, var(--cell-size))`,
                      }}
                    >
                      {displayRows.map((row) => (
                        <div
                          key={`row-num-${row.id}`}
                          className={`row-number ${
                            crochetMode && row.index === activeRowIndex
                              ? "active"
                              : ""
                          } ${crochetMode && row.index < activeRowIndex ? "done" : ""}`}
                          style={{
                            height: cellSize,
                            lineHeight: `${cellSize}px`,
                            gridRowStart: rowCount - row.index,
                          }}
                          role="button"
                          tabIndex={0}
                          onClick={() => jumpToRow(row.index)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              jumpToRow(row.index);
                            }
                          }}
                        >
                          {row.index + 1}
                        </div>
                      ))}
                    </div>
                  )}
                  <div
                    className="grid-shell"
                    style={{
                      width: gridDimensions.width,
                      height: gridDimensions.height,
                    }}
                  >
                    {canRender && rowCount > 0 ? (
                      <div
                        className="row-highlight"
                        style={{
                          top: rowCursorTop,
                          height: cellSize,
                        }}
                      />
                    ) : null}
                    <div
                      className="grid"
                      style={{
                        ...gridStyle,
                        width: gridDimensions.width,
                        height: gridDimensions.height,
                      }}
                    >
                      {gridCells.map((cell) => {
                        const fill =
                          displayColors[cell.color] ??
                          stringToColor(cell.color);
                        return (
                          <div
                            key={cell.key}
                            className={`cell ${showGridLines ? "grid-lines" : ""} ${
                              crochetMode && cell.originalRow < activeRowIndex
                                ? "done-row"
                                : ""
                            } ${creationMode ? "editable" : ""} ${
                              cell.originalRow === activeRowIndex
                                ? "current-cell"
                                : ""
                            }`}
                            style={{
                              backgroundColor: fill,
                              gridColumnStart: cell.colPos,
                              gridRowStart: cell.rowPos,
                            }}
                            title={`Row ${cell.originalRow + 1}`}
                            onClick={
                              creationMode
                                ? () =>
                                    handlePaintCell(
                                      cell.originalRow,
                                      cell.colIndex,
                                    )
                                : undefined
                            }
                            role={creationMode ? "button" : undefined}
                            tabIndex={creationMode ? 0 : -1}
                            onKeyDown={
                              creationMode
                                ? (e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                      e.preventDefault();
                                      handlePaintCell(
                                        cell.originalRow,
                                        cell.colIndex,
                                      );
                                    }
                                  }
                                : undefined
                            }
                          />
                        );
                      })}
                    </div>
                    {canRender && rowCount > 0 ? (
                      <div
                        className="row-cursor"
                        style={{ top: rowCursorTop, height: cellSize }}
                      >
                        <div className="row-cursor-chip">
                          <ArrowLeftToLine
                            aria-hidden
                            className="row-cursor-arrow"
                            size={20}
                            strokeWidth={2}
                          />
                          <span className="row-cursor-side">
                            {sideLabelForRow(activeRowIndex)}
                          </span>
                          <span className="row-cursor-label">
                            Row {activeRowIndex + 1} - CURRENT
                          </span>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : (
              <div className="panel soft-panel">
                <div className="small">
                  Load a file, convert an image, or create a canvas to see the
                  grid.
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="panel">
          <div className="small">
            Load a file or click “Load example” to render the grid.
          </div>
        </div>
      )}

      <footer className="panel footer-panel" id="prompt-footer">
        <div className="footer-head">
          <div>
            <strong>Always-working prompt to get a TXT from an image</strong>
            {footerCollapsed ? (
              <span className="small" style={{ marginLeft: 8 }}>
                Hidden
              </span>
            ) : null}
          </div>
          <div className="button-row">
            <button
              type="button"
              className="secondary slim"
              onClick={handleCopyPrompt}
            >
              Copy prompt
            </button>
            <button
              type="button"
              className="secondary slim"
              onClick={() => setFooterCollapsed((v) => !v)}
            >
              {footerCollapsed ? "Show" : "Hide"}
            </button>
            {copyStatus ? <span className="small">{copyStatus}</span> : null}
          </div>
        </div>
        {!footerCollapsed && (
          <textarea
            className="prompt-box"
            readOnly
            value={CONVERSION_PROMPT}
            aria-label="Conversion prompt"
          />
        )}
      </footer>
    </main>
  );
}
