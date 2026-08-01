"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _TestCase_pickle, _TestCase_projectInfo;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestCase = void 0;
class TestCase {
    constructor(id, gherkinDocuments, testRunStartedId) {
        this.id = id;
        this.gherkinDocuments = gherkinDocuments;
        this.testRunStartedId = testRunStartedId;
        _TestCase_pickle.set(this, void 0);
        _TestCase_projectInfo.set(this, void 0);
        this.beforeHooks = new Map();
        this.afterHooks = new Map();
        // in test case there are also hook steps, they are not included in this list
        this.steps = [];
    }
    get projectInfo() {
        if (!__classPrivateFieldGet(this, _TestCase_projectInfo, "f"))
            throw new Error(`Empty projectInfo for testCase: ${this.id}`);
        return __classPrivateFieldGet(this, _TestCase_projectInfo, "f");
    }
    get pickle() {
        if (!__classPrivateFieldGet(this, _TestCase_pickle, "f"))
            throw new Error(`Empty pickle for testCase: ${this.id}`);
        return __classPrivateFieldGet(this, _TestCase_pickle, "f");
    }
    addRun(testCaseRun) {
        if (!__classPrivateFieldGet(this, _TestCase_projectInfo, "f"))
            __classPrivateFieldSet(this, _TestCase_projectInfo, testCaseRun.projectInfo, "f");
        this.addHooks(testCaseRun, 'before');
        this.addHooks(testCaseRun, 'after');
        if (!__classPrivateFieldGet(this, _TestCase_pickle, "f")) {
            __classPrivateFieldSet(this, _TestCase_pickle, this.findPickle(testCaseRun), "f");
            this.createStepsFromPickle(__classPrivateFieldGet(this, _TestCase_pickle, "f"));
        }
        this.addStepsArgumentsLists(testCaseRun);
    }
    getHooks(hookType) {
        return hookType == 'before' ? this.beforeHooks : this.afterHooks;
    }
    getSteps() {
        return this.steps;
    }
    buildMessage() {
        const testSteps = [
            ...Array.from(this.beforeHooks.values()).map((hook) => hook.testStep),
            ...(this.steps || []),
            ...Array.from(this.afterHooks.values()).map((hook) => hook.testStep),
        ];
        const testCase = {
            testRunStartedId: this.testRunStartedId,
            id: this.id,
            pickleId: this.pickle.id,
            testSteps,
        };
        return { testCase };
    }
    /**
     * We collect hooks from all runs of this test case, avoiding duplicates.
     */
    addHooks(testCaseRun, hookType) {
        const testCaseHooks = hookType === 'before' ? this.beforeHooks : this.afterHooks;
        const testCaseRunHooks = testCaseRun.getExecutedHooks(hookType);
        testCaseRunHooks.forEach((executedHookInfo) => {
            const { hook } = executedHookInfo;
            if (testCaseHooks.has(hook.internalId))
                return;
            const hookTypeStr = hook.hookType.toLowerCase().replaceAll('_', '-');
            const testStep = {
                id: `${this.id}-${hookTypeStr}-${testCaseHooks.size}`,
                hookId: hook.id,
            };
            testCaseHooks.set(hook.internalId, { hook, testStep });
        });
    }
    /**
     * Initially create steps from pickle steps, with empty stepMatchArgumentsLists.
     */
    createStepsFromPickle(pickle) {
        this.steps = pickle.steps.map((pickleStep, stepIndex) => {
            return {
                id: `${this.id}-step-${stepIndex}`,
                pickleStepId: pickleStep.id,
                stepDefinitionIds: [],
                stepMatchArgumentsLists: [],
            };
        });
    }
    /**
     * Fill stepMatchArgumentsLists from all test retries.
     * It allows to fill as many steps as possible.
     * Possibly, we write the same stepMatchArgumentsLists several times,
     * looks like it's not a problem as they should be equal for all retries.
     */
    addStepsArgumentsLists(testCaseRun) {
        testCaseRun.bddTestData.steps.forEach((bddStep, stepIndex) => {
            // map executed step from bddTestData to pickle step by index
            const testCaseStep = this.steps[stepIndex];
            if (testCaseStep && bddStep.stepMatchArguments) {
                testCaseStep.stepMatchArgumentsLists = [{ stepMatchArguments: bddStep.stepMatchArguments }];
            }
        });
    }
    findPickle(testCaseRun) {
        const doc = this.gherkinDocuments.find((doc) => doc.uri === testCaseRun.featureUri);
        if (!doc) {
            throw new Error(`GherkinDocument not found for test: ${testCaseRun.test.title}`);
        }
        const pickle = doc.pickles.find((pickle) => {
            return pickle.location.line === testCaseRun.bddTestData.pickleLine;
        });
        if (!pickle) {
            throw new Error([
                `Pickle not found for test: ${testCaseRun.test.title}`,
                `Gherkin document: ${doc.uri}`,
            ].join('\n'));
        }
        return pickle;
    }
}
exports.TestCase = TestCase;
_TestCase_pickle = new WeakMap(), _TestCase_projectInfo = new WeakMap();
//# sourceMappingURL=TestCase.js.map