@recoverNFID @smoke @regression
Feature: Recover NFID Account from Recovery Phrase
  As a user, I want to recover access to my NFID account by providing my Recovery Phrase

  Background:
    Given I open the site "/"

  Scenario:
    When I click on the link "Recover NFID"
    Then I expect the url to contain "/recover-nfid/enter-recovery-phrase"
    Then I put Recovery Phrase to input field "10974 same candy swim dry violin end asthma lake similar bronze dragon obtain recall panther essence cheese pitch flip slot nerve insane village protect load"
    Then I toggle checkbox "#has-verified-domain"
    Then I press button "#recoveryButton"
    Then I wait on element "#loader" for 10000ms to not be displayed
    Then I wait on element "#notTrustedDevice" for 10000ms to be displayed
    Then I press button "#notTrustedDevice"
    Then I wait on element "#sendReceiveButton" for 10000ms to be displayed
    Then I expect that element "#sendReceiveButton" is displayed
