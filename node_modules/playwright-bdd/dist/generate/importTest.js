"use strict";
/**
 * Guess import test from by used steps.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportTestGuesser = void 0;
const testTypeImpl_1 = require("../playwright/testTypeImpl");
const exportedTest_1 = require("../steps/exportedTest");
const exit_1 = require("../utils/exit");
// todo: refactor to fill this class in-place, instead of collecting data
class ImportTestGuesser {
    // eslint-disable-next-line max-params
    constructor(featureUri, usedStepDefinitions, usedDecoratorFixtures, customTestsFromHooks) {
        this.featureUri = featureUri;
        this.usedStepDefinitions = usedStepDefinitions;
        this.usedDecoratorFixtures = usedDecoratorFixtures;
        this.customTestsSet = new Set([...customTestsFromHooks]);
    }
    guess() {
        this.fillCustomTestsFromRegularSteps();
        this.fillCustomTestsFromDecoratorSteps();
        if (!this.hasCustomTests())
            return;
        if ((0, exportedTest_1.getExportedTestsCount)() === 0)
            this.throwCantGuessError();
        // topmostTest must exist as we checked tests count above
        const topmostTest = this.findTopmostTest();
        const { file, varName } = this.getExportedTestInfo(topmostTest);
        return { file, varName };
    }
    fillCustomTestsFromRegularSteps() {
        this.usedStepDefinitions.forEach(({ customTest }) => {
            if (customTest)
                this.customTestsSet.add(customTest);
        });
    }
    fillCustomTestsFromDecoratorSteps() {
        this.usedDecoratorFixtures.forEach((fixtureName) => {
            const exportedTest = (0, exportedTest_1.findExportedTestWithFixture)(fixtureName);
            if (!exportedTest) {
                (0, exit_1.exit)(`Can't guess test instance for decorator fixture "${fixtureName}".`, `Please ensure that "${fixtureName}" is defined in test.extend()`, `and "steps" pattern in config covers files with decorator steps.`);
            }
            this.customTestsSet.add(exportedTest.testInstance);
        });
    }
    hasCustomTests() {
        return this.customTestsSet.size > 0;
    }
    findTopmostTest() {
        const customTests = [...this.customTestsSet];
        let topmostTest = customTests[0];
        for (let i = 1; i < customTests.length; i++) {
            const customTest = customTests[i];
            const higherTest = selectHigherTestInstance(topmostTest, customTest);
            // todo: uncomment for noUncheckedIndexedAccess
            // const higherTest =
            //   topmostTest && customTest
            //     ? selectHigherTestInstance(topmostTest, customTest)
            //     : topmostTest || customTest;
            if (!higherTest) {
                (0, exit_1.exit)(`Can't guess test instance for: ${this.featureUri}.`, `Found ${customTests.length} test instances, but they should extending each other.`, `Please check BDD configuration "steps" or set "importTestFrom" manually.`);
            }
            topmostTest = higherTest;
        }
        return topmostTest;
    }
    getExportedTestInfo(customTest) {
        const info = (0, exportedTest_1.getExportedTestInfo)(customTest);
        if (!info)
            this.throwCantGuessError();
        return info;
    }
    throwCantGuessError() {
        (0, exit_1.exit)(`Can't guess test instance for: ${this.featureUri}.`, `Your tests use custom test instance, produced by base.extend().`, `Please check that:\n`, `- fixtures file exports "test" variable\n`, `- fixtures file is included in BDD configuration "steps" option\n`, `If it does not help, try to set "importTestFrom" option manually.`);
    }
}
exports.ImportTestGuesser = ImportTestGuesser;
function selectHigherTestInstance(test1, test2) {
    if ((0, testTypeImpl_1.isTestContainsSubtest)(test1, test2))
        return test1;
    if ((0, testTypeImpl_1.isTestContainsSubtest)(test2, test1))
        return test2;
    // Provided tests are not in parent-child relation
}
//# sourceMappingURL=importTest.js.map