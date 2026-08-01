"use strict";
/**
 * Copy trace viewer to the report folder.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assetsViewTraceLinks = void 0;
exports.copyTraceViewer = copyTraceViewer;
exports.isTraceAttachment = isTraceAttachment;
exports.generateTraceUrl = generateTraceUrl;
exports.createViewTraceLinkAttachment = createViewTraceLinkAttachment;
const node_path_1 = __importDefault(require("node:path"));
const node_fs_1 = __importDefault(require("node:fs"));
const paths_1 = require("../../../utils/paths");
const helpers_1 = require("../attachments/helpers");
function getTraceViewerFolder() {
    const pwCorePath = require.resolve('playwright-core');
    // See: https://github.com/microsoft/playwright/blob/94321fef1c94f9851b6fcc4304d3844760e986cb/packages/playwright/src/reporters/html.ts#L314
    return node_path_1.default.join(pwCorePath, '..', 'lib', 'vite', 'traceViewer');
}
// eslint-disable-next-line visual/complexity
async function copyTraceViewer(reportDir) {
    const traceViewerFolder = getTraceViewerFolder();
    const traceViewerTargetFolder = node_path_1.default.join(reportDir, 'trace');
    const traceViewerAssetsTargetFolder = node_path_1.default.join(traceViewerTargetFolder, 'assets');
    node_fs_1.default.mkdirSync(traceViewerAssetsTargetFolder, { recursive: true });
    for (const file of node_fs_1.default.readdirSync(traceViewerFolder)) {
        if (file.endsWith('.map') || file.includes('watch') || file.includes('assets'))
            continue;
        await (0, paths_1.copyFileAndMakeWritable)(node_path_1.default.join(traceViewerFolder, file), node_path_1.default.join(traceViewerTargetFolder, file));
    }
    for (const file of node_fs_1.default.readdirSync(node_path_1.default.join(traceViewerFolder, 'assets'))) {
        if (file.endsWith('.map') || file.includes('xtermModule'))
            continue;
        await (0, paths_1.copyFileAndMakeWritable)(node_path_1.default.join(traceViewerFolder, 'assets', file), node_path_1.default.join(traceViewerAssetsTargetFolder, file));
    }
}
function isTraceAttachment(attachment) {
    return attachment.fileName === 'trace';
}
function generateTraceUrl(attachment) {
    // In PW trace url is generated dynamically in JS with location.href:
    // https://github.com/microsoft/playwright/blob/8f3353865d8d98e9b40c15497e60d5e2583410b6/packages/html-reporter/src/links.tsx#L102
    return `trace/index.html?trace=${attachment.url}`;
}
function createViewTraceLinkAttachment(testCaseStartedId, testStepId, href) {
    // eslint-disable-next-line max-len
    const html = `<a data-custom-html class="view-trace" href="${href}" onmousedown="updateTraceViewLink(this)">🔍 View trace</a>`;
    return (0, helpers_1.createLogAttachment)(testCaseStartedId, testStepId, html);
}
/**
 * Custom css and script for 'View trace' links.
 * Update link href to pass full trace URL.
 * Use 'onmousedown' to update href for right-click + open in new tab.
 * Maybe it will be implemented in Playwright:
 * https://github.com/microsoft/playwright/issues/34493
 */
exports.assetsViewTraceLinks = `
<style>
a.view-trace {
  text-decoration: none; 
  color: #297bde;
}

a.view-trace:hover {
  text-decoration: underline;
}
</style>
<script>
function updateTraceViewLink(link) {
  if (!isHttpUrl(window.location.href)) return;
  var urlObj = new URL(link.href);
  var traceUrl = urlObj.searchParams.get('trace') || '';
  if (!isHttpUrl(traceUrl)) {
    traceUrl = new URL(traceUrl, window.location.href).href;
    urlObj.searchParams.set('trace', traceUrl);
    link.href = urlObj.href;
  }
}
function isHttpUrl(url) {
  return url.startsWith('http://') || url.startsWith('https://');
} 
</script>
`;
//# sourceMappingURL=traceViewer.js.map