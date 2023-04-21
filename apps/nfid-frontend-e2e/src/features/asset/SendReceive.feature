Feature:Send/Receive Asset
  As a user, I want to send/receive assets

  @sendreceive1
  Scenario Outline: User should be able to receive BTC/ETH transaction
    Given User opens NFID site
    Given authstate is cleared
    And User is already authenticated by <anchor> anchor
    Given User signs in
    And Tokens displayed on user assets
    Then Asset calculated for <chain>
    Then User opens receive dialog window
    Then Choose <currency> from options
    Then Choose NFID Account 1 from receive accounts
    Then Account ID is <account_id>
    Examples:
      | chain           | anchor | account_id                            | currency |
      | Bitcoin         | 25795  | mn9cmLSFxFE5ASRNXFnxbdZmEvp4Z...FDm2h | BTC      |
      | Ethereum        | 10974  | 0xcDF42Ca0423a6063Fa4E60BdCBc...07CDa | ETH      |
      | ChainLink Token | 25795  | 0x1e76A4b38Be7573bCb0fE5f7cc8...545F3 | LINK     |

  @sendreceive2
  Scenario Outline: User should be able to receive ICP transaction
    Given User opens NFID site
    Given authstate is cleared
    And User is already authenticated by <anchor> anchor
    Given User signs in
    And Tokens displayed on user assets
    Then Asset calculated for <chain>
    Then User opens receive dialog window
    Then Choose <currency> from options
    Then Account ID is <princ>
    Then Address is <address>
    Examples:
      | chain             | anchor | princ                                 | address                               | currency |
      | Internet Computer | 28542  | 8f4835777b8e7abf166ab5e7390ab...d52ba | ymhyc-prisv-3sxup-hjy2n-4tgz4...q-pae | ICP      |

  @sendreceive3
  Scenario Outline: User should be able to see balance and fee
    Given User opens NFID site
    Given authstate is cleared
    And User is already authenticated by <anchor> anchor
    Given User signs in
    And Tokens displayed on user assets
    Then Asset calculated for <chain>
    Then User opens send dialog window
    Then Choose <currency> from send options
    Then Choose <account> from accounts
    Then Balance is <balance> and fee is <fee>
    Examples:
      | chain             | anchor | balance    | fee          | account        | currency |
      | Bitcoin           | 25795  | 0.00006879 | 0.000015 BTC | NFID Account 1 | BTC      |
      | Ethereum          | 10974  | 0.1        | 0 ETH        | NFID Account 1 | ETH      |
      | Internet Computer | 28542  | 0.01       | 0.0001 ICP   | NFID account 1 | ICP      |
      | ChainLink Token   | 25795  | 20         | 0 ETH        | NFID Account 1 | LINK     |

  @pending
  @send_receive_once_a_day
  Scenario Outline: User should be able to send transaction
    Given User opens NFID site
    And User is already authenticated by <anchor> anchor
    Given User signs in
    And Tokens displayed on user assets
    Then Asset calculated for <chain>
    And User opens send dialog window
    And Choose <currency> from send options
    And Choose <account> from accounts
    And Set <target> address and <amount> and send
    Then Success window appears with <text>
    Examples:
      | chain             | anchor | target                                                           | amount    | text                                    | currency | account        |
      | Bitcoin           | 28567  | mjXH5mLcWY2VRRvSZQ1Q33qXJjzBiUq45p                               | 0.0000001 | You've sent 1e-7 BTC. Transaction hash: | BTC      | NFID Account 1 |
      | Ethereum          | 28567  | 0xB1107F4141fb56b07D15b65F1629451443Ff8F8e                       | 0.000001  | You've sent 0.000001 LINK               | LINK     | NFID Account 1 |
      | Ethereum          | 28567  | 0xB1107F4141fb56b07D15b65F1629451443Ff8F8e                       | 0.000001  | You've sent 0.000001 ETH                | ETH      | NFID Account 1 |
      | Internet Computer | 28567  | d5066269d8ae5cd30c23bda91d42e56bd2475bb318d38841c589eb2ae4fe1f06 | 0.0001    | You've sent 0.0001 ICP                  | ICP      | NFID account 1 |


