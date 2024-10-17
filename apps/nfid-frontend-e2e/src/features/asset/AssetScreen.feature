Feature: Fungible Asset
  As a user, I want to see fungible assets in profile

  @asset
  Scenario Outline: Verify tokens are displayed with correct category, currency, balance and name in assets
    Given User opens NFID site
    And User is already authenticated by <nfid number> anchor
    And Tokens displayed on user assets
    Then <token name> appears with <currency> on <category> and <balance>
    Examples:
      | category | currency | balance     | nfid number | token name        |
      | Native   | ICP      | 0.01007 ICP | 28542       | Internet Computer |
      | Native   | ICP      | 0.0499 ICP  | 100000830   | Internet Computer |
      | Native   | ICP      | 0.05 ICP    | 200000276   | Internet Computer |
