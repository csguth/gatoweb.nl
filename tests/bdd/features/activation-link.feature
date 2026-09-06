Feature: Activation bridge link resolution (issue #173 follow-up)
  The /activate/ bridge page (layouts/activate/list.html) never follows its
  `verify` query parameter blindly — see js/activate/activation-link.js. A
  missing, malformed, or non-http(s) value must resolve to nothing so the
  page can show a "link expired" message instead of rendering a broken or
  unsafe href.

  Scenario Outline: Resolving the verify query parameter
    Given the verify query parameter is "<raw>"
    When the activation link is resolved
    Then the resolved activation link is "<resolved>"

    Examples:
      | raw                                                                          | resolved                                    |
      | https%3A%2F%2Fx.supabase.co%2Fauth%2Fv1%2Fverify%3Ftoken%3Dabc%26type%3Dinvite | https://x.supabase.co/auth/v1/verify?token=abc&type=invite |
      |                                                                              | (none)                                      |
      | javascript%3Aalert(1)                                                       | (none)                                      |
      | not-encoded-not-a-url                                                       | (none)                                      |
