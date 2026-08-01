"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.showWarnings = showWarnings;
/**
 * Warnings module.
 * Shows warning if not disabled and not shown.
 */
const logger_1 = require("../utils/logger");
const shownWarnings = new Set();
function showWarnings(configs) {
    for (const config of configs) {
        warningImportTestFrom(config);
    }
}
function warningImportTestFrom(config) {
    if (canShowWarning(config, 'importTestFrom') && config.importTestFrom) {
        showWarning('importTestFrom', 'Option "importTestFrom" in defineBddConfig() is not needed anymore.', 'Try to remove it and include that file into "steps" pattern.');
    }
}
function canShowWarning(config, warning) {
    if (config.disableWarnings === true)
        return false;
    if (typeof config.disableWarnings === 'object' && config.disableWarnings[warning])
        return false;
    if (shownWarnings.has(warning))
        return false;
    return true;
}
function showWarning(warning, ...messages) {
    shownWarnings.add(warning);
    logger_1.logger.warn('WARNING:', ...messages);
    logger_1.logger.warn(`--\nThis warning can be disabled by setting in BDD config: `, `\ndisableWarnings: { ${warning}: true }`, `\nFeel free to report any bugs: https://github.com/vitalets/playwright-bdd/issues`);
}
//# sourceMappingURL=warnings.js.map