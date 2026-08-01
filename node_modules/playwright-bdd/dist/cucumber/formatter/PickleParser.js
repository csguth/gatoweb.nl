"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getScenarioDescription = getScenarioDescription;
exports.getStepKeyword = getStepKeyword;
exports.getPickleStepMap = getPickleStepMap;
function getScenarioDescription({ pickle, gherkinScenarioMap, }) {
    return pickle.astNodeIds.map((id) => gherkinScenarioMap[id]).filter((x) => x != null)[0]
        .description;
}
function getStepKeyword({ pickleStep, gherkinStepMap }) {
    return pickleStep.astNodeIds.map((id) => gherkinStepMap[id]).filter((x) => x != null)[0].keyword;
}
function getPickleStepMap(pickle) {
    const result = {};
    pickle.steps.forEach((pickleStep) => (result[pickleStep.id] = pickleStep));
    return result;
}
//# sourceMappingURL=PickleParser.js.map