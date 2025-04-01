Feature: Send FT flow

  @sendft
  Scenario Outline: User makes FT transaction
    Given User opens NFID site
    And User is already authenticated by <nfid number> anchor
    And Verifying that tokens are displayed on assets tab
    And User opens Send dialog window
    When User selects <currency1> from send options
    And User sets the amount to <amount1>
    And User sets address to <account ID> then clicks the "Send" button
    Then Verifying that the transaction is success
    And User opens Send dialog window
    When User selects <currency2> from send options
    And User sets the amount to <amount2>
    And User sets address to <principal> then clicks the "Send" button
    Then Verifying that the transaction is success
    Examples:
      | nfid number | amount1 | amount2 | currency1 | currency2 | account ID                                                       | principal                                                       |
      | 28567       | 0.0001  | 0.001   | $ICP      | $NFIDW    | f2fcf27d5ae274bca000c90f9e9aa70e5e82fdfcdbd3377a9279e11aa1ec49ce | vso2q-ja7iv-7kzld-zje2z-2c4wd-s4tpj-hp6cv-t5srn-tknjk-ees5l-uqe |
