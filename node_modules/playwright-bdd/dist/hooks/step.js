"use strict";
/**
 * Step level hooks: BeforeStep / AfterStep.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.stepHookFactory = stepHookFactory;
exports.runStepHooks = runStepHooks;
exports.getStepHooksFixtureNames = getStepHooksFixtureNames;
exports.getStepHooksToRun = getStepHooksToRun;
const utils_1 = require("../utils");
const getLocationInFile_1 = require("../playwright/getLocationInFile");
const runStepWithLocation_1 = require("../playwright/runStepWithLocation");
const bddTestFixturesAuto_1 = require("../runtime/bddTestFixturesAuto");
const shared_1 = require("./shared");
const fixtureParameterNames_1 = require("../playwright/fixtureParameterNames");
const stepHooks = [];
/**
 * Returns BeforeStep() / AfterStep() functions.
 */
function stepHookFactory(type, { customTest, defaultTags, worldFixture }) {
    return (...args) => {
        addHook({
            type,
            options: getOptionsFromArgs(args),
            fn: getFnFromArgs(args),
            // offset = 3 b/c this call is 3 steps below the user's code
            location: (0, getLocationInFile_1.getLocationByOffset)(3),
            customTest,
            defaultTags,
            worldFixture,
        });
    };
}
// eslint-disable-next-line visual/complexity
async function runStepHooks(hooks, world, fixtures) {
    let error;
    for (const hook of hooks) {
        try {
            await runStepHook(hook, world, fixtures);
        }
        catch (e) {
            if (hook.type === 'beforeStep')
                throw e;
            if (!error)
                error = e;
        }
    }
    if (error)
        throw error;
}
// todo: join with getScenarioHooksFixtureNames(),
// make universal function getHooksFixtureNames()
function getStepHooksFixtureNames(hooks) {
    const fixtureNames = new Set();
    hooks.forEach((hook) => {
        const hookFixtureNames = (0, fixtureParameterNames_1.fixtureParameterNames)(hook.fn);
        hookFixtureNames.forEach((fixtureName) => fixtureNames.add(fixtureName));
    });
    return [...fixtureNames].filter((name) => !(0, bddTestFixturesAuto_1.isBddAutoInjectFixture)(name));
}
async function runStepHook(hook, world, fixtures) {
    const hookFn = wrapHookFnWithTimeout(hook, world, fixtures);
    const stepTitle = hook.options.name;
    // wrap hookFn call into test.step() only if user provided a name for the hook,
    // otherwise run as is to avoid extra level in the steps structure.
    if (stepTitle) {
        await (0, runStepWithLocation_1.runStepWithLocation)(fixtures.$bddContext.test, stepTitle, hook.location, hookFn);
    }
    else {
        await hookFn();
    }
}
function getStepHooksToRun(type, tags = []) {
    return stepHooks
        .filter((hook) => hook.type === type)
        .filter((hook) => !hook.tagsExpression || hook.tagsExpression.evaluate(tags));
}
/**
 * Wraps hook fn with timeout.
 */
function wrapHookFnWithTimeout(hook, world, fixtures) {
    const { timeout } = hook.options;
    return async () => {
        await (0, utils_1.callWithTimeout)(() => hook.fn.call(world, fixtures), timeout, getTimeoutMessage(hook));
    };
}
function getOptionsFromArgs(args) {
    if (typeof args[0] === 'string')
        return { tags: args[0] };
    if (typeof args[0] === 'object')
        return args[0];
    return {};
}
function getFnFromArgs(args) {
    return args.length === 1 ? args[0] : args[1];
}
function addHook(hook) {
    (0, shared_1.setTagsExpression)(hook);
    stepHooks.push(hook);
}
function getTimeoutMessage(hook) {
    const { timeout, name: hookName } = hook.options;
    return `${hook.type} hook ${hookName ? `"${hookName}" ` : ''}timeout (${timeout} ms)`;
}
//# sourceMappingURL=step.js.map