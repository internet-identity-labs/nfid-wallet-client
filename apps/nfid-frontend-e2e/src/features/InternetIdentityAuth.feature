Feature: User should be able to register and authenticate from desktop

  @ii-recovery-phrase
  Scenario Outline: User authenticates with Internet Identity recovery phrase
    Given User opens NFID /recover-nfid/enter-recovery-phrase
    When User enters recovery phrase of <nfid number> anchor
    And User toggle checkbox "#has-verified-domain"
    And User clicks on recover button
    Then User is logged in
    Examples:
      | nfid number |
      | 28593       |
      | 100000830   |
      | 200000276   |
