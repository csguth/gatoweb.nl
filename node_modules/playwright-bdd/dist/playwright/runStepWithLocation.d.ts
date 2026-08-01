/**
 * Run Playwright step with custom location.
 */
import { Location } from '@playwright/test/reporter';
import { TestTypeCommon } from './types';
export declare function runStepWithLocation(test: TestTypeCommon, stepText: string, location: Location, body: () => unknown): Promise<unknown>;
//# sourceMappingURL=runStepWithLocation.d.ts.map