// Generated from: tests\bdd\features\booking-form.feature
import { test } from "playwright-bdd";

test.describe('Booking form', () => {

  test.beforeEach('Background', async ({ Given, page }, testInfo) => { if (testInfo.error) return;
    await Given('I open the booking form', null, { page }); 
  });
  
  test('Sending without a start date is rejected', async ({ When, Then, And, page }) => { 
    await When('I click "Send booking request" without filling in any dates', null, { page }); 
    await Then('I see an alert asking for the start date'); 
    await And('the booking is not marked as sent', null, { page }); 
  });

  test('Sending without an address is rejected', async ({ Given, When, Then, And, page }) => { 
    await Given('I fill in the first day as "2025-08-10"', null, { page }); 
    await When('I click "Send booking request" without filling in an address', null, { page }); 
    await Then('I see an alert asking for the address'); 
    await And('the booking is not marked as sent', null, { page }); 
  });

  test('A complete booking is sent and shows the WhatsApp confirmation', async ({ Given, When, Then, And, page }) => { 
    await Given('I fill in the first day as "2025-08-10" and the last day as "2025-08-12"', null, { page }); 
    await And('I fill in the address as "Kerkstraat 1, \'s-Hertogenbosch"', null, { page }); 
    await When('I click "Send booking request"', null, { page }); 
    await Then('the booking is marked as sent', null, { page }); 
    await And('the WhatsApp confirmation link includes the phone number "31699999999"', null, { page }); 
    await And('the WhatsApp confirmation link mentions "2025-08-10"', null, { page }); 
  });

  test('No estimated price is shown before a start date is chosen', async ({ Then, page }) => { 
    await Then('the estimated price is not shown', null, { page }); 
  });

  test('Suggested price for a single cat with one visit a day', async ({ Given, Then, And, page }) => { 
    await Given('I fill in the first day as "2025-08-10" and the last day as "2025-08-12"', null, { page }); 
    await And('I add a pet of type "cat"', null, { page }); 
    await And('I choose the "morning" visit preference', null, { page }); 
    await Then('the suggested price is €45.00', null, { page }); 
  });

  test('Suggested price for a cat and a dog with two visits a day', async ({ Given, Then, And, page }) => { 
    await Given('I fill in the first day as "2025-08-10" and the last day as "2025-08-11"', null, { page }); 
    await And('I add a pet of type "cat"', null, { page }); 
    await And('I add a pet of type "dog"', null, { page }); 
    await And('I choose the "both" visit preference', null, { page }); 
    await Then('the suggested price is €70.00', null, { page }); 
  });

  test('Suggested price does not include the seasonal surcharge', async ({ Given, Then, And, page }) => { 
    await Given('I fill in the first day as "2025-07-01" and the last day as "2025-07-02"', null, { page }); 
    await And('I add a pet of type "cat"', null, { page }); 
    await And('I choose the "morning" visit preference', null, { page }); 
    await Then('the suggested price is €30.00', null, { page }); 
  });

  test('Suggested price includes the extra-cat charge for a second cat', async ({ Given, Then, And, page }) => { 
    await Given('I fill in the first day as "2025-08-10" and the last day as "2025-08-12"', null, { page }); 
    await And('I add a pet of type "cat"', null, { page }); 
    await And('I add a pet of type "cat"', null, { page }); 
    await And('I choose the "morning" visit preference', null, { page }); 
    await Then('the suggested price is €60.00', null, { page }); 
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
  {"pwTestLine":10,"pickleLine":8,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":6,"keywordType":"Context","textWithKeyword":"Given I open the booking form","isBg":true,"stepMatchArguments":[]},{"pwStepLine":11,"gherkinStepLine":9,"keywordType":"Action","textWithKeyword":"When I click \"Send booking request\" without filling in any dates","stepMatchArguments":[{"group":{"start":8,"value":"\"Send booking request\"","children":[{"start":9,"value":"Send booking request","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":12,"gherkinStepLine":10,"keywordType":"Outcome","textWithKeyword":"Then I see an alert asking for the start date","stepMatchArguments":[]},{"pwStepLine":13,"gherkinStepLine":11,"keywordType":"Outcome","textWithKeyword":"And the booking is not marked as sent","stepMatchArguments":[]}]},
  {"pwTestLine":16,"pickleLine":13,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":6,"keywordType":"Context","textWithKeyword":"Given I open the booking form","isBg":true,"stepMatchArguments":[]},{"pwStepLine":17,"gherkinStepLine":14,"keywordType":"Context","textWithKeyword":"Given I fill in the first day as \"2025-08-10\"","stepMatchArguments":[{"group":{"start":27,"value":"\"2025-08-10\"","children":[{"start":28,"value":"2025-08-10","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":18,"gherkinStepLine":15,"keywordType":"Action","textWithKeyword":"When I click \"Send booking request\" without filling in an address","stepMatchArguments":[{"group":{"start":8,"value":"\"Send booking request\"","children":[{"start":9,"value":"Send booking request","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":19,"gherkinStepLine":16,"keywordType":"Outcome","textWithKeyword":"Then I see an alert asking for the address","stepMatchArguments":[]},{"pwStepLine":20,"gherkinStepLine":17,"keywordType":"Outcome","textWithKeyword":"And the booking is not marked as sent","stepMatchArguments":[]}]},
  {"pwTestLine":23,"pickleLine":19,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":6,"keywordType":"Context","textWithKeyword":"Given I open the booking form","isBg":true,"stepMatchArguments":[]},{"pwStepLine":24,"gherkinStepLine":20,"keywordType":"Context","textWithKeyword":"Given I fill in the first day as \"2025-08-10\" and the last day as \"2025-08-12\"","stepMatchArguments":[{"group":{"start":27,"value":"\"2025-08-10\"","children":[{"start":28,"value":"2025-08-10","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"},{"group":{"start":60,"value":"\"2025-08-12\"","children":[{"start":61,"value":"2025-08-12","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":25,"gherkinStepLine":21,"keywordType":"Context","textWithKeyword":"And I fill in the address as \"Kerkstraat 1, 's-Hertogenbosch\"","stepMatchArguments":[{"group":{"start":25,"value":"\"Kerkstraat 1, 's-Hertogenbosch\"","children":[{"start":26,"value":"Kerkstraat 1, 's-Hertogenbosch","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":26,"gherkinStepLine":22,"keywordType":"Action","textWithKeyword":"When I click \"Send booking request\"","stepMatchArguments":[{"group":{"start":8,"value":"\"Send booking request\"","children":[{"start":9,"value":"Send booking request","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":27,"gherkinStepLine":23,"keywordType":"Outcome","textWithKeyword":"Then the booking is marked as sent","stepMatchArguments":[]},{"pwStepLine":28,"gherkinStepLine":24,"keywordType":"Outcome","textWithKeyword":"And the WhatsApp confirmation link includes the phone number \"31699999999\"","stepMatchArguments":[{"group":{"start":57,"value":"\"31699999999\"","children":[{"start":58,"value":"31699999999","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":29,"gherkinStepLine":25,"keywordType":"Outcome","textWithKeyword":"And the WhatsApp confirmation link mentions \"2025-08-10\"","stepMatchArguments":[{"group":{"start":40,"value":"\"2025-08-10\"","children":[{"start":41,"value":"2025-08-10","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":32,"pickleLine":27,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":6,"keywordType":"Context","textWithKeyword":"Given I open the booking form","isBg":true,"stepMatchArguments":[]},{"pwStepLine":33,"gherkinStepLine":28,"keywordType":"Outcome","textWithKeyword":"Then the estimated price is not shown","stepMatchArguments":[]}]},
  {"pwTestLine":36,"pickleLine":30,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":6,"keywordType":"Context","textWithKeyword":"Given I open the booking form","isBg":true,"stepMatchArguments":[]},{"pwStepLine":37,"gherkinStepLine":31,"keywordType":"Context","textWithKeyword":"Given I fill in the first day as \"2025-08-10\" and the last day as \"2025-08-12\"","stepMatchArguments":[{"group":{"start":27,"value":"\"2025-08-10\"","children":[{"start":28,"value":"2025-08-10","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"},{"group":{"start":60,"value":"\"2025-08-12\"","children":[{"start":61,"value":"2025-08-12","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":38,"gherkinStepLine":32,"keywordType":"Context","textWithKeyword":"And I add a pet of type \"cat\"","stepMatchArguments":[{"group":{"start":20,"value":"\"cat\"","children":[{"start":21,"value":"cat","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":39,"gherkinStepLine":33,"keywordType":"Context","textWithKeyword":"And I choose the \"morning\" visit preference","stepMatchArguments":[{"group":{"start":13,"value":"\"morning\"","children":[{"start":14,"value":"morning","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":40,"gherkinStepLine":34,"keywordType":"Outcome","textWithKeyword":"Then the suggested price is €45.00","stepMatchArguments":[{"group":{"start":24,"value":"45.00"},"parameterTypeName":"float"}]}]},
  {"pwTestLine":43,"pickleLine":36,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":6,"keywordType":"Context","textWithKeyword":"Given I open the booking form","isBg":true,"stepMatchArguments":[]},{"pwStepLine":44,"gherkinStepLine":37,"keywordType":"Context","textWithKeyword":"Given I fill in the first day as \"2025-08-10\" and the last day as \"2025-08-11\"","stepMatchArguments":[{"group":{"start":27,"value":"\"2025-08-10\"","children":[{"start":28,"value":"2025-08-10","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"},{"group":{"start":60,"value":"\"2025-08-11\"","children":[{"start":61,"value":"2025-08-11","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":45,"gherkinStepLine":38,"keywordType":"Context","textWithKeyword":"And I add a pet of type \"cat\"","stepMatchArguments":[{"group":{"start":20,"value":"\"cat\"","children":[{"start":21,"value":"cat","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":46,"gherkinStepLine":39,"keywordType":"Context","textWithKeyword":"And I add a pet of type \"dog\"","stepMatchArguments":[{"group":{"start":20,"value":"\"dog\"","children":[{"start":21,"value":"dog","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":47,"gherkinStepLine":40,"keywordType":"Context","textWithKeyword":"And I choose the \"both\" visit preference","stepMatchArguments":[{"group":{"start":13,"value":"\"both\"","children":[{"start":14,"value":"both","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":48,"gherkinStepLine":41,"keywordType":"Outcome","textWithKeyword":"Then the suggested price is €70.00","stepMatchArguments":[{"group":{"start":24,"value":"70.00"},"parameterTypeName":"float"}]}]},
  {"pwTestLine":51,"pickleLine":43,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":6,"keywordType":"Context","textWithKeyword":"Given I open the booking form","isBg":true,"stepMatchArguments":[]},{"pwStepLine":52,"gherkinStepLine":44,"keywordType":"Context","textWithKeyword":"Given I fill in the first day as \"2025-07-01\" and the last day as \"2025-07-02\"","stepMatchArguments":[{"group":{"start":27,"value":"\"2025-07-01\"","children":[{"start":28,"value":"2025-07-01","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"},{"group":{"start":60,"value":"\"2025-07-02\"","children":[{"start":61,"value":"2025-07-02","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":53,"gherkinStepLine":45,"keywordType":"Context","textWithKeyword":"And I add a pet of type \"cat\"","stepMatchArguments":[{"group":{"start":20,"value":"\"cat\"","children":[{"start":21,"value":"cat","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":54,"gherkinStepLine":46,"keywordType":"Context","textWithKeyword":"And I choose the \"morning\" visit preference","stepMatchArguments":[{"group":{"start":13,"value":"\"morning\"","children":[{"start":14,"value":"morning","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":55,"gherkinStepLine":47,"keywordType":"Outcome","textWithKeyword":"Then the suggested price is €30.00","stepMatchArguments":[{"group":{"start":24,"value":"30.00"},"parameterTypeName":"float"}]}]},
  {"pwTestLine":58,"pickleLine":49,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":6,"keywordType":"Context","textWithKeyword":"Given I open the booking form","isBg":true,"stepMatchArguments":[]},{"pwStepLine":59,"gherkinStepLine":50,"keywordType":"Context","textWithKeyword":"Given I fill in the first day as \"2025-08-10\" and the last day as \"2025-08-12\"","stepMatchArguments":[{"group":{"start":27,"value":"\"2025-08-10\"","children":[{"start":28,"value":"2025-08-10","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"},{"group":{"start":60,"value":"\"2025-08-12\"","children":[{"start":61,"value":"2025-08-12","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":60,"gherkinStepLine":51,"keywordType":"Context","textWithKeyword":"And I add a pet of type \"cat\"","stepMatchArguments":[{"group":{"start":20,"value":"\"cat\"","children":[{"start":21,"value":"cat","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":61,"gherkinStepLine":52,"keywordType":"Context","textWithKeyword":"And I add a pet of type \"cat\"","stepMatchArguments":[{"group":{"start":20,"value":"\"cat\"","children":[{"start":21,"value":"cat","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":62,"gherkinStepLine":53,"keywordType":"Context","textWithKeyword":"And I choose the \"morning\" visit preference","stepMatchArguments":[{"group":{"start":13,"value":"\"morning\"","children":[{"start":14,"value":"morning","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":63,"gherkinStepLine":54,"keywordType":"Outcome","textWithKeyword":"Then the suggested price is €60.00","stepMatchArguments":[{"group":{"start":24,"value":"60.00"},"parameterTypeName":"float"}]}]},
]; // bdd-data-end