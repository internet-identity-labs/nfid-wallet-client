Feature: Recovery phrase
  @ii-recovery-phrase @skip
  Scenario Outline: User authenticates with Internet Identity recovery phrase
    Given User opens NFID /recover-nfid/enter-recovery-phrase
    When User enters recovery phrase of <nfid number> anchor
    And User toggle checkbox "#has-verified-domain"
    And User clicks on recover button
    Then Verifying that user is logged in
    Examples:
      | nfid number |
      | 28593       |
      | 100000830   |
      | 200000276   |
