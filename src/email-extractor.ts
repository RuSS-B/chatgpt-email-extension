const EMAIL_REGEX = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;

export class EmailExtractor {
  static extract(text: string): string[] {
    const matches = text.match(EMAIL_REGEX) || [];
    const seen = new Set<string>();

    return matches.filter((m) => {
      const k = m.toLowerCase();
      if (seen.has(k)) {
        return false;
      }

      seen.add(k);

      return true;
    });
  }
}
