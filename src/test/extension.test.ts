import * as assert from 'assert';
import { normalizeRanges, formatReference } from '../reference';

suite('normalizeRanges', () => {
    test('empty input returns empty', () => {
        assert.deepStrictEqual(normalizeRanges([]), []);
    });

    test('single range passes through', () => {
        assert.deepStrictEqual(normalizeRanges([{ start: 5, end: 10 }]), [{ start: 5, end: 10 }]);
    });

    test('reversed range is normalized', () => {
        assert.deepStrictEqual(normalizeRanges([{ start: 10, end: 5 }]), [{ start: 5, end: 10 }]);
    });

    test('overlapping ranges are merged', () => {
        assert.deepStrictEqual(
            normalizeRanges([{ start: 5, end: 10 }, { start: 8, end: 15 }]),
            [{ start: 5, end: 15 }]
        );
    });

    test('adjacent ranges are merged', () => {
        assert.deepStrictEqual(
            normalizeRanges([{ start: 5, end: 10 }, { start: 11, end: 15 }]),
            [{ start: 5, end: 15 }]
        );
    });

    test('non-adjacent ranges are kept separate', () => {
        assert.deepStrictEqual(
            normalizeRanges([{ start: 5, end: 8 }, { start: 20, end: 25 }]),
            [{ start: 5, end: 8 }, { start: 20, end: 25 }]
        );
    });

    test('duplicate single-line ranges deduplicate', () => {
        assert.deepStrictEqual(
            normalizeRanges([{ start: 5, end: 5 }, { start: 5, end: 5 }]),
            [{ start: 5, end: 5 }]
        );
    });

    test('unsorted ranges are sorted before merge', () => {
        assert.deepStrictEqual(
            normalizeRanges([{ start: 20, end: 25 }, { start: 5, end: 8 }]),
            [{ start: 5, end: 8 }, { start: 20, end: 25 }]
        );
    });
});

suite('formatReference — words format', () => {
    test('single-line selection', () => {
        assert.strictEqual(
            formatReference('example.ts', [{ start: 22, end: 22 }]),
            'example.ts line 22'
        );
    });

    test('multi-line selection', () => {
        assert.strictEqual(
            formatReference('example.ts', [{ start: 22, end: 23 }]),
            'example.ts lines 22-23'
        );
    });

    test('no-selection / cursor-only (same as single-line)', () => {
        assert.strictEqual(
            formatReference('example.ts', [{ start: 22, end: 22 }]),
            'example.ts line 22'
        );
    });

    test('partial-line selection on one line outputs line number only', () => {
        assert.strictEqual(
            formatReference('example.ts', [{ start: 22, end: 22 }]),
            'example.ts line 22'
        );
    });

    test('multi-cursor on separate lines merges into one reference', () => {
        assert.strictEqual(
            formatReference('example.ts', [{ start: 5, end: 5 }, { start: 20, end: 20 }]),
            'example.ts lines 5, 20'
        );
    });

    test('multi-cursor with overlapping ranges deduplicates', () => {
        assert.strictEqual(
            formatReference('example.ts', [{ start: 5, end: 10 }, { start: 8, end: 15 }]),
            'example.ts lines 5-15'
        );
    });

    test('multi-cursor on adjacent ranges merges', () => {
        assert.strictEqual(
            formatReference('example.ts', [{ start: 5, end: 10 }, { start: 11, end: 15 }]),
            'example.ts lines 5-15'
        );
    });
});

suite('formatReference — colon format', () => {
    test('single line', () => {
        assert.strictEqual(
            formatReference('example.ts', [{ start: 22, end: 22 }], 'colon'),
            'example.ts:22'
        );
    });

    test('multi-line range', () => {
        assert.strictEqual(
            formatReference('example.ts', [{ start: 22, end: 23 }], 'colon'),
            'example.ts:22-23'
        );
    });

    test('multiple non-adjacent ranges', () => {
        assert.strictEqual(
            formatReference('example.ts', [{ start: 5, end: 8 }, { start: 20, end: 25 }], 'colon'),
            'example.ts:5-8, 20-25'
        );
    });
});
