import { Writable } from 'node:stream';
import { EventEmitter } from 'node:events';
import EventDataCollector from './EventDataCollector';
import { IColorFns } from './getColorFns';
interface FormatRerunOptions {
    separator?: string;
}
interface FormatOptions {
    colorsEnabled?: boolean;
    rerun?: FormatRerunOptions;
    snippetInterface?: any;
    snippetSyntax?: string;
    printAttachments?: boolean;
    [customKey: string]: unknown;
}
type IFormatterLogFn = (buffer: string | Uint8Array) => void;
type IFormatterCleanupFn = () => Promise<unknown>;
export interface IFormatterOptions {
    colorFns: IColorFns;
    cwd: string;
    eventBroadcaster: EventEmitter;
    eventDataCollector: EventDataCollector;
    log: IFormatterLogFn;
    parsedArgvOptions: FormatOptions;
    snippetBuilder: any;
    stream: Writable;
    cleanup: IFormatterCleanupFn;
    supportCodeLibrary: any;
}
export default class Formatter {
    private options;
    static readonly documentation: string;
    constructor(options: IFormatterOptions);
    finished(): Promise<void>;
}
export {};
//# sourceMappingURL=index.d.ts.map