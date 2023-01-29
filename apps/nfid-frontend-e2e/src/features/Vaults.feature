@smoke @regression @vaults @vaults-crud
Feature: Create vault / Show vault / Archive vault
  As a user, I want to create vault, create wallet, invite member and add custom policy.

  Background: User navigates to Vaults page
    Given I open the site "/"
    Given My browser supports WebAuthN

  Scenario: User registers via google
    Given I remove the e2e@identitylabs.ooo
    Given I authenticate with google account
    And I enter a captcha
    And It log's me in
    When I open profile menu
    Then I logout

  Scenario: Test create vault
    Given I authenticate with google account
    And It log's me in
    Then I wait on element "#desktop > #profile-vaults" for 2000ms to exist
    Then I click on the selector "#desktop > #profile-vaults"
    Then I wait on element "#loader" for 10000ms to not be displayed
    Then I click on the selector "#create-vault-trigger"
    When I set <vaultName> to the inputfield "[name='vaultName']"
    Then I click on the selector "#create-vault-button"
    Then I wait on element <vaultId> for 5000ms to be displayed

  Scenario: Test add wallet
    Given I authenticate with google account
    And It log's me in
    Then I click on the selector <vaultId>
    Then I click on the selector "#create-wallet-trigger"
    When I set "wallet" to the inputfield "[name='name']"
    Then I click on the selector "#create-wallet-button"
    Then I wait on element "#wallet_wallet" for 5000ms to be displayed

  Scenario: Test add member
    Given I authenticate with google account
    And It log's me in
    Then I click on the selector "#tab_members"
    Then I click on the selector "#add-member-trigger"
    When I set "member" to the inputfield "[name='name']"
    When I set "bf255d5747df36885680098ef6cfe1137720dfdd2206904b69a6758160988b39" to the inputfield "[name='address']"
    Then I click on the selector "#add-member-button"
    Then I wait on element "#member_member" for 5000ms to be displayed

  Scenario: Test add policy
    Given I authenticate with google account
    And It log's me in
    Then I click on the selector "#tab_policies"
    Then I click on the selector "#create-policy-trigger"
    Then I click on the selector "#select-wallet"
    Then I wait on element "#dropdown-options > label:nth-child(1)" for 3000ms to be displayed
    Then I click on the selector "#dropdown-options > label:nth-child(1)"
    When I set "1" to the inputfield "[name='amount']"
    When I set "2" to the inputfield "[name='approvers']"
    Then I click on the selector "#create-policy-button"
    Then I wait on element "#policy_row" for 5000ms to be displayed

  Examples:
    | vaultName | vaultId |
    | "testVault"  | "#vault_testVault" |
