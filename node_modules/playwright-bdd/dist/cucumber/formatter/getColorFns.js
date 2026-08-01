"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getColorFns;
function getColorFns(_stream, _env, _enabled) {
    return {
        forStatus(_status) {
            return (x) => x;
        },
        location: (x) => x,
        tag: (x) => x,
        diffAdded: (x) => x,
        diffRemoved: (x) => x,
        errorMessage: (x) => x,
        errorStack: (x) => x,
    };
}
//# sourceMappingURL=getColorFns.js.map