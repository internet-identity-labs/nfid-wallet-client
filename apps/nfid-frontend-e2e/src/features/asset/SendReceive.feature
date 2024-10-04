@sendreceive
Feature:Send/Receive Asset
  As a user, I want to send/receive assets

  @sendreceive1
  Scenario Outline: Check that user has correct address and principal
    Given User opens NFID site
    And User is already authenticated by <anchor> anchor
    When User opens receive dialog window
    Then Account ID is <address>
    And Principal is <principal>
    Examples:
      | anchor | address                               | principal                             |
      | 28542  | f7698099e4e9fe3297e5f3b3e0abf...5c4e2 | nejgd-f5frx-ddbma-jtskt-k237v...3-3qe |
      | 25795  | 648f03de52b30d96398fd77057c3c...fab5c | b35rl-wcza3-5w52t-565sg-eazlm...l-2qe |

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


  @sendreceive4
  Scenario Outline: User should be able to send <chain> transaction
    Given User opens NFID site
    And User is already authenticated by <anchor> anchor
    And Tokens displayed on user assets
    And User opens send dialog window
    When Choose <currency> on <chain> from send options
    And Set amount <amount>
    And Wait while balance and fee calculated
    And Set <target> address and <amount> and send
    Then Transaction is success
    Examples:
      | chain             | anchor | target                                                          | amount | currency |
      | Internet Computer | 28567  | vso2q-ja7iv-7kzld-zje2z-2c4wd-s4tpj-hp6cv-t5srn-tknjk-ees5l-uqe | 0.0001 | ICP      |
