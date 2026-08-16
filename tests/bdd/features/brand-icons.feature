Feature: Brand icons
  The site's iconography comes from Lígia's Canva design (issue #139): hand-drawn
  SVGs in static/images/icons/, rendered by layouts/partials/icon.html. They replaced
  the emojis the UI used to lean on — most visibly in the booking form's "Visit
  preference" — which rendered differently on every platform and were announced by
  screen readers.

  Background:
    Given I open the home page

  Scenario: Every visit preference option shows a brand icon instead of an emoji
    Then each "Visit preference" option shows a brand icon
    And the booking form contains no emoji

  Scenario: The pet type options show brand icons
    Then the "Catsitting" option shows the "cat-head" icon
    And the "Dogwalking" option shows the "bone" icon

  Scenario: Brand icons are decorative and stay out of the accessibility tree
    Then every brand icon on the page is hidden from assistive technology
    And the visit preference options are still announced by their labels
