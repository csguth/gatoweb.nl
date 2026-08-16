Feature: Navigation on the internal pages
  The account and facturen pages used to be dead ends (issue #98): once a client opened
  "My bookings" there was no link back to the site and no way to start another booking.
  Both now carry layouts/partials/internal-nav.html — the logo links home, and the
  account page also offers a "Book a visit" CTA.

  Scenario: The account page links back to the home page
    Given I open the site at "/en/account/"
    Then the internal navigation links home to "/en/"

  Scenario: The account page offers a way to start a new booking
    Given I open the site at "/en/account/"
    Then the internal navigation links to the booking form at "/en/#booking"

  Scenario: Navigation keeps the visitor in their own language
    Given I open the site at "/pt/account/"
    Then the internal navigation links home to "/pt/"
    And the internal navigation links to the booking form at "/pt/#booking"

  Scenario: The invoicing page links back to the site but offers no booking CTA
    Given I open the site at "/en/facturen/"
    Then the internal navigation links home to "/en/"
    And the internal navigation has no booking CTA

  Scenario: The navigation logo is announced as the home link
    Given I open the site at "/en/account/"
    Then the internal navigation is labelled for assistive technology
