"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shouldSkipAttachment = shouldSkipAttachment;
function shouldSkipAttachment(envelope, skipAttachments) {
    return Array.isArray(skipAttachments)
        ? skipAttachments.includes(envelope.attachment.mediaType)
        : Boolean(skipAttachments);
}
//# sourceMappingURL=skip.js.map