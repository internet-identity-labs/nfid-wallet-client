@assetdetails
Feature:Fungible Asset Details
  As a user, I want to see fungible assets details

  @assetdetails1
  Scenario Outline: User should be able to see <label> in asset details
    Given User opens NFID site
    Given authstate is cleared
    And User is already authenticated by <anchor> anchor
    Given User signs in
    And Tokens displayed on user assets
    And Open asset with label <label>
    Then Wait while <label> accounts calculated
    Then <label> with <balance> <currency> in header
    And NFID app account 1 with <balance> <currency> displayed
    And 1 row in the table
    And Identifiers are <principal> and <address>
    Examples:
      | label             | currency | balance    | principal | address | anchor |
      | Bitcoin           | BTC      | 0.00006879 | 5qfm      | mn9c    | 25795  |
      | Ethereum          | ETH      | 0.1        | eirk      | 0xcD    | 10974  |
      | FaucetToken       | FAU      | 1          | 5qfm      | 0x1e    | 25795  |
      | ChainLink Token   | LINK     | 20         | 5qfm      | 0x1e    | 25795  |
      | Internet Computer | ICP      | 0.01       | ymhy      | 8f48    | 28542  |
      | WICP              | WICP     | 0.01       | m5iz      | aaed    | 28565  |

