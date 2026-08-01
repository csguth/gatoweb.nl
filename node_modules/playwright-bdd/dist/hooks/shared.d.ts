/**
 * Shared stuff for worker and scenario hooks.
 * todo: move more functions here.
 */
import { TestTypeCommon } from '../playwright/types';
import { GeneralScenarioHook } from './scenario';
import { GeneralStepHook } from './step';
import { WorkerHook } from './worker';
/**
 * Options passed when creating constructor for hooks.
 */
export type HookConstructorOptions = {
    worldFixture?: string;
    customTest?: TestTypeCommon;
    defaultTags?: string;
};
export declare function setTagsExpression(hook: WorkerHook | GeneralScenarioHook | GeneralStepHook): void;
//# sourceMappingURL=shared.d.ts.map