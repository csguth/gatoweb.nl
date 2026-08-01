"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.envCommand = void 0;
const commander_1 = require("commander");
const logger_1 = require("../../utils/logger");
const utils_1 = require("../../utils");
const loadConfig_1 = require("../../playwright/loadConfig");
const paths_1 = require("../../utils/paths");
const logger = new logger_1.Logger({ verbose: true });
exports.envCommand = new commander_1.Command('env')
    .description('Prints environment info')
    .configureHelp({ showGlobalOptions: true })
    .action(() => {
    const opts = exports.envCommand.optsWithGlobals();
    logger.log(`Playwright-bdd environment info:\n`);
    logger.log(`platform: ${process.platform}`);
    logger.log(`node: ${process.version}`);
    showPackageVersion('playwright-bdd');
    showPackageVersion('@playwright/test');
    showPackageVersion('@cucumber/cucumber');
    showPlaywrightConfigPath(opts.config);
});
function showPackageVersion(packageName) {
    const version = (0, utils_1.getPackageVersion)(packageName);
    const versionStr = version ? `v${version}` : 'none';
    logger.log(`${packageName}: ${versionStr}`);
}
function showPlaywrightConfigPath(cliConfigPath) {
    const { resolvedConfigFile } = (0, loadConfig_1.resolveConfigLocation)(cliConfigPath);
    const configFileStr = resolvedConfigFile ? (0, paths_1.relativeToCwd)(resolvedConfigFile) : 'none';
    logger.log(`Playwright config file: ${configFileStr}`);
}
//# sourceMappingURL=env.js.map