"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Step = exports.Then = exports.When = exports.Given = exports.Fixture = void 0;
const fixture_1 = require("./steps/decorators/fixture");
Object.defineProperty(exports, "Fixture", { enumerable: true, get: function () { return fixture_1.Fixture; } });
const steps_1 = require("./steps/decorators/steps");
exports.Given = (0, steps_1.createStepDecorator)('Given');
exports.When = (0, steps_1.createStepDecorator)('When');
exports.Then = (0, steps_1.createStepDecorator)('Then');
exports.Step = (0, steps_1.createStepDecorator)('Unknown');
//# sourceMappingURL=decorators.js.map