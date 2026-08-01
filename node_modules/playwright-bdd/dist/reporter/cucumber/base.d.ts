/**
 * Base reporter for Cucumber reporters.
 * Reference: https://github.com/cucumber/cucumber-js/blob/main/src/formatter/index.ts
 */
import { Writable } from 'node:stream';
import { EventEmitter } from 'node:events';
import * as messages from '@cucumber/messages';
import { MessagesBuilder } from './messagesBuilder';
export type InternalOptions = {
    cwd: string;
    messagesBuilder: MessagesBuilder;
};
export default class BaseReporter {
    protected internalOptions: InternalOptions;
    eventBroadcaster: EventEmitter<Record<"envelope", [messages.Envelope]>>;
    protected outputStream: Writable;
    protected outputDir: string;
    constructor(internalOptions: InternalOptions);
    protected get eventDataCollector(): import("../../cucumber/formatter/EventDataCollector").default;
    protected get messagesBuilder(): MessagesBuilder;
    printsToStdio(): boolean;
    init(): Promise<void>;
    finished(): Promise<void>;
    protected setOutputStream(outputFile?: string): void;
}
//# sourceMappingURL=base.d.ts.map