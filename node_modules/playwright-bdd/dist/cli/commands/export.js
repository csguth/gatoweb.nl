"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportCommand = void 0;
const node_path_1 = __importDefault(require("node:path"));
const commander_1 = require("commander");
const cli_table3_1 = __importDefault(require("cli-table3"));
const loadConfig_1 = require("../../playwright/loadConfig");
const logger_1 = require("../../utils/logger");
const env_1 = require("../../config/env");
const test_1 = require("./test");
const generate_1 = require("../../generate");
const paths_1 = require("../../utils/paths");
const logger = new logger_1.Logger({ verbose: true });
exports.exportCommand = new commander_1.Command('export')
    .description('Prints step definitions')
    .configureHelp({ showGlobalOptions: true })
    .option('--unused-steps', 'Output only unused steps')
    .action(async () => {
    const opts = exports.exportCommand.optsWithGlobals();
    const { resolvedConfigFile } = await (0, loadConfig_1.loadConfig)(opts.config);
    logger.log(`Using config: ${node_path_1.default.relative(process.cwd(), resolvedConfigFile)}`);
    const configs = Object.values((0, env_1.getEnvConfigs)());
    (0, test_1.assertConfigsCount)(configs);
    if (opts.unusedSteps) {
        await showUnusedStepsForConfigs(configs);
    }
    else {
        await showStepsForConfigs(configs);
    }
});
async function showStepsForConfigs(configs) {
    // here we don't need workers (as in test command) because if some step files
    // are already in node cache, we collected them.
    const steps = new Set();
    const tasks = configs.map(async (config) => {
        const stepDefinitions = await new generate_1.TestFilesGenerator(config).extractSteps();
        stepDefinitions.forEach((s) => steps.add(`* ${formatStepText(s)}`));
    });
    await Promise.all(tasks);
    logger.log(`List of all steps (${steps.size}):`);
    steps.forEach((stepText) => logger.log(stepText));
}
async function showUnusedStepsForConfigs(configs) {
    const steps = new Set();
    const tasks = configs.map(async (config) => {
        const stepDefinitions = await new generate_1.TestFilesGenerator(config).extractUnusedSteps();
        stepDefinitions.forEach((step) => steps.add(step));
    });
    await Promise.all(tasks);
    logger.log(`Unused steps (${steps.size}):`);
    logger.log(formatUnusedStepsTable(steps));
}
function formatUnusedStepsTable(steps) {
    const table = new cli_table3_1.default({
        head: ['Pattern / Text', /*'Duration', */ 'Location'],
        style: { border: [], head: [] }, // disable colors
    });
    steps.forEach((step) => {
        table.push([formatStepText(step), formatStepLocation(step)]);
    });
    return table.toString();
}
function formatStepText({ pattern, keyword }) {
    // for Unknown return When as it looks the most suitable
    const keywordText = keyword === 'Unknown' ? 'When' : keyword;
    const patternText = typeof pattern === 'string' ? pattern : pattern.source;
    return `${keywordText} ${patternText}`;
}
function formatStepLocation(step) {
    return `${(0, paths_1.relativeToCwd)(step.uri)}:${step.line}`;
}
//# sourceMappingURL=export.js.map