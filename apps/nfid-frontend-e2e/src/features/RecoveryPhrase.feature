Feature: Log in with Recovery phrase

  @recovery-phrase
  Scenario Outline: User authenticates with recovery phrase
    Given User opens NFID site
    When User opens Auth modal window
    And User clicks the "Other sign in options" button
    And User enters the recovery phrase of <nfid number> anchor
    Then Verifying that user is logged in
    And User opens Receive dialog window
    Then Verifying that the Account ID is <account ID> and the Principal is <wallet address>
    Examples:
      | nfid number | account ID                            | wallet address                        |
      | 28593       | 29ed79c80e1e23bb885eaa817e488...6bd4b | p3564-cqrx3-aysnp-ixd2z-epyx3...3-uqe |
      | 100000830   | 05f121c2d97efa73386133c27f790...57148 | wlmjt-42cl4-bfewy-wqnsd-onwge...a-bqe |
      | 200000276   | 3c23a07edbdca387a29d6ba2c644f...f876e | zmfwj-ds7r7-ixsfr-b6mpz-mz46s...i-yae |
