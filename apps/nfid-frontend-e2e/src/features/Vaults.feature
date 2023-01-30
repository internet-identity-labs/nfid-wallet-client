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

  Scenario: Create a new Vault
    Given I authenticate with google account
    And It log's me in
    When I open Vaults
    And I create a new Vault with name testVault
    Then Vault id appears with name testVault

  Scenario: Add wallet
    Given I authenticate with google account
    And It log's me in
    When I open Vaults
    And I click on vault with name testVault
    And I create a new wallet with name myNewWallet
    Then Wallet displays with name myNewWallet

  Scenario: Add member
    Given I authenticate with google account
    And It log's me in
    When I open Vaults
    And I click on vault with name testVault
    And I open Members tab
    And I add new member to this vault with <name> and <address>
    Then New member displays with <name>

    Examples:
      | name | address                                                          |
      | john | bf255d5747df36885680098ef6cfe1137720dfdd2206904b69a6758160988b39 |

  Scenario: Add policy
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
