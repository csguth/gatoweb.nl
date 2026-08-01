"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toCucumberTimestamp = toCucumberTimestamp;
/**
 * Timing utils.
 */
const messages_1 = require("@cucumber/messages");
function toCucumberTimestamp(time) {
    return messages_1.TimeConversion.millisecondsSinceEpochToTimestamp(time);
}
//# sourceMappingURL=timing.js.map