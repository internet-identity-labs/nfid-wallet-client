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
    Then Wait while Bitcoin accounts calculated
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

  @asset3
  Scenario: User should be able to see transaction history in Received
    Given User opens NFID site
    And User is already authenticated
    Given User signs in
    And Tokens displayed on user assets
    And Open asset with label Bitcoin
    Then Wait while Bitcoin accounts calculated
    And Open first account in the row
    And Open Received tab
    Then I expect that element transaction_0 becomes displayed
    And Expect that date is "Mar 02, 2023 - 12:56:29 am"
    And Expect that asset is "BTC"
    And Expect that quantity is "0.00012717"
    And Expect transaction_to_0 with text mvyMknk9BfFAQp8tuErvozWaB6BsDtB2v1
    And Expect transaction_from_0 with text tb1qxzwaumt2cjddwjwsnvwm9jsmmzyhjvdqn7q4p4

  @asset4
  Scenario: User should be able to see transaction depends on selected app
    Given User opens NFID site
    And User is already authenticated
    Given User signs in
    And Tokens displayed on user assets
    And Open asset with label Bitcoin
    Then Wait while Bitcoin accounts calculated
    And Open first account in the row
    And Open Received tab
    And Open dropdown menu on transactions page
    Then Expect dropdown menu with text "1 selected"
    And Expect txs account "NFID account 1" with txs amount "1 TXs"
    And Expect checkbox for account "NFID account 1" is selected
    Then Click checkbox account NFID account 1
    Then Expect dropdown menu with text "All wallets"
    Then I expect that element transaction_0 becomes displayed
    Then Click checkbox account NNS account 1
    Then Expect txs account "NNS account 1" with txs amount "0 TXs"
    Then I expect that element transaction_0 becomes not displayed

