Feature: Tokens tab
  As a user, I want to see fungible assets in profile

  @asset
  Scenario Outline: User checks his tokens
    Given User opens NFID site
    And User is already authenticated by <nfid number> anchor
    And Verifying that tokens are displayed on assets tab
    Then Verifying that there is <token name> token with currency <currency> on category <category> and not 0 balance
    Examples:
      | category | currency | nfid number | token name        |
      | Native   | ICP      | 28542       | Internet Computer |
      | Native   | ICP      | 100000830   | Internet Computer |
      | Native   | ICP      | 200000276   | Internet Computer |
