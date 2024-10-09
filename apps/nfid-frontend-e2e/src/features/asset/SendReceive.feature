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
      | anchor    | address                               | principal                             |
      | 28542     | f7698099e4e9fe3297e5f3b3e0abf...5c4e2 | nejgd-f5frx-ddbma-jtskt-k237v...3-3qe |
      | 100000830 | 05f121c2d97efa73386133c27f790...57148 | wlmjt-42cl4-bfewy-wqnsd-onwge...a-bqe |
      | 200000276 | 3c23a07edbdca387a29d6ba2c644f...f876e | zmfwj-ds7r7-ixsfr-b6mpz-mz46s...i-yae |

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
      | chain            | anchor    | balance | fee    | account | currency |
      | InternetComputer | 25795     | 0       | 0.0001 | NFID    | ICP      |
      | InternetComputer | 100000830 | 0.0499  | 0.0001 | NFID    | ICP      |
      | InternetComputer | 200000276 | 0.05    | 0.0001 | NFID    | ICP      |

  @sendreceive3
  Scenario Outline: User should be able to see his collectibles on send NFT tab
    Given User opens NFID site
    And User is already authenticated by <anchor> anchor
    Then Only 1 asset displayed
    Then User opens send nft dialog window
    And User opens choose nft window
    And User sees option <nft1> in dropdown
    Examples:
      | anchor    | nft1                  |
      | 31870     | ICPuppiesWearables145 |
      | 100000830 | ICPets3808            |
      | 200000276 | ICPets349             |


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
