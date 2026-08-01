/**
 * Manages backgrounds: fill info about background steps and fixtures.
 * Note: per gherkin syntax, background section must appear before scenarios.
 */
import { Background, PickleStep, Step } from '@cucumber/messages';
import { StepData } from './test';
import { Formatter } from './formatter';
import { KeywordsMap } from './i18n';
export declare class BackgroundGen {
    private formatter;
    private i18nKeywordsMap;
    private bg;
    private steps;
    constructor(formatter: Formatter, i18nKeywordsMap: KeywordsMap | undefined, bg: Background);
    get placeholder(): string;
    findGherkinStep(pickleStep: PickleStep): Step | undefined;
    addStepData(stepData: StepData): true | undefined;
    renderInplace(lines: string[]): void;
    private render;
    private hasReferencedSteps;
    private getTitle;
}
//# sourceMappingURL=background.d.ts.map