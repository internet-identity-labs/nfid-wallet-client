@recoverNFID @smoke @regression
Feature: Recover NFID Account from Recovery Phrase
  As a user, I want to recover access to my NFID account by providing my Recovery Phrase


  Scenario:
    Given I open the site "/"
    When I click on the link "Recover NFID"
    Then I expect the url to contain "/recover-nfid/enter-recovery-phrase"
    When I put Recovery Phrase to input field "10974 same candy swim dry violin end asthma lake similar bronze dragon obtain recall panther essence cheese pitch flip slot nerve insane village protect load"
    And I toggle checkbox "#has-verified-domain"
    And I press button "#recoveryButton"
    Then I wait on element "#loader" for 10000ms to not be displayed
    Then I wait on element "#notTrustedDevice" for 10000ms to be displayed
    When I press button "#notTrustedDevice"
    And I wait on element "#sendReceiveButton" for 10000ms to be displayed
    Then I expect that element "#sendReceiveButton" is displayed
    When I press button "#addRecovery > svg"
    Then I wait on element "#securityKey"
    Then I expect that element "#recoveryKey" is not displayed

  Scenario:
    Given I open the site "/register-nfid-account/intro"
    Given My browser supports WebAuthN
    Then I wait on element "#continue-with-enhanced-security" for 20000ms to be displayed
    When I click on the selector "#continue-with-enhanced-security"
    Then I wait on element "#loader" for 10000ms to not be displayed
    Then My browser has 1 credentials

    Then I expect the url to contain "/register-nfid-account/captcha"
    And  I expect that element "#captcha-spinner" is displayed

    Then I wait on element "#captcha-img" for 10000ms to be displayed

    And  I expect that element "#enter-captcha" not contains any text
    And  I expect that element "#create-nfid" has the class "btn-disabled"


    When I set "a" to the inputfield "#enter-captcha"
    And  I expect that element "#enter-captcha" contains the text "a"
    And  I expect that element "#create-nfid" does not have the class "btn-disabled"

    When I click on the selector "#create-nfid"
    Then I wait on element "#loader" for 10000ms to not be displayed
    Then I expect "account" key to be present in localStorage

    And I wait on element "#sendReceiveButton" for 10000ms to be displayed
    When I press button "#addRecovery > svg"
    Then I expect that element "#recoveryKey" is displayed
    Then I expect that element "#securityKey" is displayed

    When I press button "#recoveryKey"
    Then I wait on element "#loader" for 10000ms to not be displayed
    Then  I wait on element "#copyButton > span" for 10000ms to be displayed
    Then I press button "#copyButton > span"
    Then I press button "#savedCheckbox"
    Then I press button "#recoverySaveButton"

    Then I wait on element "#recoveryPhrase" for 10000ms to be displayed
    Then  I wait on element "#deleteRecoveryPhrase" for 10000ms to be displayed

    When I press button "#deleteRecoveryPhrase"

#    Then I put Recovery Phrase to input field "Incorrect Phrase"   //todo indicate toast message
#    Then I wait on element "Incorrect Seed Phrase"

    Then I put copied Recovery Phrase to input field
    Then I press button "#deleteRecoveryButton"
    Then I wait on element "#loader" for 10000ms to not be displayed
    Then I wait on element "#deleteRecoveryButton" for 10000ms to not be displayed

    Then  I wait on element "#deleteRecoveryPhrase" for 10000ms to not be displayed
    When I press button "#addRecovery > svg"
    Then I wait on element "#securityKey"
    Then I expect that element "#recoveryKey" is displayed





