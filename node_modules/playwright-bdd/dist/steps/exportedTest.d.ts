/**
 * Handles exported tests to guess which test instance to use in spec files.
 */
import { TestTypeCommon } from '../playwright/types';
type ExportedTestInfo = {
    testInstance: TestTypeCommon;
    file: string;
    varName: string;
};
export declare function registerExportedTests(file: string, exportsObj: Record<string, unknown>): ExportedTestInfo[];
export declare function getExportedTestInfo(customTest: TestTypeCommon): ExportedTestInfo | undefined;
export declare function getExportedTestsCount(): number;
export declare function findExportedTestWithFixture(fixtureName: string): ExportedTestInfo | undefined;
export {};
//# sourceMappingURL=exportedTest.d.ts.map