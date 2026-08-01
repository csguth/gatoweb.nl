/**
 * Extracts BDD data from test file.
 */
import { BddTestData } from './types';
export declare class BddDataExtractor {
    private filePath;
    private lines;
    constructor(filePath: string, content: string);
    extract(): BddTestData[];
    /**
     * Extract feature uri from the generated test file.
     * // Generated from: <feature uri>
     *
     * todo: maybe move to another module.
     */
    extractFeatureUri(): string;
    private findStartIndex;
    private findEndIndex;
    private extractBddTestData;
}
//# sourceMappingURL=extractor.d.ts.map