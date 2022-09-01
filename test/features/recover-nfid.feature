@recoverNFID @smoke @regression
Feature: Recover NFID Account from Recovery Phrase
  As a user, I want to recover access to my NFID account by providing my Recovery Phrase

  Background:
    Given I open the site "/"

#  Scenario:
#    When I click on the link "Recover NFID"
#    Then I expect the url to contain "/recover-nfid/enter-recovery-phrase"
#    When I put Recovery Phrase to input field "10974 same candy swim dry violin end asthma lake similar bronze dragon obtain recall panther essence cheese pitch flip slot nerve insane village protect load"
#    And I toggle checkbox "#has-verified-domain"
#    And I press button "#recoveryButton"
#    Then I wait on element "#loader" for 10000ms to not be displayed
#    Then I wait on element "#notTrustedDevice" for 10000ms to be displayed
#    When I press button "#notTrustedDevice"
#    And I wait on element "#sendReceiveButton" for 10000ms to be displayed
#    Then I expect that element "#sendReceiveButton" is displayed
#    When I press button "#addRecovery > svg"
#    Then I wait on element "#securityKey"
#    Then I expect that element "#recoveryKey" is not displayed

  Scenario:

    Then I wait on element "#continue-with-enhanced-security" for 20000ms to be displayed
    When I click on the selector "#continue-with-enhanced-security"
    Then I wait on element "#loader" for 10000ms to not be displayed
    Then I wait on element "#captcha-img" for 10000ms to be displayed
    When I set "a" to the inputfield "#enter-captcha"
    When I click on the selector "#create-nfid"
    Then I wait on element "#loader" for 10000ms to not be displayed
    Then I expect "account" key to be present in localStorage
    And I wait on element "#sendReceiveButton" for 10000ms to be displayed
    And I press button "#addRecovery > svg"
    And I press button "#recoveryKey"
