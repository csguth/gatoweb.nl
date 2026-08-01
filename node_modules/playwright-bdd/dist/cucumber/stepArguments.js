"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseStepArgument = parseStepArgument;
/**
 * Based on: https://github.com/cucumber/cucumber-js/blob/main/src/step_arguments.ts
 */
const node_util_1 = __importDefault(require("node:util"));
const valueChecker_1 = require("./valueChecker");
function parseStepArgument(arg, mapping) {
    if ((0, valueChecker_1.doesHaveValue)(arg.dataTable)) {
        return mapping.dataTable(arg.dataTable);
    }
    else if ((0, valueChecker_1.doesHaveValue)(arg.docString)) {
        return mapping.docString(arg.docString);
    }
    throw new Error(`Unknown step argument: ${node_util_1.default.inspect(arg)}`);
}
//# sourceMappingURL=stepArguments.js.map