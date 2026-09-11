Feature: Invite link building (issue #179)
  Lígia's staff dashboard mints a generic invite token for a pre-registered
  client (create_client_invite() in schema.sql, no email involved), which
  js/facturen/clients-app.js turns into the link she copies/sends via
  WhatsApp — see js/facturen/client-invite-link.js. Loading that link is a
  pure read (get_invite_preview()), so — unlike the old Supabase-native
  invite link this replaces — it is never silently consumed by a
  link-preview crawler; no /activate/ bridge page is needed anymore.

  Scenario Outline: The invite link points at the client's preferred language
    Given the site URL is "https://gatoweb.nl"
    And the client's preferred language is "<lang>"
    And a fresh invite token is "abc123"
    When the invite link is built
    Then the invite link is "<link>"

    Examples:
      | lang | link                                                |
      | en   | https://gatoweb.nl/en/account/?invite=abc123        |
      | nl   | https://gatoweb.nl/nl/account/?invite=abc123        |
      | pt   | https://gatoweb.nl/pt/account/?invite=abc123        |
      | fr   | https://gatoweb.nl/en/account/?invite=abc123        |

  Scenario: A trailing slash on the site URL doesn't produce a double slash
    Given the site URL is "https://gatoweb.nl/"
    And the client's preferred language is "en"
    And a fresh invite token is "abc123"
    When the invite link is built
    Then the invite link is "https://gatoweb.nl/en/account/?invite=abc123"
