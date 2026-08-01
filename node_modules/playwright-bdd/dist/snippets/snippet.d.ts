import { StepData } from '../generate/test';
export type SnippetOptions = {
    isTypeScript: boolean;
    isPlaywrightStyle: boolean;
    isDecorator: boolean;
};
export declare class Snippet {
    private missingStep;
    private options;
    private generatedExpression;
    code: string;
    constructor(missingStep: StepData, options: SnippetOptions);
    private get pickleStep();
    private buildCode;
    private buildDecoratorCode;
    private getStepType;
    private getPattern;
    private getStepFunction;
    private getStepFunctionArguments;
    private getPatternArguments;
    private getLastArgument;
    private generateExpression;
}
//# sourceMappingURL=snippet.d.ts.map