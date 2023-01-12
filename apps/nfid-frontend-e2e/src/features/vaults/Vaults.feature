@smoke @regression @vaults @vaults-crud
Feature: Create vault / Show vault / Archive vault
  As a user, I want to create vault, create wallet, invite member and add custom policy.

  Background: Open the link and ensure userE2E is deleted.
    Given I open the site "/"
    Given My browser supports WebAuthN
    Given I remove the e2e@identitylabs.ooo

  Scenario:
    # Register with google
    Then I wait on element ".//iframe[contains(@src,'accounts.google')]" for 3000ms to be displayed
    And  I pause for 250ms

    When I click on the selector ".//iframe[contains(@src,'accounts.google')]"
    Then I expect a new window has been opened

    When I focus the last opened window
    Then I wait on element "#credentials-picker > div:first-child" for 4000ms to be displayed

    When I click on the selector "#credentials-picker > div:first-child"
    When I focus the previous opened window
    Then I wait on element "#captcha-img" for 20000ms to be displayed
    And  I expect that element "#enter-captcha" not contains any text
    And  I expect that element "#create-nfid" has the class "btn-disabled"

    When I set "a" to the inputfield "#enter-captcha"
    And  I expect that element "#enter-captcha" contains the text "a"
    And  I expect that element "#create-nfid" does not have the class "btn-disabled"
    When I click on the selector "#create-nfid"
    Then I wait on element "#loader" for 20000ms to not be displayed
    And  I wait on element "#just-log-me-in" to be displayed

    When I click on the selector "#just-log-me-in"
    Then I wait on element "#loader" for 20000ms to not be displayed
    Then I expect the url to contain "/profile/assets"
    And  I wait on element "#profile" for 20000ms to be displayed

    When I click on the selector "#profile"
    Then I wait on element "#logout" for 15000ms to be displayed

    # Test create vault
    Then I wait on element "#desktop > #profile-vaults" for 2000ms to exist
    Then I click on the selector "#desktop > #profile-vaults"
    Then I wait on element "#loader" for 10000ms to not be displayed
    Then I click on the selector "#create-vault-trigger"
    When I set <vaultName> to the inputfield "[name='vaultName']"
    Then I click on the selector "#create-vault-button"
    Then I wait on element <vaultId> for 5000ms to be displayed

    # Test add wallet
    Then I click on the selector <vaultId>
    Then I click on the selector "#create-wallet-trigger"
    When I set "wallet" to the inputfield "[name='name']"
    Then I click on the selector "#create-wallet-button"
    Then I wait on element "#wallet_wallet" for 5000ms to be displayed

    # Test add member
    Then I click on the selector "#tab_members"
    Then I click on the selector "#add-member-trigger"
    When I set "member" to the inputfield "[name='name']"
    When I set "bf255d5747df36885680098ef6cfe1137720dfdd2206904b69a6758160988b39" to the inputfield "[name='address']"
    Then I click on the selector "#add-member-button"
    Then I wait on element "#member_member" for 5000ms to be displayed

    # Test add policy
    Then I click on the selector "#tab_policies"
    Then I click on the selector "#create-policy-trigger"
    Then I click on the selector "#select-wallet"
    Then I click on the selector "#dropdown-options > label:nth-child(2)"
    When I set "1" to the inputfield "[name='amount']"
    When I set "2" to the inputfield "[name='approvers']"
    Then I click on the selector "#create-policy-button"
    Then I wait on element "#policy_row" for 5000ms to be displayed

  Examples:
    | vaultName | vaultId | 
    | "testVault"  | "#vault_testVault" |