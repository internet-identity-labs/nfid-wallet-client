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
      | 200000104   | 0.0001  | 0.001   | $ICP      | $NFIDW    | 45f2bfc8f90d15ea1056b5bd403d894a3c1918e9bbe7259c83a7765066a34873 | 5lj63-hvigg-qpbld-hl5pa-s6h2y-lhjqe-dtg5r-p6jtq-6i3xz-hkj36-pqe |
