"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defineBddProject = defineBddProject;
exports.defineBddConfig = defineBddConfig;
/**
 * BDD Config.
 */
const node_path_1 = __importDefault(require("node:path"));
const env_1 = require("./env");
const defaults_1 = require("./defaults");
const utils_1 = require("../utils");
const loadConfig_1 = require("../playwright/loadConfig");
const paths_1 = require("../utils/paths");
const exit_1 = require("../utils/exit");
const options_1 = require("../cli/options");
function defineBddProject(config) {
    const { name, ...bddConfig } = config;
    if (name && !bddConfig.outputDir) {
        bddConfig.outputDir = node_path_1.default.join(defaults_1.defaults.outputDir, name);
    }
    const testDir = defineBddConfig(bddConfig);
    return { name, testDir };
}
function defineBddConfig(inputConfig) {
    const isMainProcess = !process.env.TEST_WORKER_INDEX;
    // In main process store config in env to be accessible by workers
    if (isMainProcess) {
        // it's important to try to get config dir from env first,
        // because Playwright can evaluate config in some other cases (vs code).
        const configDir = (0, env_1.getConfigDirFromEnv)({ throws: false }) || resolveConfigDir();
        const config = getConfig(configDir, inputConfig);
        (0, env_1.saveConfigToEnv)(config);
        return config.outputDir;
    }
    else {
        const configDir = (0, env_1.getConfigDirFromEnv)({ throws: true });
        return resolveOutputDir(configDir, inputConfig?.outputDir);
    }
}
// eslint-disable-next-line visual/complexity
function getConfig(configDir, inputConfig) {
    const config = Object.assign({}, defaults_1.defaults, (0, utils_1.removeUndefined)(inputConfig));
    validateFeaturesRoot(config.featuresRoot);
    const features = config.features || config.paths || config.featuresRoot;
    if (!features) {
        (0, exit_1.exit)(`Please provide 'features' or 'featuresRoot' option in defineBddConfig()`);
    }
    // Currently steps can be empty: e.g. when decorator steps loaded via importTestFrom
    // After removing importTestFrom we should throw error for missing steps as well.
    const steps = config.steps || config.require || config.import || config.featuresRoot || [];
    const featuresRoot = config.featuresRoot
        ? node_path_1.default.resolve(configDir, config.featuresRoot)
        : configDir;
    return {
        ...config,
        configDir,
        features,
        steps,
        featuresRoot,
        // important to resolve outputDir as it is used as unique key for input configs
        outputDir: resolveOutputDir(configDir, config.outputDir),
        importTestFrom: resolveImportTestFrom(configDir, config.importTestFrom),
    };
}
/**
 * Returns Playwright config dir considering cli --config option.
 * Note: This fn must be called only in main process, because in workers
 * process.argv is different.
 */
function resolveConfigDir() {
    return (0, loadConfig_1.resolveConfigLocation)((0, options_1.getCliConfigPath)()).configDir;
}
/**
 * Separate function to resolve only outputDir.
 * Used in workers, to not resolve the whole config again.
 */
function resolveOutputDir(configDir, providedOutputDir) {
    return node_path_1.default.resolve(configDir, providedOutputDir || defaults_1.defaults.outputDir);
}
function resolveImportTestFrom(configDir, importTestFrom) {
    if (importTestFrom) {
        const { file, varName } = typeof importTestFrom === 'string'
            ? { file: importTestFrom }
            : importTestFrom;
        return {
            file: node_path_1.default.resolve(configDir, file),
            varName,
        };
    }
}
function validateFeaturesRoot(featuresRoot) {
    if (featuresRoot && !(0, paths_1.isDirectory)(featuresRoot)) {
        (0, exit_1.exit)(`Config option 'featuresRoot' should be a directory.`, `You can provide 'features' option with glob pattern, e.g. ./features/*.feature.`);
    }
}
//# sourceMappingURL=index.js.map