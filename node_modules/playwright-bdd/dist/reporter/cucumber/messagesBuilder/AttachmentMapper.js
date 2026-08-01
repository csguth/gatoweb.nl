"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttachmentMapper = void 0;
const AutofillMap_js_1 = require("../../../utils/AutofillMap.js");
const pwStepUtils_1 = require("./pwStepUtils");
const stripAnsiEscapes_js_1 = require("../../../utils/stripAnsiEscapes.js");
const utils_1 = require("../../../utils");
const TestCaseRunHooks_1 = require("./TestCaseRunHooks");
class AttachmentMapper {
    constructor(result) {
        this.result = result;
        this.stepAttachments = new AutofillMap_js_1.AutofillMap();
        // Playwright hides "_" prefixed attachments, we do the same.
        // See: https://github.com/microsoft/playwright/pull/35044
        const visibleAttachments = this.result.attachments.filter((a) => !a.name.startsWith('_'));
        this.allAttachments = [
            ...visibleAttachments, // prettier-ignore
            ...this.getStdioAttachments(),
        ];
    }
    getStdioAttachments() {
        return [
            stdioAsAttachment(this.result, 'stdout'),
            stdioAsAttachment(this.result, 'stderr'),
        ].filter(utils_1.toBoolean);
    }
    getStepAttachments(pwStep) {
        return this.stepAttachments.get(pwStep) || [];
    }
    populateStepAttachments(pwStep, { fromHook = false } = {}) {
        this.stepAttachments.set(pwStep, []);
        const nestedSteps = fromHook
            ? [
                pwStep,
                // for hooks stop on nested potential hook candidates, as they show attachments themselves
                // bg steps will be also filtered out
                ...(0, pwStepUtils_1.walkSteps)(pwStep.steps, (pwStep) => !(0, TestCaseRunHooks_1.isHookCandidate)(pwStep)),
            ]
            : (0, pwStepUtils_1.walkSteps)(pwStep);
        if ('attachments' in pwStep) {
            this.populateByAttachmentsField(pwStep, nestedSteps);
        }
        else {
            this.populateByAttachCategory(pwStep, nestedSteps);
        }
        return this.getStepAttachments(pwStep);
    }
    hasUnprocessedAttachments() {
        return this.allAttachments.length > 0;
    }
    mapUnprocessedAttachments(pwStep) {
        const existingAttachments = this.getStepAttachments(pwStep);
        const newAttachments = existingAttachments.concat(this.allAttachments);
        this.stepAttachments.set(pwStep, newAttachments);
        this.allAttachments.length = 0;
    }
    populateByAttachmentsField(pwStep, nestedSteps) {
        nestedSteps
            // Since PW 1.50 tere is 'step.attachments' field
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            .map((pwStep) => pwStep.attachments || [])
            .flat()
            .forEach((attachment) => {
            // Items in step.attachments are referencially equal to result.attachments:
            // See: https://github.com/microsoft/playwright/pull/34037/files#diff-a99c58caa6261e2a4ea9b74b160d863e627fcb76f171c7bada90eb2065fa6af6R708
            const index = this.allAttachments.indexOf(attachment);
            if (index >= 0)
                this.assignAttachment(index, pwStep);
        });
    }
    populateByAttachCategory(pwStep, nestedSteps) {
        nestedSteps
            .filter((pwStep) => pwStep.category === 'attach')
            // filter out trace/screenshot/video to always show them at the scenario bottom (and not in bg)
            .filter((attachmentStep) => !isPlaywrightAutoAttachment(attachmentStep))
            .forEach((attachmentStep) => {
            const index = findAttachmentIndexByAttachmentStep(this.allAttachments, attachmentStep);
            if (index >= 0)
                this.assignAttachment(index, pwStep);
        });
    }
    // private mapAttachments() {
    //   // const allAttachmentSteps = findAllStepsWithCategory(this.result, 'attach');
    //   allAttachmentSteps
    //     // filter out trace/screenshot/video to always show them at the scenario bottom (and not in bg)
    //     .filter((attachmentStep) => !isPlaywrightAutoAttachment(attachmentStep))
    //     .forEach((attachmentStep) => this.handleAttachmentStep(attachmentStep));
    //   // this.unusedAttachments.push(...this.allAttachments);
    // }
    // private handleAttachmentStep(attachmentStep: pw.TestStep) {
    //   const parentStep = attachmentStep.parent;
    //   // Since PW 1.50 handle parent BDD step 'attachments' field (once)
    //   if (parentStep && !this.stepAttachments.has(parentStep)) {
    //     this.handleBddStep(parentStep);
    //   }
    //   const index = findAttachmentIndexByAttachmentStep(this.allAttachments, attachmentStep);
    //   if (index === -1) {
    //     throw new Error(`Attachment not found for step: ${attachmentStep.title}`);
    //   }
    //   this.assignAttachment(index, parentStep);
    // }
    assignAttachment(index, pwStep) {
        // pick attachment from result.attachments array
        const [foundAttachment] = this.allAttachments.splice(index, 1);
        this.stepAttachments.getOrCreate(pwStep, () => []).push(foundAttachment);
    }
}
exports.AttachmentMapper = AttachmentMapper;
function findAttachmentIndexByAttachmentStep(allAttachments, attachmentStep) {
    return allAttachments.findIndex((a) => getAttachmentStepTitle(a.name) === attachmentStep.title);
}
// See: https://github.com/microsoft/playwright/blob/main/packages/playwright/src/worker/testInfo.ts#L413
function getAttachmentStepTitle(attachmentName) {
    return `attach "${attachmentName}"`;
}
function isPlaywrightAutoAttachment(attachmentStep) {
    return /^attach "(trace|screenshot|video)"$/.test(attachmentStep.title);
}
function stdioAsAttachment(result, name) {
    if (!result[name]?.length)
        return;
    const body = result[name]
        // data can be buffer
        .map((data) => (typeof data === 'string' ? data : data?.toString('utf8')))
        .filter(Boolean)
        .map((str) => (0, stripAnsiEscapes_js_1.stripAnsiEscapes)(str))
        .join('');
    return {
        name,
        // Attach stdout / stderr as text/x.cucumber.log+plain instead of text/plain,
        // because Cucumber HTML report has pretty formatting for that.
        // See: https://github.com/vitalets/playwright-bdd/issues/239#issuecomment-2451423020
        contentType: 'text/x.cucumber.log+plain',
        body: Buffer.from(body),
    };
}
//# sourceMappingURL=AttachmentMapper.js.map