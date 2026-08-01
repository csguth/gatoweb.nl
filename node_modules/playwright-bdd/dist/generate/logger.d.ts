/**
 * Logging helper, separate from the main codebase.
 */
import { StepDefinition } from '../steps/stepDefinition';
import { Logger } from '../utils/logger';
import { TestFile } from './file';
export declare class TestFilesGeneratorLogger extends Logger {
    logLoadingFeatures(files: string[], finalPatterns: string[]): void;
    logLoadingSteps(files: string[], finalPatterns: string[]): void;
    logLoadedSteps(files: string[], stepDefinitions: StepDefinition[]): void;
    logGeneratedTestFiles(files: TestFile[]): void;
    logClearingOutputDir(pattern: string): void;
}
//# sourceMappingURL=logger.d.ts.map