@smoke @regression @vaults @vaults-crud
Feature: Vault scenarios
  As a user, I want to create vault, create wallet, invite member and add custom policy.

  Background: User navigates to Vaults page
    Given I open the site "/"
    Given My browser supports WebAuthN

  Scenario: User registers via google
    Given I remove the e2e@identitylabs.ooo
    Given User authenticates with google account
    And User enters a captcha
    And It log's me in
    When User opens profile menu
    Then User logs out

  Scenario: Create a new Vault
    Given User authenticates with google account
    And It log's me in
    When I open Vaults
    And I create a new Vault with name testVault
    Then Vault appears with name testVault

  Scenario: Add wallet
    Given User authenticates with google account
    And It log's me in
    When I open Vaults
    And I click on vault with name testVault
    And I create a new wallet with name myNewWallet
    Then Wallet displays with name myNewWallet

  Scenario: Add member
    Given User authenticates with google account
    And It log's me in
    When I open Vaults
    And I click on vault with name testVault
    And I open Members tab
    And I add new member to this vault with <membername> and <address>
    Then New member displays with <membername>

    Examples:
      | membername | address                                                          |
      | john       | bf255d5747df36885680098ef6cfe1137720dfdd2206904b69a6758160988b39 |

  Scenario: Add policy
    Given User authenticates with google account
    And It log's me in
    When I open Vaults
    And I click on vault with name testVault
    And I open Policies tab
    And I create new Policy for this vault with <wallet>, <greaterthan> and <approvers> included
    Then Policy is displayed on the policies list

    Examples:
      | wallet      | greaterthan | approvers |
      | myNewWallet | 1           | 2         |

