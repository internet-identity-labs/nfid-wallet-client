@activity @skip
Feature:Assets Activity
    As a user, I want to see assets transaction history

    @activity1
    Scenario Outline: User should be able to see transaction history
        Given User opens NFID site
        And User is already authenticated by <anchor> anchor
        And I press on Activity icon
        Then I should see activity page
        Then I should see <txs> activities in the table
        And I should see transaction <action> <network> <currency> <type> <asset> <timestamp> <from> <to>
        Examples:
            | anchor | txs | action   | type | asset      | currency | network           | timestamp     | from                                                             | to                                                               |
            | 28542  | 2   | Received | ft   | 0.01       | ICP      | Internet Computer | 1679482557000 | d5066269d8ae5cd30c23bda91d42e56bd2475bb318d38841c589eb2ae4fe1f06 | 8f4835777b8e7abf166ab5e7390abf5c4871d55204994ca30d25d90af30d52ba |
            | 28593  | 9   | Sent     | ft   | 0.18       | ICP      | Internet Computer | 1681206438000 | 7d2912c28cd074a912be7d0cd5a6f6dd48591045d7d626edc5e6877a3a22314f | d5066269d8ae5cd30c23bda91d42e56bd2475bb318d38841c589eb2ae4fe1f06 |
