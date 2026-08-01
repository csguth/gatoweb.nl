/**
 * Finding step definitions.
 */
import { PickleStepType } from '@cucumber/messages';
import { BDDConfig } from '../config/types';
import { MatchedStepDefinition } from './matchedStepDefinition';
export declare class StepFinder {
    private config;
    constructor(config: BDDConfig);
    findDefinitions(keywordType: PickleStepType | undefined, stepText: string, tags?: string[]): MatchedStepDefinition[];
    private matchByText;
    private filterByKeyword;
    private filterByTags;
}
export declare function formatDuplicateStepsMessage(matchedDefinitions: MatchedStepDefinition[], stepTextWithKeyword: string, stepLocation: string): string;
//# sourceMappingURL=finder.d.ts.map