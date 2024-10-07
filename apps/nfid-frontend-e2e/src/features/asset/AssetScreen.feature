@asset
Feature:Fungible Asset
  As a user, I want to see fungible assets in profile

  Scenario Outline: User should be able to see <chain> in assets
    Given User opens NFID site
    And User is already authenticated by <anchor> anchor
    And Tokens displayed on user assets
    And Wait while <label> asset calculated with currency <currency>
    And Asset appears with label <label>
    And <label> appears with <currency> on <chain> and <balance>
    And <label> <currency> address calculated
    And <label> USD balance not $0.00
    Examples:
      | chain  | currency | balance     | anchor    | label             |
      | Native | ICP      | 0.01007 ICP | 28542     | Internet Computer |
      | Native | ICP      | 0.0499 ICP  | 100000830 | Internet Computer |
      | Native | ICP      | 0.05 ICP    | 200000276 | Internet Computer |
