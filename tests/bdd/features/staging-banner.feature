Feature: Staging environment banner
  The site must clearly show when it's running on staging (not production), so
  nobody mistakes a test environment for the live site (css/site.css,
  ENV_LABEL build variable — see README "Environments").

  @staging-env
  Scenario: The staging banner is visible on the staging build
    Given I open the site
    Then the "STAGING" banner is visible

  Scenario: The staging banner is hidden on the production build
    Given I open the site
    Then the "STAGING" banner is hidden
