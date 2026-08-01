"use strict";
/**
 * Worker-scoped fixtures added by playwright-bdd.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.test = void 0;
const test_1 = require("@playwright/test");
const env_1 = require("../config/env");
const worker_1 = require("../hooks/worker");
const loader_1 = require("../steps/loader");
// BDD fixtures prefixed with '$' to avoid collision with user's fixtures.
// Hide all BDD fixtures in reporter.
// 'box' option was added in PW 1.46,
// make type coercion to satisfy TS in early PW versions
const fixtureOptions = { scope: 'worker', box: true };
exports.test = test_1.test.extend({
    $workerInfo: [({}, use, $workerInfo) => use($workerInfo), fixtureOptions],
    $bddConfig: [
        async ({}, use, workerInfo) => {
            const bddConfig = getBddConfig(workerInfo.project.testDir);
            const { files } = await (0, loader_1.resolveStepFiles)(bddConfig.configDir, bddConfig.steps);
            await (0, loader_1.loadSteps)(files);
            await use(bddConfig);
        },
        fixtureOptions,
    ],
    $runBeforeAllHooks: [
        // Important unused dependency:
        // - $bddConfig: to load bdd config before hooks
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        async ({ $bddConfig }, use, $workerInfo) => {
            await use(async (test, customFixtures, bddFileData) => {
                // Collect worker hooks for all tests in the file
                // In fact, we could use only first test from bddFileData to get hooks,
                // b/c we require that all tests in the file have the same beforeAll hooks.
                // todo: filter out skipped tests
                const hooksToRun = new Map();
                const fixtures = { $workerInfo, ...customFixtures };
                bddFileData
                    .filter((bddTestData) => !bddTestData.skipped)
                    .forEach((bddTestData) => {
                    // eslint-disable-next-line max-nested-callbacks
                    (0, worker_1.getWorkerHooksToRun)('beforeAll', bddTestData.tags).forEach((hook) => {
                        hooksToRun.set(hook, { test, hook, fixtures });
                    });
                });
                await (0, worker_1.runWorkerHooks)(hooksToRun);
            });
        },
        fixtureOptions,
    ],
    // Execution of AfterAll hooks is different from BeforeAll hooks.
    // The main challenge is with tagged AfterAll hooks:
    // We can't detect when the last test for tagged AfterAll hook is executed,
    // especially when there are several test files in a worker or in fullyParallel mode.
    // The solution: collect and run all AfterAll hooks in worker teardown phase.
    // A list of afterAll hooks is populated from test.afterAll() call in each test file.
    $registerAfterAllHooks: [
        // Important unused dependency:
        // - $bddConfig: to load bdd config before hooks
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        async ({ $bddConfig }, use, $workerInfo) => {
            const hooksToRun = new Map();
            await use((test, customFixtures, bddFileData) => {
                const fixtures = { $workerInfo, ...customFixtures };
                bddFileData
                    .filter((bddTestData) => !bddTestData.skipped)
                    .forEach((bddTestData) => {
                    (0, worker_1.getWorkerHooksToRun)('afterAll', bddTestData.tags)
                        // eslint-disable-next-line max-nested-callbacks
                        .filter((hook) => !hooksToRun.has(hook))
                        // eslint-disable-next-line max-nested-callbacks
                        .forEach((hook) => hooksToRun.set(hook, { test, hook, fixtures }));
                });
            });
            // run AfterAll hooks in FILO order
            const reversedHooksToRun = new Map([...hooksToRun].reverse());
            await (0, worker_1.runWorkerHooks)(reversedHooksToRun);
        },
        fixtureOptions,
    ],
});
function getBddConfig(testDir) {
    const config = (0, env_1.getConfigFromEnv)(testDir);
    if (!config) {
        throw new Error(`BDD config not found for testDir: "${testDir}"`);
    }
    return config;
}
//# sourceMappingURL=bddWorkerFixtures.js.map