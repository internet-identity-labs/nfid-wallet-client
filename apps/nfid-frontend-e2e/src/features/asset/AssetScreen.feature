@asset
Feature:Fungible Asset
  As a user, I want to see fungible assets in profile

  @asset1
  Scenario Outline: User should be able to see <chain> in assets
    Given User opens NFID site
    And User is already authenticated by <anchor> anchor
    And Tokens displayed on user assets
    And Asset appears with label <label>
    And <asset> appears with <currency> on <chain> and <balance>
    And <label> <currency> address calculated
    And <label> USD balance not $0.00
    Examples:
      | chain             | currency | balance        | asset             | anchor | label             |
      | Bitcoin           | BTC      | 0.00006879 BTC | Bitcoin           | 25795  | Bitcoin           |
      | Ethereum          | LINK     | 20 LINK        | ChainLink Token   | 25795  | ChainLink Token   |
      | Ethereum          | FAU      | 1 FAU          | FaucetToken       | 25795  | FaucetToken       |
      | Polygon           | MATIC    | 0.2 MATIC      | Matic             | 25795  | Matic             |
      | Polygon           | TST      | 1 TST          | Test Token        | 25795  | Test Token        |
      | Ethereum          | ETH      | 0.09664164 ETH | Ethereum          | 25795  | Ethereum          |
      | Internet Computer | ICP      | 0 ICP          | Internet Computer | 28542  | Internet Computer |
      | Internet Computer | WICP     | 0 WICP         | WICP              | 28565  | WICP              |


  @asset2
  Scenario Outline: User should be able to filter assets by blockchain
    Given User opens NFID site
    And User is already authenticated by <anchor> anchor
    And Tokens displayed on user assets
    Then Open filter menu on assets screen
    And Expect blockchain filter menu with text "All"
    And Open blockchain filter on page
    And Click checkbox chain <chain>
    Then Asset appears with label <label>
    Then Only <amount> asset displayed
    Examples:
      | chain             | anchor | amount | label             |
      | Bitcoin           | 25795  | 1      | Bitcoin           |
      | Ethereum          | 25795  | 3      | Ethereum          |
      | Polygon           | 25795  | 2      | Matic             |
      | Internet Computer | 28542  | 4      | Internet Computer |

  @asset3
  Scenario Outline: User should be able to see NFTs
    Given User opens NFID site
    And User is already authenticated by <anchor> anchor
    And <amount> NFT displayed on assets page
    Then Token <token> from <collection> collection displayed
    Examples:
      | amount | anchor | token       | collection |
      | 4      | 31870  | AnilAnimal  | Rarible    |
      | 4      | 31870  | TestERC1155 | Rarible    |

  @assets-filter-by-account
  Scenario Outline: User should be able to filter assets by account
    Given User opens NFID site
    And User is already authenticated by <anchor> anchor
    And Tokens displayed on user assets
    And Wait while <asset> asset calculated with currency <currency>
    And <asset> appears with <currency> on <chain> and <balanceAll>
    Then Open filter menu on assets screen
    Then Expect account filter menu with text "All"
    And Open account filter on page
    And Click checkbox account <account1>
    And <asset> appears with <currency> on <chain> and <balance1>
    And Click checkbox account <account2>
    And <asset> appears with <currency> on <chain> and <balance2>

    Examples:
      | anchor | chain             | asset | account1      | account2       | balanceAll | balance1 | balance2  | currency |
      | 10271  | Internet Computer | WICP  | NNS account 1 | NFID account 1 | 0.01 WICP  | 0 WICP   | 0.01 WICP | WICP     |
