"use strict";
/**
 * Step definitions registry - global array to store all step definitions.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.stepDefinitions = void 0;
exports.registerStepDefinition = registerStepDefinition;
const stepDefinition_1 = require("./stepDefinition");
exports.stepDefinitions = [];
function registerStepDefinition(options) {
    const stepDefinition = new stepDefinition_1.StepDefinition(options);
    exports.stepDefinitions.push(stepDefinition);
}
//# sourceMappingURL=stepRegistry.js.map