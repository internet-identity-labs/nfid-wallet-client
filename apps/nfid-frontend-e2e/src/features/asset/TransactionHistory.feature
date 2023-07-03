@tsxhistory
Feature:Fungible Asset History
  As a user, I want to see fungible assets transaction history

  @tsxhistory1
  Scenario Outline: User should be able to see transaction history in <tab>
    Given User opens NFID site
    And User is already authenticated by <anchor> anchor
    And Tokens displayed on user assets
    And Open asset with label <label> and network <network>
    Then Wait while <label> accounts calculated
    And Open <tab> tab for first account
    Then <txs> transaction in the table
    And Sent <balance> <currency>
    And From <address_from> to <address_to>
    And Date is <millis>
    Examples:
      | txs | tab      | network | label             | currency | balance    | millis        | address_from                                                     | address_to                                                       | anchor |
#                  Have to be filtered not with nfid.one but with the global account
#      | 1   | Received |         | Bitcoin           | BTC      | 0.00006879 | 1680510249000 | 2MxAMYp3JVcTbicoHTC7EFy6eN2B1Sersre                              | mn9cmLSFxFE5ASRNXFnxbdZmEvp4ZFDm2h                               | 25795  |
#      | 2   | Sent     |         | Bitcoin           | BTC      | 0.000001 | 1680864742000 | n2yvAStr9w75oUMyb3c7s4QdQu78Rj9Sjc                               | mohjSavDdQYHRYXcS3uS6ttaHP8amyvX78                               | 28593  |
      | 1   | Received |         | Internet Computer | ICP      | 0.01       | 1679482557000 | d5066269d8ae5cd30c23bda91d42e56bd2475bb318d38841c589eb2ae4fe1f06 | 8f4835777b8e7abf166ab5e7390abf5c4871d55204994ca30d25d90af30d52ba | 28542  |
      | 1   | Sent     |         | Internet Computer | ICP      | 0.18       | 1681206438000 | 7d2912c28cd074a912be7d0cd5a6f6dd48591045d7d626edc5e6877a3a22314f | d5066269d8ae5cd30c23bda91d42e56bd2475bb318d38841c589eb2ae4fe1f06 | 28593  |
      | 1   | Sent     | Goerli  | Ethereum          | ETH      | 0.05       | 1682378652000 | 0xeaf87e4ddf980280b64f860b1af9bf7decb2e780                       | 0xb1107f4141fb56b07d15b65f1629451443ff8f8e                       | 28593  |
      | 2   | Sent     | Mumbai  | Test Token        | TST      | 0.1        | 1682686127000 | 0xc1ac7969159ca99a50341ee78779c56120632265                       | 0xb1107f4141fb56b07d15b65f1629451443ff8f8e                       | 10974  |
      | 1   | Received | Mumbai  | Test Token        | TST      | 1          | 1682686001000 | 0xe84d601e5d945031129a83e5602be0cc7f182cf3                       | 0xc1ac7969159ca99a50341ee78779c56120632265                       | 10974  |
                  # disabled because of spam token. We need to prepare new E2E acc for this
                  # | 2   | Received | Goerli  | Ethereum          | ETH      | 0.1        | 1682378592000 | 0xb1107f4141fb56b07d15b65f1629451443ff8f8e                       | 0xeaf87e4ddf980280b64f860b1af9bf7decb2e780                       | 28593  |
                  # | 6   | Received | Goerli  | Ethereum          | FAU      | 1          | 1682580072000 | 0x91a636095fa65511a30a9d9ac29549984ad25741                       | 0x00607c1f864508e7de80b6db6a2cef775b9f01e7                       | 25795  |
      | 1   | Received | Goerli  | Ethereum          | NFT      | 1          | 1682582412000 | 0x91a636095fa65511a30a9d9ac29549984ad25741                       | 0xf6319bbb3c94391a95041810c6e4f3adf004e82a                       | 28542  |
      | 1   | Sent     | Mumbai  | Matic             | MATIC    | 0.01       | 1682688335000 | 0xe4ee3c7a77791b899a4f4400bcfcd86d4911e3f6                       | 0xb1107f4141fb56b07d15b65f1629451443ff8f8e                       | 10271  |
      | 2   | Received | Mumbai  | Matic             | MATIC    | 0.01       | 1682689429000 | 0xb1107f4141fb56b07d15b65f1629451443ff8f8e                       | 0xe4ee3c7a77791b899a4f4400bcfcd86d4911e3f6                       | 10271  |


  @tsxhistory2
  Scenario Outline: User should be able to see transaction depends on selected app
    Given User opens NFID site
    And User is already authenticated by <anchor> anchor
    And Tokens displayed on user assets
    And Open asset with label <label> and network <network>
    Then Wait while <label> accounts calculated
    Then Open <tab> tab for first account
    And Open dropdown menu on page
    And Expect dropdown menu with text "1 selected"
    And Expect txs account "NFID account 1" with txs amount "<txs>"
    And Expect checkbox for account "NFID account 1" is selected
    Then Click checkbox account NFID account 1
    Then Expect dropdown menu with text "All wallets"
    Then <txss> transaction in the table
    Then Click checkbox account NNS account 1
    Then Expect txs account "NNS account 1" with txs amount "0 TXs"
    Then 0 transaction in the table
    Examples:
      | tab      | network | label             | anchor | txs    | txss |
      | Received |         | Bitcoin           | 25795  | 10 TXs | 1    |
      | Received | Goerli  | Ethereum          | 25795  | 10 TXs | 6    |
      | Sent     |         | Bitcoin           | 28593  | 8 TXs  | 2    |
      | Sent     | Goerli  | Ethereum          | 28593  | 8 TXs  | 1    |
      | Sent     |         | Internet Computer | 28593  | 8 TXs  | 1    |
      | Received |         | Internet Computer | 28542  | 2 TXs  | 1    |
      | Received | Goerli  | Ethereum          | 28542  | 2 TXs  | 1    |
      | Sent     | Mumbai  | Test Token        | 10974  | 3 TXs  | 2    |
      | Received | Mumbai  | Test Token        | 10974  | 3 TXs  | 1    |

