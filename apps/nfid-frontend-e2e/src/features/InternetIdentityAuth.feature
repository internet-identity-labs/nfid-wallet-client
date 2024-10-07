@ii @recovery
Feature: User should be able to register and authenticate from desktop

  # Scenario: User creates new anchor with Internet Identity

  # Scenario: User authenticates with Internet Identity anchor

  @ii-recovery-phrase
  Scenario Outline: User authenticates with Internet Identity recovery phrase
    Given User opens NFID /recover-nfid/enter-recovery-phrase
    When User enters recovery phrase of <anchor> anchor
    Then I toggle checkbox "#has-verified-domain"
    When I click on recover button
    When It log's me in
    Then Wait while Security accounts calculated
    Examples:
      | anchor    |
      | 28593     |
      | 100000830 |
      | 200000276 |
