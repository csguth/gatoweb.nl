import { StepData } from '.';
import { BDDConfig } from '../../config/types';
export declare class DecoratorFixtureResolver {
    private config;
    private testPoms;
    constructor(config: BDDConfig, testTags: string[]);
    resolveFixtureNames(stepsData: Map<string, StepData>): void;
    private getFixtureName;
}
//# sourceMappingURL=decoratorFixtureResolver.d.ts.map