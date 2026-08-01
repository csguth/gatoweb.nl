"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPlaywrightTestInstance = isPlaywrightTestInstance;
exports.isTestContainsSubtest = isTestContainsSubtest;
exports.isTestContainsFixture = isTestContainsFixture;
/**
 * Helpers to deal with Playwright test internal stuff.
 * See: https://github.com/microsoft/playwright/blob/main/packages/playwright-test/src/common/testType.ts
 */
const test_1 = require("@playwright/test");
const utils_1 = require("../utils");
const testTypeSymbol = (0, utils_1.getSymbolByName)(test_1.test, 'testType');
/**
 * Returns test fixtures using Symbol.
 */
function getTestFixtures(test) {
    return getTestImpl(test).fixtures;
}
function getTestImpl(test) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return test[testTypeSymbol];
}
function isPlaywrightTestInstance(value) {
    return typeof value === 'function' && getTestImpl(value);
}
/**
 * Returns true if test contains all fixtures of subtest.
 * - test was extended from subtest
 * - test is a result of mergeTests(subtest, ...)
 */
function isTestContainsSubtest(test, subtest) {
    if (test === subtest)
        return true;
    const testFixtures = new Set(getTestFixtures(test).map((f) => locationToString(f.location)));
    return getTestFixtures(subtest).every((f) => {
        return testFixtures.has(locationToString(f.location));
    });
}
function isTestContainsFixture(test, fixtureName) {
    for (const { fixtures } of getTestFixtures(test)) {
        if (Object.hasOwn(fixtures, fixtureName))
            return true;
    }
}
function locationToString({ file, line, column }) {
    return `${file}:${line}:${column}`;
}
//# sourceMappingURL=testTypeImpl.js.map