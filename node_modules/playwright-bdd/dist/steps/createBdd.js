"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBdd = createBdd;
const bddTestFixtures_1 = require("../runtime/bddTestFixtures");
const testTypeImpl_1 = require("../playwright/testTypeImpl");
const exit_1 = require("../utils/exit");
const scenario_1 = require("../hooks/scenario");
const worker_1 = require("../hooks/worker");
const cucumberStyle_1 = require("./styles/cucumberStyle");
const playwrightStyle_1 = require("./styles/playwrightStyle");
const step_1 = require("../hooks/step");
// eslint-disable-next-line max-statements, visual/complexity, max-lines-per-function
function createBdd(customTest, options) {
    if (customTest === bddTestFixtures_1.test)
        customTest = undefined;
    if (customTest)
        assertTestHasBddFixtures(customTest);
    // hooks and steps have the same constructor options
    const ctorOptions = {
        customTest,
        worldFixture: options?.worldFixture,
        defaultTags: options?.tags,
    };
    const BeforeAll = (0, worker_1.workerHookFactory)('beforeAll', ctorOptions);
    const AfterAll = (0, worker_1.workerHookFactory)('afterAll', ctorOptions);
    const Before = (0, scenario_1.scenarioHookFactory)('before', ctorOptions);
    const After = (0, scenario_1.scenarioHookFactory)('after', ctorOptions);
    const BeforeStep = (0, step_1.stepHookFactory)('beforeStep', ctorOptions);
    const AfterStep = (0, step_1.stepHookFactory)('afterStep', ctorOptions);
    // aliases
    const [BeforeWorker, AfterWorker] = [BeforeAll, AfterAll];
    const [BeforeScenario, AfterScenario] = [Before, After];
    // cucumber-style
    if (options && 'worldFixture' in options && options.worldFixture) {
        if (!customTest) {
            (0, exit_1.exit)(`When using worldFixture, you should provide custom test to createBdd()`);
        }
        const Given = (0, cucumberStyle_1.cucumberStepCtor)('Given', ctorOptions);
        const When = (0, cucumberStyle_1.cucumberStepCtor)('When', ctorOptions);
        const Then = (0, cucumberStyle_1.cucumberStepCtor)('Then', ctorOptions);
        const Step = (0, cucumberStyle_1.cucumberStepCtor)('Unknown', ctorOptions);
        return {
            Given,
            When,
            Then,
            Step,
            BeforeAll,
            AfterAll,
            Before,
            After,
            BeforeWorker,
            AfterWorker,
            BeforeScenario,
            AfterScenario,
            BeforeStep,
            AfterStep,
        };
    }
    // playwright-style
    const Given = (0, playwrightStyle_1.playwrightStepCtor)('Given', ctorOptions);
    const When = (0, playwrightStyle_1.playwrightStepCtor)('When', ctorOptions);
    const Then = (0, playwrightStyle_1.playwrightStepCtor)('Then', ctorOptions);
    const Step = (0, playwrightStyle_1.playwrightStepCtor)('Unknown', ctorOptions);
    return {
        Given,
        When,
        Then,
        Step,
        BeforeAll,
        AfterAll,
        Before,
        After,
        BeforeWorker,
        AfterWorker,
        BeforeScenario,
        AfterScenario,
        BeforeStep,
        AfterStep,
    };
}
function assertTestHasBddFixtures(customTest) {
    if (!(0, testTypeImpl_1.isTestContainsSubtest)(customTest, bddTestFixtures_1.test)) {
        (0, exit_1.exit)(`createBdd() should use 'test' extended from "playwright-bdd"`);
    }
}
//# sourceMappingURL=createBdd.js.map