@registration @mobile @dev
Feature: Mobile registration and authentication

  Background: Background name
    Given User opens NFID site

  @uat
  @mission
  Scenario Outline: User wants to register with Enhanced Security
    Given User authenticates with enhanced security
    And User enters a captcha
    And Tokens displayed on user assets
    And User opens burger menu
    When User opens mobile profile menu
    Then User has stored localstorage

  Scenario Outline: User Signs In with predefined credentials
    And User opens burger menu
    Given User signs in
