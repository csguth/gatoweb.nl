import { BddTestData } from '../../../bddData/types';
type TestFileExtractedData = {
    featureUri: string;
    bddData: BddTestData[];
};
export declare class TestFiles {
    private filesData;
    getBddData(filePath: string): TestFileExtractedData;
    private extractBddData;
}
export {};
//# sourceMappingURL=TestFiles.d.ts.map