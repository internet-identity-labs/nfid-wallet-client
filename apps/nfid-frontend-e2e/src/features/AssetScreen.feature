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
    And Expect "token_Bitcoin_usd" not with text $0.00

  @asset2
  Scenario: User should be able to see BTC in asset details
    Given User opens NFID site
    And User is already authenticated
    Given User signs in
    And Tokens displayed on user assets
    And Open asset with label Bitcoin
    Then Expect page_title with text Your Bitcoin accounts
    Then Expect label with text Bitcoin
    Then Expect token with text BTC
    Then Expect "token_info" not with text 0 BTC
    Then Expect app_name_0 with text NFID
    Then Expect acc_name_0 with text account 1
    Then Expect account_id_0 with text mvyM
    Then Expect principal_id_0 with text 5qfm
    Then Expect "token_balance_0" not with text 0 BTC
    Then Expect "usd_balance_0" not with text $0.00
    Then I expect that element app_row_1 becomes not displayed
    Then I expect that element app_row_0 becomes displayed


