"use strict";
/**
 * Handles Fix With AI feature for Cucumber HTML Reporter.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromptBuilder = void 0;
const promptTemplate_1 = require("./promptTemplate");
const supportedFeatures_1 = require("../playwright/supportedFeatures");
const stripAnsiEscapes_1 = require("../utils/stripAnsiEscapes");
const utils_1 = require("../utils");
const snippet_1 = require("./snippet");
class PromptBuilder {
    constructor(bddContext, page) {
        this.bddContext = bddContext;
        this.page = page;
    }
    get customTemplate() {
        return this.bddContext.config.aiFix?.promptTemplate;
    }
    // eslint-disable-next-line visual/complexity
    async build() {
        const { error } = this.bddContext.testInfo;
        if (!error)
            return;
        const errorMessage = (0, stripAnsiEscapes_1.stripAnsiEscapes)(error.message || '').trim();
        if (!errorMessage)
            return;
        const steps = this.buildStepsString();
        if (!steps)
            return;
        const ariaSnapshot = await this.captureAriaSnapshot();
        if (!ariaSnapshot)
            return;
        const snippet = (0, snippet_1.getCodeSnippet)(error);
        if (!snippet)
            return;
        return (0, utils_1.substitute)(this.customTemplate || promptTemplate_1.defaultPromptTemplate, {
            scenarioName: this.bddContext.testInfo.title,
            steps,
            error: errorMessage,
            snippet,
            ariaSnapshot,
        }).trim();
    }
    async captureAriaSnapshot() {
        if (supportedFeatures_1.supportedFeatures.ariaSnapshots && this.page) {
            try {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore PW < 1.49 don't have .ariaSnapshot()
                return await this.page.locator('html').ariaSnapshot();
            }
            catch {
                // Page can be already closed
                // See: https://github.com/vitalets/playwright-bdd/issues/308
                return '';
            }
        }
    }
    buildStepsString() {
        return this.bddContext.bddTestData.steps
            .slice(0, this.bddContext.stepIndex + 1)
            .map((bddStep) => bddStep.textWithKeyword)
            .filter(Boolean)
            .map((line) => `  ${line}`)
            .join('\n');
    }
}
exports.PromptBuilder = PromptBuilder;
//# sourceMappingURL=promptBuilder.js.map