@demoApp
Feature: DemoApp functionality

  @1
  Scenario Outline: User sends ICP/NFT through demoApp
    Given User opens NFID site
    And User is already authenticated by <nfid number> anchor
    And User opens the demoApp
    When User authenticates to DemoTransactions with shared NFID Wallet address using <profileType> profile with <target> canister and <derivationOrigin>
    Then Principal, Address, Targets are correct:
      | principal | <wallet address> |
      | address   | <account ID>     |
      | targets   | <target>         |
    When User sends <amount> ICP to <account ID>
    Then Check request details ICP equals to <amount> ICP
    And Assert requestICPTransfer code block has hash
    When User sends NFT to <account ID>
    Then Check request details NFT equals to ICPets #4504
    And Assert requestEXTTransfer code block has hash
    Examples:
      | nfid number | profileType | derivationOrigin      | amount  | wallet address                                                  | account ID                                                       | target                      |
      | 28567       | public      | http://localhost:4200 | 0.00001 | vso2q-ja7iv-7kzld-zje2z-2c4wd-s4tpj-hp6cv-t5srn-tknjk-ees5l-uqe | f2fcf27d5ae274bca000c90f9e9aa70e5e82fdfcdbd3377a9279e11aa1ec49ce | irshc-3aaaa-aaaam-absla-cai |

  Scenario Outline: User updates delegation
    Given User opens NFID site
    And authstate is cleared
    And User is already authenticated by <nfid number> anchor
    And User opens the demoApp
    When User authenticates to DemoTransactions with shared NFID Wallet address using <profileType> profile with <target> canister
    Then Principal, Address, Targets are correct:
      | principal | <wallet address> |
      | address   | <account ID>     |
      | targets   | <target>         |
    When User updates list of targets by <target>,<target>,<target>
    Then Principal, Address, Targets are correct:
      | principal | <wallet address>           |
      | address   | <account ID>               |
      | targets   | <target>,<target>,<target> |
    Examples:
      | nfid number | profileType | wallet address                                                  | account ID                                                       | target                      |
      | 28567       | public      | vso2q-ja7iv-7kzld-zje2z-2c4wd-s4tpj-hp6cv-t5srn-tknjk-ees5l-uqe | f2fcf27d5ae274bca000c90f9e9aa70e5e82fdfcdbd3377a9279e11aa1ec49ce | irshc-3aaaa-aaaam-absla-cai |
