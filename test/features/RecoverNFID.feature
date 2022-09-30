@recoverNFID @smoke @regression
Feature: Recover NFID Account from Recovery Phrase
  As a user, I want to recover access to my NFID account by providing my Recovery Phrase


  Scenario:
    Given I open the site "/recover-nfid/enter-recovery-phrase"
    When I set "10974 same candy swim dry violin end asthma lake similar bronze dragon obtain recall panther essence cheese pitch flip slot nerve insane village protect load" to the inputfield "[name='recoveryPhrase']"
    When I click on the selector "#has-verified-domain"
    And I click on the selector "#recoveryButton"
    Then I wait on element "#loader" for 10000ms to not be displayed
    Then I wait on element "#just-log-me-in" for 10000ms to be displayed
    When I click on the selector "#just-log-me-in"
    And I wait on element "#sendReceiveButton" for 10000ms to be displayed
    Then I expect that element "#sendReceiveButton" is displayed

