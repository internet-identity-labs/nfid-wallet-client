@sendreceive
Feature:Send/Receive Asset
  As a user, I want to send/receive assets

  @sendreceive1
  Scenario Outline: Check that user's chains have correct address and principal
    Given User opens NFID site
    And User is already authenticated by <anchor> anchor
    And Tokens displayed on user assets
    When User opens receive dialog window
    Then Choose <chain> then check that an Account ID is <address>
    And Principal is <principal>
    Examples:
      | chain            | anchor | address                               | principal                             |
      | InternetComputer | 28542  | f7698099e4e9fe3297e5f3b3e0abf...5c4e2 | nejgd-f5frx-ddbma-jtskt-k237v...3-3qe |
      | InternetComputer | 25795  | 648f03de52b30d96398fd77057c3c...fab5c | b35rl-wcza3-5w52t-565sg-eazlm...l-2qe |

  @sendreceive2
  Scenario Outline: User should be able to see balance and fee in <chain>
    Given User opens NFID site
    And User is already authenticated by <anchor> anchor
    And Tokens displayed on user assets
    And User opens send dialog window
    When Choose <currency> on <chain> from send options
    And Set amount '0.0001'
    And Wait while balance and fee calculated
    And Choose <account> from accounts
    Then Wait while balance and fee calculated
    And Balance is <balance> and fee is <fee> and currency is <currency>
    Examples:
      | chain            | anchor | balance | fee    | account | currency |
      | InternetComputer | 25795  | 0       | 0.0001 | NFID    | ICP      |

  @sendreceive3
  Scenario Outline: User should be able to see his collectibles on send NFT tab
    Given User opens NFID site
    And User is already authenticated by <anchor> anchor
    Then Only 1 asset displayed
    Then User opens send nft dialog window
    And User opens choose nft window
    And User sees option <nft1> in dropdown
    Examples:
      | anchor | nft1                  |
      | 31870  | ICPuppiesWearables145 |


  @only_deploy_to_main
  Scenario Outline: User should be able to send <chain> transaction
    Given User opens NFID site
    And User is already authenticated by <anchor> anchor
    And Tokens displayed on user assets
    And User opens send dialog window
    When Choose <currency> on <chain> from send options
    And Set amount <amount>
    And Wait while balance and fee calculated
    And Choose <account> from accounts
    And Wait while balance and fee calculated
    And Set <target> address and <amount> and send
    Then Transaction is success
    Examples:
      | chain             | anchor | target                                                           | amount | currency | account |
      | Internet Computer | 28567  | d5066269d8ae5cd30c23bda91d42e56bd2475bb318d38841c589eb2ae4fe1f06 | 0.0001 | ICP      | NFID    |
