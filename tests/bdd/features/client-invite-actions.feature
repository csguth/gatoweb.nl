Feature: Client invite actions on the staff Clients page (issue #180 follow-up)
  Lígia's three invite-related actions on /clients/ (generate invite link,
  send password reset, unlink account) all call a Supabase RPC and used to
  have their success/error handling written straight inside the Alpine
  component (clients-app.js), which the BDD suite could never actually
  exercise — only the resulting UI state was testable. The decision logic
  (what counts as success, what message to show) now lives in the pure
  js/facturen/client-invite-actions.js module, with no DOM/Alpine/real
  network involved, so every RPC outcome — including corner cases like a
  permission-denied error or a backend that reports success with no data —
  can be exercised directly here.

  Scenario: Generating an invite link succeeds
    Given the create_client_invite RPC will return token "abc123"
    When I generate an invite link for client "client-1" in "en" from "https://gatoweb.nl"
    Then the invite action succeeds
    And the generated invite link is "https://gatoweb.nl/en/invite/?invite=abc123"

  Scenario: Generating an invite link fails because the RPC errors
    Given the create_client_invite RPC will fail with "permission denied for function create_client_invite"
    When I generate an invite link for client "client-1" in "en" from "https://gatoweb.nl"
    Then the invite action fails with message "permission denied for function create_client_invite"

  Scenario: Generating an invite link fails because the client already has a linked account
    Given the create_client_invite RPC will fail with "client already has a linked account"
    When I generate an invite link for client "client-1" in "en" from "https://gatoweb.nl"
    Then the invite action fails with message "client already has a linked account"

  Scenario: Generating an invite link fails because the RPC returned no token
    Given the create_client_invite RPC will return no token
    When I generate an invite link for client "client-1" in "en" from "https://gatoweb.nl"
    Then the invite action fails with the generic invite error

  Scenario: Sending a password reset email succeeds
    Given the get_linked_account_email RPC will return "jane@example.com"
    And resetPasswordForEmail will succeed
    When I send a password reset for client "client-1" in "en" from "https://gatoweb.nl"
    Then the invite action succeeds

  Scenario: Sending a password reset email fails because the account email lookup errors
    Given the get_linked_account_email RPC will fail with "permission denied for function get_linked_account_email"
    When I send a password reset for client "client-1" in "en" from "https://gatoweb.nl"
    Then the invite action fails with message "permission denied for function get_linked_account_email"

  Scenario: Sending a password reset email fails because no linked account email exists
    Given the get_linked_account_email RPC will return no email
    When I send a password reset for client "client-1" in "en" from "https://gatoweb.nl"
    Then the invite action fails with the generic invite error

  Scenario: Sending a password reset email fails because Supabase Auth rejects the reset itself
    Given the get_linked_account_email RPC will return "jane@example.com"
    And resetPasswordForEmail will fail with "email rate limit exceeded"
    When I send a password reset for client "client-1" in "en" from "https://gatoweb.nl"
    Then the invite action fails with message "email rate limit exceeded"

  Scenario: Unlinking an account succeeds and reports a link existed
    Given the unlink_client_account RPC will return true
    When I unlink the account for client "client-1"
    Then the invite action succeeds
    And the unlink result reports a link existed

  Scenario: Unlinking an account succeeds but reports there was nothing to unlink
    Given the unlink_client_account RPC will return false
    When I unlink the account for client "client-1"
    Then the invite action succeeds
    And the unlink result reports no link existed

  Scenario: Unlinking an account fails because of a permission error (issue #180 bug report)
    Given the unlink_client_account RPC will fail with "permission denied for table account_profile_links"
    When I unlink the account for client "client-1"
    Then the invite action fails with message "permission denied for table account_profile_links"
