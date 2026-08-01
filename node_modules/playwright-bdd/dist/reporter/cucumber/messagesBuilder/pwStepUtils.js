"use strict";
/**
 * Utility functions for filtering Playwright steps.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHooksRootPwStep = getHooksRootPwStep;
exports.walkSteps = walkSteps;
exports.findDeepestStepWith = findDeepestStepWith;
exports.isUnknownDuration = isUnknownDuration;
exports.findParentWith = findParentWith;
exports.areTestErrorsEqual = areTestErrorsEqual;
exports.isTopLevelStep = isTopLevelStep;
exports.isSkippedError = isSkippedError;
const utils_1 = require("../../../utils");
/**
 * Returns root step for Before Hooks / After Hooks.
 * Strings 'Before Hooks' and 'After Hooks' are hardcoded in Playwright.
 * See: https://github.com/microsoft/playwright/blob/release-1.49/packages/playwright/src/worker/workerMain.ts#L336
 */
function getHooksRootPwStep(result, type) {
    const rootStepTitle = type === 'before' ? 'Before Hooks' : 'After Hooks';
    return result.steps.find((step) => step.category === 'hook' && step.title === rootStepTitle);
}
/**
 * Traverse steps tree per shouldEnter fn, starting from root.
 * Returns flat list of steps.
 * Graph traversal is done in BFS manner.
 */
function walkSteps(root, shouldEnter = () => true) {
    const result = [];
    let curSteps = (0, utils_1.toArray)(root);
    while (curSteps.length) {
        const nextSteps = [];
        curSteps.forEach((pwStep) => {
            if (shouldEnter(pwStep)) {
                result.push(pwStep);
                nextSteps.push(...(pwStep.steps || []));
            }
        });
        curSteps = nextSteps;
    }
    return result;
}
/**
 * Finds the deepest step that satisfies predicate function.
 */
function findDeepestStepWith(pwSteps, predicate) {
    let result;
    let maxLevel = -1;
    pwSteps.forEach((pwStep) => {
        if (!predicate(pwStep))
            return;
        const level = getStepLevel(pwStep);
        if (level > maxLevel) {
            maxLevel = level;
            result = pwStep;
        }
    });
    return result;
}
function isUnknownDuration(pwStep) {
    return pwStep.duration === -1;
}
function findParentWith(pwStep, predicate) {
    let parent = pwStep.parent;
    while (parent) {
        if (predicate(parent))
            return parent;
        parent = parent.parent;
    }
}
function getStepLevel(pwStep) {
    let level = 0;
    let parent = pwStep.parent;
    while (parent) {
        level += 1;
        parent = parent.parent;
    }
    return level;
}
function areTestErrorsEqual(e1, e2) {
    // don't check location as it's object
    const keys = ['message', 'stack', 'value'];
    return keys.every((key) => e1[key] === e2[key]);
}
function isTopLevelStep(pwStep) {
    return !pwStep.parent;
}
/**
 * When calling test.skip() in Playwright test, it throws an error with message:
 * "Test is skipped".
 * This error exists in step, but it is not a real error, it is a skipped step.
 * See: https://github.com/microsoft/playwright/blob/main/packages/playwright/src/worker/testInfo.ts#L223
 */
function isSkippedError(error) {
    return Boolean(error?.message?.includes('Test is skipped:'));
}
//# sourceMappingURL=pwStepUtils.js.map