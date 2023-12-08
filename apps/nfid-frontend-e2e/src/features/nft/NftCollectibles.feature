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
    And NFT <token> <collection_id> <id> <wallet> displayed

    Examples:
      | amount | anchor | token         | collection_id                              | filteredAmount | wallet       | id                                                                            | blockchain       |
      | 3      | 31870  | AnilAnimal    | 0x67a8fe17db4d441f96f26094677763a2213a3b5f | 3              | NFID         | 22558361690228810656161743101174268944760789894532108532742266930527975981633 | Polygon Mumbai   |

