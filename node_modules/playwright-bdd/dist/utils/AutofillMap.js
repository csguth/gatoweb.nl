"use strict";
/**
 * Extended Map that automatically creates item if it does not exist.
 * Usage:
 * const map = new AutofillMap<string, number[]>();
 * map.getOrCreate('key', () => []);
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutofillMap = void 0;
class AutofillMap extends Map {
    getOrCreate(key, createFn) {
        let item = this.get(key);
        if (!item) {
            item = createFn(key);
            this.set(key, item);
        }
        return item;
    }
}
exports.AutofillMap = AutofillMap;
//# sourceMappingURL=AutofillMap.js.map