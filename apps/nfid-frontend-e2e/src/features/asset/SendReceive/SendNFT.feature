Feature: Send NFT flow

  @sendnft
  Scenario Outline: User makes NFT transaction
    Given User opens NFID site
    And User is already authenticated by <nfid number> anchor
    And Verifying that tokens are displayed on assets tab
    And User opens Send nft dialog window
    And User opens Choose nft dialog window
    When User selects the <tokenName> NFT
    And User sets address to <Account ID> then clicks the "Send" button
    Then Verifying that the transaction is success
    Examples:
      | tokenName  | nfid number | Account ID                                                       |
      | BoxyDude28 | 200000099   | 88a219cd353c78dfb7973381f3fc5fc8b0dd5853b0fa7533149d76a12fa79fa2 |
