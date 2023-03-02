@asset
Feature:Fungible Asset
  As a user, I want to see fungible assets in profile

  @asset1
  Scenario: User should be able to see BTC in assets
    Given User opens NFID site
    And User is already authenticated
    Given User signs in
    And Tokens displayed on user assets
    And Asset appears with label Bitcoin
    And Asset Bitcoin appears with currency BTC and blockchain Bitcoin balance 0 BTC and $0.00
    Then Bitcoin address calculated
    And Expect element "token_Bitcoin_usd" not with text $0.00

  @asset2
  Scenario: User should be able to see BTC in asset details
    Given User opens NFID site
    And User is already authenticated
    Given User signs in
    And Tokens displayed on user assets
    Then Open asset with label Bitcoin
    Then Expect element page_title with text Your Bitcoin accounts
    Then Expect element label with text Bitcoin
    Then Expect element token with text BTC
    Then Expect element "token_info" not with text 0 BTC
    Then Expect element app_name_0 with text NFID
    Then Expect element acc_name_0 with text account 1
    Then Expect element account_id_0 with text mvyM
    Then Expect element principal_id_0 with text 5qfm
    Then Expect element "token_balance_0" not with text 0 BTC
    Then Expect element "usd_balance_0" not with text $0.00
    And I expect that element app_row_1 becomes not displayed
    And I expect that element app_row_0 becomes displayed


