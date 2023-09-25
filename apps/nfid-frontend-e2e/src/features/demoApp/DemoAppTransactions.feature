@demoApp @skip
Feature: DemoApp transactions functionality

  Scenario Outline: User sends ICP through demoApp
    Given User opens NFID site
    And authstate is cleared
    And User is already authenticated by <anchor> anchor
    And User opens the demoApp /request-transfer
    When User authenticates to DemoTransactions with google account using <profileType> account
    Then Principal, Address, Balance are correct:
      | principal | <principal> |
      | address   | <address>   |
    When User sends <amount> ICP to <address>
    Then Check request details equals to <amount> ICP
    And Assert logs are successful
    Examples:
      | anchor | profileType | amount  | principal                                                       | address                                                          |
      | 28567  | public      | 0.00001 | vso2q-ja7iv-7kzld-zje2z-2c4wd-s4tpj-hp6cv-t5srn-tknjk-ees5l-uqe | f2fcf27d5ae274bca000c90f9e9aa70e5e82fdfcdbd3377a9279e11aa1ec49ce |
