"use strict";
/**
 * Based on: https://github.com/cucumber/cucumber-js/blob/main/src/formatter/helpers/gherkin_document_parser.ts
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGherkinStepMap = getGherkinStepMap;
exports.getGherkinScenarioMap = getGherkinScenarioMap;
exports.getGherkinExampleRuleMap = getGherkinExampleRuleMap;
exports.getGherkinScenarioLocationMap = getGherkinScenarioLocationMap;
const valueChecker_1 = require("../valueChecker");
function getGherkinStepMap(gherkinDocument) {
    const result = {};
    gherkinDocument.feature?.children
        .map(extractStepContainers)
        .flat()
        .forEach((x) => x.steps.forEach((step) => (result[step.id] = step)));
    return result;
}
function extractStepContainers(child) {
    if ((0, valueChecker_1.doesHaveValue)(child.background)) {
        return [child.background];
    }
    else if ((0, valueChecker_1.doesHaveValue)(child.rule)) {
        return child.rule.children
            .map((ruleChild) => (0, valueChecker_1.doesHaveValue)(ruleChild.background) ? ruleChild.background : ruleChild.scenario)
            .filter((v) => !!v);
    }
    else if ((0, valueChecker_1.doesHaveValue)(child.scenario)) {
        return [child.scenario];
    }
    else {
        throw new Error('Empty step container');
    }
}
function getGherkinScenarioMap(gherkinDocument) {
    const result = {};
    gherkinDocument.feature?.children
        .map((child) => {
        if ((0, valueChecker_1.doesHaveValue)(child.rule)) {
            return child.rule.children;
        }
        return [child];
    })
        .flat()
        .forEach((x) => {
        if (x.scenario != null) {
            result[x.scenario.id] = x.scenario;
        }
    });
    return result;
}
function getGherkinExampleRuleMap(gherkinDocument) {
    const result = {};
    gherkinDocument.feature?.children
        .filter((x) => x.rule != null)
        .forEach((x) => x?.rule?.children
        .filter((child) => (0, valueChecker_1.doesHaveValue)(child.scenario))
        .forEach((child) => {
        if (child?.scenario?.id && x.rule)
            result[child.scenario.id] = x.rule;
    }));
    return result;
}
function getGherkinScenarioLocationMap(gherkinDocument) {
    const locationMap = {};
    const scenarioMap = getGherkinScenarioMap(gherkinDocument);
    Object.keys(scenarioMap).forEach((id) => {
        const scenario = scenarioMap[id];
        locationMap[id] = scenario.location;
        if ((0, valueChecker_1.doesHaveValue)(scenario.examples)) {
            scenario.examples.forEach((x) => x.tableBody.forEach((tableRow) => (locationMap[tableRow.id] = tableRow.location)));
        }
    });
    return locationMap;
}
//# sourceMappingURL=GherkinDocumentParser.js.map