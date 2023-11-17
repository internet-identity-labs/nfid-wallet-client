@sendreceive
Feature:Send/Receive Asset
  As a user, I want to send/receive assets

  @sendreceive1
  Scenario Outline: User should be able to receive transaction
    Given User opens NFID site
    And User is already authenticated by <anchor> anchor
    And Tokens displayed on user assets
    When User opens receive dialog window
    Then Choose <chain> then check that an Account ID is <account_id>
    Examples:
      | chain                           | anchor | account_id                                                                                                        |
      | Bitcoin,Ethereum,Polygon Mumbai | 25795  | mn9cmLSFxFE5ASRNXFnxbdZmEvp4Z...FDm2h,0x00607C1f864508E7De80B6db6A2...f01E7,0x00607C1f864508E7De80B6db6A2...f01E7 |

  @sendreceive2
  Scenario Outline: User should be able to receive ICP transaction
    Given User opens NFID site
    And User is already authenticated by <anchor> anchor
    And Tokens displayed on user assets
    When User opens receive dialog window
    Then Choose <chain> then check that an Account ID is <address>
    And Principal is <principal>
    Examples:
      | chain            | anchor | address                               | principal                             | currency |
      | InternetComputer | 28542  | f7698099e4e9fe3297e5f3b3e0abf...5c4e2 | nejgd-f5frx-ddbma-jtskt-k237v...3-3qe | ICP      |

  @sendreceive3
  Scenario Outline: User should be able to see balance and fee
    Given User opens NFID site
    And User is already authenticated by <anchor> anchor
    And Tokens displayed on user assets
    Then User opens send modal window
    Then Choose <currency> on <chain> from send options
    And Set amount '0.0001'
    Then Wait while balance and fee calculated
    Then Choose <account> from accounts
    Then Wait while balance and fee calculated
    Then Balance is <balance> and fee is <fee> and currency is <currency>
    Examples:
      | chain             | anchor | balance    | fee    | account        | currency |
      | Bitcoin           | 25795  | 0.00006879 | any    | NFID           | BTC      |
      | Polygon Mumbai    | 25795  | 0.2        | any    | NFID           | MATIC    |
      | Polygon Mumbai    | 25795  | 1.0        | any    | NFID           | TST      |
      | Ethereum Goerli   | 25795  | 0.79664164 | any    | NFID           | ETH      |
      | Ethereum Goerli   | 25795  | 20.0       | any    | NFID           | LINK     |
      | Internet Computer | 28542  | 0.00923    | 0.0001 | NFID account 1 | ICP      |

  @sendreceive4
  Scenario Outline: User should be able to see his collectibles on send NFT tab
    Given User opens NFID site
    And User is already authenticated by <anchor> anchor
    And Tokens displayed on user assets
    Then User opens send nft dialog window
    Then User opens choose nft window
    Then User sees option <nft1> in dropdown
    Then User sees option <nft2> in dropdown
    Examples:
      | anchor | nft1       | nft2        |
      | 31870  | AnilAnimal | TestERC1155 |


  @only_deploy_to_main
  Scenario Outline: User should be able to send transaction
    Given User opens NFID site
    And User is already authenticated by <anchor> anchor
    And Tokens displayed on user assets
    And User opens send modal window
    And Choose <currency> on <chain> from send options
    And Set amount <amount>
    Then Wait while balance and fee calculated
    And Choose <account> from accounts
    Then Wait while balance and fee calculated
    And Set <target> address and <amount> and send
    Then Transaction is success
    Examples:
      | chain             | anchor | target                                                           | amount    | currency | account |
      | Bitcoin           | 28567  | mjXH5mLcWY2VRRvSZQ1Q33qXJjzBiUq45p                               | 0.0000001 | BTC      | NFID    |
      | Polygon Mumbai    | 28567  | 0xB1107F4141fb56b07D15b65F1629451443Ff8F8e                       | 0.000001  | MATIC    | NFID    |
      # | Polygon Mumbai    | 28567  | 0xB1107F4141fb56b07D15b65F1629451443Ff8F8e                       | 0.000001  | TST      | NFID account 1 |
      | Ethereum Goerli   | 28567  | 0xB1107F4141fb56b07D15b65F1629451443Ff8F8e                       | 0.000001  | ETH      | NFID    |
      | Internet Computer | 28567  | d5066269d8ae5cd30c23bda91d42e56bd2475bb318d38841c589eb2ae4fe1f06 | 0.0001    | ICP      | NFID    |
      | Ethereum Goerli   | 28567  | 0xB1107F4141fb56b07D15b65F1629451443Ff8F8e                       | 0.000001  | LINK     | NFID    |
