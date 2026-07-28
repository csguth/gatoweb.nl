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

  Scenario: About section shows Lígia's bio in English by default
    Given I open the site with browser language "en-US" and no saved preference
    Then the page shows "Rabbits, guinea pigs, birds, snakes, lizards — I love getting to know every species and follow your care instructions closely so their routine stays the same." and hides "Konijnen, cavia's, vogels, slangen, hagedissen — ik leer graag elke soort kennen en volg je instructies nauwkeurig, zodat hun routine hetzelfde blijft."

  Scenario: About section shows Lígia's bio in Dutch after switching language
    Given I open the site with browser language "en-US" and no saved preference
    When I switch the language to "nl"
    Then the page shows "Konijnen, cavia's, vogels, slangen, hagedissen — ik leer graag elke soort kennen en volg je instructies nauwkeurig, zodat hun routine hetzelfde blijft." and hides "Rabbits, guinea pigs, birds, snakes, lizards — I love getting to know every species and follow your care instructions closely so their routine stays the same."
