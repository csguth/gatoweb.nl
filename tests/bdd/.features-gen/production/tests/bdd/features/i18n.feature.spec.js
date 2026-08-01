// Generated from: tests\bdd\features\i18n.feature
import { test } from "playwright-bdd";

test.describe('Language toggle (EN/NL/PT)', () => {

  test('Default language is English for an English-speaking visitor', async ({ Given, Then, page }) => { 
    await Given('I open the site with browser language "en-US" and no saved preference', null, { page }); 
    await Then('the nav shows "Book a visit" and hides "Boek een bezoek"', null, { page }); 
  });

  test('Switching to Nederlands shows Dutch text', async ({ Given, When, Then, page }) => { 
    await Given('I open the site with browser language "en-US" and no saved preference', null, { page }); 
    await When('I switch the language to "nl"', null, { page }); 
    await Then('the nav shows "Boek een bezoek" and hides "Book a visit"', null, { page }); 
  });

  test('Portuguese shows Portuguese static copy', async ({ Given, When, Then, page }) => { 
    await Given('I open the site with browser language "en-US" and no saved preference', null, { page }); 
    await When('I switch the language to "pt"', null, { page }); 
    await Then('the nav shows "Marque uma visita" and hides "Boek een bezoek"', null, { page }); 
  });

  test('Language choice is remembered after reloading the page', async ({ Given, When, Then, And, page }) => { 
    await Given('I open the site with browser language "en-US" and no saved preference', null, { page }); 
    await When('I switch the language to "nl"', null, { page }); 
    await And('I reload the page', null, { page }); 
    await Then('the nav shows "Boek een bezoek" and hides "Book a visit"', null, { page }); 
  });

  test('About section shows Lígia\'s bio in English by default', async ({ Given, Then, page }) => { 
    await Given('I open the site with browser language "en-US" and no saved preference', null, { page }); 
    await Then('the page shows "Rabbits, guinea pigs, birds, snakes, lizards — I love getting to know every species and follow your care instructions closely so their routine stays the same." and hides "Konijnen, cavia\'s, vogels, slangen, hagedissen — ik leer graag elke soort kennen en volg je instructies nauwkeurig, zodat hun routine hetzelfde blijft."', null, { page }); 
  });

  test('About section shows Lígia\'s bio in Dutch after switching language', async ({ Given, When, Then, page }) => { 
    await Given('I open the site with browser language "en-US" and no saved preference', null, { page }); 
    await When('I switch the language to "nl"', null, { page }); 
    await Then('the page shows "Konijnen, cavia\'s, vogels, slangen, hagedissen — ik leer graag elke soort kennen en volg je instructies nauwkeurig, zodat hun routine hetzelfde blijft." and hides "Rabbits, guinea pigs, birds, snakes, lizards — I love getting to know every species and follow your care instructions closely so their routine stays the same."', null, { page }); 
  });

});

// == technical section ==

test.beforeEach('BeforeEach Hooks', ({ $runScenarioHooks }) => $runScenarioHooks('before', {  }));

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('tests\\bdd\\features\\i18n.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":6,"pickleLine":6,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":7,"keywordType":"Context","textWithKeyword":"Given I open the site with browser language \"en-US\" and no saved preference","stepMatchArguments":[{"group":{"start":38,"value":"\"en-US\"","children":[{"start":39,"value":"en-US","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":8,"gherkinStepLine":8,"keywordType":"Outcome","textWithKeyword":"Then the nav shows \"Book a visit\" and hides \"Boek een bezoek\"","stepMatchArguments":[{"group":{"start":14,"value":"\"Book a visit\"","children":[{"start":15,"value":"Book a visit","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"},{"group":{"start":39,"value":"\"Boek een bezoek\"","children":[{"start":40,"value":"Boek een bezoek","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":11,"pickleLine":10,"tags":[],"steps":[{"pwStepLine":12,"gherkinStepLine":11,"keywordType":"Context","textWithKeyword":"Given I open the site with browser language \"en-US\" and no saved preference","stepMatchArguments":[{"group":{"start":38,"value":"\"en-US\"","children":[{"start":39,"value":"en-US","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":13,"gherkinStepLine":12,"keywordType":"Action","textWithKeyword":"When I switch the language to \"nl\"","stepMatchArguments":[{"group":{"start":25,"value":"\"nl\"","children":[{"start":26,"value":"nl","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":14,"gherkinStepLine":13,"keywordType":"Outcome","textWithKeyword":"Then the nav shows \"Boek een bezoek\" and hides \"Book a visit\"","stepMatchArguments":[{"group":{"start":14,"value":"\"Boek een bezoek\"","children":[{"start":15,"value":"Boek een bezoek","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"},{"group":{"start":42,"value":"\"Book a visit\"","children":[{"start":43,"value":"Book a visit","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":17,"pickleLine":15,"tags":[],"steps":[{"pwStepLine":18,"gherkinStepLine":16,"keywordType":"Context","textWithKeyword":"Given I open the site with browser language \"en-US\" and no saved preference","stepMatchArguments":[{"group":{"start":38,"value":"\"en-US\"","children":[{"start":39,"value":"en-US","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":19,"gherkinStepLine":17,"keywordType":"Action","textWithKeyword":"When I switch the language to \"pt\"","stepMatchArguments":[{"group":{"start":25,"value":"\"pt\"","children":[{"start":26,"value":"pt","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":20,"gherkinStepLine":18,"keywordType":"Outcome","textWithKeyword":"Then the nav shows \"Marque uma visita\" and hides \"Boek een bezoek\"","stepMatchArguments":[{"group":{"start":14,"value":"\"Marque uma visita\"","children":[{"start":15,"value":"Marque uma visita","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"},{"group":{"start":44,"value":"\"Boek een bezoek\"","children":[{"start":45,"value":"Boek een bezoek","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":23,"pickleLine":20,"tags":[],"steps":[{"pwStepLine":24,"gherkinStepLine":21,"keywordType":"Context","textWithKeyword":"Given I open the site with browser language \"en-US\" and no saved preference","stepMatchArguments":[{"group":{"start":38,"value":"\"en-US\"","children":[{"start":39,"value":"en-US","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":25,"gherkinStepLine":22,"keywordType":"Action","textWithKeyword":"When I switch the language to \"nl\"","stepMatchArguments":[{"group":{"start":25,"value":"\"nl\"","children":[{"start":26,"value":"nl","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":26,"gherkinStepLine":23,"keywordType":"Action","textWithKeyword":"And I reload the page","stepMatchArguments":[]},{"pwStepLine":27,"gherkinStepLine":24,"keywordType":"Outcome","textWithKeyword":"Then the nav shows \"Boek een bezoek\" and hides \"Book a visit\"","stepMatchArguments":[{"group":{"start":14,"value":"\"Boek een bezoek\"","children":[{"start":15,"value":"Boek een bezoek","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"},{"group":{"start":42,"value":"\"Book a visit\"","children":[{"start":43,"value":"Book a visit","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":30,"pickleLine":26,"tags":[],"steps":[{"pwStepLine":31,"gherkinStepLine":27,"keywordType":"Context","textWithKeyword":"Given I open the site with browser language \"en-US\" and no saved preference","stepMatchArguments":[{"group":{"start":38,"value":"\"en-US\"","children":[{"start":39,"value":"en-US","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":32,"gherkinStepLine":28,"keywordType":"Outcome","textWithKeyword":"Then the page shows \"Rabbits, guinea pigs, birds, snakes, lizards — I love getting to know every species and follow your care instructions closely so their routine stays the same.\" and hides \"Konijnen, cavia's, vogels, slangen, hagedissen — ik leer graag elke soort kennen en volg je instructies nauwkeurig, zodat hun routine hetzelfde blijft.\"","stepMatchArguments":[{"group":{"start":15,"value":"\"Rabbits, guinea pigs, birds, snakes, lizards — I love getting to know every species and follow your care instructions closely so their routine stays the same.\"","children":[{"start":16,"value":"Rabbits, guinea pigs, birds, snakes, lizards — I love getting to know every species and follow your care instructions closely so their routine stays the same.","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"},{"group":{"start":186,"value":"\"Konijnen, cavia's, vogels, slangen, hagedissen — ik leer graag elke soort kennen en volg je instructies nauwkeurig, zodat hun routine hetzelfde blijft.\"","children":[{"start":187,"value":"Konijnen, cavia's, vogels, slangen, hagedissen — ik leer graag elke soort kennen en volg je instructies nauwkeurig, zodat hun routine hetzelfde blijft.","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":35,"pickleLine":30,"tags":[],"steps":[{"pwStepLine":36,"gherkinStepLine":31,"keywordType":"Context","textWithKeyword":"Given I open the site with browser language \"en-US\" and no saved preference","stepMatchArguments":[{"group":{"start":38,"value":"\"en-US\"","children":[{"start":39,"value":"en-US","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":37,"gherkinStepLine":32,"keywordType":"Action","textWithKeyword":"When I switch the language to \"nl\"","stepMatchArguments":[{"group":{"start":25,"value":"\"nl\"","children":[{"start":26,"value":"nl","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":38,"gherkinStepLine":33,"keywordType":"Outcome","textWithKeyword":"Then the page shows \"Konijnen, cavia's, vogels, slangen, hagedissen — ik leer graag elke soort kennen en volg je instructies nauwkeurig, zodat hun routine hetzelfde blijft.\" and hides \"Rabbits, guinea pigs, birds, snakes, lizards — I love getting to know every species and follow your care instructions closely so their routine stays the same.\"","stepMatchArguments":[{"group":{"start":15,"value":"\"Konijnen, cavia's, vogels, slangen, hagedissen — ik leer graag elke soort kennen en volg je instructies nauwkeurig, zodat hun routine hetzelfde blijft.\"","children":[{"start":16,"value":"Konijnen, cavia's, vogels, slangen, hagedissen — ik leer graag elke soort kennen en volg je instructies nauwkeurig, zodat hun routine hetzelfde blijft.","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"},{"group":{"start":179,"value":"\"Rabbits, guinea pigs, birds, snakes, lizards — I love getting to know every species and follow your care instructions closely so their routine stays the same.\"","children":[{"start":180,"value":"Rabbits, guinea pigs, birds, snakes, lizards — I love getting to know every species and follow your care instructions closely so their routine stays the same.","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
]; // bdd-data-end