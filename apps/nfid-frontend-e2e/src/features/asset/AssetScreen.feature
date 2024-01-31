@asset
Feature:Fungible Asset
  As a user, I want to see fungible assets in profile

  @asset1
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
      | chain             | currency | balance        | anchor | label                  |
      | Internet Computer | ICP      | 0.01007 ICP    | 28542  | Internet Computer      |
