// Generated from: tests\bdd\features\invoice-document.feature
import { test } from "playwright-bdd";

test.describe('Invoice document — proforma vs final factuur', () => {

  test.beforeEach('Background', async ({ Given }, testInfo) => { if (testInfo.error) return;
    await Given('the Dutch invoice translations and business config are loaded'); 
  });
  
  test('A booking without a factuur number renders a proforma', async ({ Given, When, Then, And }) => { 
    await Given('a booking from "2025-03-10" to "2025-03-12" for a cat with "morning" preference'); 
    await When('the invoice document is built'); 
    await Then('the document title is "Proforma factuur"'); 
    await And('the document shows the proforma notice'); 
    await And('the document total is €45.00'); 
  });

  test('A paid booking renders the official numbered factuur', async ({ Given, When, Then, And }) => { 
    await Given('a booking from "2025-03-10" to "2025-03-12" for a cat with "morning" preference'); 
    await And('the booking is paid as factuur number 7 on "2025-03-01"'); 
    await When('the invoice document is built'); 
    await Then('the document title is "Factuur 2025-0007"'); 
    await And('the document does not show the proforma notice'); 
    await And('the document total is €45.00'); 
  });

  test('A booking with two cats includes the extra-cat line in the total', async ({ Given, When, Then }) => { 
    await Given('a booking from "2025-03-10" to "2025-03-12" for 2 cats with "morning" preference'); 
    await When('the invoice document is built'); 
    await Then('the document total is €60.00'); 
  });

});

// == technical section ==

test.beforeEach('BeforeEach Hooks', ({ $runScenarioHooks }) => $runScenarioHooks('before', {  }));

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('tests\\bdd\\features\\invoice-document.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":10,"pickleLine":11,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":9,"keywordType":"Context","textWithKeyword":"Given the Dutch invoice translations and business config are loaded","isBg":true,"stepMatchArguments":[]},{"pwStepLine":11,"gherkinStepLine":12,"keywordType":"Context","textWithKeyword":"Given a booking from \"2025-03-10\" to \"2025-03-12\" for a cat with \"morning\" preference","stepMatchArguments":[{"group":{"start":15,"value":"\"2025-03-10\"","children":[{"start":16,"value":"2025-03-10","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"},{"group":{"start":31,"value":"\"2025-03-12\"","children":[{"start":32,"value":"2025-03-12","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"},{"group":{"start":59,"value":"\"morning\"","children":[{"start":60,"value":"morning","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":12,"gherkinStepLine":13,"keywordType":"Action","textWithKeyword":"When the invoice document is built","stepMatchArguments":[]},{"pwStepLine":13,"gherkinStepLine":14,"keywordType":"Outcome","textWithKeyword":"Then the document title is \"Proforma factuur\"","stepMatchArguments":[{"group":{"start":22,"value":"\"Proforma factuur\"","children":[{"start":23,"value":"Proforma factuur","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":14,"gherkinStepLine":15,"keywordType":"Outcome","textWithKeyword":"And the document shows the proforma notice","stepMatchArguments":[]},{"pwStepLine":15,"gherkinStepLine":16,"keywordType":"Outcome","textWithKeyword":"And the document total is €45.00","stepMatchArguments":[{"group":{"start":23,"value":"45.00"},"parameterTypeName":"float"}]}]},
  {"pwTestLine":18,"pickleLine":18,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":9,"keywordType":"Context","textWithKeyword":"Given the Dutch invoice translations and business config are loaded","isBg":true,"stepMatchArguments":[]},{"pwStepLine":19,"gherkinStepLine":19,"keywordType":"Context","textWithKeyword":"Given a booking from \"2025-03-10\" to \"2025-03-12\" for a cat with \"morning\" preference","stepMatchArguments":[{"group":{"start":15,"value":"\"2025-03-10\"","children":[{"start":16,"value":"2025-03-10","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"},{"group":{"start":31,"value":"\"2025-03-12\"","children":[{"start":32,"value":"2025-03-12","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"},{"group":{"start":59,"value":"\"morning\"","children":[{"start":60,"value":"morning","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":20,"gherkinStepLine":20,"keywordType":"Context","textWithKeyword":"And the booking is paid as factuur number 7 on \"2025-03-01\"","stepMatchArguments":[{"group":{"start":38,"value":"7"},"parameterTypeName":"int"},{"group":{"start":43,"value":"\"2025-03-01\"","children":[{"start":44,"value":"2025-03-01","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":21,"gherkinStepLine":21,"keywordType":"Action","textWithKeyword":"When the invoice document is built","stepMatchArguments":[]},{"pwStepLine":22,"gherkinStepLine":22,"keywordType":"Outcome","textWithKeyword":"Then the document title is \"Factuur 2025-0007\"","stepMatchArguments":[{"group":{"start":22,"value":"\"Factuur 2025-0007\"","children":[{"start":23,"value":"Factuur 2025-0007","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":23,"gherkinStepLine":23,"keywordType":"Outcome","textWithKeyword":"And the document does not show the proforma notice","stepMatchArguments":[]},{"pwStepLine":24,"gherkinStepLine":24,"keywordType":"Outcome","textWithKeyword":"And the document total is €45.00","stepMatchArguments":[{"group":{"start":23,"value":"45.00"},"parameterTypeName":"float"}]}]},
  {"pwTestLine":27,"pickleLine":26,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":9,"keywordType":"Context","textWithKeyword":"Given the Dutch invoice translations and business config are loaded","isBg":true,"stepMatchArguments":[]},{"pwStepLine":28,"gherkinStepLine":27,"keywordType":"Context","textWithKeyword":"Given a booking from \"2025-03-10\" to \"2025-03-12\" for 2 cats with \"morning\" preference","stepMatchArguments":[{"group":{"start":15,"value":"\"2025-03-10\"","children":[{"start":16,"value":"2025-03-10","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"},{"group":{"start":31,"value":"\"2025-03-12\"","children":[{"start":32,"value":"2025-03-12","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"},{"group":{"start":48,"value":"2"},"parameterTypeName":"int"},{"group":{"start":60,"value":"\"morning\"","children":[{"start":61,"value":"morning","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":29,"gherkinStepLine":28,"keywordType":"Action","textWithKeyword":"When the invoice document is built","stepMatchArguments":[]},{"pwStepLine":30,"gherkinStepLine":29,"keywordType":"Outcome","textWithKeyword":"Then the document total is €60.00","stepMatchArguments":[{"group":{"start":23,"value":"60.00"},"parameterTypeName":"float"}]}]},
]; // bdd-data-end