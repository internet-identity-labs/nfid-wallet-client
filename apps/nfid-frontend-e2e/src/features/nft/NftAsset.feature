@nft
Feature:Non Fungible Asset
  As a user, I want to see nft in profile

  @nft1
  Scenario Outline: User should be able to see NFTs
    Given User opens NFID site
    And User is already authenticated by <anchor> anchor
    And <amount> NFT displayed on assets page and <view> at all
    Then Token <token> from <collection_id> nft collection displayed
    Examples:
      | amount | anchor | token         | collection_id                              | view |
      | 7      | 31870  | AnilAnimal    | 0x67a8fe17db4d441f96f26094677763a2213a3b5f | 4    |
      | 7      | 31870  | PandaQueen571 | zhibq-piaaa-aaaah-qcvka-cai                | 4    |
