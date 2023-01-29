@registration @google
Feature: Registration using Google

  Background: Open the link and ensure userE2E is deleted.
    Given I open the site "/"
    Given My browser supports WebAuthN

  Scenario Outline: User wants to register with Google
    Given I remove the e2e@identitylabs.ooo
    Given I authenticate with google account
    And I enter a captcha
    And It log's me in
    When I open profile menu

  Scenario Outline: User wants to login with Google
    Given I authenticate with google account
    And It log's me in
    When I open profile menu
    Then I logout

