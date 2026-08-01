"use strict";
/**
 * Class level @Fixture decorator.
 *
 * This decorator is needed to get access to class Constructor,
 * that in turn is needed to build POM inheritance graph using prototype chain.
 * Method decorators don't have access to Constructor in decoration phase,
 * only in runtime (that is too late).
 *
 * There was idea to use the following way of creating decorators,
 * that eliminates usage of @Fixture:
 * const { Given, When, Then } = createBddDecorators(test, { pomFixture: 'myPOM' });
 * But due to above reason it's not possible.
 * Also it leads to cyclic dependencies: fixture imports test, and test imports fixture.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Fixture = Fixture;
const pomGraph_1 = require("./pomGraph");
function Fixture(arg) {
    const { name, tags } = resolveFixtureOptions(arg);
    // context parameter is required for decorator by TS even though it's not used
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    return (Ctor, _context) => {
        (0, pomGraph_1.createPomNode)(Ctor, name, tags);
    };
}
function resolveFixtureOptions(arg) {
    return typeof arg === 'string' ? { name: arg } : arg;
}
//# sourceMappingURL=fixture.js.map