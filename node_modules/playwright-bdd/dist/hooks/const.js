"use strict";
/**
 * Some constants used in hooks.
 * Keep this file separate as it is used in the reporter.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AFTER_EACH_HOOKS_GROUP_NAME = exports.BEFORE_EACH_HOOKS_GROUP_NAME = exports.AFTER_ALL_HOOKS_GROUP_NAME = exports.BEFORE_ALL_HOOKS_GROUP_NAME = void 0;
/**
 * The title used in test.beforeAll() call,
 * shown in the reporter as a parent for all BeforeWorker hooks.
 */
exports.BEFORE_ALL_HOOKS_GROUP_NAME = 'BeforeAll Hooks';
/**
 * The title used in test.afterAll() call,
 * shown in the reporter as a parent for all AfterWorker hooks.
 */
exports.AFTER_ALL_HOOKS_GROUP_NAME = 'AfterAll Hooks';
/**
 * The title used in test.beforeEach() call,
 * shown in the reporter as a parent for all BeforeScenario hooks.
 */
exports.BEFORE_EACH_HOOKS_GROUP_NAME = 'BeforeEach Hooks';
/**
 * The title used in test.afterEach() call,
 * shown in the reporter as a parent for all AFterScenario hooks.
 */
exports.AFTER_EACH_HOOKS_GROUP_NAME = 'AfterEach Hooks';
//# sourceMappingURL=const.js.map