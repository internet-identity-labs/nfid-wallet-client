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
      | ICPets4504 | 28567       | f2fcf27d5ae274bca000c90f9e9aa70e5e82fdfcdbd3377a9279e11aa1ec49ce |
