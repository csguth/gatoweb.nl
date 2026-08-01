/**
 * Wrapper function to define Cucumber reporter in a type-safe way in Playwright config.
 *
 * Examples:
 * reporter: [cucumberReporter('html', { outputFile: 'cucumber-report.html' })],
 * reporter: [cucumberReporter('./reporter.ts', { foo: 'bar' })],
 */
import type { BuiltinReporters, CucumberReporterOptions } from '.';
export declare function cucumberReporter<T extends keyof BuiltinReporters | string>(type: T, userOptions?: CucumberReporterOptions<T>): [string, unknown];
//# sourceMappingURL=wrapper.d.ts.map