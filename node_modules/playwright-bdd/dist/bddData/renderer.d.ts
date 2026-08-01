import { SourceMapper } from '../generate/sourceMapper';
import { TestGen } from '../generate/test';
export declare class BddDataRenderer {
    private tests;
    private sourceMapper;
    static varName: string;
    constructor(tests: TestGen[], sourceMapper: SourceMapper);
    renderFixture(): string[];
    renderVariable(): string[];
    private getBddTestData;
}
//# sourceMappingURL=renderer.d.ts.map