@recoverNFID @mobile @regression
Feature: Add protected/unportected, Protect, Delete recovery phrase
  As a user, I want to be able to add recovery phrase, protect it and delete

  Scenario:
    Given I open the site "/"
    Given My browser supports WebAuthN
   
    Then I wait on element "#continue-with-enhanced-security" for 4000ms to be displayed
    When I click on the selector "#continue-with-enhanced-security"
    Then I wait on element "#loader" for 10000ms to not be displayed
    Then My browser has 1 credentials

    And  I expect that element "#captcha-spinner" is displayed

    Then I wait on element "#captcha-img" for 10000ms to be displayed

    And  I expect that element "#enter-captcha" not contains any text
    And  I expect that element "#create-nfid" has the class "btn-disabled"

    When I wait on element "#captcha-spinner" for 10000ms to not be displayed
    When I set "a" to the inputfield "#enter-captcha"
    And  I expect that element "#enter-captcha" contains the text "a"
    And  I expect that element "#create-nfid" does not have the class "btn-disabled"

    When I click on the selector "#create-nfid"
    Then I wait on element "#loader" for 10000ms to not be displayed

    Then I expect "account" key to be present in localStorage

    When I press button "#mobile-menu"
    Then I expect that element "#profile-security" is displayed

    When I press button "#profile-security"
    When I expect that element "#addRecovery" is displayed

    Then I wait on element "#addRecovery" for 2000ms to be displayed

    When I press button "#addRecovery > svg"
    Then I expect that element "#recoveryKey" is displayed
    Then I expect that element "#securityKey" is displayed

    # Create protected, protect and delete

    When I press button "#recoveryKey"
    Then I wait on element "#loader" for 10000ms to not be displayed
    Then I wait on element "#copyButton > span" for 10000ms to be displayed
    Then I press button "#copyButton > span"
    Then I press button "#savedCheckbox"
    Then I press button "#recoverySaveButton"

    Then I wait on element "#recoveryPhrase" for 10000ms to be displayed
    Then I wait on element "#deleteRecoveryPhrase" for 10000ms to be displayed

    When I press button "#deleteRecoveryPhrase"

    Then I put copied Recovery Phrase to input field
    Then I press button "#deleteRecoveryButton"
    Then I wait on element "#loader" for 10000ms to not be displayed
    Then I wait on element "#deleteRecoveryButton" for 10000ms to not be displayed

    When I press button "#addRecovery > svg"
    Then I wait on element "#securityKey"
    Then I expect that element "#recoveryKey" is displayed

    # Create unprotected, protect and delete

    When I press button "#createUnprotectedPhrase"
    Then I wait on element "#loader" for 10000ms to not be displayed
    Then I wait on element "#copyButton > span" for 10000ms to be displayed
    Then I press button "#copyButton > span"
    Then I press button "#savedCheckbox"
    Then I press button "#recoverySaveButton"

    Then I wait on element "#protect-recovery" for 10000ms to be displayed
    When I press button "#protect-recovery"
    Then I wait on element "#protect-modal" for 2000ms to be displayed

    Then I put copied Recovery Phrase to input field
    Then I press button "#protect-submit"
    Then I wait on element "#protect-modal" for 10000ms to not be displayed

    Then I press button "#deleteRecoveryPhrase"
    Then I wait on element "#deleteRecoveryButton" for 3000ms to be displayed
    And  I expect that element "#deleteRecoveryButton" has the class "btn-disabled"

    Then I put copied Recovery Phrase to input field
    And  I expect that element "#deleteRecoveryButton" does not have the class "btn-disabled"
    Then I press button "#deleteRecoveryButton"
    Then I wait on element "#loader" for 10000ms to not be displayed

    When I press button "#addRecovery > svg"
    Then I wait on element "#securityKey"
    Then I expect that element "#recoveryKey" is displayed

    


