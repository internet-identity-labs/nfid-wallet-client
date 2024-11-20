Feature: User has correct fee calculation, balance, address and principal in send/receive dialog window

  @sendreceive
  Scenario Outline: Validate fee calculation, balance, address and principal in send/receive dialog window
    Given User opens NFID site
    And User is already authenticated by <NFID number> anchor
    And Only 1 asset displayed
    When User opens send nft dialog window
    And User opens choose nft window
    Then User sees option <nft> in dropdown
    When User click the back button in Send window
    And User switches send type
    And Choose <currency> from send options
    And Set amount '0.0001'
    And Balance is calculated as <balance> and fee is calculated as <fee>
    And Choose <account> from accounts
    Then Balance is <balance> and fee is <fee> and currency is <currency>
    When User refreshes the page
    And User opens receive dialog window
    Then Account ID is <account ID> and Principal is <wallet address>
    Examples:
      | NFID number | account ID                            | wallet address                        | nft                   | balance | fee    | account | currency |
      | 31870       | 0c754c4a1da28c73bd911e4cd3e88...3ae69 | 6hg7q-37lzt-3lpdo-oocet-itvrv...s-vae | ICPuppiesWearables145 | 0       | 0.0001 | NFID    | ICP      |
      | 100000830   | 05f121c2d97efa73386133c27f790...57148 | wlmjt-42cl4-bfewy-wqnsd-onwge...a-bqe | ICPets3808            | 0.0487  | 0.0001 | NFID    | ICP      |
      | 200000276   | 3c23a07edbdca387a29d6ba2c644f...f876e | zmfwj-ds7r7-ixsfr-b6mpz-mz46s...i-yae | ICPets349             | 0.0489  | 0.0001 | NFID    | ICP      |
