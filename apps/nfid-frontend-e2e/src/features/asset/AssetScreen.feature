@asset
Feature:Fungible Asset
  As a user, I want to see fungible assets in profile

  @asset1
  Scenario Outline: User should be able to see <chain> in assets
    Given User opens NFID site
    Given authstate is cleared
    And User is already authenticated by <anchor> anchor
    Given User signs in
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
      | Ethereum          | ETH      | 0.1 ETH        | Ethereum          | 25795  | Ethereum          |
      | Internet Computer | ICP      | 0 ICP          | Internet Computer | 28542  | Internet Computer |
      | Internet Computer | WICP     | 0 WICP         | WICP              | 28565  | WICP              |


  @asset2
  Scenario Outline: User should be able to filter assets by blockchain
    Given User opens NFID site
    Given authstate is cleared
    And User is already authenticated by <anchor> anchor
    Given User signs in
    And Tokens displayed on user assets
    Then Open filter menu on assets screen
    And Expect dropdown menu with text "All"
    And Open dropdown menu on page
    And Click checkbox chain <chain>
    Then Asset appears with label <chain>
    Then Only <amount> asset displayed
    Examples:
      | chain             | anchor | amount |
      | Bitcoin           | 25795  | 1      |
      | Ethereum          | 25795  | 3      |
      | Internet Computer | 28542  | 4      |

