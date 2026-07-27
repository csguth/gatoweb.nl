// Shared mutable "world" object used to pass state between Given/When/Then
// steps within a single Gherkin scenario. Reset before every scenario by the
// Before() hook in hooks.steps.mjs — this avoids relying on a custom Playwright
// fixture (which hit a module-resolution issue with playwright-bdd's generated
// spec files in this environment) while still keeping state properly isolated
// per scenario.
export const world = {};

export function resetWorld() {
  for (const key of Object.keys(world)) delete world[key];
}
