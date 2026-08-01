"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GherkinDocuments = void 0;
/**
 * Loads Gherkin documents from feature files.
 * The same feature can be executed in several PW projects,
 * for that we map feature files to projects as 1-to-many.
 */
const node_path_1 = __importDefault(require("node:path"));
const AutofillMap_1 = require("../../../utils/AutofillMap");
const featuresLoader_1 = require("../../../gherkin/featuresLoader");
const GherkinDocumentClone_1 = require("./GherkinDocumentClone");
const GherkinDocument_1 = require("./GherkinDocument");
const Projects_1 = require("./Projects");
const env_1 = require("../../../config/env");
const lang_1 = require("../../../config/lang");
class GherkinDocuments {
    constructor() {
        this.featuresLoader = new featuresLoader_1.FeaturesLoader();
        this.projectsPerFeaturePath = new AutofillMap_1.AutofillMap();
        this.gherkinDocumentsPerProject = new AutofillMap_1.AutofillMap();
    }
    // todo: maybe testCaseRuns are not needed here,
    // we can pass testFiles + projects info
    async load(testCaseRuns) {
        this.fillProjectsPerFeaturePath(testCaseRuns);
        const cwd = (0, env_1.getConfigDirFromEnv)();
        const featurePaths = [...this.projectsPerFeaturePath.keys()].map((featurePath) => node_path_1.default.resolve(cwd, featurePath));
        await this.featuresLoader.load(featurePaths, {
            relativeTo: cwd,
            defaultDialect: this.getFeaturesLang(),
        });
        this.fillGherkinDocumentsPerProject();
    }
    getDocumentsForProject(projectInfo) {
        const docs = this.gherkinDocumentsPerProject.get(projectInfo);
        if (!docs)
            throw new Error(`No gherkin docs for project ${projectInfo?.projectName}`);
        return docs;
    }
    buildMessages() {
        const sources = [];
        const gherkinDocuments = [];
        this.gherkinDocumentsPerProject.forEach((docs, project) => {
            docs.forEach((doc) => {
                sources.push(this.buildSourceMessage(project, doc));
                gherkinDocuments.push(new GherkinDocument_1.GherkinDocumentMessage(project, doc).build());
            });
        });
        return { sources, gherkinDocuments };
    }
    fillProjectsPerFeaturePath(testCaseRuns) {
        testCaseRuns.forEach((testCaseRun) => {
            this.projectsPerFeaturePath
                .getOrCreate(testCaseRun.featureUri, () => new Set())
                .add(testCaseRun.projectInfo);
        });
    }
    fillGherkinDocumentsPerProject() {
        this.featuresLoader.getDocumentsWithPickles().forEach((gherkinDocument) => {
            if (!gherkinDocument.uri)
                throw new Error(`Feature without uri`);
            const projects = this.projectsPerFeaturePath.get(gherkinDocument.uri);
            if (!projects)
                throw new Error(`Feature without projects: ${gherkinDocument.uri}`);
            projects.forEach((project) => {
                this.addGherkinDocumentToProject(project, gherkinDocument);
            });
        });
    }
    addGherkinDocumentToProject(projectInfo, gherkinDocument) {
        const clonedDocument = new GherkinDocumentClone_1.GherkinDocumentClone(gherkinDocument).getClone();
        const projectDocs = this.gherkinDocumentsPerProject.getOrCreate(projectInfo, () => []);
        projectDocs.push(clonedDocument);
    }
    buildSourceMessage(projectInfo, doc) {
        if (!doc.uri)
            throw new Error(`Doc without uri`);
        const originalSource = this.featuresLoader.gherkinQuery.getSource(doc.uri);
        if (!originalSource)
            throw new Error(`No source`);
        const source = {
            ...originalSource,
            uri: (0, Projects_1.getFeatureUriWithProject)(projectInfo, doc.uri),
        };
        return { source };
    }
    getFeaturesLang() {
        const langsSet = new Set();
        const envConfigs = (0, env_1.getEnvConfigs)();
        Object.values(envConfigs).forEach((config) => {
            langsSet.add(config.language || lang_1.LANG_EN);
        });
        const langs = [...langsSet];
        if (langs.length > 1) {
            throw new Error([
                `Multiple BDD configs with different language are not supported yet.`,
                `Detected languages: ${langs.join(', ')}`,
            ].join(' '));
        }
        return langs[0];
    }
}
exports.GherkinDocuments = GherkinDocuments;
//# sourceMappingURL=GherkinDocuments.js.map