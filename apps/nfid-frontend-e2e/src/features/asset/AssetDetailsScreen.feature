@assetdetails
Feature:Fungible Asset Details
  As a user, I want to see fungible assets details

  @assetdetails1
  Scenario Outline: User should be able to see <label> in asset details
    Given User opens NFID site
    And User is already authenticated by <anchor> anchor
    And Tokens displayed on user assets
    And Open asset with label <label> and network <network>
    Then Wait while <label> accounts calculated
    Then <label> with <balance> <currency> in header
    And NFID app account 1 with <balance> <currency> displayed
    And 1 row in the table
    And Identifiers are <principal> and <address>
    Examples:
      | label             | network | currency | balance    | principal | address | anchor |
      | Bitcoin           |         | BTC      | 0.00006879 |           | mn9c    | 25795  |
      | Ethereum Goerli   | Goerli  | ETH      | 0.09664164 |           | 0x00    | 25795  |
      | FaucetToken       | Goerli  | FAU      | 1          |           | 0x00    | 25795  |
      | ChainLink Token   | Goerli  | LINK     | 20         |           | 0x00    | 25795  |
      | Test Token        | Mumbai  | TST      | 1          |           | 0x00    | 25795  |
      | Matic             | Mumbai  | MATIC    | 0.2        |           | 0x00    | 25795  |
      | Internet Computer |         | ICP      | 0.01       | ymhy      | 8f48    | 28542  |
      | WICP              |         | WICP     | 0.01       | m5iz      | aaed    | 28565  |

