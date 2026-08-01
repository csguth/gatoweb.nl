/**
 * Handles skipping attachments.
 */
import { AttachmentEnvelope } from '../messagesBuilder/types';
export type SkipAttachments = boolean | ('image/png' | 'video/webm' | 'application/zip' | string)[];
export declare function shouldSkipAttachment(envelope: AttachmentEnvelope, skipAttachments?: SkipAttachments): boolean;
//# sourceMappingURL=skip.d.ts.map