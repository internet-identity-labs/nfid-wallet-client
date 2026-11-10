Feature: SendReceive dialog window

  @sendreceive
  Scenario Outline: User is able to select NFT to send. User checks his balance and fee during send flow
    Given User opens NFID site
    And User is already authenticated by <NFID number> anchor
    And Verifying that tokens are displayed on assets tab
    When User opens Send nft dialog window
    And User opens Choose nft dialog window
    Then Verifying that user sees option <nft> in dropdown
    When User clicks the back button in Send window
    And User switches send type
    And User selects <currency> from send options
    And User sets the amount to '0.0001'
    Then Verifying that the balance is calculated as <balance> and fee is calculated as <fee>
    When User refreshes the page
    And User opens Receive dialog window
    Then Verifying that the Account ID is <account ID> and the Principal is <wallet address>
    Examples:
      | NFID number | account ID                            | wallet address                        | nft         | balance | fee    | currency |
      | 200000099   | 88a219cd353c78dfb7973381f3fc5...79fa2 | lnomy-nldge-bihr2-wedzc-ont46...6-eae | BoxyDude265 | 0.2194  | 0.0001 | ICP      |

  @sendreceive
  Scenario Outline: User checks his balance and fee during send flow and his Receive data
    Given User opens NFID site
    And User is already authenticated by <NFID number> anchor
    And Verifying that tokens are displayed on assets tab
    When User opens Send dialog window
    And User selects <currency> from send options
    And User sets the amount to '0.0001'
    Then Verifying that the balance is calculated as <balance> and fee is calculated as <fee>
    When User refreshes the page
    And User opens Receive dialog window
    Then Verifying that the Account ID is <account ID> and the Principal is <wallet address>
    Examples:
      | NFID number | account ID                            | wallet address                        | balance | fee    | currency |
      | 200000103   | 1a119fe7a7d14b424652bc29c77a0...9c2ac | eok5k-qews5-724zh-n33hc-4h5bk...r-nae | 0       | 0.0001 | ICP      |
      | 200000100   | 1ad373cd558bf77ea360d0946b4b1...f173b | 3nuf7-ugqoq-2yuoa-llo2k-db5i2...5-7ae | 0.05    | 0.0001 | ICP      |
