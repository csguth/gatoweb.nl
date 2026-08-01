/**
 * Simple logger
 */
type LoggerOptions = {
    verbose?: boolean;
};
export declare class Logger {
    private options;
    constructor(options?: LoggerOptions);
    get enabled(): boolean | undefined;
    log(...args: unknown[]): void;
    warn(...args: unknown[]): void;
    error(...args: unknown[]): void;
}
export declare const logger: Logger;
export {};
//# sourceMappingURL=logger.d.ts.map