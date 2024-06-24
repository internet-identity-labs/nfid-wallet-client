@nft-collectibles
Feature:Non Fungible Asset
  As a user, I want to see nft in collectibles

  @nft2
  Scenario Outline: User should be able to see collectibles page
    Given User opens NFID site
    And User is already authenticated by <anchor> anchor
    Then Open collectibles page
    Then <amount> NFT displayed on collectibles page
    Then Filter by <blockchain>
    Then <filteredAmount> NFT displayed on collectibles page
    And Token <token> from <collection_id> nft collection displayed
    Then Switch to table
    And NFT <token> <collection_id> <id> displayed
    Examples:
      | amount | anchor | token                    | collection_id               | filteredAmount | id                                          | blockchain       |
      | 2      | 31870  | ICPuppiesWearables145 | 4gbxl-byaaa-aaaak-aafuq-cai | 2              | 3s5hr-4ikor-uwiaa-aaaaa-cqabn-eaqca-aaaci-q | InternetComputer |

