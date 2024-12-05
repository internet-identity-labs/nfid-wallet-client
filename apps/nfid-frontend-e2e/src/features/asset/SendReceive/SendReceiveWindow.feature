Feature: SendReceive dialog window

  @sendreceive
  Scenario Outline: User is able to select NFT to send. User checks his balance and fee during send flow
    Given User opens NFID site
    And User is already authenticated by <NFID number> anchor
    And Verifying that tokens are displayed on assets tab
    When User opens Send nft dialog window
    And User opens Choose nft dialog window
    Then Verifying that user sees option <nft> in dropdown
    When User clicks the back button in Send window
    And User switches send type
    And User selects <currency> from send options
    And User sets the amount to '0.0001'
    Then Verifying that the balance is calculated as <balance> and fee is calculated as <fee>
    When User refreshes the page
    And User opens Receive dialog window
    Then Verifying that the Account ID is <account ID> and the Principal is <wallet address>
    Examples:
      | NFID number | account ID                            | wallet address                        | nft                   | balance | fee    | currency |
      | 31870       | 0c754c4a1da28c73bd911e4cd3e88...3ae69 | 6hg7q-37lzt-3lpdo-oocet-itvrv...s-vae | ICPuppiesWearables145 | 0       | 0.0001 | ICP      |
      | 100000830   | 05f121c2d97efa73386133c27f790...57148 | wlmjt-42cl4-bfewy-wqnsd-onwge...a-bqe | ICPets3808            | 0.0497  | 0.0001 | ICP      |
      | 200000276   | 3c23a07edbdca387a29d6ba2c644f...f876e | zmfwj-ds7r7-ixsfr-b6mpz-mz46s...i-yae | ICPets349             | 0.0489  | 0.0001 | ICP      |
