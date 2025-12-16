const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const hslToHex = (h: number, s: number, l: number) => {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = (x: number) => Math.round(255 * x).toString(16).padStart(2, '0');
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
};

const hashString = (input: string) => {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0; // force 32bit
  }
  return Math.abs(hash);
};

export const stringToColor = (name: string) => {
  const hash = hashString(name.toLowerCase());
  const h = hash % 360;
  const s = 45 + (hash % 30); // 45 - 74
  const l = 35 + (hash % 20); // 35 - 54
  return hslToHex(clamp(h, 0, 360), clamp(s, 30, 80), clamp(l, 25, 75));
};

// Expanded French color bank to give predictable, readable swatches for most pattern files.
export const KNOWN_COLORS: Record<string, string> = {
  blanc: '#ffffff',
  blanc_casse: '#f3f4f6',
  noir: '#000000',
  gris: '#6b7280',
  gris_clair: '#cbd5e1',
  gris_fonce: '#374151',
  gris_ardoise: '#475569',
  argent: '#c0c0c0',
  ivoire: '#f2ead3',
  creme: '#f7f2e7',
  beige: '#d7c5a0',
  sable: '#c2b280',
  taupe: '#8b7866',
  marron: '#7b4b2a',
  brun: '#6b4423',
  chocolat: '#5c3317',
  cafe: '#4b3621',
  caramel: '#af6e3d',
  cuivre: '#b87333',
  bronze: '#a97142',
  or: '#d4af37',
  dore: '#c99700',
  ocre: '#c99700',
  terracotta: '#d97757',
  rouge: '#e11d48',
  rouge_fonce: '#991b1b',
  bordeaux: '#7f1d1d',
  vermillon: '#e25822',
  corail: '#ff7f50',
  saumon: '#fa8072',
  abricot: '#f8b195',
  peche: '#f5a68b',
  rose: '#ec4899',
  rose_clair: '#f9a8d4',
  rose_pale: '#ffd5e5',
  fuchsia: '#d946ef',
  magenta: '#ff00a8',
  violet: '#8b5cf6',
  mauve: '#a78bfa',
  parme: '#c084fc',
  lilas: '#c4b5fd',
  prune: '#6b21a8',
  aubergine: '#581c87',
  lavande: '#c7d2fe',
  indigo: '#4338ca',
  bleu: '#2563eb',
  bleu_pastel: '#93c5fd',
  bleu_clair: '#7cbbf1',
  bleu_ciel: '#60a5fa',
  bleu_nuit: '#0b1f46',
  bleu_canard: '#0f6177',
  turquoise: '#14b8a6',
  cyan: '#22d3ee',
  azur: '#1e90ff',
  aqua: '#7fdbda',
  marine: '#0f3460',
  vert: '#226e35',
  vert_clair: '#4ade80',
  vert_pomme: '#7fbf3f',
  vert_anis: '#c0df16',
  vert_menthe: '#98f5e1',
  vert_tilleul: '#d0e17d',
  vert_pistache: '#a3e635',
  vert_emeraude: '#059669',
  vert_olive: '#708238',
  vert_sapin: '#0f3b2f',
  vert_bouteille: '#0b3d2e',
  vert_kaki: '#7b8b6f',
  vert_fonce: '#14532d',
  jaune: '#facc15',
  jaune_pale: '#fef9c3',
  moutarde: '#b45309',
  orange: '#f97316',
  orange_brule: '#c2410c',
  bleu_fonce: '#1a2f6d'
};
