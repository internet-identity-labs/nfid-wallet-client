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
    Examples:
      | anchor    | token                    | id                                          | standard | collection_id               | about                                                                                                                                                                                                                                                         |
      | 31870     | ICPuppies Wearables #145 | 3s5hr-4ikor-uwiaa-aaaaa-cqabn-eaqca-aaaci-q | EXT      | 4gbxl-byaaa-aaaak-aafuq-cai | ICPuppies Wearables                                                                                                                                                                                                                                           |
      | 100000830 | ICPets #3808             | jjhck-rakor-uwiaa-aaaaa-b4atg-aaqca-aab3q-a | EXT      | unssi-hiaaa-aaaah-qcmya-cai | Community Revenue Focused NFT Project. ICPets is a Hold-2-Earn lifestyle aimed to increase your earnings through passive income and to build a strong community around art and financial opportunities by using NFT technology and its smart contracts power. |
      | 200000276 | ICPets #349              | padpn-oqkor-uwiaa-aaaaa-b4atg-aaqca-aaafo-q | EXT      | unssi-hiaaa-aaaah-qcmya-cai | Community Revenue Focused NFT Project. ICPets is a Hold-2-Earn lifestyle aimed to increase your earnings through passive income and to build a strong community around art and financial opportunities by using NFT technology and its smart contracts power. |

  @nft4
  Scenario Outline: User should be able to see txs on NFT details page
    Given User opens NFID site
    And User is already authenticated by <anchor> anchor
    Then Open collectibles page
    Then Go to <token> and <collection_id> details
    And The first raw has the next values: <type> & <date> & <from> & <to> & <price>
    Examples:
      | anchor | token                    | collection_id               | type | date                       | from                                                             | to                                                               | price    |
      | 31870  | ICPuppies Wearables #145 | 4gbxl-byaaa-aaaak-aafuq-cai | Sale | Jun 24, 2024 - 03:19:58 pm | 9ed0bb6a80207a4a8d9dcc723ac311de5e4ff0dda8f0487afa5b9a0affb0ebb4 | 7effb2346414c16572c3475cb69e02cb258699085fb9103f6156c13204ae77cf | 0.04 ICP |
