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
      | anchor | token            | id                                          | standard  | collection_id               | about          | previewType |
      | 31870  | BOXONBLOCK479    | fz3lu-3ykor-uwiaa-aaaaa-buahl-iaqca-aaahp-q | ext       | 7cpyk-jyaaa-aaaag-qa5na-cai | The secret     | img         |

  @nft4
  Scenario Outline: User should be able to see txs on NFT details page
    Given User opens NFID site
    And User is already authenticated by <anchor> anchor
    Then Open collectibles page
    Then Go to <token> and <collection_id> details
    Then <amount> transactions appear
    And <n> raw with <type> & <date> & <from> & <to> & <price>
    Examples:
      | anchor | token         | collection_id               | amount | n | type | date          | from                                                             | to                                                               | price    |
      | 31870  | BOXONBLOCK479 | 7cpyk-jyaaa-aaaag-qa5na-cai | 6      | 6 | Sale | 1698314266000 | 4f0a40f1e24fdac90cfa87d7a0a3427aea78dc0cd6b046ba3497689343a2852b | f940aa34800b1a4ba632a735400fb4c485d5d0feb3c67574b18035dea80104b0 | 0.05 ICP |
