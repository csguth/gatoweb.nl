// Generated from: tests\bdd\features\staging-banner.feature
import { test } from "playwright-bdd";

test.describe('Staging environment banner', () => {

  test('The staging banner is hidden on the production build', async ({ Given, Then, page }) => { 
    await Given('I open the site', null, { page }); 
    await Then('the "STAGING" banner is hidden', null, { page }); 
  });

});

// == technical section ==

test.beforeEach('BeforeEach Hooks', ({ $runScenarioHooks }) => $runScenarioHooks('before', {  }));

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('tests\\bdd\\features\\staging-banner.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":6,"pickleLine":11,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":12,"keywordType":"Context","textWithKeyword":"Given I open the site","stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":13,"keywordType":"Outcome","textWithKeyword":"Then the \"STAGING\" banner is hidden","stepMatchArguments":[{"group":{"start":4,"value":"\"STAGING\"","children":[{"start":5,"value":"STAGING","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
]; // bdd-data-end