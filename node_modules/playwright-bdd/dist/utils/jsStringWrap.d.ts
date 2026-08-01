/**
 * Adopted version of https://github.com/joliss/js-string-escape
 * - added support of backticks
 * - added 'quotes' option to indicate which quotes to escape
 * - wrap result string with provided quotes
 *
 * Considered alternative is https://github.com/mathiasbynens/jsesc,
 * but it provides additional functionality and much slower
 * See: https://github.com/mathiasbynens/jsesc/issues/16
 */
export declare function jsStringWrap(str: string, { quotes }?: {
    quotes?: 'single' | 'double' | 'backtick';
}): string;
//# sourceMappingURL=jsStringWrap.d.ts.map