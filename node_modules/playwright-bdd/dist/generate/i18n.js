"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getKeywordsMap = getKeywordsMap;
exports.getKeywordEng = getKeywordEng;
/**
 * Get i18n keywords.
 * See: https://github.com/cucumber/cucumber-js/blob/main/src/cli/i18n.ts
 */
const gherkin_1 = require("@cucumber/gherkin");
function getKeywordsMap(language) {
    const origMap = gherkin_1.dialects[language];
    if (!origMap)
        throw new Error(`Language not found: ${language}`);
    const targetMap = new Map();
    const enKeywords = Object.keys(origMap);
    enKeywords.forEach((enKeyword) => handleKeyword(enKeyword, origMap, targetMap));
    return targetMap;
}
function handleKeyword(enKeyword, origMap, targetMap) {
    const nativeKeywords = origMap[enKeyword];
    // Array.isArray converts to any[]
    if (typeof nativeKeywords === 'string')
        return;
    nativeKeywords.forEach((nativeKeyword) => {
        nativeKeyword = nativeKeyword.trim();
        if (!nativeKeyword || nativeKeyword === '*')
            return;
        targetMap.set(nativeKeyword, capitalizeFirstLetter(enKeyword));
    });
}
function capitalizeFirstLetter(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}
function getKeywordEng(i18nKeywordsMap, keywordOrig) {
    keywordOrig = keywordOrig.trim();
    if (keywordOrig === '*')
        return 'And';
    const keywordEng = i18nKeywordsMap ? i18nKeywordsMap.get(keywordOrig) : keywordOrig;
    if (!keywordEng)
        throw new Error(`Eng keyword not found: ${keywordOrig}`);
    return keywordEng;
}
//# sourceMappingURL=i18n.js.map