"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parameterTypeRegistry = void 0;
exports.defineParameterType = defineParameterType;
/**
 * Custom parameter types registry.
 * Placeholder unit full refuse of cucumber.
 */
const cucumber_expressions_1 = require("@cucumber/cucumber-expressions");
const SourcedParameterTypeRegistry_1 = require("../cucumber/SourcedParameterTypeRegistry");
const getLocationInFile_1 = require("../playwright/getLocationInFile");
const utils_1 = require("../utils");
exports.parameterTypeRegistry = new SourcedParameterTypeRegistry_1.SourcedParameterTypeRegistry();
function defineParameterType(options) {
    const parameterType = new cucumber_expressions_1.ParameterType(options.name, options.regexp, null, options.transformer, (0, utils_1.booleanDefault)(options.useForSnippets, true), (0, utils_1.booleanDefault)(options.preferForRegexpMatch, false));
    // todo: check offset
    const { file: uri, line } = (0, getLocationInFile_1.getLocationByOffset)(1);
    exports.parameterTypeRegistry.defineSourcedParameterType(parameterType, {
        uri,
        line,
    });
}
//# sourceMappingURL=parameterTypes.js.map