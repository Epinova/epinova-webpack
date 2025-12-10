import { expect } from 'vitest';
import serializer from 'jest-serializer-path';

// Add path serializer globally to normalize paths in snapshots
// This makes snapshots platform-independent
expect.addSnapshotSerializer(serializer);

// Helper function to recursively remove Symbol properties from objects
// This is needed because Sass includes non-deterministic Symbol(identityHashCode) properties
function removeSymbolProperties(obj: unknown): unknown {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(removeSymbolProperties);
    }

    const result: Record<string, unknown> = {};
    for (const key of Object.keys(obj as Record<string, unknown>)) {
        // Skip keys that look like serialized Symbol properties
        if (key.includes('Symbol(identityHashCode)')) {
            continue;
        }
        result[key] = removeSymbolProperties(
            (obj as Record<string, unknown>)[key]
        );
    }

    // Also remove actual Symbol properties
    for (const sym of Object.getOwnPropertySymbols(obj)) {
        // Skip - we don't want symbols in snapshots
    }

    return result;
}

// Custom serializer to strip Symbol(identityHashCode) properties from Sass objects
expect.addSnapshotSerializer({
    test: (val): val is object =>
        typeof val === 'object' &&
        val !== null &&
        (Object.getOwnPropertySymbols(val).some((s) =>
            s.toString().includes('identityHashCode')
        ) ||
            Object.keys(val).some((k) =>
                k.includes('Symbol(identityHashCode)')
            )),
    print: (val, serialize) => {
        return serialize(removeSymbolProperties(val));
    },
});
