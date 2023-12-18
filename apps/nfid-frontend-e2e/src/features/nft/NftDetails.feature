@nft-details
Feature:Non Fungible Asset Details
  As a user, I want to see nft details

  @nft3
  Scenario Outline: User should be able to see details page
    Given User opens NFID site
    And User is already authenticated by <anchor> anchor
    Then Open collectibles page
    Then Open nft <token> and <collection_id> details
    And NFT <token> <collection_id> <id> displayed
    And Details are <standard> <collection_id>
    And About starts with <about>
    And Asset preview type is <previewType>

    Examples:
      | anchor | token         | collection | id                                                                            | standard  | collection_id                              | about          | previewType |
      | 31870  | AnilAnimal    | Rarible    | 22558361690228810656161743101174268944760789894532108532742266930527975981633 | ERC1155   | 0x67a8fe17db4d441f96f26094677763a2213a3b5f | Testing        | img         |

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
