Feature:Send/Receive Asset
  As a user, I want to send/receive assets

  Scenario Outline: User should be able to receive transaction
    Given User opens NFID site
    And User is already authenticated by <anchor> anchor
    Given User signs in
    And Tokens displayed on user assets
    Then Asset appears with label <chain>
    And <chain> USD balance is not empty
    Then User opens receive dialog window
    Then Choose BTC from options
    Then Choose NFID Account 1 from receive accounts
#  sc-6838
#    And Account ID is <first_acc_part> ... <second_acc_part>
    Examples:
      | chain   | anchor | first_acc_part                | second_acc_part |
      | Bitcoin | 25795  | mn9cmLSFxFE5ASRNXFnxbdZmEvp4Z | FDm2h           |


  Scenario Outline: User should be able to see balance and fee
    Given User opens NFID site
    And User is already authenticated by <anchor> anchor
    Given User signs in
    And Tokens displayed on user assets
    Then Asset appears with label <chain>
    And <chain> asset calculated
    Then User opens send dialog window
    Then Choose BTC from send options
    Then Choose NFID Account 1 from accounts
#  sc-6838
#    Then Balance is <balance> and fee is <fee>
    Examples:
      | chain   | anchor | balance    | fee      |
      | Bitcoin | 25795  | 0.00006879 | 6e-8 BTC |

  @pending
  Scenario Outline: User should be able to send transaction
    Given User opens NFID site
    And User is already authenticated by <anchor> anchor
    Given User signs in
    And Tokens displayed on user assets
    Then Asset appears with label <chain>
    And <chain> asset calculated
    And User opens send dialog window
    And Choose BTC from send options
    And Choose NFID Account 1 from accounts
    And Set <target> address and <amount> and send
    Then Success window appears with <text>
    Examples:
      | chain   | anchor | target                             | amount    | text                                    |
      | Bitcoin | 28567  | mjXH5mLcWY2VRRvSZQ1Q33qXJjzBiUq45p | 0.0000001 | You've sent 1e-7 BTC. Transaction hash: |


