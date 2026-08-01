"use strict";
/**
 * See: https://github.com/cucumber/cucumber-js/blob/main/src/formatter/helpers/duration_helpers.ts#L5
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.durationToNanoseconds = durationToNanoseconds;
const NANOS_IN_SECOND = 1_000_000_000;
function durationToNanoseconds(duration) {
    return Math.floor(duration.seconds * NANOS_IN_SECOND + duration.nanos);
}
//# sourceMappingURL=durationHelpers.js.map