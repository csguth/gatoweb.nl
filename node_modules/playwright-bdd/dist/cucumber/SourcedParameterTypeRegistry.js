"use strict";
/**
 * SourcedParameterTypeRegistry: the same as ParameterTypeRegistry, but stores location of each arameter type.
 * See: https://github.com/cucumber/cucumber-js/blob/main/src/support_code_library_builder/sourced_parameter_type_registry.ts
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SourcedParameterTypeRegistry = void 0;
const cucumber_expressions_1 = require("@cucumber/cucumber-expressions");
class SourcedParameterTypeRegistry extends cucumber_expressions_1.ParameterTypeRegistry {
    constructor() {
        super(...arguments);
        this.parameterTypeToSource = new WeakMap();
    }
    defineSourcedParameterType(parameterType, source) {
        this.defineParameterType(parameterType);
        this.parameterTypeToSource.set(parameterType, source);
    }
    lookupSource(parameterType) {
        return this.parameterTypeToSource.get(parameterType);
    }
}
exports.SourcedParameterTypeRegistry = SourcedParameterTypeRegistry;
//# sourceMappingURL=SourcedParameterTypeRegistry.js.map