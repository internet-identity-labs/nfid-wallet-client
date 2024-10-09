@nft-collectibles
Feature:Non Fungible Asset
  As a user, I want to see nft in collectibles

  @nft2
  Scenario Outline: User should be able to see collectibles page
    Given User opens NFID site
    And User is already authenticated by <nfid number> anchor
    Then Open collectibles page
    Then <amount> NFT displayed on collectibles page
    And Token <NFT name> from <collection_id> nft collection displayed
    Then Switch to table
    And NFT <NFT name> <collection_id> <id> displayed
    Examples:
      | amount | nfid number | NFT name                 | collection_id               | id                                          |
      | 3      | 31870       | ICPuppies Wearables #145 | 4gbxl-byaaa-aaaak-aafuq-cai | 3s5hr-4ikor-uwiaa-aaaaa-cqabn-eaqca-aaaci-q |

