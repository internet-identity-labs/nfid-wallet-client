@nft
Feature:Non Fungible Asset
  As a user, I want to see nft in profile

  @nft1
  Scenario Outline: User should be able to see NFTs
    Given User opens NFID site
    And User is already authenticated by <anchor> anchor
    And <amount> NFT displayed on assets page and <view> at all
    Then Token <token> from <collection> collection displayed
    Examples:
      | amount | anchor | token         | collection | view |
      | 6      | 31870  | AnilAnimal    | Rarible    | 4    |
      | 6      | 31870  | PandaQueen571 | PandaQueen | 4    |
