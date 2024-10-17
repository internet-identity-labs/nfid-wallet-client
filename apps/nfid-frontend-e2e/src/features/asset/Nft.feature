Feature: Non Fungible Asset
  As a user, I check details of a NFT

  @nft-details
  Scenario Outline: Verify NFT details
    Given User opens NFID site
    And User is already authenticated by <nfid number> anchor
    When User goes to nfts tab
    Then <amount> NFT displayed on collectibles page
    And Token with name <NFT name> and collection <collection_id> is displayed
    When Switch to table
    Then Token with name <NFT name> and collection <collection_id> and ID <id> is displayed
    When User goes to details of the nft with name <NFT name> and collection <collection_id>
    Then Token with name <NFT name> and collection <collection_id> and ID <id> is displayed
    And Details are: standard - <standard>, collection - <collection_id>, about - <about>
    And The first raw has the next values: <type> & <date> & <from> & <to> & <price> in activity section
    Examples:
      | nfid number | amount | NFT name                 | collection_id               | id                                          | standard | type | date                       | from                                                             | to                                                               | price    | about                                                                                                                                                                                                                                                         |
      | 31870       | 3      | ICPuppies Wearables #145 | 4gbxl-byaaa-aaaak-aafuq-cai | 3s5hr-4ikor-uwiaa-aaaaa-cqabn-eaqca-aaaci-q | EXT      | Sale | Jun 24, 2024 - 12:19:58 pm | 9ed0bb6a80207a4a8d9dcc723ac311de5e4ff0dda8f0487afa5b9a0affb0ebb4 | 7effb2346414c16572c3475cb69e02cb258699085fb9103f6156c13204ae77cf | 0.03 ICP | ICPuppies Wearables                                                                                                                                                                                                                                           |
      | 100000830   | 1      | ICPets #3808             | unssi-hiaaa-aaaah-qcmya-cai | jjhck-rakor-uwiaa-aaaaa-b4atg-aaqca-aab3q-a | EXT      | Sale | Oct 09, 2024 - 03:56:24 am | 9ed0bb6a80207a4a8d9dcc723ac311de5e4ff0dda8f0487afa5b9a0affb0ebb4 | 39a4b9a5a1c9c6493244956c6c6fd1e655b936d583289345c8128473a3cb0dbd | 0.02 ICP | Community Revenue Focused NFT Project. ICPets is a Hold-2-Earn lifestyle aimed to increase your earnings through passive income and to build a strong community around art and financial opportunities by using NFT technology and its smart contracts power. |
      | 200000276   | 1      | ICPets #349              | unssi-hiaaa-aaaah-qcmya-cai | padpn-oqkor-uwiaa-aaaaa-b4atg-aaqca-aaafo-q | EXT      | Sale | Oct 09, 2024 - 03:55:40 am | 9ed0bb6a80207a4a8d9dcc723ac311de5e4ff0dda8f0487afa5b9a0affb0ebb4 | 39a4b9a5a1c9c6493244956c6c6fd1e655b936d583289345c8128473a3cb0dbd | 0.02 ICP | Community Revenue Focused NFT Project. ICPets is a Hold-2-Earn lifestyle aimed to increase your earnings through passive income and to build a strong community around art and financial opportunities by using NFT technology and its smart contracts power. |
