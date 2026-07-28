Feature: Language toggle (EN/NL/PT)
  As a visitor, I can switch the site language and have my choice remembered,
  so the content is comfortable to read in my own language (js/lang-toggle.js,
  css/site.css).

  Scenario: Default language is English for an English-speaking visitor
    Given I open the site with browser language "en-US" and no saved preference
    Then the nav shows "Book a visit" and hides "Boek een bezoek"

  Scenario: Switching to Nederlands shows Dutch text
    Given I open the site with browser language "en-US" and no saved preference
    When I switch the language to "nl"
    Then the nav shows "Boek een bezoek" and hides "Book a visit"

  Scenario: Portuguese shows Portuguese static copy
    Given I open the site with browser language "en-US" and no saved preference
    When I switch the language to "pt"
    Then the nav shows "Marque uma visita" and hides "Boek een bezoek"

  Scenario: Language choice is remembered after reloading the page
    Given I open the site with browser language "en-US" and no saved preference
    When I switch the language to "nl"
    And I reload the page
    Then the nav shows "Boek een bezoek" and hides "Book a visit"

  Scenario: About section shows Lígia's full bio in English by default
    Given I open the site with browser language "en-US" and no saved preference
    Then the page shows "And yes, I also offer dog walks! I've had dogs my entire life and have plenty of experience handling them. I'm confident walking dogs of different sizes and personalities, paying close attention to leash manners, safety, and making each walk enjoyable and stress-free for both your dog and everyone else we meet." and hides "En jawel, ik bied ook hondenuitlaatservice aan! Ik heb mijn hele leven honden gehad en heb veel ervaring met de omgang met ze. Ik loop met vertrouwen met honden van verschillende formaten en persoonlijkheden, met veel aandacht voor lijngedrag, veiligheid en een prettige, stressvrije wandeling voor jouw hond en iedereen die we onderweg tegenkomen."

  Scenario: About section shows Lígia's full bio in Dutch after switching language
    Given I open the site with browser language "en-US" and no saved preference
    When I switch the language to "nl"
    Then the page shows "En jawel, ik bied ook hondenuitlaatservice aan! Ik heb mijn hele leven honden gehad en heb veel ervaring met de omgang met ze. Ik loop met vertrouwen met honden van verschillende formaten en persoonlijkheden, met veel aandacht voor lijngedrag, veiligheid en een prettige, stressvrije wandeling voor jouw hond en iedereen die we onderweg tegenkomen." and hides "And yes, I also offer dog walks! I've had dogs my entire life and have plenty of experience handling them. I'm confident walking dogs of different sizes and personalities, paying close attention to leash manners, safety, and making each walk enjoyable and stress-free for both your dog and everyone else we meet."
