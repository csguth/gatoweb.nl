Feature: Per-language URLs (EN/NL/PT)
  As a visitor, each language is a real page at its own URL, the bare root sends me to
  the right one, and my choice is remembered — so the content is comfortable to read in
  my own language and shareable/indexable per language
  (hugo.toml, layouts/partials/lang-switcher.html, js/root-redirect.js, js/lang-persist.js).

  Scenario: English page renders English copy
    Given I open the site at "/en/"
    Then the page language is "en"
    And the page shows "Book a visit"
    And the page does not show "Boek een bezoek"

  Scenario: Dutch page renders Dutch copy
    Given I open the site at "/nl/"
    Then the page language is "nl"
    And the page shows "Boek een bezoek"
    And the page does not show "Book a visit"

  Scenario: Portuguese page renders Portuguese copy
    Given I open the site at "/pt/"
    Then the page language is "pt"
    And the page shows "Marque uma visita"
    And the page does not show "Boek een bezoek"

  Scenario: About section bio is in English on the English page
    Given I open the site at "/en/"
    Then the page shows "Rabbits, guinea pigs, birds, snakes, lizards — I love getting to know every species and follow your care instructions closely so their routine stays the same."
    And the page does not show "Konijnen, cavia's, vogels, slangen, hagedissen — ik leer graag elke soort kennen en volg je instructies nauwkeurig, zodat hun routine hetzelfde blijft."

  Scenario: About section bio is in Dutch on the Dutch page
    Given I open the site at "/nl/"
    Then the page shows "Konijnen, cavia's, vogels, slangen, hagedissen — ik leer graag elke soort kennen en volg je instructies nauwkeurig, zodat hun routine hetzelfde blijft."
    And the page does not show "Rabbits, guinea pigs, birds, snakes, lizards — I love getting to know every species and follow your care instructions closely so their routine stays the same."

  Scenario: Pricing "/day" suffix is English on the English page (issue #77)
    Given I open the site at "/en/"
    Then the page shows "/day"
    And the page does not show "/dag"

  Scenario: Pricing "/day" suffix is Dutch on the Dutch page (issue #77)
    Given I open the site at "/nl/"
    Then the page shows "/dag"
    And the page does not show "/day"

  Scenario: The language selector links to the same page in another language
    Given I open the site at "/en/"
    When I follow the language selector link for "nl"
    Then the current path is "/nl/"
    And the page shows "Boek een bezoek"

  Scenario: The root redirects an English-speaking visitor to /en/
    Given my browser language is "en-US" and I have no saved language preference
    When I open the root
    Then the current path is "/en/"

  Scenario: The root redirects a Dutch-speaking visitor to /nl/
    Given my browser language is "nl-NL" and I have no saved language preference
    When I open the root
    Then the current path is "/nl/"

  Scenario: The root falls back to English for an unsupported browser language
    Given my browser language is "de-DE" and I have no saved language preference
    When I open the root
    Then the current path is "/en/"

  Scenario: Visiting a language page remembers it for the next visit to the root
    Given I open the site at "/pt/"
    When I open the root
    Then the current path is "/pt/"

  Scenario: The saved preference wins over the browser language
    Given my browser language is "nl-NL" and I have no saved language preference
    And I open the site at "/pt/"
    When I open the root
    Then the current path is "/pt/"
