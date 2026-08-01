import * as messages from '@cucumber/messages';
import { TestCaseRun } from './TestCaseRun';
import { GherkinDocumentWithPickles } from '../../../gherkin/types';
import { ProjectInfo } from './Projects';
export declare class GherkinDocuments {
    private featuresLoader;
    private projectsPerFeaturePath;
    private gherkinDocumentsPerProject;
    constructor();
    load(testCaseRuns: TestCaseRun[]): Promise<void>;
    getDocumentsForProject(projectInfo: ProjectInfo): GherkinDocumentWithPickles[];
    buildMessages(): {
        sources: Required<Pick<messages.Envelope, "source">>[];
        gherkinDocuments: Required<Pick<messages.Envelope, "gherkinDocument">>[];
    };
    private fillProjectsPerFeaturePath;
    private fillGherkinDocumentsPerProject;
    private addGherkinDocumentToProject;
    private buildSourceMessage;
    private getFeaturesLang;
}
//# sourceMappingURL=GherkinDocuments.d.ts.map