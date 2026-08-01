"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackgroundGen = void 0;
const AutofillMap_1 = require("../utils/AutofillMap");
const i18n_1 = require("./i18n");
class BackgroundGen {
    constructor(formatter, i18nKeywordsMap, bg) {
        this.formatter = formatter;
        this.i18nKeywordsMap = i18nKeywordsMap;
        this.bg = bg;
        this.steps = new AutofillMap_1.AutofillMap();
    }
    get placeholder() {
        return `// bg: ${this.bg.id}`;
    }
    findGherkinStep(pickleStep) {
        return this.bg.steps.find((step) => pickleStep.astNodeIds.includes(step.id));
    }
    addStepData(stepData) {
        if (this.bg.steps.includes(stepData.gherkinStep)) {
            this.steps.getOrCreate(stepData.gherkinStep, () => []).push(stepData);
            return true;
        }
    }
    renderInplace(lines) {
        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            const line = lines[lineIndex];
            const pos = line?.indexOf(this.placeholder) ?? -1;
            if (pos >= 0) {
                const indent = ' '.repeat(pos);
                const bgLines = this.hasReferencedSteps() ? this.render().map((v) => `${indent}${v}`) : [];
                lines.splice(lineIndex, 1, ...bgLines);
                return;
            }
        }
        throw new Error(`Background placeholder "${this.placeholder}" is not found in the file.`);
    }
    render() {
        const bgFixtureNames = [];
        const stepLines = this.bg.steps.map((gherkinStep) => {
            const keywordEng = (0, i18n_1.getKeywordEng)(this.i18nKeywordsMap, gherkinStep.keyword);
            // bg step can have several stepData - one per scenario that uses this bg
            const stepDataArr = this.steps.get(gherkinStep) || [];
            // take first, b/c for bg steps text and argument are the same in all pickle steps
            const firstPickleStep = stepDataArr[0]?.pickleStep;
            if (!firstPickleStep) {
                throw new Error(`Cannot find pickle step for background step: ${gherkinStep.id}`);
            }
            const stepFixtureNames = [];
            stepDataArr.forEach(({ fixtureNames }) => stepFixtureNames.push(...fixtureNames));
            const pickleStepIds = stepDataArr.map(({ pickleStep }) => pickleStep.id) || [];
            bgFixtureNames.push(keywordEng, ...stepFixtureNames);
            return this.formatter.step(keywordEng, firstPickleStep.text, firstPickleStep.argument, new Set(stepFixtureNames), pickleStepIds);
        });
        const title = this.getTitle();
        return this.formatter.beforeEach(title, new Set(bgFixtureNames), stepLines);
    }
    hasReferencedSteps() {
        return this.steps.size > 0;
    }
    getTitle() {
        return [this.bg.keyword, this.bg.name].filter(Boolean).join(': ');
    }
}
exports.BackgroundGen = BackgroundGen;
//# sourceMappingURL=background.js.map