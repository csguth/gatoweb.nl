/**
 * Extended Map that automatically creates item if it does not exist.
 * Usage:
 * const map = new AutofillMap<string, number[]>();
 * map.getOrCreate('key', () => []);
 */
export declare class AutofillMap<K, V> extends Map<K, V> {
    getOrCreate(key: K, createFn: (key: K) => V): V;
}
//# sourceMappingURL=AutofillMap.d.ts.map