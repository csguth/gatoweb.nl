// Generated from: tests\bdd\features\tikkie-link.feature
import { test } from "playwright-bdd";

test.describe('Pay with Tikkie link on the client bookings page', () => {

  test('Approved booking with a Tikkie link shows a Pay with Tikkie button', { tag: ['@auth-required'] }, async ({ Given, When, Then, page }) => { 
    await Given('I am logged in on my bookings page', null, { page }); 
    await When('my bookings include an approved booking with the Tikkie link "https://tikkie.me/pay/abc123"', null, { page }); 
    await Then('I see a Pay with Tikkie button linking to "https://tikkie.me/pay/abc123"', null, { page }); 
  });

  test('Approved booking without a Tikkie link shows no payment button', { tag: ['@auth-required'] }, async ({ Given, When, Then, page }) => { 
    await Given('I am logged in on my bookings page', null, { page }); 
    await When('my bookings include an approved booking with no Tikkie link', null, { page }); 
    await Then('I do not see a Pay with Tikkie button', null, { page }); 
  });

  test('A still-pending booking never shows a Pay with Tikkie button', { tag: ['@auth-required'] }, async ({ Given, When, Then, page }) => { 
    await Given('I am logged in on my bookings page', null, { page }); 
    await When('my bookings include a pending booking with the Tikkie link "https://tikkie.me/pay/abc123"', null, { page }); 
    await Then('I do not see a Pay with Tikkie button', null, { page }); 
  });

});

// == technical section ==

test.beforeEach('BeforeEach Hooks', ({ $runScenarioHooks }) => $runScenarioHooks('before', {  }));

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('tests\\bdd\\features\\tikkie-link.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":6,"pickleLine":8,"tags":["@auth-required"],"steps":[{"pwStepLine":7,"gherkinStepLine":9,"keywordType":"Context","textWithKeyword":"Given I am logged in on my bookings page","stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":10,"keywordType":"Action","textWithKeyword":"When my bookings include an approved booking with the Tikkie link \"https://tikkie.me/pay/abc123\"","stepMatchArguments":[{"group":{"start":61,"value":"\"https://tikkie.me/pay/abc123\"","children":[{"start":62,"value":"https://tikkie.me/pay/abc123","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":9,"gherkinStepLine":11,"keywordType":"Outcome","textWithKeyword":"Then I see a Pay with Tikkie button linking to \"https://tikkie.me/pay/abc123\"","stepMatchArguments":[{"group":{"start":42,"value":"\"https://tikkie.me/pay/abc123\"","children":[{"start":43,"value":"https://tikkie.me/pay/abc123","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":12,"pickleLine":14,"tags":["@auth-required"],"steps":[{"pwStepLine":13,"gherkinStepLine":15,"keywordType":"Context","textWithKeyword":"Given I am logged in on my bookings page","stepMatchArguments":[]},{"pwStepLine":14,"gherkinStepLine":16,"keywordType":"Action","textWithKeyword":"When my bookings include an approved booking with no Tikkie link","stepMatchArguments":[]},{"pwStepLine":15,"gherkinStepLine":17,"keywordType":"Outcome","textWithKeyword":"Then I do not see a Pay with Tikkie button","stepMatchArguments":[]}]},
  {"pwTestLine":18,"pickleLine":20,"tags":["@auth-required"],"steps":[{"pwStepLine":19,"gherkinStepLine":21,"keywordType":"Context","textWithKeyword":"Given I am logged in on my bookings page","stepMatchArguments":[]},{"pwStepLine":20,"gherkinStepLine":22,"keywordType":"Action","textWithKeyword":"When my bookings include a pending booking with the Tikkie link \"https://tikkie.me/pay/abc123\"","stepMatchArguments":[{"group":{"start":59,"value":"\"https://tikkie.me/pay/abc123\"","children":[{"start":60,"value":"https://tikkie.me/pay/abc123","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":21,"gherkinStepLine":23,"keywordType":"Outcome","textWithKeyword":"Then I do not see a Pay with Tikkie button","stepMatchArguments":[]}]},
]; // bdd-data-end