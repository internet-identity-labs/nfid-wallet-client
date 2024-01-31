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
      | chain            | anchor | account_id                            |
      | InternetComputer | 25795  | 648f03de52b30d96398fd77057c3c...fab5c |

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
  Scenario Outline: User should be able to see balance and fee in <chain>
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
      | InternetComputer  | 25795  | 0          | 0.0001 | NFID           | ICP      |

  @sendreceive4
  Scenario Outline: User should be able to see his collectibles on send NFT tab
    Given User opens NFID site
    And User is already authenticated by <anchor> anchor
    And Tokens displayed on user assets
    Then User opens send nft dialog window
    Then User opens choose nft window
    Then User sees option <nft1> in dropdown
    Examples:
      | anchor | nft1          |
      | 31870  | BOXONBLOCK479 |


  @only_deploy_to_main
  Scenario Outline: User should be able to send <chain> transaction
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
      | chain             | anchor | target                                                           | amount   | currency | account |
      | Internet Computer | 28567  | d5066269d8ae5cd30c23bda91d42e56bd2475bb318d38841c589eb2ae4fe1f06 | 0.0001   | ICP      | NFID    |
