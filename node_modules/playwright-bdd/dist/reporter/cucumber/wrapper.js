"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cucumberReporter = cucumberReporter;
function cucumberReporter(type, userOptions) {
    return ['playwright-bdd/reporter/cucumber', { $type: type, ...(userOptions || {}) }];
}
//# sourceMappingURL=wrapper.js.map