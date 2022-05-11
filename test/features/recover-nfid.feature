@recoverNFID @smoke @regression
Feature: Recover NFID Account from Recovery Phrase
  As a user, I want to recover access to my NFID account by providing my Recovery Phrase

  Background:
    Given I open the site "/"

  Scenario:
    When I click on the link "Recover your existing NFID"
    Then I expect the url to contain "/recover-nfid/enter-seed-phrase"
