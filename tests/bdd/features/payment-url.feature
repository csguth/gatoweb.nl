Feature: Tikkie payment link validation
  Before storing a Tikkie link on a booking (issue #63), the facturen staff tool
  must reject anything that isn't a well-formed absolute http(s) URL, so the
  client never gets a broken or non-payment link on their bookings page
  (see js/facturen/payment-url.js).

  Scenario Outline: Only absolute http(s) URLs are accepted
    Given a Tikkie link "<link>"
    When the link is validated
    Then the link is <verdict>

    Examples:
      | link                          | verdict |
      | https://tikkie.me/pay/abc123  | valid   |
      | http://tikkie.me/pay/abc123   | valid   |
      | tikkie.me/pay/abc123          | invalid |
      | /pay/abc123                   | invalid |
      | javascript:alert(1)           | invalid |
      | ftp://tikkie.me/pay           | invalid |
      |                               | invalid |
      | not a url                     | invalid |
