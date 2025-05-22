Feature: Activity tab
  As a user, I want to see assets transaction history

  @activity
  Scenario Outline: User checks his activity history
    Given User opens NFID site
    And User is already authenticated by <nfid number> anchor
    When User goes to activity tab
    Then Verifying that there are <txs> activities in the table
    And Verifying that there is the transaction with action type <action>, currency <currency>, type <type>, amount <amount>, timestamp <timestamp>, "From" field <from> and "To" field <to>
    When User sets filter to <filter>
    Then Verifying that there are <filtered_txs> activities in the table
    Examples:
      | nfid number | txs | filtered_txs | action   | type | amount | currency | filter       | timestamp     | from                                                             | to                                                               |
      | 28542       | 8   | 8            | Received | ft   | 0.01   | $ICP     | $ICP         | 1701693484123 | e12dc3625c079187b43d2d0afdab8dda896dd5c48f49e65571dce3b63894210f | f7698099e4e9fe3297e5f3b3e0abfa64456b8cec13cc208014bbc0ea6a45c4e2 |
      | 100000830   | 9   | 5            | Sent     | ft   | 0.01   | $ICP     | $ICP         | 1728304804094 | 05f121c2d97efa73386133c27f790723382a3795e6d7b54d5f7e975d66257148 | 05f121c2d97efa73386133c27f790723382a3795e6d7b54d5f7e975d66257148 |
      | 200000276   | 3   | 3            | Received | ft   | 0.05   | $ICP     | $ICP, ckPEPE | 1728310136966 | 7255539e38f2035fde19be6925afa78cad5237860b1826eab09b3f7e164e9b40 | 3c23a07edbdca387a29d6ba2c644fe1afc070b8d866dba002be91dbce31f876e |
