/**
 * Helper to query data from loaded gherkin document.
 * See PICKLES.md.
 */
import * as messages from '@cucumber/messages';
import { GherkinDocumentWithPickles, PickleWithLocation } from './types';
export declare class GherkinDocumentQuery {
    private gherkinDocument;
    private astNodeIdsToPickles;
    private astNodeIdsToPickleSteps;
    constructor(gherkinDocument: GherkinDocumentWithPickles);
    get pickles(): PickleWithLocation[];
    hasPickles(): boolean;
    /**
     * Returns pickle for astNodeId.
     * Pickle is executable entity including background steps
     * and steps titles with substituted example values.
     *
     * AstNodeId can represent here:
     * - bg scenario: maps to several pickles
     * - scenario: maps to single pickle
     * - scenario outline: maps to several pickles (for each example row)
     * - example row: maps to single pickle
     */
    getPickles(astNodeId: string): PickleWithLocation[];
    /**
     * Returns pickle steps for AstNodeId.
     * AstNodeId can represent here:
     * - bg step: maps to several pickle steps (in different pickles)
     * - scenario step: maps to single pickle step
     * - scenario outline step: maps to several pickle steps (for each example row)
     * - example row: maps to several pickle steps (for each scenario step)
     */
    getPickleSteps(astNodeId: string): messages.PickleStep[];
    private mapAstNodeIdsToPickles;
    private mapAstNodeIdsToPickleSteps;
}
//# sourceMappingURL=documentQuery.d.ts.map