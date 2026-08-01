"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseStepDefinitionArgs = parseStepDefinitionArgs;
function parseStepDefinitionArgs(args) {
    const [pattern, providedOptions, fn] = args.length === 3 ? args : [args[0], {}, args[1]];
    return { pattern, providedOptions, fn };
}
//# sourceMappingURL=shared.js.map