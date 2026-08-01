/**
 * Cucumber json reporter.
 * Based on: https://github.com/cucumber/cucumber-js/blob/main/src/formatter/json_formatter.ts
 *
 * Although json reporter is marked as deprecated in CucumberJS docs
 * (see https://github.com/cucumber/cucumber-js/blob/main/docs/formatters.md#json),
 * this decision was rolled back:
 * (see https://github.com/cucumber/json-formatter/issues/34).
 *
 * See also: separate tool to convert cucumber messages to cucumber json:
 * https://github.com/vrymar/cucumber-json-report-formatter/tree/master
 */
import * as messages from '@cucumber/messages';
import BaseReporter, { InternalOptions } from './base';
import { SkipAttachments } from './attachments/skip';
type JsonReporterOptions = {
    outputFile?: string;
    skipAttachments?: SkipAttachments;
    addProjectToFeatureName?: boolean;
    addMetadata?: 'object' | 'list';
};
interface IJsonFeature {
    description: string;
    elements: IJsonScenario[];
    id: string;
    keyword: string;
    line: number;
    name: string;
    tags: IJsonTag[];
    uri: string;
    metadata?: IJsonFeatureMetadata;
}
type IJsonFeatureMetadata = Record<string, string> | {
    name: string;
    value: string;
}[];
interface IJsonScenario {
    description: string;
    id: string;
    keyword: string;
    line: number;
    name: string;
    steps: IJsonStep[];
    tags: IJsonTag[];
    type: string;
}
interface IJsonStep {
    arguments?: any;
    embeddings?: any;
    hidden?: boolean;
    keyword?: string;
    line?: number;
    match?: any;
    name?: string;
    result?: any;
}
interface IJsonTag {
    name: string;
    line?: number;
}
interface IBuildJsonFeatureOptions {
    gherkinDocument: messages.GherkinDocument;
    elements: IJsonScenario[];
}
interface IBuildJsonScenarioOptions {
    feature: messages.Feature;
    gherkinScenarioMap: Record<string, messages.Scenario>;
    gherkinExampleRuleMap: Record<string, messages.Rule>;
    gherkinScenarioLocationMap: Record<string, messages.Location>;
    pickle: messages.Pickle;
    steps: IJsonStep[];
}
interface IBuildJsonStepOptions {
    isBeforeHook: boolean;
    gherkinStepMap: Record<string, messages.Step>;
    pickleStepMap: Record<string, messages.PickleStep>;
    testStep: messages.TestStep;
    testStepAttachments: messages.Attachment[];
    testStepResult: messages.TestStepResult;
}
export default class JsonReporter extends BaseReporter {
    protected userOptions: JsonReporterOptions;
    constructor(internalOptions: InternalOptions, userOptions?: JsonReporterOptions);
    convertNameToId(obj: {
        name: string;
    }): string;
    formatDataTable(dataTable: messages.PickleTable): any;
    formatDocString(docString: messages.PickleDocString, gherkinStep: messages.Step): any;
    formatStepArgument(stepArgument: messages.PickleStepArgument | undefined, gherkinStep: messages.Step): any;
    onTestRunFinished(): void;
    getFeatureData({ gherkinDocument, elements }: IBuildJsonFeatureOptions): IJsonFeature;
    getFeatureMetadata(gherkinDocument: messages.GherkinDocument): IJsonFeatureMetadata | undefined;
    getScenarioData({ feature, gherkinScenarioLocationMap, gherkinExampleRuleMap, gherkinScenarioMap, pickle, steps, }: IBuildJsonScenarioOptions): IJsonScenario;
    private formatScenarioId;
    getStepData({ isBeforeHook, gherkinStepMap, pickleStepMap, testStep, testStepAttachments, testStepResult, }: IBuildJsonStepOptions): IJsonStep;
    getFeatureTags(feature: messages.Feature): IJsonTag[];
    getScenarioTags({ feature, pickle, gherkinScenarioMap, }: {
        feature: messages.Feature;
        pickle: messages.Pickle;
        gherkinScenarioMap: Record<string, messages.Scenario>;
    }): IJsonTag[];
    private getScenarioTag;
    private getAllowedAttachments;
}
export {};
//# sourceMappingURL=json.d.ts.map