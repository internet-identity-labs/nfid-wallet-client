@nft-details
Feature:Non Fungible Asset Details
  As a user, I want to see nft details

  @nft3
  Scenario Outline: User should be able to see details page
    Given User opens NFID site
    And User is already authenticated by <anchor> anchor
    Then Open collectibles page
    Then Open nft <token> and <collection_id> details
    And NFT <token> <collection_id> <id> <wallet> displayed
    And Details are <standard> <collection_id>
    And About starts with <about>
    And Asset preview type is <previewType>

    Examples:
      | anchor | token         | collection | wallet       | id                                                                            | standard  | collection_id                              | about          | previewType |
      | 31870  | AnilAnimal    | Rarible    | NFIDWallet   | 22558361690228810656161743101174268944760789894532108532742266930527975981633 | ERC1155   | 0x67a8fe17db4d441f96f26094677763a2213a3b5f | Testing        | img         |
      | 31870  | TestERC1155   | Rarible    | NFIDWallet   | 94667527331073441490639696296732950748865385440430584394830104056550742032385 | ERC1155   | 0x7c4b13b5893cd82f371c5e28f12fb2f37542bbc5 | Test ERC1155   | img         |
      | 31870  |               | Rarible    | NFIDWallet   | 86090545217057429589019094455964497579787873809883022909766658167983963111527 | ERC721    | 0xd8560c88d1dc85f9ed05b25878e366c49b68bef9 | No description | video       |

  @nft4
  Scenario Outline: User should be able to see txs on NFT details page
    Given User opens NFID site
    And User is already authenticated by <anchor> anchor
    Then Open collectibles page
    Then Go to <token> details
    Then <amount> transactions appear
    And <n> raw with <type> & <date> & <from> & <to> & <price>

    Examples:
      | anchor | token       | amount | n | type | date          | from                                       | to                                         | price         |
      | 31870  | AnilAnimal  | 4      | 1 | SELL | 1683890719000 | 0x31df948b4eeb91a4bd47a48e4af342c3f86b1d2b | 0x1a5305ee6e7acb65c3068ce0202c72a1e5ab2133 | 0.00001 MATIC |
      # sc-7279
      #      | 31870  | PandaQueen571 | 1     | 1 | Sale | 1683296175000 | 11355b3faf35b3e7f51489a95b161dc64413164cdacd28b320b96a4cf718c7d6 | bbe3525252f118ce3b4d156306673d77513919262f946c63b9273f8b63bf2459 | 0.00001 MATIC |
      | 31870  | TestERC1155 | 5      | 3 | SELL | 1683283692000 | 0xd14bebf277c671ee22ed433e67f36ca38ec5a0e5 | 0xdc75e8c3ae765d8947adbc6698a2403a6141d439 | 0.01 ETH      |
