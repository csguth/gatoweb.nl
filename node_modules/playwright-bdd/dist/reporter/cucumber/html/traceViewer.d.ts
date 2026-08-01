/**
 * Copy trace viewer to the report folder.
 */
import * as messages from '@cucumber/messages';
export declare function copyTraceViewer(reportDir: string): Promise<void>;
export declare function isTraceAttachment(attachment: messages.Attachment): boolean;
export declare function generateTraceUrl(attachment: messages.Attachment): string;
export declare function createViewTraceLinkAttachment(testCaseStartedId: string | undefined, testStepId: string | undefined, href: string): {
    attachment: messages.Attachment;
};
/**
 * Custom css and script for 'View trace' links.
 * Update link href to pass full trace URL.
 * Use 'onmousedown' to update href for right-click + open in new tab.
 * Maybe it will be implemented in Playwright:
 * https://github.com/microsoft/playwright/issues/34493
 */
export declare const assetsViewTraceLinks = "\n<style>\na.view-trace {\n  text-decoration: none; \n  color: #297bde;\n}\n\na.view-trace:hover {\n  text-decoration: underline;\n}\n</style>\n<script>\nfunction updateTraceViewLink(link) {\n  if (!isHttpUrl(window.location.href)) return;\n  var urlObj = new URL(link.href);\n  var traceUrl = urlObj.searchParams.get('trace') || '';\n  if (!isHttpUrl(traceUrl)) {\n    traceUrl = new URL(traceUrl, window.location.href).href;\n    urlObj.searchParams.set('trace', traceUrl);\n    link.href = urlObj.href;\n  }\n}\nfunction isHttpUrl(url) {\n  return url.startsWith('http://') || url.startsWith('https://');\n} \n</script>\n";
//# sourceMappingURL=traceViewer.d.ts.map