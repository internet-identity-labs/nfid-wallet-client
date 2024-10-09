@asset
Feature:Fungible Asset
  As a user, I want to see fungible assets in profile

  Scenario Outline: User should be able to see <category> in assets
    Given User opens NFID site
    And User is already authenticated by <nfid number> anchor
    And Tokens displayed on user assets
    And Wait while <label> asset calculated with currency <currency>
    And Asset appears with label <label>
    And <token name> appears with <currency> on <category> and <balance>
    And <token name> <token> address calculated
    And <token name> USD balance not $0.00
    Examples:
      | category | token | balance     | nfid number | token name        |
      | Native   | ICP   | 0.01007 ICP | 28542       | Internet Computer |
      | Native   | ICP   | 0.0499 ICP  | 100000830   | Internet Computer |
      | Native   | ICP   | 0.05 ICP    | 200000276   | Internet Computer |
