@tsxhistory
Feature:Fungible Asset History
  As a user, I want to see fungible assets transaction history

  @tsxhistory1
  Scenario Outline: User should be able to see transaction history in Sent/Received
    Given User opens NFID site
    And User is already authenticated by <anchor> anchor
    And It log's me in
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
      | 2   | Sent     | Bitcoin           | BTC      | 0.00003269 | 1680864742000 | n2yvAStr9w75oUMyb3c7s4QdQu78Rj9Sjc                               | mohjSavDdQYHRYXcS3uS6ttaHP8amyvX78                               | 28593  |
      | 1   | Sent     | Internet Computer | ICP      | 0.18       | 1681206438000 | 7d2912c28cd074a912be7d0cd5a6f6dd48591045d7d626edc5e6877a3a22314f | d5066269d8ae5cd30c23bda91d42e56bd2475bb318d38841c589eb2ae4fe1f06 | 28593  |
      | 1   | Sent     | Ethereum          | ETH      | 0.05       | 1682378652000 | 0xeaf87e4ddf980280b64f860b1af9bf7decb2e780                       | 0xb1107f4141fb56b07d15b65f1629451443ff8f8e                       | 28593  |
      | 1   | Received | Ethereum          | ETH      | 0.1        | 1682378592000 | 0xb1107f4141fb56b07d15b65f1629451443ff8f8e                       | 0xeaf87e4ddf980280b64f860b1af9bf7decb2e780                       | 28593  |
      | 3   | Received | Ethereum          | FAU      | 1          | 1682376036000 | 0x0000000000000000000000000000000000000000                       | 0x00607c1f864508e7de80b6db6a2cef775b9f01e7                       | 25795  |

  @tsxhistory2
  Scenario Outline: User should be able to see transaction depends on selected app
    Given User opens NFID site
    And User is already authenticated by <anchor> anchor
    And It log's me in
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
      | Received | Bitcoin           | 25795  | 4 TXs | 1    |
      | Received | Ethereum          | 25795  | 4 TXs | 3    |
      | Sent     | Bitcoin           | 28593  | 9 TXs | 2    |
      | Sent     | Ethereum          | 28593  | 9 TXs | 1    |
      | Sent     | Internet Computer | 28593  | 9 TXs | 1    |
      | Received | Internet Computer | 28542  | 1 TXs | 1    |

