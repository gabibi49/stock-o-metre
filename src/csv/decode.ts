export type DetectedEncoding = 'utf-8' | 'utf-8-bom' | 'utf-16le' | 'utf-16be' | 'windows-1252';

/**
 * Décode les octets du fichier en texte.
 *
 * 1. BOM UTF-8 (EF BB BF) ou UTF-16 → encodage indiqué par le BOM.
 * 2. Sinon, tentative en UTF-8 strict : si une séquence est invalide, le fichier
 *    n'est pas de l'UTF-8 et on le relit en Windows-1252 (export Excel / ERP sous
 *    Windows). Un fichier purement ASCII est identique dans les deux encodages.
 */
export function decodeBytes(bytes: Uint8Array): { text: string; encoding: DetectedEncoding } {
  if (bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
    return { text: new TextDecoder('utf-8').decode(bytes.subarray(3)), encoding: 'utf-8-bom' };
  }
  if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) {
    return { text: new TextDecoder('utf-16le').decode(bytes.subarray(2)), encoding: 'utf-16le' };
  }
  if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
    return { text: new TextDecoder('utf-16be').decode(bytes.subarray(2)), encoding: 'utf-16be' };
  }
  try {
    return { text: new TextDecoder('utf-8', { fatal: true }).decode(bytes), encoding: 'utf-8' };
  } catch {
    return { text: new TextDecoder('windows-1252').decode(bytes), encoding: 'windows-1252' };
  }
}
