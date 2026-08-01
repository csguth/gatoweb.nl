"use strict";
/**
 * Generate and show snippets for missing steps.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Snippets = void 0;
const logger_1 = require("../utils/logger");
const stepRegistry_1 = require("../steps/stepRegistry");
const snippet_1 = require("./snippet");
const helpers_1 = require("../gherkin/helpers");
// if there are too many snippets, it's more like invalid configuration
const MAX_SNIPPETS_TO_SHOW = 10;
class Snippets {
    constructor(missingSteps) {
        this.missingSteps = missingSteps;
        this.snippets = new Map();
        this.snippetOptions = this.buildSnippetOptions();
        this.buildSnippets();
    }
    print() {
        const snippetsToShow = [...this.snippets.values()].slice(0, MAX_SNIPPETS_TO_SHOW);
        const moreSnippetsCount = this.snippets.size - snippetsToShow.length;
        logger_1.logger.error([
            `Missing step definitions: ${this.snippets.size}`,
            ...snippetsToShow,
            moreSnippetsCount > 0 ? `...and ${moreSnippetsCount} more.` : '',
            `Use snippets above to create missing steps.`,
        ]
            .filter(Boolean)
            .join('\n\n'));
    }
    buildSnippetOptions() {
        return {
            isPlaywrightStyle: !this.hasCucumberStyleSteps(),
            isTypeScript: this.hasTypeScriptSteps(),
            isDecorator: this.hasDecoratorSteps(),
        };
    }
    buildSnippets() {
        this.missingSteps.forEach((missingStep) => {
            this.buildSnippet(missingStep);
        });
    }
    buildSnippet(missingStep) {
        const snippet = new snippet_1.Snippet(missingStep, this.snippetOptions);
        // use snippet code as unique key
        if (this.snippets.has(snippet.code))
            return;
        const { gherkinStep, pickleStep } = missingStep;
        const stepTextWithKeyword = (0, helpers_1.getStepTextWithKeyword)(gherkinStep.keyword, pickleStep.text);
        const snippetWithLocation = snippet.code
            .replace('{step}', `Step: ${stepTextWithKeyword}`)
            .replace('{location}', `From: ${missingStep.location}`);
        this.snippets.set(snippet.code, snippetWithLocation);
    }
    hasTypeScriptSteps() {
        return stepRegistry_1.stepDefinitions.some((s) => s.uri.endsWith('.ts'));
    }
    hasDecoratorSteps() {
        const decoratorSteps = stepRegistry_1.stepDefinitions.filter((step) => step.isDecorator());
        return decoratorSteps.length > stepRegistry_1.stepDefinitions.length / 2;
    }
    hasCucumberStyleSteps() {
        const cucumberStyleSteps = stepRegistry_1.stepDefinitions.filter((step) => step.isCucumberStyle());
        return cucumberStyleSteps.length > stepRegistry_1.stepDefinitions.length / 2;
    }
}
exports.Snippets = Snippets;
//# sourceMappingURL=index.js.map