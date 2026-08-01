/**
 * Generate and show snippets for missing steps.
 */
import { StepData } from '../generate/test';
export declare class Snippets {
    private missingSteps;
    private snippets;
    private snippetOptions;
    constructor(missingSteps: StepData[]);
    print(): void;
    private buildSnippetOptions;
    private buildSnippets;
    private buildSnippet;
    private hasTypeScriptSteps;
    private hasDecoratorSteps;
    private hasCucumberStyleSteps;
}
//# sourceMappingURL=index.d.ts.map