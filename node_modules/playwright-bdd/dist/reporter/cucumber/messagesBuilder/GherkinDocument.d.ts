/**
 * Builds GherkinDocument message.
 * Attaches extra fields (meta).
 */
import * as messages from '@cucumber/messages';
import { GherkinDocumentWithPickles } from '../../../gherkin/types';
import { ConcreteEnvelope } from './types';
import { ProjectInfo } from './Projects';
type GherkinDocumentMeta = {
    originalUri: string;
    projectName?: string;
    browserName?: string;
};
export declare class GherkinDocumentMessage {
    private projectInfo;
    private gherkinDocument;
    static extractMeta(gherkinDocument: messages.GherkinDocument): GherkinDocumentMeta;
    constructor(projectInfo: ProjectInfo, gherkinDocument: GherkinDocumentWithPickles);
    build(): ConcreteEnvelope<'gherkinDocument'>;
    private copyDocumentWithoutPickles;
    private setUriWithProject;
    private setMeta;
}
export {};
//# sourceMappingURL=GherkinDocument.d.ts.map