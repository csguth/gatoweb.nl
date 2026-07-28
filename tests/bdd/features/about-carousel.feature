Feature: About Lígia bio carousel
  As a visitor, I can browse Lígia's bio as a set of short chapters instead of
  one long wall of text, using the next/previous buttons or the dots
  (js/index/about-carousel.js, index.html #about-carousel-track).

  Background:
    Given I open the site with browser language "en-US" and no saved preference

  Scenario: First slide and its dot are active on load
    Then the about carousel is on slide 1 of 7
    And the about carousel shows "My story"

  Scenario: The next button advances to the following slide
    When I click the about carousel next button
    Then the about carousel is on slide 2 of 7
    And the about carousel shows "Where it all started"

  Scenario: The previous button is a no-op on the first slide
    When I click the about carousel previous button
    Then the about carousel is on slide 1 of 7

  Scenario: The next button stops at the last slide
    When I click the about carousel next button 6 times
    Then the about carousel is on slide 7 of 7
    And the about carousel shows "Let's meet"
    When I click the about carousel next button
    Then the about carousel is on slide 7 of 7

  Scenario: Clicking a dot jumps directly to that slide
    When I click dot 4 of the about carousel
    Then the about carousel is on slide 4 of 7
    And the about carousel shows "Specialised, gentle care"

  Scenario: Each slide exactly fills the viewport width on a mobile screen
    Given I use an iPhone-sized viewport
    Then every about carousel slide exactly fills the track width
