const ESC = 0x1b;
const GS = 0x1d;
const LF = 0x0a;

export const Align = { LEFT: 0, CENTER: 1, RIGHT: 2 } as const;
export type Align = (typeof Align)[keyof typeof Align];

const COMBINING_DIACRITICS = /[̀-ͯ]/g;
const NON_BREAKING_SPACE = / /g;

// Thermal printers expect a single-byte codepage (usually CP437), not UTF-8.
// Diacritics are stripped rather than mapped to a codepage table, which is
// simpler and safe across the many generic printer firmwares this targets.
function encodeAscii(text: string): number[] {
  const normalized = text
    .normalize('NFD')
    .replace(COMBINING_DIACRITICS, '') // a-with-accent -> a, n-with-tilde -> n, ...
    .replace(NON_BREAKING_SPACE, ' ');

  return Array.from(normalized, (char) => {
    const code = char.charCodeAt(0);
    return code < 128 ? code : 0x3f; // '?' fallback for anything still non-ASCII
  });
}

export class ReceiptBuilder {
  private readonly bytes: number[] = [];

  constructor() {
    this.bytes.push(ESC, 0x40); // ESC @ - initialize printer
  }

  align(mode: Align): this {
    this.bytes.push(ESC, 0x61, mode);
    return this;
  }

  bold(on: boolean): this {
    this.bytes.push(ESC, 0x45, on ? 1 : 0);
    return this;
  }

  doubleHeight(on: boolean): this {
    this.bytes.push(GS, 0x21, on ? 0x01 : 0x00);
    return this;
  }

  text(line: string): this {
    this.bytes.push(...encodeAscii(line));
    return this;
  }

  line(text = ''): this {
    return this.text(text).newline();
  }

  newline(times = 1): this {
    for (let i = 0; i < times; i += 1) this.bytes.push(LF);
    return this;
  }

  divider(width: number, char = '-'): this {
    return this.line(char.repeat(width));
  }

  cut(): this {
    this.bytes.push(GS, 0x56, 0x00); // full cut
    return this;
  }

  build(): Uint8Array {
    return new Uint8Array(this.bytes);
  }
}

/** Lays `left` and `right` on one line, padding with spaces up to `width`. */
export function twoColumns(left: string, right: string, width: number): string {
  const maxLeftWidth = Math.max(0, width - right.length - 1);
  const clippedLeft = left.length > maxLeftWidth ? left.slice(0, maxLeftWidth) : left;
  const padding = Math.max(1, width - clippedLeft.length - right.length);
  return clippedLeft + ' '.repeat(padding) + right;
}
