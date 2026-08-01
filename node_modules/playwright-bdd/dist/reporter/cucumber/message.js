"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = __importDefault(require("./base"));
const helpers_1 = require("./attachments/helpers");
const skip_1 = require("./attachments/skip");
const external_1 = require("./attachments/external");
class MessageReporter extends base_1.default {
    constructor(internalOptions, userOptions = {}) {
        super(internalOptions);
        this.userOptions = userOptions;
        this.setOutputStream(this.userOptions.outputFile);
        this.eventBroadcaster.on('envelope', (envelope) => {
            if ((0, helpers_1.isAttachmentEnvelope)(envelope)) {
                this.handleAttachment(envelope);
            }
            else {
                this.writeEnvelope(envelope);
            }
        });
    }
    handleAttachment(envelope) {
        if ((0, skip_1.shouldSkipAttachment)(envelope, this.userOptions.skipAttachments))
            return;
        this.writeEnvelope({
            ...envelope,
            attachment: (0, external_1.toEmbeddedAttachment)(envelope.attachment),
        });
    }
    writeEnvelope(envelope) {
        this.outputStream.write(JSON.stringify(envelope) + '\n');
    }
}
exports.default = MessageReporter;
//# sourceMappingURL=message.js.map