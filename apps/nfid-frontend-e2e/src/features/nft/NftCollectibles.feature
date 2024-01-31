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
      | amount | anchor | token         | collection_id               | filteredAmount | id                                          | blockchain       |
      | 1      | 31870  | BOXONBLOCK479 | 7cpyk-jyaaa-aaaag-qa5na-cai | 1              | fz3lu-3ykor-uwiaa-aaaaa-buahl-iaqca-aaahp-q | InternetComputer |

