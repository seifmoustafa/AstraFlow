export function extractBulletsUnderHeading(
  markdown: string,
  headingText: string,
): string[] {
  const lines = markdown.split('\n');
  const escaped = headingText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const startRegex = new RegExp(`^##+\\s+${escaped}\\s*$`, 'i');

  let insideSection = false;
  const bullets: string[] = [];
  for (const line of lines) {
    if (startRegex.test(line.trim())) {
      insideSection = true;
      continue;
    }
    if (insideSection && /^##+\s+/.test(line.trim())) break;
    if (!insideSection) continue;

    const match = line.match(/^\s*(?:-\s+\[[ xX]\]\s+|-|\d+\.)\s+(.*)$/);
    if (match) {
      bullets.push(
        match[1]
          .replace(/`([^`]+)`/g, '$1')
          .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
          .trim(),
      );
    }
  }
  return bullets;
}
