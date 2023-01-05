@smoke @regression @vaults @vaults-crud
Feature: Create vault / Show vault / Archive vault
  As a user, I want to create vault, create wallet, invite member and add custom policy.

  Scenario:
    Given I open the site "/recover-nfid/enter-recovery-phrase"
    When I set "10271 conduct mushroom funny work margin mountain squeeze punch curious hockey truck such trust chef arctic ethics wet potato steak olympic pattern orchard sign brief" to the inputfield "[name='recoveryPhrase']"
    When I click on the selector "#has-verified-domain"
    And I click on the selector "#recovery-button"
    Then I wait on element "#loader" for 10000ms to not be displayed
    Then I wait on element "#just-log-me-in" for 10000ms to be displayed
    When I click on the selector "#just-log-me-in"
    And I wait on element "#sendReceiveButton" for 10000ms to be displayed
    Then I expect that element "#sendReceiveButton" is displayed

    # Test create vault
    Then I wait on element "#desktop > #profile-vaults" for 2000ms to exist
    Then I click on the selector "#desktop > #profile-vaults"
    Then I click on the selector "#create-vault-trigger"
    When I set "vaultTest13" to the inputfield "[name='vaultName']"
    Then I click on the selector "#create-vault-button"
    Then I wait on element "#vault_vaultTest13" for 5000ms to be displayed

    # TODO discuss with Raghu @pavlo
    # # Test add wallet
    # Then I click on the selector "#vault_vaultTest13"
    # Then I click on the selector "#create-wallet-trigger"
    # When I set "wallet" to the inputfield "[name='name']"
    # Then I click on the selector "#create-wallet-button"
    # Then I wait on element "#wallet_wallet" for 5000ms to be displayed

    # # Test add member
    # Then I click on the selector "#tab_members"
    # Then I click on the selector "#add-member-trigger"
    # When I set "member" to the inputfield "[name='name']"
    # When I set "bf255d5747df36885680098ef6cfe1137720dfdd2206904b69a6758160988b39" to the inputfield "[name='address']"
    # Then I click on the selector "#add-member-button"
    # Then I wait on element "#member_member" for 5000ms to be displayed

    # # Test add policy
    # Then I click on the selector "#tab_policies"
    # Then I click on the selector "#create-policy-trigger"
    # Then I click on the selector "#select-wallet"
    # Then I click on the selector "#dropdown-options > label:nth-child(2)"
    # When I set "1" to the inputfield "[name='amount']"
    # When I set "2" to the inputfield "[name='approvers']"
    # Then I click on the selector "#create-policy-button"
    # Then I wait on element "#policy_row" for 5000ms to be displayed



