import * as messages from '@cucumber/messages';
export declare function toEmbeddedAttachment(attachment: messages.Attachment): messages.Attachment;
/**
 * See implementation in Playwright HTML reporter:
 * https://github.com/microsoft/playwright/blob/412073253f03099d0fe4081b26ad5f0494fea8d2/packages/playwright/src/reporters/html.ts#L428
 */
export declare function toExternalAttachment(attachment: messages.Attachment, attachmentsDir: string, attachmentsBaseURL: string): messages.Attachment;
export declare function isTextAttachment(attachment: messages.Attachment): boolean;
//# sourceMappingURL=external.d.ts.map