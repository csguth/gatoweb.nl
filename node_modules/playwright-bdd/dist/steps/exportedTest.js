"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerExportedTests = registerExportedTests;
exports.getExportedTestInfo = getExportedTestInfo;
exports.getExportedTestsCount = getExportedTestsCount;
exports.findExportedTestWithFixture = findExportedTestWithFixture;
const testTypeImpl_1 = require("../playwright/testTypeImpl");
const exportedTests = new Map();
function registerExportedTests(file, exportsObj) {
    const fileExportedTests = [];
    for (const [varName, testInstance] of Object.entries(exportsObj)) {
        if (!(0, testTypeImpl_1.isPlaywrightTestInstance)(testInstance))
            continue;
        const exportedTest = { testInstance, file, varName };
        fileExportedTests.push(exportedTest);
        if (!exportedTests.has(testInstance)) {
            exportedTests.set(testInstance, exportedTest);
        }
    }
    return fileExportedTests;
}
function getExportedTestInfo(customTest) {
    return exportedTests.get(customTest);
}
function getExportedTestsCount() {
    return exportedTests.size;
}
function findExportedTestWithFixture(fixtureName) {
    for (const [testInstance, exportedTest] of exportedTests.entries()) {
        if ((0, testTypeImpl_1.isTestContainsFixture)(testInstance, fixtureName)) {
            return exportedTest;
        }
    }
}
//# sourceMappingURL=exportedTest.js.map