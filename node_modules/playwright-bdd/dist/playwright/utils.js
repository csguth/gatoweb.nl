"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.playwrightVersion = void 0;
exports.requirePlaywrightModule = requirePlaywrightModule;
exports.getPlaywrightModulePath = getPlaywrightModulePath;
const node_path_1 = __importDefault(require("node:path"));
const utils_1 = require("../utils");
// cache playwright root
let playwrightRoot = '';
exports.playwrightVersion = (0, utils_1.getPackageVersion)('@playwright/test');
/**
 * Requires Playwright's internal module that is not exported via package.exports.
 */
function requirePlaywrightModule(modulePath) {
    const absPath = node_path_1.default.isAbsolute(modulePath) ? modulePath : getPlaywrightModulePath(modulePath);
    return require(absPath);
}
/**
 * Not used now. Kept for potential use.
 * @public
 */
function getPlaywrightModulePath(relativePath) {
    return node_path_1.default.join(getPlaywrightRoot(), relativePath);
}
function getPlaywrightRoot() {
    if (!playwrightRoot) {
        playwrightRoot = (0, utils_1.resolvePackageRoot)('playwright');
    }
    return playwrightRoot;
}
//# sourceMappingURL=utils.js.map