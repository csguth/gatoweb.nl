"use strict";
/**
 * Logging helper, separate from the main codebase.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestFilesGeneratorLogger = void 0;
const logger_1 = require("../utils/logger");
const paths_1 = require("../utils/paths");
class TestFilesGeneratorLogger extends logger_1.Logger {
    logLoadingFeatures(files, finalPatterns) {
        if (!this.enabled)
            return;
        this.log(`Checking feature files at:`);
        finalPatterns.forEach((pattern) => this.log(`  - ${pattern}`));
        this.log(`Found feature files (${files.length}):`);
        files.forEach((featureFile) => this.log(`  - ${(0, paths_1.relativeToCwd)(featureFile)}`));
    }
    logLoadingSteps(files, finalPatterns) {
        if (!this.enabled)
            return;
        this.log(`Checking step files at:`);
        finalPatterns.forEach((pattern) => this.log(`  - ${pattern}`));
        this.log(`Found step files (${files.length}):`);
    }
    logLoadedSteps(files, stepDefinitions) {
        if (!this.enabled)
            return;
        files.forEach((stepFile) => {
            const normalizedStepFile = (0, paths_1.toPosixPath)(stepFile);
            const definitions = stepDefinitions.filter((definition) => (0, paths_1.toPosixPath)(definition.uri) === normalizedStepFile);
            const suffix = definitions.length === 1 ? 'step' : 'steps';
            this.log(`  - ${(0, paths_1.relativeToCwd)(stepFile)} (${definitions.length} ${suffix})`);
        });
    }
    logGeneratedTestFiles(files) {
        if (!this.enabled)
            return;
        this.log(`Generating Playwright test files (${files.length}):`);
        files.forEach((file) => this.log(`  - ${(0, paths_1.relativeToCwd)(file.outputPath)}`));
    }
    logClearingOutputDir(pattern) {
        this.log(`Clearing output directory: ${(0, paths_1.relativeToCwd)(pattern)}`);
    }
}
exports.TestFilesGeneratorLogger = TestFilesGeneratorLogger;
//# sourceMappingURL=logger.js.map