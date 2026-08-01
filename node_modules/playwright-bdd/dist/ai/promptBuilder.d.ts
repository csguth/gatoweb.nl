/**
 * Handles Fix With AI feature for Cucumber HTML Reporter.
 */
import { Page } from '@playwright/test';
import { BddContext } from '../runtime/bddContext';
export declare class PromptBuilder {
    private bddContext;
    private page;
    constructor(bddContext: BddContext, page: Page);
    private get customTemplate();
    build(): Promise<string | undefined>;
    private captureAriaSnapshot;
    private buildStepsString;
}
//# sourceMappingURL=promptBuilder.d.ts.map