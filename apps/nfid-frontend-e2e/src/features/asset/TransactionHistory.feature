@tsxhistory
Feature:Fungible Asset History
  As a user, I want to see fungible assets transaction history

  @tsxhistory1
  Scenario Outline: User should be able to see transaction history in Sent/Received
    Given User opens NFID site
    Given authstate is cleared
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
      | 2   | Sent     | Bitcoin           | BTC      | 0.00003269 | 1680864742000 | n2yvAStr9w75oUMyb3c7s4QdQu78Rj9Sjc                               | mohjSavDdQYHRYXcS3uS6ttaHP8amyvX78                               | 28593  |
      | 1   | Sent     | Internet Computer | ICP      | 0.18       | 1681206438000 | 7d2912c28cd074a912be7d0cd5a6f6dd48591045d7d626edc5e6877a3a22314f | d5066269d8ae5cd30c23bda91d42e56bd2475bb318d38841c589eb2ae4fe1f06 | 28593  |
      | 1   | Sent     | Ethereum          | ETH      | 0.05       | 1681292364000 | 0xf9387c5e8f3ac64824706623daeaa49c65d8b2b1                       | 0xb1107f4141fb56b07d15b65f1629451443ff8f8e                       | 28593  |
      | 1   | Received | Ethereum          | ETH      | 0.1        | 1681205316000 | 0xdc75e8c3ae765d8947adbc6698a2403a6141d439                       | 0xcdf42ca0423a6063fa4e60bdcbceae64f7d07cda                       | 10974  |

  @tsxhistory2
  Scenario Outline: User should be able to see transaction depends on selected app
    Given User opens NFID site
    Given authstate is cleared
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
      | Sent     | Bitcoin           | 28593  | 9 TXs | 2    |
      | Sent     | Ethereum          | 28593  | 9 TXs | 1    |
      | Sent     | Internet Computer | 28593  | 9 TXs | 1    |
      | Received | Internet Computer | 28542  | 1 TXs | 1    |
      | Received | Ethereum          | 10974  | 1 TXs | 1    |

