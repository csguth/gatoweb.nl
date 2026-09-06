Feature: Staff client roster panel (issue #173, MVP)
  Lígia pre-registers an existing client in the facturen dashboard's clients
  panel, then mints a fresh Supabase invite link there to copy or send via
  WhatsApp herself — no email is ever sent automatically. See
  js/facturen/facturen-app.js and layouts/facturen/list.html.

  Background:
    Given I am logged in on the facturen dashboard

  @auth-required
  Scenario: A client who hasn't been invited yet shows the generate-link button
    When my client roster includes "Jane Doe" who hasn't been invited yet
    Then I see the "Not invited yet" status
    And I see a "Generate invite link" button
    And I do not see a "Copy link" button

  @auth-required
  Scenario: A client who was invited but hasn't logged in yet
    When my client roster includes "Jane Doe" who was invited but hasn't logged in
    Then I see the "Invited" status

  @auth-required
  Scenario: A client who already logged in
    When my client roster includes "Jane Doe" who already logged in
    Then I see the "Logged in" status

  @auth-required
  Scenario: A freshly generated invite link can be copied or sent via WhatsApp
    Given my client roster includes "Jane Doe" with phone "+31611111111" who hasn't been invited yet
    When a fresh invite link "https://gatoweb.nl/en/account/#token123" is generated
    Then I see a "Copy link" button
    And I see a "Send via WhatsApp" link pointing to WhatsApp number "31611111111"
