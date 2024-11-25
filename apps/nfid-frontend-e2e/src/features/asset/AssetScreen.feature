Feature: Tokens tab
  As a user, I want to see fungible assets in profile

  @assets
  Scenario Outline: User checks his tokens
    Given User opens NFID site
    And User is already authenticated by <nfid number> anchor
    And Verifying that tokens are displayed on assets tab
    Then Verifying that there is <token name> token with currency <currency> on category <category>, token balance <token balance> and USD balance is not 0
    Examples:
      | category     | currency | nfid number | token name        | token balance |
      | Native       | ICP      | 28542       | Internet Computer | 0.01007 ICP   |
      | Native       | ICP      | 100000830   | Internet Computer | 0.0497 ICP    |
      | Chain Fusion | ckPEPE   | 200000276   | ckPEPE            | 953 ckPEPE    |
