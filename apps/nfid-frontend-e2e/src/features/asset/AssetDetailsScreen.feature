@assetdetails
Feature:Fungible Asset Details
  As a user, I want to see fungible assets details

  @assetdetails1
  Scenario Outline: User should be able to see <label> in asset details
    Given User opens NFID site
    And User is already authenticated by <anchor> anchor
    And Tokens displayed on user assets
    And Open asset with label <label>
    Then Wait while <label> accounts calculated
    Then <label> with <balance> <currency> in header
    And NFID app account 1 with <balance> <currency> displayed
    And 1 row in the table
    And Identifiers are <principal> and <address>
    Examples:
      | label             | currency | balance    | principal | address | anchor |
      | Bitcoin           | BTC      | 0.00006879 |           | mn9c    | 25795  |
      | Ethereum          | ETH      | 0.09664164 |           | 0x00    | 25795  |
      | FaucetToken       | FAU      | 1          |           | 0x00    | 25795  |
      | ChainLink Token   | LINK     | 20         |           | 0x00    | 25795  |
      | Test Token        | TST      | 1          |           | 0x00    | 25795  |
      | Matic             | MATIC    | 0.2        |           | 0x00    | 25795  |
      | Internet Computer | ICP      | 0.01       | ymhy      | 8f48    | 28542  |
      | WICP              | WICP     | 0.01       | m5iz      | aaed    | 28565  |

