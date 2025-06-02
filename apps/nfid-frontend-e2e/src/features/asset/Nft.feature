Feature: NFT tab
  As a user, I check details of a NFT

  @nft-details
  Scenario Outline: User checks his NFTs and details of an NFT
    Given User opens NFID site
    And User is already authenticated by <nfid number> anchor
    When User goes to NFTs tab
    Then Verifying that 2 NFT are displayed on collectibles page
    And Verifying that the token with name <NFT name> and collection <collection_id> is displayed
    When User switches to table view
    Then Verifying that the token with name <NFT name> and collection <collection_id> and ID <id> is displayed
    When User goes to details of the nft with name <NFT name> and collection <collection_id>
    Then Verifying that the token with name <NFT name> and collection <collection_id> and ID <id> is displayed
    And Verifying that details are: standard - <standard>, collection - <collection_id>, about - <about>
    And Verifying that the first raw has the next values: type <type>, date <date>, from <from>, to <to>, price <price> in activity section
    Examples:
      | nfid number | NFT name                 | collection_id               | id                                          | standard | type | date                       | from                                                             | to                                                               | price     | about                                                                                                                                                                                                                                                         |
      | 31870       | ICPuppies Wearables #145 | 4gbxl-byaaa-aaaak-aafuq-cai | 3s5hr-4ikor-uwiaa-aaaaa-cqabn-eaqca-aaaci-q | EXT      | Sale | Jun 24, 2024 - 12:19:58 pm | 9ed0bb6a80207a4a8d9dcc723ac311de5e4ff0dda8f0487afa5b9a0affb0ebb4 | 7effb2346414c16572c3475cb69e02cb258699085fb9103f6156c13204ae77cf | 0.01 ICP  | ICPuppies Wearables                                                                                                                                                                                                                                           |
      | 100000830   | ICPets #3808             | unssi-hiaaa-aaaah-qcmya-cai | jjhck-rakor-uwiaa-aaaaa-b4atg-aaqca-aab3q-a | EXT      | Sale | Oct 09, 2024 - 12:56:24 am | 9ed0bb6a80207a4a8d9dcc723ac311de5e4ff0dda8f0487afa5b9a0affb0ebb4 | 39a4b9a5a1c9c6493244956c6c6fd1e655b936d583289345c8128473a3cb0dbd | 0.029 ICP | Community Revenue Focused NFT Project. ICPets is a Hold-2-Earn lifestyle aimed to increase your earnings through passive income and to build a strong community around art and financial opportunities by using NFT technology and its smart contracts power. |
      | 200000276   | ICPets #349              | unssi-hiaaa-aaaah-qcmya-cai | padpn-oqkor-uwiaa-aaaaa-b4atg-aaqca-aaafo-q | EXT      | Sale | Oct 09, 2024 - 12:55:40 am | 9ed0bb6a80207a4a8d9dcc723ac311de5e4ff0dda8f0487afa5b9a0affb0ebb4 | 39a4b9a5a1c9c6493244956c6c6fd1e655b936d583289345c8128473a3cb0dbd | 0.029 ICP | Community Revenue Focused NFT Project. ICPets is a Hold-2-Earn lifestyle aimed to increase your earnings through passive income and to build a strong community around art and financial opportunities by using NFT technology and its smart contracts power. |
