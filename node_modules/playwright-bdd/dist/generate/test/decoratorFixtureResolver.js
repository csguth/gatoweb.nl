"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecoratorFixtureResolver = void 0;
/**
 * Resolves fixture names for decorator steps.
 */
const poms_1 = require("./poms");
const exit_1 = require("../../utils/exit");
class DecoratorFixtureResolver {
    constructor(config, testTags) {
        this.config = config;
        this.testPoms = new poms_1.TestPoms();
        testTags.forEach((tag) => this.testPoms.registerPomNodeByTag(tag));
    }
    resolveFixtureNames(stepsData) {
        stepsData.forEach(({ fixtureNames, pomNode }) => {
            fixtureNames.forEach((fixtureName) => {
                this.testPoms.registerPomNodeByFixtureName(fixtureName);
            });
            if (pomNode) {
                this.testPoms.registerPomNode(pomNode);
            }
        });
        this.testPoms.resolveAllFixtures();
        stepsData.forEach((stepData) => {
            if (stepData.pomNode) {
                stepData.pomFixtureName = this.getFixtureName(stepData.pomNode, stepData);
                stepData.fixtureNames.push(stepData.pomFixtureName);
            }
        });
    }
    // eslint-disable-next-line visual/complexity
    getFixtureName(pomNode, stepData) {
        const resolvedFixtures = this.testPoms.getResolvedFixtures(pomNode);
        const firstFixture = resolvedFixtures[0];
        if (resolvedFixtures.length > 1) {
            if (this.config.statefulPoms) {
                return exitAmbiguousDecoratorFixture(stepData, resolvedFixtures);
            }
            else {
                // tagged fixture has priority
                const firstTaggedFixture = resolvedFixtures.find((f) => f.byTag);
                const firstFixtureWithName = firstTaggedFixture?.name || pomNode.fixtureName || firstFixture?.name;
                return firstFixtureWithName || exitEmptyDecoratorFixture(stepData);
            }
        }
        if (!firstFixture) {
            return exitEmptyDecoratorFixture(stepData);
        }
        return firstFixture.name;
    }
}
exports.DecoratorFixtureResolver = DecoratorFixtureResolver;
function exitEmptyDecoratorFixture({ pickleStep, location }) {
    return (0, exit_1.exit)(`No POM fixtures found for decorator step "${pickleStep.text}" at ${location}.`, `Please add @Fixture decorator to the class.`);
}
function exitAmbiguousDecoratorFixture({ pickleStep, location }, resolvedFixtures) {
    const possibleFixturesNames = resolvedFixtures.map((f) => f.name).join(', ');
    return (0, exit_1.exit)(`Multiple POM fixtures found for decorator step "${pickleStep.text}" at ${location}.`, `Possible fixtures: ${possibleFixturesNames}.`, `Please refactor your Page Object classes.`);
}
//# sourceMappingURL=decoratorFixtureResolver.js.map