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
