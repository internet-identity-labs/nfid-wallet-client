@smoke @regression @vaults @vaults-crud
Feature: Vault scenarios
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
    When I open Vaults
    And I click on vault with name testVault
    And I open Policies tab
    And I create new Policy for this vault with <wallet>, <greaterthan> and <approvers> included
    Then Policy is displayed on the policies list

    Examples:
      | wallet      | greaterthan | approvers |
      | myNewWallet | 1           | 2         |

