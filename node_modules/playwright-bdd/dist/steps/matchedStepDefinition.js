"use strict";
/**
 * Matched step definition.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchedStepDefinition = void 0;
class MatchedStepDefinition {
    constructor(definition, stepText, result) {
        this.definition = definition;
        this.stepText = stepText;
        this.result = result;
    }
    async getMatchedParameters(world) {
        return Promise.all(this.result.map((arg) => arg.getValue(world)));
    }
    /**
     * Returns step arguments in format suitable for reporter.
     * See: https://github.com/cucumber/cucumber-js/blob/main/src/assemble/assemble_test_cases.ts
     */
    getStepMatchArguments() {
        return this.result.map((arg) => {
            return {
                group: mapArgumentGroup(arg.group),
                parameterTypeName: arg.parameterType.name,
            };
        });
    }
}
exports.MatchedStepDefinition = MatchedStepDefinition;
function mapArgumentGroup(group) {
    return {
        start: group.start,
        value: group.value,
        children: group.children?.map((child) => mapArgumentGroup(child)),
    };
}
//# sourceMappingURL=matchedStepDefinition.js.map