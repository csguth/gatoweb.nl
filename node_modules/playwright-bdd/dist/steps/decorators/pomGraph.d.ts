/**
 * Tree-structure of all POM classes.
 * Allows to guess correct fixture for decorator steps.
 */
type PomClass = Function;
export type PomNode = {
    fixtureName: string;
    fixtureTags?: string;
    className: string;
    children: Set<PomNode>;
};
export declare function createPomNode(Ctor: PomClass, fixtureName: string, fixtureTags?: string): PomNode;
export declare function getPomNodeByFixtureName(fixtureName: string): PomNode | undefined;
export {};
//# sourceMappingURL=pomGraph.d.ts.map