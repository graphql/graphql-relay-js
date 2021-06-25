export type Base64String = string;

export function base64(input: string): Base64String {
  const utf8Array = stringToUTF8Array(input);
  let result = '';

  const length = utf8Array.length;
  const rest = length % 3;
  for (let i = 0; i < length - rest; i += 3) {
    const a = utf8Array[i];
    const b = utf8Array[i + 1];
    const c = utf8Array[i + 2];

    result += first6Bits(a);
    result += last2BitsAndFirst4Bits(a, b);
    result += last4BitsAndFirst2Bits(b, c);
    result += last6Bits(c);
  }

  if (rest === 1) {
    const a = utf8Array[length - 1];
    result += first6Bits(a) + last2BitsAndFirst4Bits(a, 0) + '==';
  } else if (rest === 2) {
    const a = utf8Array[length - 2];
    const b = utf8Array[length - 1];
    result +=
      first6Bits(a) +
      last2BitsAndFirst4Bits(a, b) +
      last4BitsAndFirst2Bits(b, 0) +
      '=';
  }

  return result;
}

function first6Bits(a: number): string {
  return toBase64Char((a >> 2) & 63);
}

function last2BitsAndFirst4Bits(a: number, b: number): string {
  return toBase64Char(((a << 4) | (b >> 4)) & 63);
}

function last4BitsAndFirst2Bits(b: number, c: number): string {
  return toBase64Char(((b << 2) | (c >> 6)) & 63);
}

function last6Bits(c: number): string {
  return toBase64Char(c & 63);
}

export function unbase64(input: Base64String): string {
  const utf8Array = [];

  for (let i = 0; i < input.length; i += 4) {
    const a = fromBase64Char(input[i]);
    const b = fromBase64Char(input[i + 1]);
    const c = fromBase64Char(input[i + 2]);
    const d = fromBase64Char(input[i + 3]);

    if (a === -1 || b === -1 || c === -1 || d === -1) {
      /*
       * Previously we used Node's API for parsing Base64 and following code
       * Buffer.from(i, 'utf8').toString('base64')
       * That silently ignored incorrect input and returned empty string instead
       * Let's keep this behaviour for a time being and hopefully fix it in the future.
       */
      return '';
    }

    const bitmap24 = (a << 18) | (b << 12) | (c << 6) | d;
    utf8Array.push((bitmap24 >> 16) & 255);
    utf8Array.push((bitmap24 >> 8) & 255);
    utf8Array.push(bitmap24 & 255);
  }

  let paddingIndex = input.length - 1;
  while (input[paddingIndex] === '=') {
    --paddingIndex;
    utf8Array.pop();
  }

  return utf8ArrayToString(utf8Array);
}

const b64CharacterSet =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function toBase64Char(bitMap6: number): string {
  return b64CharacterSet.charAt(bitMap6);
}

function fromBase64Char(base64Char: string | void): number {
  if (base64Char === undefined) {
    return -1;
  }
  return base64Char === '=' ? 0 : b64CharacterSet.indexOf(base64Char);
}

function stringToUTF8Array(input: string): Array<number> {
  const result = [];
  for (const utfChar of input) {
    const code = utfChar.codePointAt(0);
    if (code < 0x80) {
      result.push(code);
    } else if (code < 0x800) {
      result.push(0xc0 | (code >> 6));
      result.push(0x80 | (code & 0x3f));
    } else if (code < 0x10000) {
      result.push(0xe0 | (code >> 12));
      result.push(0x80 | ((code >> 6) & 0x3f));
      result.push(0x80 | (code & 0x3f));
    } else {
      result.push(0xf0 | (code >> 18));
      result.push(0x80 | ((code >> 12) & 0x3f));
      result.push(0x80 | ((code >> 6) & 0x3f));
      result.push(0x80 | (code & 0x3f));
    }
  }
  return result;
}

function utf8ArrayToString(input: Array<number>) {
  let result = '';
  for (let i = 0; i < input.length; ) {
    const a = input[i++];
    if ((a & 0x80) === 0) {
      result += String.fromCodePoint(a);
      continue;
    }

    const b = input[i++];
    if ((a & 0xe0) === 0xc0) {
      result += String.fromCodePoint(((a & 0x1f) << 6) | (b & 0x3f));
      continue;
    }

    const c = input[i++];
    if ((a & 0xf0) === 0xe0) {
      result += String.fromCodePoint(
        ((a & 0x0f) << 12) | ((b & 0x3f) << 6) | (c & 0x3f),
      );
      continue;
    }

    const d = input[i++];
    result += String.fromCodePoint(
      ((a & 0x07) << 18) | ((b & 0x3f) << 12) | ((c & 0x3f) << 6) | (d & 0x3f),
    );
  }

  return result;
}
