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
    And Token <token> from <collection> collection displayed
    Then Switch to table
    And <token> <collection> <id> <wallet> displayed

    Examples:
      | amount | anchor | token         | collection | filteredAmount | wallet       | id                                                                            | blockchain       |
      | 6      | 31870  | AnilAnimal    | Rarible    | 3              | NFIDaccount1 | 22558361690228810656161743101174268944760789894532108532742266930527975981633 | Polygon          |
      | 6      | 31870  | TestERC1155   | Rarible    | 1              | NFIDaccount1 | 94667527331073441490639696296732950748865385440430584394830104056550742032385 | Ethereum         |
      | 6      | 31870  | PandaQueen571 | PandaQueen | 2              | NFIDaccount1 | jzwaa-zikor-uwiaa-aaaaa-b4avk-qaqca-aaai5-q                                   | InternetComputer |

