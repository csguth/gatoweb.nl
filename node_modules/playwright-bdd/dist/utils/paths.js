"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toPosixPath = toPosixPath;
exports.relativeToCwd = relativeToCwd;
exports.resolveFiles = resolveFiles;
exports.finalizePattern = finalizePattern;
exports.sanitizeForFilePath = sanitizeForFilePath;
exports.copyFileAndMakeWritable = copyFileAndMakeWritable;
exports.isDirectory = isDirectory;
exports.belongsToNodeModules = belongsToNodeModules;
const node_path_1 = __importDefault(require("node:path"));
const node_fs_1 = __importDefault(require("node:fs"));
const tinyglobby_1 = __importDefault(require("tinyglobby"));
/**
 * Returns path with "/" separator on all platforms.
 * See: https://github.com/microsoft/playwright/blob/main/packages/playwright-core/src/utils/fileUtils.ts#L56
 * See: https://stackoverflow.com/questions/53799385/how-can-i-convert-a-windows-path-to-posix-path-using-node-path
 */
function toPosixPath(somePath) {
    return somePath.split(node_path_1.default.sep).join(node_path_1.default.posix.sep);
}
/**
 * Returns path relative to cwd.
 */
function relativeToCwd(absPath) {
    return node_path_1.default.isAbsolute(absPath) ? node_path_1.default.relative(process.cwd(), absPath) : absPath;
}
/**
 * Resolves patterns to list of files.
 * Extension can be a list: {js,ts}
 * See: https://github.com/cucumber/cucumber-js/blob/main/src/paths/paths.ts
 */
async function resolveFiles(cwd, patterns, extension) {
    const finalPatterns = patterns.map((pattern) => finalizePattern(pattern, extension));
    const files = await tinyglobby_1.default.glob(finalPatterns, {
        cwd,
        absolute: true,
        dot: true,
        expandDirectories: false,
    });
    return { files, finalPatterns };
}
/**
 * Appends file extension(s) to pattern.
 * Example: 'path/to/dir' -> 'path/to/dir/** /*.{js,ts}'
 * @public
 */
function finalizePattern(pattern, extension) {
    // On Windows convert path to forward slash.
    // Note: pattern must always use forward slash "/",
    // but directory can be resolved dynamically via path.xxx methods
    // that return backslash on Windows.
    if (node_path_1.default.sep === '\\')
        pattern = toPosixPath(pattern);
    switch (true) {
        case pattern.endsWith('**'):
            return `${pattern}/*.${extension}`;
        case pattern.endsWith('*'):
            return `${pattern}.${extension}`;
        case node_path_1.default.extname(pattern) === '':
            return `${pattern.replace(/\/+$/, '')}/**/*.${extension}`;
        default:
            return pattern;
    }
}
// See: https://github.com/microsoft/playwright/blob/6f16b6cc08f7d59a079d9afa67afacc321a37675/packages/playwright-core/src/utils/fileUtils.ts#L55
function sanitizeForFilePath(s) {
    // eslint-disable-next-line no-control-regex
    return s.replace(/[\x00-\x2C\x2E-\x2F\x3A-\x40\x5B-\x60\x7B-\x7F]+/g, '-');
}
// See: https://github.com/microsoft/playwright/blob/0fd94521279cfe5e02d1221242a7bf8d001119f0/packages/playwright-core/src/utils/fileUtils.ts#L50
async function copyFileAndMakeWritable(from, to) {
    await node_fs_1.default.promises.copyFile(from, to);
    await node_fs_1.default.promises.chmod(to, 0o664);
}
function isDirectory(directoryPath) {
    try {
        const stats = node_fs_1.default.statSync(directoryPath);
        return stats.isDirectory();
    }
    catch {
        return false;
    }
}
/**
 * Identifies based on filepath whether a directory is a part of node_modules.
 * Intended for use with extractTagsFromPath to prevent including path names containing '@' that aren't test tags.
 * See: https://github.com/vitalets/playwright-bdd/blob/main/src/steps/tags.ts
 */
function belongsToNodeModules(filePath) {
    return (filePath.startsWith(`node_modules${node_path_1.default.sep}`) ||
        filePath.includes(`${node_path_1.default.sep}node_modules${node_path_1.default.sep}`));
}
//# sourceMappingURL=paths.js.map