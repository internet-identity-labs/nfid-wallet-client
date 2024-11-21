Feature: Send FT flow

  @sendft
  Scenario Outline: User makes FT transaction
    Given User opens NFID site
    And User is already authenticated by <nfid number> anchor
    And Verifying that tokens are displayed on assets tab
    And User opens send dialog window
    When User selects <currency> from send options
    And User sets the amount to <amount>
    And User sets address to <address> then clicks the "Send" button
    Then Verifying that the transaction is success
    Examples:
      | nfid number | address                                                          | amount | currency |
      | 28567       | f2fcf27d5ae274bca000c90f9e9aa70e5e82fdfcdbd3377a9279e11aa1ec49ce | 0.0001 | ICP      |
      | 28567       | vso2q-ja7iv-7kzld-zje2z-2c4wd-s4tpj-hp6cv-t5srn-tknjk-ees5l-uqe  | 0.001  | BOOM     |
