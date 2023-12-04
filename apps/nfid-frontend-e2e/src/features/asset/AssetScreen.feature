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
      | Internet Computer | ICP      | 0.01007 ICP    | 28542  | Internet Computer      |
      # | Internet Computer | WICP     | 0.01 WICP      | 28565  | WICP                   |
