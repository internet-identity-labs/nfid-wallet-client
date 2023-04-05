@asset
Feature:Fungible Asset
  As a user, I want to see fungible assets in profile

  @asset1
  Scenario Outline: User should be able to see <chain> in assets
    Given User opens NFID site
    And User is already authenticated by <anchor> anchor
    Given User signs in
    And Tokens displayed on user assets
    And Asset appears with label <label>
    And <asset> appears with <currency> on <chain> and <balance> && <initial_usd> USD
    And <label> <currency> address calculated
    And <label> USD balance is not empty
    And <label> USD balance not $0.00
    Examples:
      | chain             | currency | balance | asset             | anchor | initial_usd | label             |
      | Bitcoin           | BTC      | 0 BTC   | Bitcoin           | 25795  |             | Bitcoin           |
      | Ethereum          | ETH      | 0 ETH   | Ethereum          | 10974  |             | Ethereum          |
      | Internet Computer | ICP      | 0 ICP   | Internet Computer | 28542  |             | Internet Computer |
      | Internet Computer | WICP     | 0 WICP  | WICP              | 28565  |             | WICP              |

  @asset2
  Scenario Outline: User should be able to see <label> in asset details
    Given User opens NFID site
    And User is already authenticated by <anchor> anchor
    Given User signs in
    And Tokens displayed on user assets
    And Open asset with label <label>
    Then Wait while <label> accounts calculated
    Then <label> with <balance> <currency> in header
    Then 1 row in the table
    And NFID app account 1 with <balance> <currency> displayed
    And Identifiers are <principal> and <address>
    And Account balance in USD not empty
    Examples:
      | label             | currency | balance    | principal | address | anchor |
      | Bitcoin           | BTC      | 0.00006879 | 5qfm      | mn9c    | 25795  |
      | Ethereum          | ETH      | 0.1        | eirk      | 0x36    | 10974  |
      | Internet Computer | ICP      | 0.01       | ymhy      | 8f48    | 28542  |
      | WICP              | WICP     | 0.01       | m5iz      | aaed    | 28565  |

  @asset3
  Scenario Outline: User should be able to see transaction history in Received
    Given User opens NFID site
    And User is already authenticated by <anchor> anchor
    Given User signs in
    And Tokens displayed on user assets
    And Open asset with label <label>
    Then Wait while <label> accounts calculated
    And Open Received tab for first account
    Then 1 transaction in the table
    And Sent <balance> <currency>
    And From <address_from> to <address_to>
    And Date is <millis>
    Examples:
      | label             | currency | balance    | millis        | address_from                                                     | address_to                                                       | anchor |
      | Bitcoin           | BTC      | 0.00006879 | 1680510249000 | 2MxAMYp3JVcTbicoHTC7EFy6eN2B1Sersre                              | mn9cmLSFxFE5ASRNXFnxbdZmEvp4ZFDm2h                               | 25795  |
      | Internet Computer | ICP      | 0.01       | 1679482557000 | d5066269d8ae5cd30c23bda91d42e56bd2475bb318d38841c589eb2ae4fe1f06 | 8f4835777b8e7abf166ab5e7390abf5c4871d55204994ca30d25d90af30d52ba | 28542  |
      | Ethereum          | ETH      | 0.1        | 0.1           | 0x51c20059d7084e3d381403939d5dc3158f891a8e                       | 0x36c4dac48217546e0be2b5057857e76ac784b3c7                       | 10974  |

  @asset4
  Scenario Outline: User should be able to see transaction depends on selected app
    Given User opens NFID site
    And User is already authenticated by <anchor> anchor
    Given User signs in
    And Tokens displayed on user assets
    And Open asset with label <chain>
    Then Wait while <chain> accounts calculated
    Then Open Received tab for first account
    And Open dropdown menu on page
    Then Expect dropdown menu with text "1 selected"
    And Expect txs account "NFID account 1" with txs amount "1 TXs"
    And Expect checkbox for account "NFID account 1" is selected
    Then Click checkbox account NFID account 1
    Then Expect dropdown menu with text "All wallets"
    Then 1 transaction in the table
    Then Click checkbox account NNS account 1
    Then Expect txs account "NNS account 1" with txs amount "0 TXs"
    Then 0 transaction in the table
    Examples:
      | chain             | anchor |
      | Bitcoin           | 25795  |
      | Internet Computer | 28542  |
      | Ethereum          | 10974  |

  @asset5
  Scenario Outline: User should be able to filter assets by blockchain
    Given User opens NFID site
    And User is already authenticated by <anchor> anchor
    Given User signs in
    And Tokens displayed on user assets
    Then Open filter menu on assets screen
    And Expect dropdown menu with text "All"
    And Open dropdown menu on page
    And Click checkbox chain <chain>
    Then Asset appears with label <chain>
    Examples:
      | chain             | anchor |
      | Bitcoin           | 25795  |
      | Ethereum          | 10974  |
      | Internet Computer | 28542  |
