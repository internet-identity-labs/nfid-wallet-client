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
      | anchor | token                    | id                                          | standard        | collection_id               | about                   | previewType |
      | 31870  | ICPuppiesWearables145    | 3s5hr-4ikor-uwiaa-aaaaa-cqabn-eaqca-aaaci-q | legacy1.5       | 4gbxl-byaaa-aaaak-aafuq-cai | ICPuppies Wearables     | img         |

  @nft4
  Scenario Outline: User should be able to see txs on NFT details page
    Given User opens NFID site
    And User is already authenticated by <anchor> anchor
    Then Open collectibles page
    Then Go to <token> and <collection_id> details
    Then <amount> transactions appear
    And <n> raw with <type> & <date> & <from> & <to> & <price>
    Examples:
      | anchor | token                 | collection_id               | amount | n | type     | date          | from                                                             | to                                                               | price    |
      | 31870  | ICPuppiesWearables145 | 4gbxl-byaaa-aaaak-aafuq-cai | 2      | 2 | Sale | 1719231618000 | 9ed0bb6a80207a4a8d9dcc723ac311de5e4ff0dda8f0487afa5b9a0affb0ebb4 | 7effb2346414c16572c3475cb69e02cb258699085fb9103f6156c13204ae77cf | 0.01 ICP |
