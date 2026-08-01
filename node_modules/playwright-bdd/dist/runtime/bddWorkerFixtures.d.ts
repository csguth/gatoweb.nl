/**
 * Worker-scoped fixtures added by playwright-bdd.
 */
import { BDDConfig } from '../config/types';
import { WorkerInfo } from '@playwright/test';
import { BddFileData } from '../bddData/types';
import { TestTypeCommon } from '../playwright/types';
type WorkerHooksFixture = (test: TestTypeCommon, fixtures: Record<string, unknown>, bddFileData: BddFileData) => unknown;
export type BddWorkerFixtures = {
    $workerInfo: WorkerInfo;
    $bddConfig: BDDConfig;
    $runBeforeAllHooks: WorkerHooksFixture;
    $registerAfterAllHooks: WorkerHooksFixture;
};
export declare const test: import("@playwright/test").TestType<import("@playwright/test").PlaywrightTestArgs & import("@playwright/test").PlaywrightTestOptions, import("@playwright/test").PlaywrightWorkerArgs & import("@playwright/test").PlaywrightWorkerOptions & BddWorkerFixtures>;
export {};
//# sourceMappingURL=bddWorkerFixtures.d.ts.map