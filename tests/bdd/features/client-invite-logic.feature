Feature: Client invite link decisions
  Before Lígia's staff dashboard asks Supabase to generate a native invite
  link for a pre-registered client (issue #173), the client-invite Edge
  Function validates the email and works out which language-prefixed
  /account/ page (issue #12) the client should land on after clicking it —
  see supabase/functions/client-invite/logic.js.

  Scenario Outline: Only well-formed emails are accepted
    Given a client email "<email>"
    When the client email is validated
    Then the client email is <verdict>

    Examples:
      | email                       | verdict |
      | ligia@example.com           | valid   |
      | client.name+tag@site.co     | valid   |
      | not-an-email                | invalid |
      | missing.domain@             | invalid |
      | @missing-local.com          | invalid |
      |                             | invalid |

  Scenario Outline: The invite redirects to the client's preferred language
    Given the site URL is "https://gatoweb.nl"
    And the client's preferred language is "<lang>"
    When the invite redirect is built
    Then the invite redirect URL is "<redirect>"

    Examples:
      | lang | redirect                       |
      | en   | https://gatoweb.nl/en/account/ |
      | nl   | https://gatoweb.nl/nl/account/ |
      | pt   | https://gatoweb.nl/pt/account/ |
      | fr   | https://gatoweb.nl/en/account/ |
