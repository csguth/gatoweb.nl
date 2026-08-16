Feature: Social CTA and pricing notes
  Two bits of copy that were easy to miss (issues #115 and #116): the additional
  services line and the seasonal-surcharge caveat were tiny grey text under the
  pricing cards, and there was no invitation anywhere to follow Lígia's Instagram.

  Scenario: The additional services line stands out under the pricing cards
    Given I open the site at "/en/"
    Then the additional services line is emphasised

  Scenario: The seasonal surcharge notice is presented as a notice
    Given I open the site at "/en/"
    Then the seasonal surcharge notice stands out from the body text

  Scenario: The footer invites visitors to follow on social media
    Given I open the site at "/en/"
    Then the page shows "Find me on social media for cat care content and pics of cats!"
    And the social link points at Instagram

  Scenario: The social CTA is translated
    Given I open the site at "/pt/"
    Then the page shows "Me siga nas redes sociais para conteúdo sobre gatos e fotos de gatinhos!"
    And the social link points at Instagram
