/**
 * Based on Playwright's stackTrace.ts
 * See: https://github.com/microsoft/playwright/blob/release-1.51/packages/playwright-core/src/utils/isomorphic/stackTrace.ts
 */
export type RawStack = string[];
export type StackFrame = {
    file: string;
    line: number;
    column: number;
    function?: string;
};
export declare function captureRawStack(): RawStack;
export declare function parseStackFrame(text: string, pathSeparator: string, showInternalStackFrames: boolean): StackFrame | null;
export declare function rewriteErrorMessage<E extends Error>(e: E, newMessage: string): E;
export declare function stringifyStackFrames(frames: StackFrame[]): string[];
export declare function splitErrorMessage(message: string): {
    name: string;
    message: string;
};
export declare function parseErrorStack(stack: string, pathSeparator: string, showInternalStackFrames?: boolean): {
    message: string;
    stackLines: string[];
    location?: StackFrame;
};
//# sourceMappingURL=stackTrace.d.ts.map