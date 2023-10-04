@demoApp
Feature: DemoApp functionality

  Scenario Outline: User sends ICP/NFT through demoApp
    Given User opens NFID site
    And authstate is cleared
    And User is already authenticated by <anchor> anchor
    And User opens the demoApp
    When User authenticates to DemoTransactions with google account using <profileType> account with <targets>
    Then Principal, Address, Targets are correct:
      | principal | <principal> |
      | address   | <address>   |
      | targets   | <targets>   |
    When User sends <amount> ICP to <address>
    Then Check request details ICP equals to <amount> ICP
    And Assert requestICPTransfer logs message has hash
    When User sends NFT to <address>
    Then Check request details NFT equals to ICPets #4504
    And Assert requestEXTTransfer logs message has hash
    Examples:
      | anchor | profileType | amount  | principal                                                       | address                                                          | targets                     |
      | 28567  | public      | 0.00001 | vso2q-ja7iv-7kzld-zje2z-2c4wd-s4tpj-hp6cv-t5srn-tknjk-ees5l-uqe | f2fcf27d5ae274bca000c90f9e9aa70e5e82fdfcdbd3377a9279e11aa1ec49ce | irshc-3aaaa-aaaam-absla-cai |
