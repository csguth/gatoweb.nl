/**
 * Special tags: @skip, @only, etc.
 * SpecialTags class uses only own tags of gherkin node (without any inheritance),
 * because inheritance is guaranteed by Playwright runner.
 */
import { DescribeConfigureOptions } from '../playwright/types';
export declare function isTestSkippedByCollectedTags(collectedTags: string[]): boolean;
export declare function isTestSlowByCollectedTags(collectedTags: string[]): boolean;
export declare class SpecialTags {
    private ownTags;
    only?: boolean;
    skip?: boolean;
    fixme?: boolean;
    fail?: boolean;
    slow?: boolean;
    retries?: number;
    timeout?: number;
    mode?: DescribeConfigureOptions['mode'];
    constructor(ownTags?: string[]);
    /**
     * Forces the test to be marked as `fixme` no matter which tags it has.
     * Used for marking tests with missing steps.
     */
    forceFixme(): void;
    private extractFlags;
    private extractRetries;
    private extractTimeout;
    private extractMode;
}
//# sourceMappingURL=specialTags.d.ts.map