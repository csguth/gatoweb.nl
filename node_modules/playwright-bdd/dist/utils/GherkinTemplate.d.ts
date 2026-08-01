/**
 * Represents Gherkin template: string with <> placeholders.
 * Example: 'Given <name> is <age> years old'
 */
export declare class GherkinTemplate {
    private template;
    constructor(template: string);
    fill(params: Record<string, unknown>): string;
    extractParams(): string[];
}
//# sourceMappingURL=GherkinTemplate.d.ts.map