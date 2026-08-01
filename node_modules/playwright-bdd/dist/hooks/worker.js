"use strict";
/**
 * Worker-level hooks: BeforeAll / AfterAll.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.workerHookFactory = workerHookFactory;
exports.runWorkerHooks = runWorkerHooks;
exports.getWorkerHooksToRun = getWorkerHooksToRun;
exports.getWorkerHooksFixtureNames = getWorkerHooksFixtureNames;
const fixtureParameterNames_1 = require("../playwright/fixtureParameterNames");
const utils_1 = require("../utils");
const getLocationInFile_1 = require("../playwright/getLocationInFile");
const runStepWithLocation_1 = require("../playwright/runStepWithLocation");
const shared_1 = require("./shared");
const workerHooks = [];
/**
 * Returns BeforeAll() / AfterAll() functions.
 */
function workerHookFactory(type, { customTest, defaultTags }) {
    return (...args) => {
        addHook({
            type,
            options: getOptionsFromArgs(args),
            fn: getFnFromArgs(args),
            // offset = 3 b/c this call is 3 steps below the user's code
            location: (0, getLocationInFile_1.getLocationByOffset)(3),
            customTest,
            defaultTags,
        });
    };
}
// eslint-disable-next-line visual/complexity
async function runWorkerHooks(hooksRunInfo) {
    let error;
    for (const runInfo of hooksRunInfo.values()) {
        try {
            await runWorkerHook(runInfo);
        }
        catch (e) {
            if (runInfo.hook.type === 'beforeAll')
                throw e;
            if (!error)
                error = e;
        }
    }
    if (error)
        throw error;
}
async function runWorkerHook({ test, hook, fixtures }) {
    if (hook.executed)
        return;
    hook.executed = true;
    const hookFn = wrapHookFnWithTimeout(hook, fixtures);
    const stepTitle = getHookStepTitle(hook);
    // test.step() is not available for afterAll hooks.
    // See: https://github.com/microsoft/playwright/issues/33750
    // So all afterAll hooks are called under AfterAll step (with type = 'hook' in reporter)
    if (hook.type === 'beforeAll') {
        await (0, runStepWithLocation_1.runStepWithLocation)(test, stepTitle, hook.location, hookFn);
    }
    else {
        await hookFn();
    }
}
function getWorkerHooksToRun(type, tags) {
    return workerHooks
        .filter((hook) => hook.type === type)
        .filter((hook) => !hook.tagsExpression || hook.tagsExpression.evaluate(tags));
}
function getWorkerHooksFixtureNames(hooks) {
    const fixtureNames = new Set();
    hooks.forEach((hook) => {
        (0, fixtureParameterNames_1.fixtureParameterNames)(hook.fn).forEach((fixtureName) => fixtureNames.add(fixtureName));
    });
    return [...fixtureNames];
}
/**
 * Wraps hook fn with timeout.
 */
function wrapHookFnWithTimeout(hook, fixtures) {
    const { timeout } = hook.options;
    return async () => {
        await (0, utils_1.callWithTimeout)(
        // call with null to avoid using 'this' inside worker hook
        () => hook.fn.call(null, fixtures), timeout, getTimeoutMessage(hook));
    };
}
function getOptionsFromArgs(args) {
    if (typeof args[0] === 'object')
        return args[0];
    return {};
}
function getFnFromArgs(args) {
    return args.length === 1 ? args[0] : args[1];
}
function addHook(hook) {
    (0, shared_1.setTagsExpression)(hook);
    workerHooks.push(hook);
}
function getTimeoutMessage(hook) {
    const { timeout } = hook.options;
    return `${hook.type} hook timeout (${timeout} ms)`;
}
function getHookStepTitle(hook) {
    return hook.options.name || (hook.type === 'beforeAll' ? 'BeforeAll hook' : 'AfterAll hook');
}
//# sourceMappingURL=worker.js.map