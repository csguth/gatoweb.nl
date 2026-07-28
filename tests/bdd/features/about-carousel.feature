Feature: About Lígia bio carousel
  As a visitor, I can browse Lígia's bio as a set of short chapters instead of
  one long wall of text, using the next/previous buttons or the dots
  (js/index/about-carousel.js, index.html #about-carousel-track).

  Background:
    Given I open the site with browser language "en-US" and no saved preference

  Scenario: First slide and its dot are active on load
    Then the about carousel is on slide 1 of 6
    And the about carousel shows "Hi, I'm Lígia"

  Scenario: The next button advances to the following slide
    When I click the about carousel next button
    Then the about carousel is on slide 2 of 6
    And the about carousel shows "Care at your cat's pace"

  Scenario: The next button stops at the last slide
    When I click the about carousel next button 5 times
    Then the about carousel is on slide 6 of 6
    And the about carousel shows "Dogs are welcome too"

  Scenario: Clicking a dot jumps directly to that slide
    When I click dot 4 of the about carousel
    Then the about carousel is on slide 4 of 6
    And the about carousel shows "Understanding your cat"

  Scenario: The previous arrow is hidden on the first slide
    Then the about carousel previous button is hidden
    And the about carousel next button is visible

  Scenario: The next arrow is hidden on the last slide
    When I click dot 6 of the about carousel
    Then the about carousel next button is hidden
    And the about carousel previous button is visible

  Scenario: Each slide exactly fills the viewport width on a mobile screen
    Given I use an iPhone-sized viewport
    Then every about carousel slide exactly fills the track width
