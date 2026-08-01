/**
 * Cucumber message reporter.
 * Based on: https://github.com/cucumber/cucumber-js/blob/main/src/formatter/message_formatter.ts
 */
import * as messages from '@cucumber/messages';
import BaseReporter, { InternalOptions } from './base';
import { AttachmentEnvelope } from './messagesBuilder/types';
import { SkipAttachments } from './attachments/skip';
type MessageReporterOptions = {
    outputFile?: string;
    skipAttachments?: SkipAttachments;
};
export default class MessageReporter extends BaseReporter {
    protected userOptions: MessageReporterOptions;
    constructor(internalOptions: InternalOptions, userOptions?: MessageReporterOptions);
    protected handleAttachment(envelope: AttachmentEnvelope): void;
    protected writeEnvelope(envelope: messages.Envelope): void;
}
export {};
//# sourceMappingURL=message.d.ts.map