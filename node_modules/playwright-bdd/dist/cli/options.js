"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configOption = void 0;
exports.getCliConfigPath = getCliConfigPath;
/**
 * Config option moved to separate file as it used in test run.
 */
const commander_1 = require("commander");
exports.configOption = new commander_1.Option(`-c, --config <file>`, `Path to Playwright configuration file (default: playwright.config.(js|ts))`);
/**
 * Helper used in test run to detect config location.
 */
function getCliConfigPath() {
    return new commander_1.Command()
        .allowUnknownOption()
        .allowExcessArguments()
        .addOption(exports.configOption)
        .parse()
        .getOptionValue('config');
}
//# sourceMappingURL=options.js.map