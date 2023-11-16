@demoApp
Feature: DemoApp functionality

  Scenario Outline: User sends ICP/NFT through demoApp
    Given User opens NFID site
    And authstate is cleared
    And User is already authenticated by <anchor> anchor
    And User opens the demoApp
    When User authenticates to DemoTransactions with google account using <profileType> profile with <target> canister and <derivationOrigin>
    Then Principal, Address, Targets are correct:
      | principal | <principal> |
      | address   | <address>   |
      | targets   | <target>   |
    When User sends <amount> ICP to <address>
    Then Check request details ICP equals to <amount> ICP
    And Assert requestICPTransfer logs message:
      | firstChild  | 2, 3 |
      | secondChild | 2, 6 |
      | header      | hash |
      | body        |      |
#    When User sends NFT to <address>
#    Then Check request details NFT equals to ICPets #4504
#    And Assert requestEXTTransfer logs message:
#      | firstChild  | 2, 3 |
#      | secondChild | 2, 6 |
#      | header      | hash |
#      | body        |      |
    Examples:
      | anchor | profileType | derivationOrigin      | amount  | principal                                                       | address                                                          | target                     |
      | 28567  | public      | http://localhost:4200 | 0.00001 | nejgd-f5frx-ddbma-jtskt-k237v-2c7df-eupfu-ig4ze-g6wmt-qpg73-3qe | f7698099e4e9fe3297e5f3b3e0abfa64456b8cec13cc208014bbc0ea6a45c4e2 | irshc-3aaaa-aaaam-absla-cai |

  Scenario Outline: User updates delegation
    Given User opens NFID site
    And authstate is cleared
    And User is already authenticated by <anchor> anchor
    And User opens the demoApp
    When User authenticates to DemoTransactions with google account using <profileType> profile with <target> canister and <derivationOrigin>
    Then Principal, Address, Targets are correct:
      | principal | <principal> |
      | address   | <address>   |
      | targets   | <target>    |
    When User updates list of targets by <target>,<target>,<target> and <derivationOrigin>
    Then Principal, Address, Targets are correct:
      | principal | <principal>                |
      | address   | <address>                  |
      | targets   | <target>,<target>,<target> |
    Examples:
      | anchor | profileType | derivationOrigin      | principal                                                       | address                                                          | target                      |
      | 28567  | public      | http://localhost:4200 | nejgd-f5frx-ddbma-jtskt-k237v-2c7df-eupfu-ig4ze-g6wmt-qpg73-3qe | f7698099e4e9fe3297e5f3b3e0abfa64456b8cec13cc208014bbc0ea6a45c4e2 | irshc-3aaaa-aaaam-absla-cai |
