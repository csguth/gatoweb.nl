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

  Scenario Outline: Falling back to a recovery link when the client already has an account
    A client may have already signed up themselves through the normal booking
    form before Lígia got around to inviting them from the clients panel — in
    that case GoTrue rejects a fresh 'invite' link with error_code
    'email_exists', and generateInviteLink() (index.ts) retries once with
    'recovery' instead, which authenticates that existing user just the same.

    Given GoTrue responded to the invite attempt with the body "<response>"
    When the response is checked for an "email already registered" error
    Then the error is <verdict>

    Examples:
      | response                                                             | verdict   |
      | {'code':422,'error_code':'email_exists','msg':'already registered'}  | detected  |
      | {'code':400,'error_code':'validation_failed','msg':'bad request'}    | not detected |
      | not even json                                                        | not detected |

  Scenario: The invite link Lígia copies is a bridge page, never the raw GoTrue link
    WhatsApp's own link-preview crawler fetches any URL pasted into a chat —
    including the invite link — to build the preview card. Since GoTrue's
    verify link is single-use, that automatic fetch would silently consume it
    before the client ever clicks it themselves. buildActivationUrl() wraps
    the real link behind our own /activate/ bridge page instead, which only
    forwards to it on an actual human click (see layouts/activate/list.html).

    Given a raw GoTrue link "https://project.supabase.co/auth/v1/verify?token=abc123&type=recovery"
    When the activation URL is built for site "https://gatoweb.nl" and language "nl"
    Then the activation URL is "https://gatoweb.nl/nl/activate/?verify=https%3A%2F%2Fproject.supabase.co%2Fauth%2Fv1%2Fverify%3Ftoken%3Dabc123%26type%3Drecovery"
