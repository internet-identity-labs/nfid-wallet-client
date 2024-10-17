Feature: As a user, I can send non fungible tokens

  @sendnft
  Scenario Outline: Send NFT transaction
    Given User opens NFID site
    And User is already authenticated by <nfid number> anchor
    And Tokens displayed on user assets
    And User opens send nft dialog window
    And User opens choose nft window
    When User selects the <tokenName> NFT
    And Set <Account ID> address then send
    Then Transaction is success
    Examples:
      | tokenName  | nfid number | Account ID                                                       |
      | ICPets4504 | 28567       | f2fcf27d5ae274bca000c90f9e9aa70e5e82fdfcdbd3377a9279e11aa1ec49ce |
