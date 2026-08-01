"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestFiles = void 0;
/**
 * Class to load and manage list of test files.
 * todo: make files reading async?
 */
const node_fs_1 = __importDefault(require("node:fs"));
const AutofillMap_1 = require("../../../utils/AutofillMap");
const extractor_1 = require("../../../bddData/extractor");
class TestFiles {
    constructor() {
        this.filesData = new AutofillMap_1.AutofillMap();
    }
    getBddData(filePath) {
        return this.filesData.getOrCreate(filePath, () => {
            return this.extractBddData(filePath);
        });
    }
    extractBddData(filePath) {
        const content = node_fs_1.default.readFileSync(filePath, 'utf8');
        const bddDataExtractor = new extractor_1.BddDataExtractor(filePath, content);
        return {
            featureUri: bddDataExtractor.extractFeatureUri(),
            bddData: bddDataExtractor.extract(),
        };
    }
}
exports.TestFiles = TestFiles;
//# sourceMappingURL=TestFiles.js.map