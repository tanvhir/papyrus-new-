import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function preserveSpaces(html: string | undefined): string {
  if (!html) return '';
  let result = '';
  let inTag = false;
  let spaceCount = 0;
  
  for (let i = 0; i < html.length; i++) {
    const char = html[i];
    if (char === '<') {
      if (spaceCount > 0) {
        result += '\u00a0'.repeat(spaceCount);
        spaceCount = 0;
      }
      inTag = true;
      result += char;
    } else if (char === '>') {
      inTag = false;
      result += char;
    } else if (inTag) {
      result += char;
    } else {
      if (char === ' ') {
        spaceCount++;
      } else {
        if (spaceCount > 0) {
          if (spaceCount === 1) {
            result += ' ';
          } else {
            result += '\u00a0'.repeat(spaceCount);
          }
          spaceCount = 0;
        }
        result += char;
      }
    }
  }
  if (spaceCount > 0) {
    if (spaceCount === 1) {
      result += ' ';
    } else {
      result += '\u00a0'.repeat(spaceCount);
    }
  }
  return result;
}
