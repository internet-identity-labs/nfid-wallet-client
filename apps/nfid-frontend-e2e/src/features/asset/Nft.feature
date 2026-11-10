Feature: NFT tab
  As a user, I check details of a NFT

  @nft-details
  Scenario Outline: User checks his NFTs and details of an NFT
    Given User opens NFID site
    And User is already authenticated by <nfid number> anchor
    When User goes to NFTs tab
    Then Verifying that 2 NFT are displayed on collectibles page
    And Verifying that the token with name <NFT name> and collection <collection_id> is displayed
    When User switches to table view
    Then Verifying that the token with name <NFT name> and collection <collection_id> and ID <id> is displayed
    When User goes to details of the nft with name <NFT name> and collection <collection_id>
    Then Verifying that the token with name <NFT name> and collection <collection_id> and ID <id> is displayed
    And Verifying that details are: standard - <standard>, collection - <collection_id>, about - <about>
    Examples:
      | nfid number | NFT name       | collection_id               | id                                          | standard | about                                                                                                                                                  |
      | 200000099   | Boxy Dude #265 | s36wu-5qaaa-aaaah-qcyzq-cai | nuehp-lqkor-uwiaa-aaaaa-b4awg-maqca-aaaee-q | EXT      | Body Dude is a collectible and breedable NFT. There are 62 unique original 100% rare Boxy Dudes with higher breeding power and 9938 with mixed traits. |
