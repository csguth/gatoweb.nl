Feature: Activate page renders a real error message (not a raw i18n key)
  The /activate/ page can show its "link missing/invalid" message on the
  very first paint — before the async i18next runtime (static/js/i18n.js)
  has necessarily finished loading. js/activate/activate-app.js must never
  let that race show the raw translation key instead of real copy.

  Scenario: Visiting /activate/ without a verify link shows the real message
    Given I visit the activate page without a verify link
    Then I see the message "This activation link is missing or invalid. Please ask Lígia for a new one."
    And I do not see the raw key "activate.missing_link"
