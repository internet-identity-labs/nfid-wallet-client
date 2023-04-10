@tsxhistory
Feature:Fungible Asset History
  As a user, I want to see fungible assets transaction history

  @tsxhistory1
  Scenario Outline: User should be able to see transaction history in Sent/Received
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
#      | 1   | Received | Bitcoin           | BTC      | 0.00006879 | 1680510249000 | 2MxAMYp3JVcTbicoHTC7EFy6eN2B1Sersre                              | mn9cmLSFxFE5ASRNXFnxbdZmEvp4ZFDm2h                               | 25795  |
      | 1   | Received | Internet Computer | ICP      | 0.01       | 1679482557000 | d5066269d8ae5cd30c23bda91d42e56bd2475bb318d38841c589eb2ae4fe1f06 | 8f4835777b8e7abf166ab5e7390abf5c4871d55204994ca30d25d90af30d52ba | 28542  |
#      | 2   | Sent     | Bitcoin           | BTC      | 0.00003269 | 1680864742000 | n2yvAStr9w75oUMyb3c7s4QdQu78Rj9Sjc                               | mohjSavDdQYHRYXcS3uS6ttaHP8amyvX78                               | 28593  |
#      | 1   | Received | Ethereum          | ETH      | 0.1        | 1680091200000 | 0x51c20059d7084e3d381403939d5dc3158f891a8e                       | 0x36c4dac48217546e0be2b5057857e76ac784b3c7                       | 10974  |

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

