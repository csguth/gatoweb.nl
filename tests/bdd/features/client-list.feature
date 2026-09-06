Feature: Client roster sort/filter/pagination (issue #173 follow-up)
  The standalone Clients page (js/facturen/clients-app.js) needs to sort,
  filter and paginate the client roster — see js/facturen/client-list.js for
  the pure decision-making covered here.

  Scenario Outline: A client's invite status is derived from its timestamps
    Given a client with invited_at "<invited_at>" and accepted_at "<accepted_at>"
    When the client's status is derived
    Then the status is "<status>"

    Examples:
      | invited_at          | accepted_at         | status   |
      |                     |                     | pending  |
      | 2025-08-01T00:00:00Z |                     | invited  |
      | 2025-08-01T00:00:00Z | 2025-08-02T00:00:00Z | accepted |

  Scenario: Filtering by free-text search matches name, email or phone
    Given a roster of clients:
      | name        | email               | phone       |
      | Jane Doe    | jane@example.com    | 31611111111 |
      | John Smith  | john@example.com    | 31622222222 |
    When the roster is filtered with search "jane" and status "all"
    Then the filtered roster contains only "Jane Doe"

  Scenario: Filtering by status only keeps matching clients
    Given a roster of clients:
      | name       | email             | invited_at           | accepted_at |
      | Jane Doe   | jane@example.com  |                      |             |
      | John Smith | john@example.com  | 2025-08-01T00:00:00Z |             |
      | Ann Lee    | ann@example.com   | 2025-08-01T00:00:00Z | 2025-08-02T00:00:00Z |
    When the roster is filtered with search "" and status "invited"
    Then the filtered roster contains only "John Smith"

  Scenario Outline: Sorting the roster by a column
    Given a roster of clients:
      | name       | email             | created_at           |
      | Charlie    | charlie@x.com     | 2025-08-01T00:00:00Z |
      | Alice      | alice@x.com       | 2025-08-03T00:00:00Z |
      | Bob        | bob@x.com         | 2025-08-02T00:00:00Z |
    When the roster is sorted by "<field>" in "<direction>" order
    Then the sorted roster names are "<order>"

    Examples:
      | field      | direction | order                   |
      | name       | asc       | Alice, Bob, Charlie     |
      | name       | desc      | Charlie, Bob, Alice     |
      | created_at | asc       | Charlie, Bob, Alice     |
      | created_at | desc      | Alice, Bob, Charlie     |

  Scenario Outline: Paginating the roster
    Given a roster of <count> clients
    When the roster is paginated at page <page> with page size <page_size>
    Then the page has <item_count> items
    And the page number is <effective_page>
    And there are <total_pages> total pages

    Examples:
      | count | page | page_size | item_count | effective_page | total_pages |
      | 25    | 1    | 10        | 10         | 1               | 3           |
      | 25    | 2    | 10        | 10         | 2               | 3           |
      | 25    | 3    | 10        | 5          | 3               | 3           |
      | 25    | 99   | 10        | 5          | 3               | 3           |
      | 0     | 1    | 10        | 0          | 1               | 1           |
