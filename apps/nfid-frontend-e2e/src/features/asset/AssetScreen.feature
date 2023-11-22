@asset
Feature:Fungible Asset
  As a user, I want to see fungible assets in profile

  @asset1
  Scenario Outline: User should be able to see <chain> in assets
    Given User opens NFID site
    And User is already authenticated by <anchor> anchor
    And Tokens displayed on user assets
    And Wait while <label> asset calculated with currency <currency>
    And Asset appears with label <label>
    And <label> appears with <currency> on <chain> and <balance>
    And <label> <currency> address calculated
    And <label> USD balance not $0.00
    Examples:
      | chain             | currency | balance        | anchor | label                  |
      | Bitcoin           | BTC      | 0.00006879 BTC | 25795  | Bitcoin                |
      | Ethereum Goerli   | LINK     | 20 LINK        | 25795  | ChainLink Token Goerli |
      | Ethereum Goerli   | FAU      | 1 FAU          | 25795  | FaucetToken Goerli     |
      | Ethereum Goerli   | ETH      | 0.79664164 ETH | 25795  | Ethereum Goerli        |
      | Polygon Mumbai    | MATIC    | 0.2 MATIC      | 25795  | Matic Mumbai           |
      | Polygon Mumbai    | TST      | 1 TST          | 25795  | Test Token Mumbai      |
      | Internet Computer | ICP      | 0.0093 ICP     | 28542  | Internet Computer      |
      | Internet Computer | WICP     | 0.01 WICP      | 28565  | WICP                   |


  @asset2
  Scenario Outline: User should be able to filter assets by <chain> blockchain
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
      | Ethereum Goerli   | 25795  | 5      | Ethereum Goerli   |
#      | Polygon Mumbai    | 25795  | 2      | Matic Mumbai      |
#      | Internet Computer | 28542  | 1      | Internet Computer |

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
