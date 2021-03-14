export type Base64String = string;

export function base64(i: string): Base64String {
  return Buffer.from(i, 'utf8').toString('base64');
}

export function unbase64(i: Base64String): string {
  return Buffer.from(i, 'base64').toString('utf8');
}
