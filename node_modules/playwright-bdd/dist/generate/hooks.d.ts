/**
 * Manage hooks for test file.
 *
 * For worker hooks we generate test.beforeAll() / test.afterAll() that call $runWorkerFixture
 * and pass all needed fixtures to it.
 *
 * For scenario hooks we generate test.beforeEach() / test.afterEach()
 * that call $runScenarioHooks and pass all needed fixtures to it.
 *
 * test.beforeEach('BeforeEach Hooks', ({ $runScenarioHooks, fixtureA, fixtureB }) => {
 *   return $runScenarioHooks('before', { fixtureA, fixtureB }));
 * });
 * test.afterEach('AfterEach Hooks', ({ $runScenarioHooks, fixtureC }) => {
 *   return $runScenarioHooks('after', { fixtureC });
 * });
 *
 * It's important to generate these test.beforeEach() / test.afterEach() separately from Background,
 * otherwise dependency fixtures will be nested under background in the report.
 *
 * Additionally, we generate test.use() code for $beforeEachFixtures/$afterEachFixtures,
 * that collect all custom fixtures used in scenario hooks in this file.
 *
 * PREVIOUSLY:
 * For scenario hooks we generate test.beforeEach() / test.afterEach()
 * that just reference $beforeEach/$afterEach fixtures,
 * to get them executed during fixtures setup and call scenario hooks:
 *
 * test.beforeEach('BeforeEach Hooks', ({ $beforeEach }) => {});
 * test.afterEach('AfterEach Hooks', ({ $afterEach }) => {});
 *
 * The approach is different for beforeAll/afterAll.
 * If we follow the same approach and call scenario hooks directly inside test.beforeEach,
 * them in case of error in hook, Playwright will execute Background steps.
 * See: https://github.com/microsoft/playwright/issues/33314
 *
 * We can solve it by checking testInfo.error in Background's beforeEach, and calling testInfo.skip() in case of error.
 * But in this case in the Playwright report Background's beforeEach is still displayed and marked as failed:
 * test.beforeEach('Background', async ({}, testInfo) => {
 *   if (testInfo.error) testInfo.skip();
 *   // ... bg steps
 * });
 *
 * Another option is to wrap whole Background code into if (!testInfo.error) { ... },
 * but in this case Background is also displayed in the report as passed,
 * although actually it was not executed.
 *
 */
import { ScenarioHookType } from '../hooks/scenario';
import { Formatter } from './formatter';
import { TestGen } from './test';
export declare class TestFileHooks {
    private formatter;
    private beforeAll;
    private afterAll;
    before: ScenarioHooks<"before">;
    after: ScenarioHooks<"after">;
    constructor(formatter: Formatter);
    fillFromTests(tests: TestGen[]): void;
    getCustomTestInstances(): Set<import("../playwright/types").TestTypeCommon>;
    getWorldFixtureNames(): Set<string>;
    render(): string[];
}
declare class ScenarioHooks<T extends ScenarioHookType> {
    private type;
    private formatter;
    private hooks;
    constructor(type: T, formatter: Formatter);
    registerHooksForTest(test: TestGen): void;
    getCustomTestInstances(): Set<import("../playwright/types").TestTypeCommon>;
    render(): string[];
    getWorldFixtureNames(): Set<string>;
}
export {};
//# sourceMappingURL=hooks.d.ts.map