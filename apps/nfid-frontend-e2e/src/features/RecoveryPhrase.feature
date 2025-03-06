Feature: Log in with Recovery phrase

  @recovery-phrase
  Scenario Outline: User authenticates with recovery phrase
    Given User opens NFID site
    When User opens Auth modal window
    And User clicks the "Other sign in options" button
    And User enters the recovery phrase of <nfid number> anchor
    Then Verifying that user is logged in
    And User logs out
    Examples:
      | nfid number |
      | 28593       |
      | 100000830   |
      | 200000276   |
