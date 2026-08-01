/**
 * Worker-level hooks: BeforeAll / AfterAll.
 */
import { WorkerInfo } from '@playwright/test';
import { KeyValue, PlaywrightLocation, TestTypeCommon } from '../playwright/types';
import { HookConstructorOptions } from './shared';
import { TagsExpression } from '../steps/tags';
export type WorkerHookType = 'beforeAll' | 'afterAll';
type WorkerHookOptions = {
    name?: string;
    tags?: string;
    timeout?: number;
};
type WorkerHookFixtures = {
    $workerInfo: WorkerInfo;
    [key: string]: unknown;
};
type WorkerHookFn<Fixtures> = (fixtures: Fixtures) => unknown;
export type WorkerHook<Fixtures = object> = {
    type: WorkerHookType;
    options: WorkerHookOptions;
    fn: WorkerHookFn<Fixtures>;
    tagsExpression?: TagsExpression;
    location: PlaywrightLocation;
    customTest?: TestTypeCommon;
    defaultTags?: string;
    executed?: boolean;
};
export type WorkerHookRunInfo = {
    test: TestTypeCommon;
    hook: WorkerHook;
    fixtures: WorkerHookFixtures;
};
/**
 * When calling BeforeAll() / AfterAll() you can pass:
 * 1. hook fn
 * 2. options object + hook fn
 *
 * See: https://github.com/cucumber/cucumber-js/blob/main/docs/support_files/api_reference.md#afteralloptions-fn
 */
type WorkerHookDefinitionArgs<Fixtures> = [WorkerHookFn<Fixtures>] | [WorkerHookOptions, WorkerHookFn<Fixtures>];
/**
 * Returns BeforeAll() / AfterAll() functions.
 */
export declare function workerHookFactory<Fixtures extends KeyValue>(type: WorkerHookType, { customTest, defaultTags }: HookConstructorOptions): (...args: WorkerHookDefinitionArgs<Fixtures>) => void;
export declare function runWorkerHooks(hooksRunInfo: Map<WorkerHook, WorkerHookRunInfo>): Promise<void>;
export declare function getWorkerHooksToRun(type: WorkerHookType, tags: string[]): WorkerHook<object>[];
export declare function getWorkerHooksFixtureNames(hooks: WorkerHook[]): string[];
export {};
//# sourceMappingURL=worker.d.ts.map