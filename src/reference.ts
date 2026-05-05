export interface LineRange {
    start: number; // 1-based inclusive
    end: number;   // 1-based inclusive
}

export type Format = 'words' | 'colon';

export function normalizeRanges(ranges: LineRange[]): LineRange[] {
    if (ranges.length === 0) {return [];}
    const sorted = ranges.map(r => ({ start: Math.min(r.start, r.end), end: Math.max(r.start, r.end) }))
        .sort((a, b) => a.start - b.start);
    const merged: LineRange[] = [{ ...sorted[0] }];
    for (let i = 1; i < sorted.length; i++) {
        const last = merged[merged.length - 1];
        const curr = sorted[i];
        if (curr.start <= last.end + 1) {
            last.end = Math.max(last.end, curr.end);
        } else {
            merged.push({ ...curr });
        }
    }
    return merged;
}

function rangeStr(r: LineRange): string {
    return r.start === r.end ? `${r.start}` : `${r.start}-${r.end}`;
}

export function formatReference(fileName: string, ranges: LineRange[], format: Format = 'words'): string {
    const normalized = normalizeRanges(ranges);
    if (normalized.length === 0) {return fileName;}

    if (format === 'colon') {
        return `${fileName}:${normalized.map(rangeStr).join(', ')}`;
    }

    if (normalized.length === 1) {
        const r = normalized[0];
        return r.start === r.end
            ? `${fileName} line ${r.start}`
            : `${fileName} lines ${r.start}-${r.end}`;
    }

    return `${fileName} lines ${normalized.map(rangeStr).join(', ')}`;
}
