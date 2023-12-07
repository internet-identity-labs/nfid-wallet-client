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
            | 25795  | 10  | Received | ft   | 0.00006879 | BTC      | Bitcoin           | 1680510249000 | 2MxAMYp3JVcTbicoHTC7EFy6eN2B1Sersre                              | mn9cmLSFxFE5ASRNXFnxbdZmEvp4ZFDm2h                               |
            | 28593  | 9   | Sent     | ft   | 0.000001   | BTC      | Bitcoin           | 1680864742000 | n2yvAStr9w75oUMyb3c7s4QdQu78Rj9Sjc                               | mohjSavDdQYHRYXcS3uS6ttaHP8amyvX78                               |
            | 28542  | 2   | Received | ft   | 0.01       | ICP      | Internet Computer | 1679482557000 | d5066269d8ae5cd30c23bda91d42e56bd2475bb318d38841c589eb2ae4fe1f06 | 8f4835777b8e7abf166ab5e7390abf5c4871d55204994ca30d25d90af30d52ba |
            | 28593  | 9   | Sent     | ft   | 0.18       | ICP      | Internet Computer | 1681206438000 | 7d2912c28cd074a912be7d0cd5a6f6dd48591045d7d626edc5e6877a3a22314f | d5066269d8ae5cd30c23bda91d42e56bd2475bb318d38841c589eb2ae4fe1f06 |
            | 10974  | 3   | Received | ft   | 1          | TST      | Polygon Mumbai    | 1682378652000 | 0xc1ac7969159ca99a50341ee78779c56120632265                       | 0xb1107f4141fb56b07d15b65f1629451443ff8f8e                       |
            | 10974  | 3   | Sent     | ft   | 0.1        | TST      | Polygon Mumbai    | 1682378652000 | 0xc1ac7969159ca99a50341ee78779c56120632265                       | 0xb1107f4141fb56b07d15b65f1629451443ff8f8e                       |
            | 10271  | 259 | Received | ft   | 0.01       | MATIC    | Polygon Mumbai    | 1682689429000 | 0xb1107f4141fb56b07d15b65f1629451443ff8f8e                       | 0xe4ee3c7a77791b899a4f4400bcfcd86d4911e3f6                       |
            | 10271  | 259 | Sent     | ft   | 0.01       | MATIC    | Polygon Mumbai    | 1682688335000 | 0xe4ee3c7a77791b899a4f4400bcfcd86d4911e3f6                       | 0xb1107f4141fb56b07d15b65f1629451443ff8f8e                       |
