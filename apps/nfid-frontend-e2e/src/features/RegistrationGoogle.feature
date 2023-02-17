@registration @google
Feature: Registration using Google

  Background: Open the link and ensure userE2E is deleted.
    Given User opens NFID site

  Scenario Outline: User wants to register with Google
    Given I remove the e2e@identitylabs.ooo
    Given User authenticates with google account
    And User enters a captcha
    And It log's me in
    When User opens profile menu

  Scenario Outline: User wants to login with Google
    Given User authenticates with google account
    And It log's me in
    When User opens profile menu
    Then User logs out

