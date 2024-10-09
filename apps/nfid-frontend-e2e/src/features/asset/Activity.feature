@activity
Feature:Assets Activity
  As a user, I want to see assets transaction history

  Scenario Outline: User should be able to see transaction history
    Given User opens NFID site
    And User is already authenticated by <nfid number> anchor
    And I press on Activity icon
    Then I should see <txs> activities in the table
    And I should see transaction <action> <currency> <type> <NFT name> <timestamp> <from> <to>
    Examples:
      | nfid number | txs | action   | type | NFT name | currency | timestamp     | from                                                             | to                                                               |
      | 28542       | 8   | Received | ft   | 0.01     | ICP      | 1679482557000 | d5066269d8ae5cd30c23bda91d42e56bd2475bb318d38841c589eb2ae4fe1f06 | 8f4835777b8e7abf166ab5e7390abf5c4871d55204994ca30d25d90af30d52ba |
      | 100000830   | 3   | Received | ft   | 0.01     | ICP      | 1679482557000 | d5066269d8ae5cd30c23bda91d42e56bd2475bb318d38841c589eb2ae4fe1f06 | 8f4835777b8e7abf166ab5e7390abf5c4871d55204994ca30d25d90af30d52ba |
      | 200000276   | 1   | Received | ft   | 0.01     | ICP      | 1679482557000 | d5066269d8ae5cd30c23bda91d42e56bd2475bb318d38841c589eb2ae4fe1f06 | 8f4835777b8e7abf166ab5e7390abf5c4871d55204994ca30d25d90af30d52ba |
