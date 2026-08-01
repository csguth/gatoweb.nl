// Generated from: tests\bdd\features\booking-form.feature
import { test } from "playwright-bdd";

test.describe('Booking form', () => {

  test.beforeEach('Background', async ({ Given, page }, testInfo) => { if (testInfo.error) return;
    await Given('I open the booking form', null, { page }); 
  });
  
  test('Sending a booking requires logging in first when accounts are enabled', { tag: ['@auth-required'] }, async ({ Given, When, Then, And, page }) => { 
    await Given('I fill in the first day as "2025-08-10"', null, { page }); 
    await And('I fill in the address as "Kerkstraat 1, \'s-Hertogenbosch"', null, { page }); 
    await When('I click "Send booking request"', null, { page }); 
    await Then('I see the login or signup gate instead of a sent confirmation', null, { page }); 
    await And('the booking is not marked as sent', null, { page }); 
  });

});

// == technical section ==

test.beforeEach('BeforeEach Hooks', ({ $runScenarioHooks }) => $runScenarioHooks('before', {  }));

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('tests\\bdd\\features\\booking-form.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":10,"pickleLine":57,"tags":["@auth-required"],"steps":[{"pwStepLine":7,"gherkinStepLine":6,"keywordType":"Context","textWithKeyword":"Given I open the booking form","isBg":true,"stepMatchArguments":[]},{"pwStepLine":11,"gherkinStepLine":58,"keywordType":"Context","textWithKeyword":"Given I fill in the first day as \"2025-08-10\"","stepMatchArguments":[{"group":{"start":27,"value":"\"2025-08-10\"","children":[{"start":28,"value":"2025-08-10","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":12,"gherkinStepLine":59,"keywordType":"Context","textWithKeyword":"And I fill in the address as \"Kerkstraat 1, 's-Hertogenbosch\"","stepMatchArguments":[{"group":{"start":25,"value":"\"Kerkstraat 1, 's-Hertogenbosch\"","children":[{"start":26,"value":"Kerkstraat 1, 's-Hertogenbosch","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":13,"gherkinStepLine":60,"keywordType":"Action","textWithKeyword":"When I click \"Send booking request\"","stepMatchArguments":[{"group":{"start":8,"value":"\"Send booking request\"","children":[{"start":9,"value":"Send booking request","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":14,"gherkinStepLine":61,"keywordType":"Outcome","textWithKeyword":"Then I see the login or signup gate instead of a sent confirmation","stepMatchArguments":[]},{"pwStepLine":15,"gherkinStepLine":62,"keywordType":"Outcome","textWithKeyword":"And the booking is not marked as sent","stepMatchArguments":[]}]},
]; // bdd-data-end