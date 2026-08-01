import * as pw from '@playwright/test/reporter';
import * as messages from '@cucumber/messages';
export type HooksGroup = 'before' | 'after';
export declare class Hook {
    internalId: string;
    private pwStep;
    static getInternalId(pwStep: pw.TestStep): string;
    id: string;
    hookType: messages.HookType;
    constructor(internalId: string, group: HooksGroup, pwStep: pw.TestStep);
    buildMessage(): {
        hook: messages.Hook;
    };
    private getName;
    private getBeforeHookType;
    private getAfterHookType;
    private getSourceReference;
}
//# sourceMappingURL=Hook.d.ts.map