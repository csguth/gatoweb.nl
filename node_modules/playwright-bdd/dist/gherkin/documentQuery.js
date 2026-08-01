"use strict";
/**
 * Helper to query data from loaded gherkin document.
 * See PICKLES.md.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GherkinDocumentQuery = void 0;
const AutofillMap_1 = require("../utils/AutofillMap");
class GherkinDocumentQuery {
    constructor(gherkinDocument) {
        this.gherkinDocument = gherkinDocument;
        this.astNodeIdsToPickles = new AutofillMap_1.AutofillMap();
        this.astNodeIdsToPickleSteps = new AutofillMap_1.AutofillMap();
        // Here, we could recursively iterate whole document
        // and map astNodeIds to actual steps / example rows,
        // to be able to quickly find ast step for pickle step astNodeIds.
        // But actually we already iterate whole document in testFile,
        // for now we just iterate pickles and build reverse map.
        this.mapAstNodeIdsToPickles();
        this.mapAstNodeIdsToPickleSteps();
    }
    get pickles() {
        return this.gherkinDocument.pickles;
    }
    hasPickles() {
        return this.pickles.length > 0;
    }
    // todo: returns strictly one pickle step!
    // getPickleStep(scenarioId: string, stepId: string, exampleRowId: string) {
    //   return null;
    // }
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
    getPickles(astNodeId) {
        return this.astNodeIdsToPickles.get(astNodeId) || [];
    }
    /**
     * Returns pickle steps for AstNodeId.
     * AstNodeId can represent here:
     * - bg step: maps to several pickle steps (in different pickles)
     * - scenario step: maps to single pickle step
     * - scenario outline step: maps to several pickle steps (for each example row)
     * - example row: maps to several pickle steps (for each scenario step)
     */
    getPickleSteps(astNodeId) {
        return this.astNodeIdsToPickleSteps.get(astNodeId) || [];
    }
    mapAstNodeIdsToPickles() {
        this.pickles.forEach((pickle) => {
            pickle.astNodeIds.forEach((astNodeId) => {
                this.astNodeIdsToPickles.getOrCreate(astNodeId, () => []).push(pickle);
            });
        });
    }
    mapAstNodeIdsToPickleSteps() {
        this.pickles.forEach((pickle) => {
            pickle.steps.forEach((pickleStep) => {
                pickleStep.astNodeIds.forEach((astNodeId) => {
                    this.astNodeIdsToPickleSteps.getOrCreate(astNodeId, () => []).push(pickleStep);
                });
            });
        });
    }
}
exports.GherkinDocumentQuery = GherkinDocumentQuery;
//# sourceMappingURL=documentQuery.js.map