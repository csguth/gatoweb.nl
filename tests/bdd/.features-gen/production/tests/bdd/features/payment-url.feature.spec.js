// Generated from: tests\bdd\features\payment-url.feature
import { test } from "playwright-bdd";

test.describe('Tikkie payment link validation', () => {

  test.describe('Only absolute http(s) URLs are accepted', () => {

    test('Example #1', async ({ Given, When, Then }) => { 
      await Given('a Tikkie link "https://tikkie.me/pay/abc123"'); 
      await When('the link is validated'); 
      await Then('the link is valid'); 
    });

    test('Example #2', async ({ Given, When, Then }) => { 
      await Given('a Tikkie link "http://tikkie.me/pay/abc123"'); 
      await When('the link is validated'); 
      await Then('the link is valid'); 
    });

    test('Example #3', async ({ Given, When, Then }) => { 
      await Given('a Tikkie link "tikkie.me/pay/abc123"'); 
      await When('the link is validated'); 
      await Then('the link is invalid'); 
    });

    test('Example #4', async ({ Given, When, Then }) => { 
      await Given('a Tikkie link "/pay/abc123"'); 
      await When('the link is validated'); 
      await Then('the link is invalid'); 
    });

    test('Example #5', async ({ Given, When, Then }) => { 
      await Given('a Tikkie link "javascript:alert(1)"'); 
      await When('the link is validated'); 
      await Then('the link is invalid'); 
    });

    test('Example #6', async ({ Given, When, Then }) => { 
      await Given('a Tikkie link "ftp://tikkie.me/pay"'); 
      await When('the link is validated'); 
      await Then('the link is invalid'); 
    });

    test('Example #7', async ({ Given, When, Then }) => { 
      await Given('a Tikkie link ""'); 
      await When('the link is validated'); 
      await Then('the link is invalid'); 
    });

    test('Example #8', async ({ Given, When, Then }) => { 
      await Given('a Tikkie link "not a url"'); 
      await When('the link is validated'); 
      await Then('the link is invalid'); 
    });

  });

});

// == technical section ==

test.beforeEach('BeforeEach Hooks', ({ $runScenarioHooks }) => $runScenarioHooks('before', {  }));

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('tests\\bdd\\features\\payment-url.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":8,"pickleLine":14,"tags":[],"steps":[{"pwStepLine":9,"gherkinStepLine":8,"keywordType":"Context","textWithKeyword":"Given a Tikkie link \"https://tikkie.me/pay/abc123\"","stepMatchArguments":[{"group":{"start":14,"value":"\"https://tikkie.me/pay/abc123\"","children":[{"start":15,"value":"https://tikkie.me/pay/abc123","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":10,"gherkinStepLine":9,"keywordType":"Action","textWithKeyword":"When the link is validated","stepMatchArguments":[]},{"pwStepLine":11,"gherkinStepLine":10,"keywordType":"Outcome","textWithKeyword":"Then the link is valid","stepMatchArguments":[]}]},
  {"pwTestLine":14,"pickleLine":15,"tags":[],"steps":[{"pwStepLine":15,"gherkinStepLine":8,"keywordType":"Context","textWithKeyword":"Given a Tikkie link \"http://tikkie.me/pay/abc123\"","stepMatchArguments":[{"group":{"start":14,"value":"\"http://tikkie.me/pay/abc123\"","children":[{"start":15,"value":"http://tikkie.me/pay/abc123","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":16,"gherkinStepLine":9,"keywordType":"Action","textWithKeyword":"When the link is validated","stepMatchArguments":[]},{"pwStepLine":17,"gherkinStepLine":10,"keywordType":"Outcome","textWithKeyword":"Then the link is valid","stepMatchArguments":[]}]},
  {"pwTestLine":20,"pickleLine":16,"tags":[],"steps":[{"pwStepLine":21,"gherkinStepLine":8,"keywordType":"Context","textWithKeyword":"Given a Tikkie link \"tikkie.me/pay/abc123\"","stepMatchArguments":[{"group":{"start":14,"value":"\"tikkie.me/pay/abc123\"","children":[{"start":15,"value":"tikkie.me/pay/abc123","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":22,"gherkinStepLine":9,"keywordType":"Action","textWithKeyword":"When the link is validated","stepMatchArguments":[]},{"pwStepLine":23,"gherkinStepLine":10,"keywordType":"Outcome","textWithKeyword":"Then the link is invalid","stepMatchArguments":[]}]},
  {"pwTestLine":26,"pickleLine":17,"tags":[],"steps":[{"pwStepLine":27,"gherkinStepLine":8,"keywordType":"Context","textWithKeyword":"Given a Tikkie link \"/pay/abc123\"","stepMatchArguments":[{"group":{"start":14,"value":"\"/pay/abc123\"","children":[{"start":15,"value":"/pay/abc123","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":28,"gherkinStepLine":9,"keywordType":"Action","textWithKeyword":"When the link is validated","stepMatchArguments":[]},{"pwStepLine":29,"gherkinStepLine":10,"keywordType":"Outcome","textWithKeyword":"Then the link is invalid","stepMatchArguments":[]}]},
  {"pwTestLine":32,"pickleLine":18,"tags":[],"steps":[{"pwStepLine":33,"gherkinStepLine":8,"keywordType":"Context","textWithKeyword":"Given a Tikkie link \"javascript:alert(1)\"","stepMatchArguments":[{"group":{"start":14,"value":"\"javascript:alert(1)\"","children":[{"start":15,"value":"javascript:alert(1)","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":34,"gherkinStepLine":9,"keywordType":"Action","textWithKeyword":"When the link is validated","stepMatchArguments":[]},{"pwStepLine":35,"gherkinStepLine":10,"keywordType":"Outcome","textWithKeyword":"Then the link is invalid","stepMatchArguments":[]}]},
  {"pwTestLine":38,"pickleLine":19,"tags":[],"steps":[{"pwStepLine":39,"gherkinStepLine":8,"keywordType":"Context","textWithKeyword":"Given a Tikkie link \"ftp://tikkie.me/pay\"","stepMatchArguments":[{"group":{"start":14,"value":"\"ftp://tikkie.me/pay\"","children":[{"start":15,"value":"ftp://tikkie.me/pay","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":40,"gherkinStepLine":9,"keywordType":"Action","textWithKeyword":"When the link is validated","stepMatchArguments":[]},{"pwStepLine":41,"gherkinStepLine":10,"keywordType":"Outcome","textWithKeyword":"Then the link is invalid","stepMatchArguments":[]}]},
  {"pwTestLine":44,"pickleLine":20,"tags":[],"steps":[{"pwStepLine":45,"gherkinStepLine":8,"keywordType":"Context","textWithKeyword":"Given a Tikkie link \"\"","stepMatchArguments":[{"group":{"start":14,"value":"\"\"","children":[{"start":15,"value":"","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":46,"gherkinStepLine":9,"keywordType":"Action","textWithKeyword":"When the link is validated","stepMatchArguments":[]},{"pwStepLine":47,"gherkinStepLine":10,"keywordType":"Outcome","textWithKeyword":"Then the link is invalid","stepMatchArguments":[]}]},
  {"pwTestLine":50,"pickleLine":21,"tags":[],"steps":[{"pwStepLine":51,"gherkinStepLine":8,"keywordType":"Context","textWithKeyword":"Given a Tikkie link \"not a url\"","stepMatchArguments":[{"group":{"start":14,"value":"\"not a url\"","children":[{"start":15,"value":"not a url","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":52,"gherkinStepLine":9,"keywordType":"Action","textWithKeyword":"When the link is validated","stepMatchArguments":[]},{"pwStepLine":53,"gherkinStepLine":10,"keywordType":"Outcome","textWithKeyword":"Then the link is invalid","stepMatchArguments":[]}]},
]; // bdd-data-end