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
      | Ethereum          | ETH      | 0.1        | eirk      | 0xcD    | 10974  |
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
    And Open <tab> tab for first account
    Then <txs> transaction in the table
    And Sent <balance> <currency>
    And From <address_from> to <address_to>
    And Date is <millis>
    Examples:
      | txs | tab      | label             | currency | balance    | millis        | address_from                                                     | address_to                                                       | anchor |
      | 1   | Received | Bitcoin           | BTC      | 0.00006879 | 1680510249000 | 2MxAMYp3JVcTbicoHTC7EFy6eN2B1Sersre                              | mn9cmLSFxFE5ASRNXFnxbdZmEvp4ZFDm2h                               | 25795  |
      | 1   | Received | Internet Computer | ICP      | 0.01       | 1679482557000 | d5066269d8ae5cd30c23bda91d42e56bd2475bb318d38841c589eb2ae4fe1f06 | 8f4835777b8e7abf166ab5e7390abf5c4871d55204994ca30d25d90af30d52ba | 28542  |
      | 2   | Sent     | Bitcoin           | BTC      | 0.00005269 | 1680784471000 | n2yvAStr9w75oUMyb3c7s4QdQu78Rj9Sjc                               | mohjSavDdQYHRYXcS3uS6ttaHP8amyvX78                               | 28593  |
      | 1   | Received | Ethereum          | ETH      | 0.1        | 1681205316000 | 0xdc75e8c3ae765d8947adbc6698a2403a6141d439                       | 0xcdf42ca0423a6063fa4e60bdcbceae64f7d07cda                       | 10974  |

  @asset4
  Scenario Outline: User should be able to see transaction depends on selected app
    Given User opens NFID site
    And User is already authenticated by <anchor> anchor
    Given User signs in
    And Tokens displayed on user assets
    And Open asset with label <chain>
    Then Wait while <chain> accounts calculated
    Then Open <tab> tab for first account
    And Open dropdown menu on page
    Then Expect dropdown menu with text "1 selected"
    And Expect txs account "NFID account 1" with txs amount "<txs>"
    And Expect checkbox for account "NFID account 1" is selected
    Then Click checkbox account NFID account 1
    Then Expect dropdown menu with text "All wallets"
    Then <txss> transaction in the table
    Then Click checkbox account NNS account 1
    Then Expect txs account "NNS account 1" with txs amount "0 TXs"
    Then 0 transaction in the table
    Examples:
      | tab      | chain             | anchor | txs   | txss |
      | Received | Bitcoin           | 25795  | 1 TXs | 1    |
      | Sent     | Bitcoin           | 28593  | 5 TXs | 2    |
      | Received | Internet Computer | 28542  | 1 TXs | 1    |
      | Received | Ethereum          | 10974  | 1 TXs | 1    |

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
    Then Only <amount> asset displayed
    Examples:
      | chain             | anchor | amount |
      | Bitcoin           | 25795  | 1      |
      | Ethereum          | 10974  | 1      |
      | Internet Computer | 28542  | 4      |

  @asset6
  Scenario Outline: User should be able to receive transaction
    Given User opens NFID site
    And User is already authenticated by <anchor> anchor
    Given User signs in
    And Tokens displayed on user assets
    Then Asset appears with label <chain>
    And <chain> USD balance is not empty
    Then User opens receive dialog window
    Then Choose BTC from options
    Then Choose NFID Account 1 from receive accounts
#  sc-6838
#    And Account ID is <first_acc_part> ... <second_acc_part>
    Examples:
      | chain   | anchor | first_acc_part                | second_acc_part |
      | Bitcoin | 25795  | mn9cmLSFxFE5ASRNXFnxbdZmEvp4Z | FDm2h           |


  @asset7
  Scenario Outline: User should be able to see balance and fee
    Given User opens NFID site
    And User is already authenticated by <anchor> anchor
    Given User signs in
    And Tokens displayed on user assets
    Then Asset appears with label <chain>
    And <chain> asset calculated
    Then User opens send dialog window
    Then Choose BTC from send options
    Then Choose NFID Account 1 from accounts
#  sc-6838
#    Then Balance is <balance> and fee is <fee>
    Examples:
      | chain   | anchor | balance    | fee      |
      | Bitcoin | 25795  | 0.00006879 | 6e-8 BTC |

  @asset8
  @pending
  Scenario Outline: User should be able to send transaction
    Given User opens NFID site
    And User is already authenticated by <anchor> anchor
    Given User signs in
    And Tokens displayed on user assets
    Then Asset appears with label <chain>
    And <chain> asset calculated
    And User opens send dialog window
    And Choose BTC from send options
    And Choose NFID Account 1 from accounts
    And Set <target> address and <amount> and send
    Then Success window appears with <text>
    Examples:
      | chain   | anchor | target                             | amount    | text                                    |
      | Bitcoin | 28567  | mjXH5mLcWY2VRRvSZQ1Q33qXJjzBiUq45p | 0.0000001 | You've sent 1e-7 BTC. Transaction hash: |


