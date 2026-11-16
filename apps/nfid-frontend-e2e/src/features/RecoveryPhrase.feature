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
      | 200000101   | 75a5568cd6441ffde06d40442b5ea...23634 | vn4do-ypdc2-w5wrf-5vme3-ljopw...2-sqe |
      | 200000099   | 88a219cd353c78dfb7973381f3fc5...79fa2 | lnomy-nldge-bihr2-wedzc-ont46...6-eae |
      | 200000100   | 1ad373cd558bf77ea360d0946b4b1...f173b | 3nuf7-ugqoq-2yuoa-llo2k-db5i2...5-7ae |
