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

export const KNOWN_COLORS: Record<string, string> = {
  blanc: '#ffffff',
  vert: '#226e35',
  bleu_clair: '#7cbbf1',
  bleu_fonce: '#1a2f6d'
};
