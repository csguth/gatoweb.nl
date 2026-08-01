// Generated from: tests\bdd\features\about-carousel.feature
import { test } from "playwright-bdd";

test.describe('About Lígia bio carousel', () => {

  test.beforeEach('Background', async ({ Given, page }, testInfo) => { if (testInfo.error) return;
    await Given('I open the site with browser language "en-US" and no saved preference', null, { page }); 
  });
  
  test('First slide and its dot are active on load', async ({ Then, And, page }) => { 
    await Then('the about carousel is on slide 1 of 6', null, { page }); 
    await And('the about carousel shows "Hi, I\'m Lígia"', null, { page }); 
  });

  test('The next button advances to the following slide', async ({ When, Then, And, page }) => { 
    await When('I click the about carousel next button', null, { page }); 
    await Then('the about carousel is on slide 2 of 6', null, { page }); 
    await And('the about carousel shows "Care at your cat\'s pace"', null, { page }); 
  });

  test('The next button stops at the last slide', async ({ When, Then, And, page }) => { 
    await When('I click the about carousel next button 5 times', null, { page }); 
    await Then('the about carousel is on slide 6 of 6', null, { page }); 
    await And('the about carousel shows "Dogs are welcome too"', null, { page }); 
  });

  test('Clicking a dot jumps directly to that slide', async ({ When, Then, And, page }) => { 
    await When('I click dot 4 of the about carousel', null, { page }); 
    await Then('the about carousel is on slide 4 of 6', null, { page }); 
    await And('the about carousel shows "Understanding your cat"', null, { page }); 
  });

  test('The previous arrow is hidden on the first slide', async ({ Then, And, page }) => { 
    await Then('the about carousel previous button is hidden', null, { page }); 
    await And('the about carousel next button is visible', null, { page }); 
  });

  test('The next arrow is hidden on the last slide', async ({ When, Then, And, page }) => { 
    await When('I click dot 6 of the about carousel', null, { page }); 
    await Then('the about carousel next button is hidden', null, { page }); 
    await And('the about carousel previous button is visible', null, { page }); 
  });

  test('Each slide exactly fills the viewport width on a mobile screen', async ({ Given, Then, page }) => { 
    await Given('I use an iPhone-sized viewport', null, { page }); 
    await Then('every about carousel slide exactly fills the track width', null, { page }); 
  });

});

// == technical section ==

test.beforeEach('BeforeEach Hooks', ({ $runScenarioHooks }) => $runScenarioHooks('before', {  }));

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('tests\\bdd\\features\\about-carousel.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":10,"pickleLine":9,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I open the site with browser language \"en-US\" and no saved preference","isBg":true,"stepMatchArguments":[{"group":{"start":38,"value":"\"en-US\"","children":[{"start":39,"value":"en-US","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":11,"gherkinStepLine":10,"keywordType":"Outcome","textWithKeyword":"Then the about carousel is on slide 1 of 6","stepMatchArguments":[{"group":{"start":31,"value":"1"},"parameterTypeName":"int"},{"group":{"start":36,"value":"6"},"parameterTypeName":"int"}]},{"pwStepLine":12,"gherkinStepLine":11,"keywordType":"Outcome","textWithKeyword":"And the about carousel shows \"Hi, I'm Lígia\"","stepMatchArguments":[{"group":{"start":25,"value":"\"Hi, I'm Lígia\"","children":[{"start":26,"value":"Hi, I'm Lígia","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":15,"pickleLine":13,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I open the site with browser language \"en-US\" and no saved preference","isBg":true,"stepMatchArguments":[{"group":{"start":38,"value":"\"en-US\"","children":[{"start":39,"value":"en-US","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":16,"gherkinStepLine":14,"keywordType":"Action","textWithKeyword":"When I click the about carousel next button","stepMatchArguments":[]},{"pwStepLine":17,"gherkinStepLine":15,"keywordType":"Outcome","textWithKeyword":"Then the about carousel is on slide 2 of 6","stepMatchArguments":[{"group":{"start":31,"value":"2"},"parameterTypeName":"int"},{"group":{"start":36,"value":"6"},"parameterTypeName":"int"}]},{"pwStepLine":18,"gherkinStepLine":16,"keywordType":"Outcome","textWithKeyword":"And the about carousel shows \"Care at your cat's pace\"","stepMatchArguments":[{"group":{"start":25,"value":"\"Care at your cat's pace\"","children":[{"start":26,"value":"Care at your cat's pace","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":21,"pickleLine":18,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I open the site with browser language \"en-US\" and no saved preference","isBg":true,"stepMatchArguments":[{"group":{"start":38,"value":"\"en-US\"","children":[{"start":39,"value":"en-US","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":22,"gherkinStepLine":19,"keywordType":"Action","textWithKeyword":"When I click the about carousel next button 5 times","stepMatchArguments":[{"group":{"start":39,"value":"5"},"parameterTypeName":"int"}]},{"pwStepLine":23,"gherkinStepLine":20,"keywordType":"Outcome","textWithKeyword":"Then the about carousel is on slide 6 of 6","stepMatchArguments":[{"group":{"start":31,"value":"6"},"parameterTypeName":"int"},{"group":{"start":36,"value":"6"},"parameterTypeName":"int"}]},{"pwStepLine":24,"gherkinStepLine":21,"keywordType":"Outcome","textWithKeyword":"And the about carousel shows \"Dogs are welcome too\"","stepMatchArguments":[{"group":{"start":25,"value":"\"Dogs are welcome too\"","children":[{"start":26,"value":"Dogs are welcome too","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":27,"pickleLine":23,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I open the site with browser language \"en-US\" and no saved preference","isBg":true,"stepMatchArguments":[{"group":{"start":38,"value":"\"en-US\"","children":[{"start":39,"value":"en-US","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":28,"gherkinStepLine":24,"keywordType":"Action","textWithKeyword":"When I click dot 4 of the about carousel","stepMatchArguments":[{"group":{"start":12,"value":"4"},"parameterTypeName":"int"}]},{"pwStepLine":29,"gherkinStepLine":25,"keywordType":"Outcome","textWithKeyword":"Then the about carousel is on slide 4 of 6","stepMatchArguments":[{"group":{"start":31,"value":"4"},"parameterTypeName":"int"},{"group":{"start":36,"value":"6"},"parameterTypeName":"int"}]},{"pwStepLine":30,"gherkinStepLine":26,"keywordType":"Outcome","textWithKeyword":"And the about carousel shows \"Understanding your cat\"","stepMatchArguments":[{"group":{"start":25,"value":"\"Understanding your cat\"","children":[{"start":26,"value":"Understanding your cat","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":33,"pickleLine":28,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I open the site with browser language \"en-US\" and no saved preference","isBg":true,"stepMatchArguments":[{"group":{"start":38,"value":"\"en-US\"","children":[{"start":39,"value":"en-US","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":34,"gherkinStepLine":29,"keywordType":"Outcome","textWithKeyword":"Then the about carousel previous button is hidden","stepMatchArguments":[{"group":{"start":19,"value":"previous"},"parameterTypeName":"word"}]},{"pwStepLine":35,"gherkinStepLine":30,"keywordType":"Outcome","textWithKeyword":"And the about carousel next button is visible","stepMatchArguments":[{"group":{"start":19,"value":"next"},"parameterTypeName":"word"}]}]},
  {"pwTestLine":38,"pickleLine":32,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I open the site with browser language \"en-US\" and no saved preference","isBg":true,"stepMatchArguments":[{"group":{"start":38,"value":"\"en-US\"","children":[{"start":39,"value":"en-US","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":39,"gherkinStepLine":33,"keywordType":"Action","textWithKeyword":"When I click dot 6 of the about carousel","stepMatchArguments":[{"group":{"start":12,"value":"6"},"parameterTypeName":"int"}]},{"pwStepLine":40,"gherkinStepLine":34,"keywordType":"Outcome","textWithKeyword":"Then the about carousel next button is hidden","stepMatchArguments":[{"group":{"start":19,"value":"next"},"parameterTypeName":"word"}]},{"pwStepLine":41,"gherkinStepLine":35,"keywordType":"Outcome","textWithKeyword":"And the about carousel previous button is visible","stepMatchArguments":[{"group":{"start":19,"value":"previous"},"parameterTypeName":"word"}]}]},
  {"pwTestLine":44,"pickleLine":37,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I open the site with browser language \"en-US\" and no saved preference","isBg":true,"stepMatchArguments":[{"group":{"start":38,"value":"\"en-US\"","children":[{"start":39,"value":"en-US","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":45,"gherkinStepLine":38,"keywordType":"Context","textWithKeyword":"Given I use an iPhone-sized viewport","stepMatchArguments":[]},{"pwStepLine":46,"gherkinStepLine":39,"keywordType":"Outcome","textWithKeyword":"Then every about carousel slide exactly fills the track width","stepMatchArguments":[]}]},
]; // bdd-data-end