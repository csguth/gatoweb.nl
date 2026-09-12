Feature: Standalone Clients page (issue #173 follow-up)
  Lígia manages her client roster from its own page (/clients/, linked from
  the Invoices dashboard), separate from the invoices kanban board. She can
  register a client, search/filter/sort the roster, page through it, and
  mint a fresh Supabase invite link there to copy or send via WhatsApp
  herself — no email is ever sent automatically. See
  js/facturen/clients-app.js and layouts/clients/list.html.

  Background:
    Given I am logged in on the clients page

  @auth-required
  Scenario: A client who hasn't been invited yet shows the generate-link button
    When my client roster includes "Jane Doe" who hasn't been invited yet
    Then I see the "Not invited yet" status
    And I see a "Generate invite link" button
    And I do not see a "Copy link" button
    And I do not see a "Unlink account" button

  @auth-required
  Scenario: A client who was invited but hasn't logged in yet
    When my client roster includes "Jane Doe" who was invited but hasn't logged in
    Then I see the "Invited" status

  @auth-required
  Scenario: A client who already logged in
    When my client roster includes "Jane Doe" who already logged in
    Then I see the "Logged in" status
    And I see a "Send password reset email" button
    And I see a "Unlink account" button
    And I do not see a "Generate invite link" button

  @auth-required
  Scenario: A freshly generated invite link can be copied or sent via WhatsApp
    Given my client roster includes "Jane Doe" with phone "+31611111111" who hasn't been invited yet
    When a fresh invite link "https://gatoweb.nl/en/account/#token123" is generated
    Then I see a "Copy link" button
    And I see a "Send via WhatsApp" link pointing to WhatsApp number "31611111111"

  @auth-required
  Scenario: Searching the roster narrows the visible rows
    Given my client roster includes clients named "Jane Doe" and "John Smith"
    When I search the roster for "jane"
    Then I see the client row "Jane Doe"
    And I do not see the client row "John Smith"

  @auth-required
  Scenario: Filtering by status narrows the visible rows
    Given my client roster includes "Jane Doe" who hasn't been invited yet
    And my client roster also includes "John Smith" who already logged in
    When I filter the roster by status "Logged in"
    Then I see the client row "John Smith"
    And I do not see the client row "Jane Doe"

  @auth-required
  Scenario: Clicking a column header sorts the roster
    Given my client roster includes clients named "Charlie" and "Alice"
    When I click the "Name" column header
    Then "Alice" appears before "Charlie" in the roster

  @auth-required
  Scenario: A large roster is paginated
    Given my client roster has 15 clients
    Then the page indicator shows "Page 1 of 2"
    When I click the pagination button "Next →"
    Then the page indicator shows "Page 2 of 2"
