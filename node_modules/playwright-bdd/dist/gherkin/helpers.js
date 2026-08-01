"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStepTextWithKeyword = getStepTextWithKeyword;
exports.getTagNames = getTagNames;
exports.isScenarioOutline = isScenarioOutline;
function getStepTextWithKeyword(keyword, pickleStepText) {
    // There is no full original step text in gherkin document.
    // Build it by concatenation of keyword and pickle text.
    // Cucumber html-formatter does the same:
    // https://github.com/cucumber/react-components/blob/27b02543a5d7abeded3410a58588ee4b493b4a8f/src/components/gherkin/GherkinStep.tsx#L114
    return `${keyword || ''}${pickleStepText}`;
}
function getTagNames(tags) {
    return tags?.map((tag) => tag.name) || [];
}
function isScenarioOutline(scenario) {
    // scenario outline without 'Examples:' block behaves like a usual scenario
    return Boolean(scenario.examples?.length);
}
//# sourceMappingURL=helpers.js.map