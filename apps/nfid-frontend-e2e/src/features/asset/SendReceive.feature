Feature:Send/Receive Asset
  As a user, I want to send/receive assets

  @sendreceive1
  Scenario Outline: Check that user has correct address and principal
    Given User opens NFID site
    And User is already authenticated by <NFID number> anchor
    When User opens receive dialog window
    Then Account ID is <account ID>
    And Principal is <wallet address>
    Examples:
      | NFID number | account ID                            | wallet address                        |
      | 28542       | f7698099e4e9fe3297e5f3b3e0abf...5c4e2 | nejgd-f5frx-ddbma-jtskt-k237v...3-3qe |
      | 100000830   | 05f121c2d97efa73386133c27f790...57148 | wlmjt-42cl4-bfewy-wqnsd-onwge...a-bqe |
      | 200000276   | 3c23a07edbdca387a29d6ba2c644f...f876e | zmfwj-ds7r7-ixsfr-b6mpz-mz46s...i-yae |

  @sendreceive2
  Scenario Outline: User should be able to see balance and fee in <category>
    Given User opens NFID site
    And User is already authenticated by <nfid number> anchor
    And Tokens displayed on user assets
    And User opens send dialog window
    When Choose <currency> on <category> from send options
    And Set amount '0.0001'
    And Wait while balance and fee calculated
    And Choose <account> from accounts
    Then Wait while balance and fee calculated
    And Balance is <balance> and fee is <fee> and currency is <currency>
    Examples:
      | category         | nfid number | balance | fee    | account | currency |
      | InternetComputer | 25795       | 0       | 0.0001 | NFID    | ICP      |
      | InternetComputer | 100000830   | 0.0499  | 0.0001 | NFID    | ICP      |
      | InternetComputer | 200000276   | 0.05    | 0.0001 | NFID    | ICP      |

  @sendreceive3
  Scenario Outline: User should be able to see his collectibles on send NFT tab
    Given User opens NFID site
    And User is already authenticated by <nfid number> anchor
    Then Only 1 asset displayed
    Then User opens send nft dialog window
    And User opens choose nft window
    And User sees option <nft> in dropdown
    Examples:
      | nfid number | nft                   |
      | 31870       | ICPuppiesWearables145 |
      | 100000830   | ICPets3808            |
      | 200000276   | ICPets349             |

  @sendreceive4
  Scenario Outline: User should be able to send <category> transaction
    Given User opens NFID site
    And User is already authenticated by <nfid number> anchor
    And Tokens displayed on user assets
    And User opens send dialog window
    When Choose <currency> on <category> from send options
    And Set amount <amount>
    And Wait while balance and fee calculated
    And Set <address> address then send <amount> FT
    Then Transaction is success
    Examples:
      | category          | nfid number | address                                                          | amount | currency |
      | Internet Computer | 28567       | f2fcf27d5ae274bca000c90f9e9aa70e5e82fdfcdbd3377a9279e11aa1ec49ce | 0.0001 | ICP      |
      | BoomDAO           | 28567       | vso2q-ja7iv-7kzld-zje2z-2c4wd-s4tpj-hp6cv-t5srn-tknjk-ees5l-uqe  | 0.0001 | BOOM     |

  @sendreceive5
  Scenario Outline: User sends <category> NFT
    Given User opens NFID site
    And User is already authenticated by <nfid number> anchor
    And Tokens displayed on user assets
    And User opens send nft dialog window
    And User opens choose nft window
    When User selects the <tokenName> NFT
    And Set <Account ID> address then send
    Then Transaction is success
    Examples:
      | tokenName  | nfid number | Account ID                                                       |
      | ICPets4504 | 28567       | f2fcf27d5ae274bca000c90f9e9aa70e5e82fdfcdbd3377a9279e11aa1ec49ce |
