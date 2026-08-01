"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SourceMapper = void 0;
const formatter_1 = require("./formatter");
class SourceMapper {
    constructor(lines) {
        this.pwTestLocations = new Map();
        this.pwStepLocations = new Map();
        this.fillPwTestLocations(lines);
        this.fillPwStepLocations(lines);
    }
    getPwTestLine(pickle) {
        const line = this.pwTestLocations.get(pickle.id);
        if (!line)
            throw new Error(`Test location is not found: ${pickle.name}`);
        return line;
    }
    getPwStepLine(pickleStep) {
        const line = this.pwStepLocations.get(pickleStep.id);
        if (!line)
            throw new Error(`Step location is not found: ${pickleStep.text}`);
        return line;
    }
    fillPwTestLocations(lines) {
        lines.forEach((line, index) => {
            const info = (0, formatter_1.extractPickleIdFromLine)(line);
            if (!info)
                return;
            this.pwTestLocations.set(info.pickleId, index + 1);
            lines[index] = line.slice(0, info.index); // clear comment
        });
    }
    fillPwStepLocations(lines) {
        lines.forEach((line, index) => {
            const info = (0, formatter_1.extractPickleStepIdsFromLine)(line);
            if (!info)
                return;
            info.pickleStepIds.forEach((pickleStepId) => {
                this.pwStepLocations.set(pickleStepId, index + 1);
            });
            lines[index] = line.slice(0, info.index); // clear comment
        });
    }
}
exports.SourceMapper = SourceMapper;
//# sourceMappingURL=sourceMapper.js.map